import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Resolve .env relative to this file's directory, not process.cwd(),
// so the key is found no matter which subdirectory the script is run from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let _client = null;

function getClient() {
  if (!_client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in .env — get one at https://aistudio.google.com/apikey");
    }
    _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _client;
}

export async function generateJSON(systemInstruction, userPrompt, model = "gemini-2.5-flash") {
  const call = async (prompt) => {
    const response = await getClient().models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });
    return response.text;
  };

  const raw = await call(userPrompt);
  try {
    return JSON.parse(raw);
  } catch (err) {
    const retryPrompt = `${userPrompt}\n\nYour previous response could not be parsed as JSON. Respond with ONLY valid JSON, no markdown fences, no commentary. Previous invalid response was:\n${raw}`;
    const retryRaw = await call(retryPrompt);
    try {
      return JSON.parse(retryRaw);
    } catch (err2) {
      throw new Error(`Gemini did not return valid JSON after retry. Last response: ${retryRaw}`);
    }
  }
}
