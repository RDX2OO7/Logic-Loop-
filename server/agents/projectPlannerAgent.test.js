import { readFileSync } from "fs";
import { runProjectPlannerAgent, pickStrongestAngle } from "./projectPlannerAgent.js";

const fixture = JSON.parse(readFileSync(new URL("../fixtures/gapInnovation-foodwaste.json", import.meta.url)));

async function main() {
  console.log("=== PART 1: offline unit test of pickStrongestAngle (no API calls) ===");
  const chosen = pickStrongestAngle(fixture.innovation_angles);
  console.log(`Picked angle with ${chosen.evidence_ids.length} evidence_ids: "${chosen.angle.slice(0, 70)}..."`);
  console.log(
    chosen.evidence_ids.length === 6
      ? "PASS: correctly picked the angle with the most real evidence (6 ids)"
      : "FAIL: did not pick the expected strongest angle"
  );

  console.log("\n=== PART 2: live run (real Gemini call, grounded in the real fixture data above) ===");
  const plan = await runProjectPlannerAgent(chosen, fixture.gaps);
  console.log(JSON.stringify(plan, null, 2));
}

main();
