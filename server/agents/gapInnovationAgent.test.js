import { runGapInnovationAgent, stripUnverifiedEvidence } from "./gapInnovationAgent.js";

const query = process.argv[2] || "food waste reduction hostels";

async function main() {
  console.log("=== PART 1: offline unit test of stripUnverifiedEvidence (no API calls) ===");
  const fakeModelOutput = {
    insufficient_evidence: false,
    evidence_summary: "test",
    gaps: ["test gap"],
    innovation_angles: [
      { angle: "Real angle", why_novel: "x", evidence_ids: ["real-id-1", "HALLUCINATED-ID-999"] },
    ],
  };
  const cleaned = stripUnverifiedEvidence(fakeModelOutput, ["real-id-1", "real-id-2"]);
  console.log(JSON.stringify(cleaned, null, 2));
  console.log(
    cleaned._stripped_hallucinated_citations === 1
      ? "PASS: correctly stripped the fabricated id and kept the real one"
      : "FAIL: guardrail did not behave as expected"
  );

  console.log("\n=== PART 2: live end-to-end run (real DeepSearch + real Gemini call) ===");
  console.log(`Query: "${query}"`);
  const result = await runGapInnovationAgent(query);
  console.log(JSON.stringify(result, null, 2));
}

main();
