import { generateJSON } from "./lib/geminiClient.js";

async function main() {
  console.log("Testing generateJSON with gemini-3.1-flash-lite...");
  const systemInstruction = `You are the Discovery Agent in ResearchOS.
Respond with ONLY valid JSON:
{
  "normalized_problem": "string",
  "needs_clarification": boolean,
  "question": "string or null"
}`;
  const userPrompt = `Student's idea: "Build an AI solution to reduce food waste in college hostels"`;

  try {
    const startTime = Date.now();
    const result = await generateJSON(systemInstruction, userPrompt, "gemini-3.1-flash-lite");
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Success in ${duration}s!`);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ Failed:", err.message);
  }
}

main();
