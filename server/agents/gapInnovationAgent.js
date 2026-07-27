import { generateJSON } from "../lib/geminiClient.js";
import { runDeepSearchAgent } from "../services/deepSearch.js";

const SYSTEM_INSTRUCTION = `You are the Gap & Innovation Agent in ResearchOS, a multi-agent research system.

You will be given a JSON list of REAL papers, repos, and web sources retrieved live by the DeepSearch agent, each with an "id" and identifying text.

STRICT RULES:
- You may ONLY reference sources that appear in the provided list. Never invent a paper, repo, statistic, or fact that is not present in the input.
- Every gap you name and every innovation angle you propose must be grounded in the ACTUAL provided sources — cite the specific source ids that support it in evidence_ids. Do not cite an id that isn't in the input.
- If the provided sources are too thin, too narrow, or too one-sided (e.g. only repos and no papers, or fewer than 3 sources total) to responsibly identify a real gap, set insufficient_evidence to true and explain why in evidence_summary — do NOT invent gaps to fill space just because you were asked for some.
- A genuine gap must reflect something the provided sources collectively fail to address — not a generic industry buzzword unconnected to what was actually retrieved.

Respond with ONLY valid JSON, no markdown fences, matching this exact shape:
{
  "insufficient_evidence": boolean,
  "evidence_summary": "string — 1-2 sentences on what the source set actually covers",
  "gaps": ["string", ...],
  "innovation_angles": [{"angle": "string", "why_novel": "string", "evidence_ids": ["id1", "id2"]}]
}`;

function buildSourceList(deepSearchResult) {
  const items = [];
  for (const p of deepSearchResult.papers || []) {
    items.push({ id: p.id, type: "paper", title: p.title, snippet: p.snippet });
  }
  for (const r of deepSearchResult.repos || []) {
    items.push({ id: r.id, type: "repo", title: r.name, snippet: r.description });
  }
  for (const w of deepSearchResult.web || []) {
    items.push({ id: w.id, type: "web", title: w.title, snippet: w.snippet });
  }
  return items;
}

export function stripUnverifiedEvidence(agentOutput, validIds) {
  const validSet = new Set(validIds);
  let strippedCount = 0;

  const cleanedAngles = (agentOutput.innovation_angles || []).map((angle) => {
    const before = angle.evidence_ids?.length || 0;
    const cleaned = (angle.evidence_ids || []).filter((id) => validSet.has(id));
    strippedCount += before - cleaned.length;
    return { ...angle, evidence_ids: cleaned };
  });

  if (strippedCount > 0) {
    console.warn(
      `stripUnverifiedEvidence: removed ${strippedCount} evidence_id reference(s) that did not match any real source. The model likely hallucinated a citation.`
    );
  }

  return { ...agentOutput, innovation_angles: cleanedAngles, _stripped_hallucinated_citations: strippedCount };
}

/**
 * runGapReasoningOnSources(deepSearchResult, query)
 * Core reasoning step — takes an already-fetched DeepSearch result object
 * and runs the Gemini gap/innovation analysis on it.
 * Does NOT call DeepSearch itself, so the Orchestrator can reuse one fetch.
 */
export async function runGapReasoningOnSources(deepSearchResult, query) {
  const sources = buildSourceList(deepSearchResult);

  if (sources.length === 0) {
    return {
      insufficient_evidence: true,
      evidence_summary: "DeepSearch returned zero sources — cannot responsibly identify gaps with no evidence.",
      gaps: [],
      innovation_angles: [],
      _stripped_hallucinated_citations: 0,
      _source_count: 0,
    };
  }

  const prompt = `Sources retrieved for the query "${query}":\n${JSON.stringify(sources, null, 2)}`;
  const rawOutput = await generateJSON(SYSTEM_INSTRUCTION, prompt);

  const validIds = sources.map((s) => s.id);
  const cleaned = stripUnverifiedEvidence(rawOutput, validIds);

  return { ...cleaned, _source_count: sources.length };
}

/**
 * runGapInnovationAgent(query)
 * Convenience wrapper — fetches DeepSearch results then delegates to
 * runGapReasoningOnSources. Kept for backward-compatibility with existing tests.
 */
export async function runGapInnovationAgent(query) {
  const deepSearchResult = await runDeepSearchAgent(query);
  return runGapReasoningOnSources(deepSearchResult, query);
}
