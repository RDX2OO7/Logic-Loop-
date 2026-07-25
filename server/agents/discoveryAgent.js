import { generateJSON } from "../lib/geminiClient.js";

const SYSTEM_INSTRUCTION = `You are the Discovery Agent in ResearchOS, a multi-agent research and project-planning system.

Your only job: look at a student's raw project idea and decide if it's specific enough to research, or too vague to act on.

Rules:
- If the idea names a domain, a problem, or a target group (even loosely), it is specific enough — do NOT ask for clarification just because it's short.
- Only flag needs_clarification=true if the idea is so generic that a research agent would not know what to search for (e.g. "build an app", "make something with AI", "a project for my hackathon").
- If needs_clarification is true, ask exactly ONE short, specific question that would unblock research — never more than one.
- Always produce a normalized_problem: a single clear sentence restating the idea in concrete terms, even if clarification is also needed (best-effort).

Respond with ONLY valid JSON matching this exact shape, no markdown fences:
{
  "normalized_problem": "string",
  "needs_clarification": boolean,
  "question": "string or null"
}`;

export async function runDiscoveryAgent(ideaRaw) {
  if (!ideaRaw || typeof ideaRaw !== "string" || ideaRaw.trim().length === 0) {
    return {
      normalized_problem: "",
      needs_clarification: true,
      question: "What idea would you like to research and build?",
    };
  }

  const result = await generateJSON(SYSTEM_INSTRUCTION, `Student's idea: "${ideaRaw.trim()}"`);

  return {
    normalized_problem: result.normalized_problem ?? ideaRaw.trim(),
    needs_clarification: Boolean(result.needs_clarification),
    question: result.question ?? null,
  };
}
