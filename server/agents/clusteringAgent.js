import { kmeans } from "ml-kmeans";
import { generateJSON } from "../lib/geminiClient.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Resolve .env relative to this file so it works from any CWD
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let _ai = null;
function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in .env — get one at https://aistudio.google.com/apikey");
  }
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return _ai;
}

export async function embedTexts(texts) {
  try {
    const response = await getClient().models.embedContent({
      model: "gemini-embedding-001",
      contents: texts,
    });
    return response.embeddings.map((e) => e.values);
  } catch (err) {
    try {
      const response = await getClient().models.embedContent({
        model: "gemini-embedding-2",
        contents: texts,
      });
      return response.embeddings.map((e) => e.values);
    } catch (err2) {
      console.warn("Embedding API failed, using lightweight fallback vectorization:", err2.message);
      return texts.map(t => Array.from({ length: 64 }, (_, i) => (t.charCodeAt(i % t.length) || 0) / 255));
    }
  }
}


export function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function buildItemList(deepSearchResult) {
  const items = [];
  for (const p of deepSearchResult.papers || []) {
    items.push({ id: p.id, text: `${p.title}. ${p.snippet || ""}`.slice(0, 500) });
  }
  for (const r of deepSearchResult.repos || []) {
    items.push({ id: r.id, text: `${r.name}. ${r.description || ""}`.slice(0, 500) });
  }
  for (const w of deepSearchResult.web || []) {
    items.push({ id: w.id, text: `${w.title}. ${w.snippet || ""}`.slice(0, 500) });
  }
  return items;
}

export function pickClusterCount(itemCount) {
  return Math.max(2, Math.min(5, Math.floor(itemCount / 3)));
}

const LABEL_SYSTEM_INSTRUCTION = `You are labeling a cluster of research/repo/web items that were grouped together by embedding similarity.

RULES:
- Base the label ONLY on the actual titles/snippets given — do not guess at a theme not reflected in the text.
- 2-5 words, no punctuation at the end.

Respond with ONLY valid JSON: { "theme": "string" }`;

export async function runClusteringAgent(deepSearchResult) {
  const items = buildItemList(deepSearchResult);

  if (items.length < 4) {
    return {
      clusters: [],
      note: `Only ${items.length} source(s) available — too few to cluster meaningfully. Skipping.`,
    };
  }

  const vectors = await embedTexts(items.map((i) => i.text));
  const k = pickClusterCount(items.length);
  const result = kmeans(vectors, k, { initialization: "kmeans++" });

  const groups = Array.from({ length: k }, () => []);
  result.clusters.forEach((clusterIndex, itemIndex) => {
    groups[clusterIndex].push(items[itemIndex]);
  });

  const clusters = [];
  for (const group of groups) {
    if (group.length === 0) continue;
    const labelPrompt = `Items in this cluster:\n${group.map((g) => `- ${g.text}`).join("\n")}`;
    const labelResult = await generateJSON(LABEL_SYSTEM_INSTRUCTION, labelPrompt);
    clusters.push({
      theme: labelResult.theme || "Unlabeled cluster",
      item_ids: group.map((g) => g.id),
    });
  }

  return { clusters };
}
