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

const MAX_RETRIES = 2;
const BASE_BACKOFF_MS = 1500;
const CALL_TIMEOUT_MS = 45000;

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

function withTimeout(promise, ms, label = "Gemini API call") {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms / 1000}s`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function generateJSON(systemInstruction, userPrompt, model = "gemini-3.1-flash-lite") {
  const callOnce = async (prompt) => {
    return withTimeout(
      getClient().models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      }).then(res => res.text),
      CALL_TIMEOUT_MS,
      "generateJSON"
    );
  };

  const callWithRetry = async (prompt) => {
    let attempt = 0;
    while (true) {
      try {
        return await callOnce(prompt);
      } catch (err) {
        const isRetryable = err?.status === 429 || err?.status === 503 || err?.message?.includes("timed out");
        if (isRetryable && attempt < MAX_RETRIES) {
          attempt++;
          const serverDelayMs = parseRetryDelaySec(err);
          const waitMs = serverDelayMs ?? BASE_BACKOFF_MS * attempt;
          console.warn(
            `[geminiClient] ${err.status || err.message} (attempt ${attempt}/${MAX_RETRIES}). ` +
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

export async function generateText(systemInstruction, userPrompt, model = "gemini-3.1-flash-lite", thinkingBudget = undefined) {
  const config = { systemInstruction };
  if (thinkingBudget !== undefined) {
    config.thinkingConfig = { thinkingBudget };
  }
  return withTimeout(
    getClient().models.generateContent({
      model,
      contents: userPrompt,
      config,
    }).then(res => res.text),
    CALL_TIMEOUT_MS,
    "generateText"
  );
}
