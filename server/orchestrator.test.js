import { runResearchOSPipeline } from "./orchestrator.js";

async function main() {
  console.log("=== TEST 1: needs_clarification halts immediately ===");
  const calledAfterDiscovery = { deepSearch: false };
  const r1 = await runResearchOSPipeline("vague idea", "student1", {
    discoveryAgent: async () => ({ needs_clarification: true, question: "What domain?", normalized_problem: "" }),
    deepSearchAgent: async () => { calledAfterDiscovery.deepSearch = true; return {}; },
    clusteringAgent: async () => ({ clusters: [] }),
    gapAgent: async () => ({}),
    plannerAgent: async () => ({}),
    curatorAgent: async () => ({}),
    criticAgent: async () => ({}),
    docxPublisher: async () => "x.docx",
    pptxPublisher: async () => "x.pptx",
  });
  console.log(`status: ${r1.status}, deepSearch called: ${calledAfterDiscovery.deepSearch}`);
  console.log(r1.status === "needs_clarification" && !calledAfterDiscovery.deepSearch ? "PASS" : "FAIL");

  console.log("\n=== TEST 2: insufficient_evidence halts before planning ===");
  const calledPlanner = { planner: false };
  const r2 = await runResearchOSPipeline("real idea", "student2", {
    discoveryAgent: async () => ({ needs_clarification: false, normalized_problem: "real idea" }),
    deepSearchAgent: async () => ({ papers: [], repos: [], web: [] }),
    clusteringAgent: async () => ({ clusters: [] }),
    gapAgent: async () => ({ insufficient_evidence: true, evidence_summary: "too thin", innovation_angles: [] }),
    plannerAgent: async () => { calledPlanner.planner = true; return {}; },
    curatorAgent: async () => ({}),
    criticAgent: async () => ({}),
    docxPublisher: async () => "x.docx",
    pptxPublisher: async () => "x.pptx",
  });
  console.log(`status: ${r2.status}, planner called: ${calledPlanner.planner}`);
  console.log(r2.status === "insufficient_evidence" && !calledPlanner.planner ? "PASS" : "FAIL");

  console.log("\n=== TEST 3: revision loop caps at 2 passes, never hangs ===");
  let criticCallCount = 0;
  const r3 = await runResearchOSPipeline("real idea", "student3", {
    discoveryAgent: async () => ({ needs_clarification: false, normalized_problem: "real idea" }),
    deepSearchAgent: async () => ({ papers: [{ id: "p1" }], repos: [], web: [] }),
    clusteringAgent: async () => ({ clusters: [] }),
    gapAgent: async () => ({ insufficient_evidence: false, gaps: ["gap1"], innovation_angles: [{ angle: "a", evidence_ids: ["p1"] }] }),
    plannerAgent: async () => ({ architecture: "x", tech_stack: ["y"], milestones: [{ name: "m", duration_days: 1 }] }),
    curatorAgent: async () => ({ datasets: [], repos: [], apis: [] }),
    criticAgent: async () => { criticCallCount++; return { approved: false, issues: [{ agent: "planner", problem: "always fails, on purpose" }] }; },
    docxPublisher: async () => "x.docx",
    pptxPublisher: async () => "x.pptx",
  });
  console.log(`status: ${r3.status}, critic called ${criticCallCount} times`);
  console.log(criticCallCount === 2 && r3.status === "approved_with_unresolved_issues" ? "PASS" : "FAIL");
}

main();
