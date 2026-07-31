import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "./.env") });

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const embedModels = ["text-embedding-004", "gemini-embedding-001", "gemini-embedding-2"];
  for (const model of embedModels) {
    try {
      console.log(`Testing embedding model: ${model}...`);
      const response = await ai.models.embedContent({
        model,
        contents: ["Hello world", "Test content"],
      });
      console.log(`✅ Embedding model ${model} succeeded! Count:`, response.embeddings?.length);
    } catch (err) {
      console.error(`❌ Embedding model ${model} failed:`, err.message);
    }
  }
}

main();
