import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "./.env") });

const API_KEY = process.env.GEMINI_API_KEY;

async function testDirectAPI(model) {
  console.log(`Testing direct API call for model: ${model}...`);
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Hello" }] }]
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    if (!res.ok) {
      const err = await res.json();
      console.error(`❌ ${model} [${elapsed}s] HTTP ${res.status}:`, err.error?.message?.slice(0, 120));
    } else {
      const data = await res.json();
      console.log(`✅ ${model} [${elapsed}s] SUCCESS:`, data.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 100));
    }
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`❌ ${model} [${elapsed}s] FAILED:`, err.message);
  }
}

async function main() {
  console.log("API_KEY exists:", !!API_KEY);
  
  const models = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
  ];

  for (const model of models) {
    await testDirectAPI(model);
  }
}

main();
