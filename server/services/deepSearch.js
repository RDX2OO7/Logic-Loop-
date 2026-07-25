import "dotenv/config";
import { XMLParser } from "fast-xml-parser";

const xmlParser = new XMLParser({ ignoreAttributes: false });

function safeId(source, index) {
  return `${source}-${index}-${Date.now().toString(36)}`;
}

export async function searchArxiv(query, maxResults = 5) {
  try {
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const xml = await res.text();
    return parseArxivXml(xml);
  } catch (err) {
    console.error("searchArxiv failed:", err.message);
    return [];
  }
}

export function parseArxivXml(xml) {
  const parsed = xmlParser.parse(xml);
  const entries = parsed?.feed?.entry;
  if (!entries) return [];
  const list = Array.isArray(entries) ? entries : [entries];
  return list.map((e, i) => ({
    id: safeId("arxiv", i),
    title: (e.title || "").replace(/\s+/g, " ").trim(),
    url: typeof e.id === "string" ? e.id : e.id?.["#text"] ?? "",
    snippet: (e.summary || "").replace(/\s+/g, " ").trim().slice(0, 300),
    source: "arxiv",
  }));
}

export async function searchSemanticScholar(query, limit = 5) {
  try {
    const headers = process.env.SEMANTIC_SCHOLAR_KEY
      ? { "x-api-key": process.env.SEMANTIC_SCHOLAR_KEY }
      : {};
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,abstract,url`;
    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((p, i) => ({
      id: safeId("semanticscholar", i),
      title: p.title || "",
      url: p.url || "",
      snippet: (p.abstract || "").slice(0, 300),
      source: "semanticscholar",
    }));
  } catch (err) {
    console.error("searchSemanticScholar failed:", err.message);
    return [];
  }
}

export async function searchOpenAlex(query, perPage = 5) {
  try {
    const mailto = process.env.MY_EMAIL || "";
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${perPage}${mailto ? `&mailto=${encodeURIComponent(mailto)}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((w, i) => ({
      id: safeId("openalex", i),
      title: w.title || "",
      url: w.id || "",
      snippet: (w.abstract_inverted_index ? "Abstract available via OpenAlex record." : "").slice(0, 300),
      source: "openalex",
    }));
  } catch (err) {
    console.error("searchOpenAlex failed:", err.message);
    return [];
  }
}

export async function searchTavily(query, maxResults = 5) {
  try {
    if (!process.env.TAVILY_API_KEY) return [];
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        max_results: maxResults,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((r, i) => ({
      id: safeId("web", i),
      title: r.title || "",
      url: r.url || "",
      snippet: (r.content || "").slice(0, 300),
      source: "web",
    }));
  } catch (err) {
    console.error("searchTavily failed:", err.message);
    return [];
  }
}

export async function searchGitHub(query, perPage = 5) {
  try {
    const headers = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((r, i) => ({
      id: safeId("github", i),
      name: r.full_name || "",
      url: r.html_url || "",
      stars: r.stargazers_count || 0,
      description: r.description || "",
    }));
  } catch (err) {
    console.error("searchGitHub failed:", err.message);
    return [];
  }
}

export function mergeAndDedupe(...resultArrays) {
  const seen = new Set();
  const merged = [];
  for (const arr of resultArrays) {
    for (const item of arr) {
      const key = item.url?.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
}

export async function runDeepSearchAgent(query) {
  const [arxiv, semanticScholar, openAlex, web, repos] = await Promise.all([
    searchArxiv(query),
    searchSemanticScholar(query),
    searchOpenAlex(query),
    searchTavily(query),
    searchGitHub(query),
  ]);

  return {
    papers: mergeAndDedupe(arxiv, semanticScholar, openAlex),
    repos,
    web,
  };
}
