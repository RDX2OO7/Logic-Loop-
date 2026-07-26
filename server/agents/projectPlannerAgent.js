import { generateJSON } from "../lib/geminiClient.js";

const SYSTEM_INSTRUCTION = `You are the Project Planner Agent in ResearchOS, a multi-agent research system.



You will be given ONE chosen innovation angle (with its supporting evidence) plus the broader gap context it came from. Turn it into a concrete, buildable project plan.

RULES:
- Ground the plan in the actual angle given — do not drift into a generic version of the idea that ignores what makes this specific angle novel.
- tech_stack must name real, specific technologies (e.g. "React", "TensorFlow Lite", "PostgreSQL") — never vague placeholders like "AI/ML" or "cloud infrastructure" alone.
- milestones should be realistic and sequential — each one buildable on the last, with duration_days that sum to a sensible total for a small team (roughly 2-6 weeks total unless the angle clearly demands more).
- apis_needed should list only APIs/services that are plausibly free-tier or low-cost for a student project.
- Do not invent named datasets, papers, or companies that weren't part of the input — if you reference the evidence, describe it generically (e.g. "the retrieved GitHub prototypes") rather than fabricating specifics not present in the input.
- Every entry in apis_needed must directly support a task described in the milestones or architecture — do not add APIs for speculative future features not part of this plan.
- If an API is truly not needed for any milestone or for core architecture, DO NOT add it to apis_needed.

Respond with ONLY valid JSON, no markdown fences, matching this exact shape:
{
  "architecture": "string — 2-4 sentences describing the system's structure and data flow",
  "tech_stack": ["string", ...],
  "milestones": [{ "name": "string", "description": "string", "duration_days": number }],
  "apis_needed": ["string", ...]
}`;

export async function runProjectPlannerAgent(chosenAngle, gaps = []) {
  if (!chosenAngle || !chosenAngle.angle) {
    throw new Error("runProjectPlannerAgent requires a chosenAngle object with at least an 'angle' field.");
  }

  const prompt = `Chosen innovation angle:\n${JSON.stringify(chosenAngle, null, 2)}\n\nBroader gap context this angle addresses:\n${JSON.stringify(gaps, null, 2)}`;

  const result = await generateJSON(SYSTEM_INSTRUCTION, prompt);

  return {
    architecture: result.architecture ?? "",
    tech_stack: Array.isArray(result.tech_stack) ? result.tech_stack : [],
    milestones: Array.isArray(result.milestones) ? result.milestones : [],
    apis_needed: Array.isArray(result.apis_needed) ? result.apis_needed : [],
  };
}

export function pickStrongestAngle(innovationAngles) {
  if (!innovationAngles || innovationAngles.length === 0) return null;
  return [...innovationAngles].sort(
    (a, b) => (b.evidence_ids?.length || 0) - (a.evidence_ids?.length || 0)
  )[0];
}
