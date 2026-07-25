import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in .env — get one at https://aistudio.google.com/apikey");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateJSON(systemInstruction, userPrompt, model = "gemini-2.5-flash") {
  const call = async (prompt) => {
    const response = await ai.models.generateContent({
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
