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

const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 5000;

function parseRetryDelaySec(err) {
  try {
    const body = JSON.parse(err.message);
    const retryInfo = body?.error?.details?.find(
      (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
    );
    if (retryInfo?.retryDelay) {
      return Math.ceil(parseFloat(retryInfo.retryDelay)) * 1000;
    }
  } catch { /* ignore */ }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateJSON(systemInstruction, userPrompt, model = "gemini-3.5-flash-lite") {
  const callOnce = async (prompt) => {
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

  const callWithRetry = async (prompt) => {
    let attempt = 0;
    while (true) {
      try {
        return await callOnce(prompt);
      } catch (err) {
        const isRetryable = err?.status === 429 || err?.status === 503;
        if (isRetryable && attempt < MAX_RETRIES) {
          attempt++;
          const serverDelayMs = parseRetryDelaySec(err);
          const waitMs = serverDelayMs ?? BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
          console.warn(
            `[geminiClient] ${err.status} (attempt ${attempt}/${MAX_RETRIES}). ` +
            `Waiting ${(waitMs / 1000).toFixed(1)}s…`
          );
          await sleep(waitMs);
        } else {
          throw err;
        }
      }
    }
  };

  const raw = await callWithRetry(userPrompt);
  try {
    return JSON.parse(raw);
  } catch (_parseErr) {
    const retryPrompt =
      `${userPrompt}\n\nYour previous response could not be parsed as JSON. ` +
      `Respond with ONLY valid JSON, no markdown fences, no commentary. ` +
      `Previous invalid response was:\n${raw}`;
    const retryRaw = await callWithRetry(retryPrompt);
    try {
      return JSON.parse(retryRaw);
    } catch (err2) {
      throw new Error(`Gemini did not return valid JSON after retry. Last response: ${retryRaw}`);
    }
  }
}
