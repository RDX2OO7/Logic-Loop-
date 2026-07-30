import { runDiscoveryPhase, runPlanningPhase } from "./orchestrator.js";

async function main() {
  console.log("=== TEST 1: needs_clarification halts Phase 1 ===");
  const calledAfterDiscovery = { deepSearch: false };
  const r1 = await runDiscoveryPhase("vague idea", "student1", {
    discoveryAgent: async () => ({ needs_clarification: true, question: "What domain?", normalized_problem: "" }),
    deepSearchAgent: async () => { calledAfterDiscovery.deepSearch = true; return {}; },
    clusteringAgent: async () => ({ clusters: [] }),
    gapAgent: async () => ({}),
  });
  console.log(`status: ${r1.status}, deepSearch called: ${calledAfterDiscovery.deepSearch}`);
  console.log(r1.status === "needs_clarification" && !calledAfterDiscovery.deepSearch ? "PASS" : "FAIL");

  console.log("\n=== TEST 2: Phase 1 returns ALL ranked angles, does not auto-pick one ===");
  const fakeGapOutput = {
    insufficient_evidence: false,
    evidence_summary: "good sources",
    gaps: ["gap 1"],
    innovation_angles: [
      { angle: "Angle A - low impact", impact_score: "low", effort_score: "high" },
      { angle: "Angle B - high impact", impact_score: "high", effort_score: "low" },
    ],
  };
  const r2 = await runDiscoveryPhase("smart hostel waste", "student2", {
    discoveryAgent: async () => ({ needs_clarification: false, normalized_problem: "smart hostel waste" }),
    deepSearchAgent: async () => ({ papers: [{ id: "p1" }], repos: [], web: [] }),
    clusteringAgent: async () => ({ clusters: [] }),
    gapAgent: async () => fakeGapOutput,
  });
  console.log(`status: ${r2.status}, ranked_angles count: ${r2.ranked_angles?.length}`);
  console.log(`rank 1 angle: ${r2.ranked_angles?.[0]?.angle}`);
  const pass2 =
    r2.status === "angles_ready" &&
    r2.ranked_angles?.length === 2 &&
    r2.ranked_angles[0].angle === "Angle B - high impact" &&
    r2.ranked_angles[0].priority_rank === 1 &&
    r2.chosen_angle === undefined;
  console.log(pass2 ? "PASS" : "FAIL");

  console.log("\n=== TEST 3: Phase 2 with a single selection runs only that one angle ===");
  let plannerCalls = 0;
  const plannedAngleNames = [];
  const mockPlannerDeps = {
    plannerAgent: async (chosenAngle) => {
      plannerCalls++;
      plannedAngleNames.push(chosenAngle.angle);
      return { architecture: "arch", tech_stack: ["react"], milestones: [], apis_needed: [] };
    },
    curatorAgent: async () => ({ datasets: [], repos: [], apis: [] }),
    criticAgent: async () => ({ approved: true, issues: [] }),
    docxPublisher: async () => "file.docx",
    pptxPublisher: async () => "file.pptx",
  };

  const r3 = await runPlanningPhase(r2, 0, "student3", mockPlannerDeps);
  console.log(`planner calls: ${plannerCalls}, planned angle: ${plannedAngleNames[0]}`);
  const pass3 = plannerCalls === 1 && plannedAngleNames[0] === "Angle B - high impact" && r3.status === "approved";
  console.log(pass3 ? "PASS" : "FAIL");

  console.log("\n=== TEST 4: Phase 2 with selection='all' runs every angle in parallel ===");
  plannerCalls = 0;
  plannedAngleNames.length = 0;
  const r4 = await runPlanningPhase(r2, "all", "student4", mockPlannerDeps);
  console.log(`planner calls: ${plannerCalls}, planned angles: ${plannedAngleNames.join(", ")}`);
  const pass4 = plannerCalls === 2 && r4.results?.length === 2;
  console.log(pass4 ? "PASS" : "FAIL");
}

main();
