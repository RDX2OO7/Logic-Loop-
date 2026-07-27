import { runDiscoveryAgent } from "./agents/discoveryAgent.js";
import { runDeepSearchAgent } from "./services/deepSearch.js";
import { runClusteringAgent } from "./agents/clusteringAgent.js";
import { runGapReasoningOnSources } from "./agents/gapInnovationAgent.js";
import { runProjectPlannerAgent, pickStrongestAngle } from "./agents/projectPlannerAgent.js";
import { runResourceCuratorAgent } from "./agents/resourceCuratorAgent.js";
import { runCriticAgent } from "./agents/criticAgent.js";
import { generateDocxReport, generatePptxDeck } from "./agents/publisherAgent.js";

const MAX_REVISION_PASSES = 2;

const defaultDeps = {
  discoveryAgent: runDiscoveryAgent,
  deepSearchAgent: runDeepSearchAgent,
  clusteringAgent: runClusteringAgent,
  gapAgent: runGapReasoningOnSources,
  plannerAgent: runProjectPlannerAgent,
  curatorAgent: runResourceCuratorAgent,
  criticAgent: runCriticAgent,
  docxPublisher: generateDocxReport,
  pptxPublisher: generatePptxDeck,
};

function flattenSourceIds(deepSearchResult) {
  return [
    ...(deepSearchResult.papers || []).map((p) => p.id),
    ...(deepSearchResult.repos || []).map((r) => r.id),
    ...(deepSearchResult.web || []).map((w) => w.id),
  ];
}

export async function runResearchOSPipeline(ideaRaw, studentId, deps = defaultDeps) {
  const log = [];
  const step = (msg) => log.push(msg);

  step("discovery: start");
  const discovery = await deps.discoveryAgent(ideaRaw);
  if (discovery.needs_clarification) {
    step("discovery: needs clarification, halting");
    return { status: "needs_clarification", question: discovery.question, log };
  }
  step("discovery: validated");

  step("deepSearch: start");
  const deepSearchResult = await deps.deepSearchAgent(discovery.normalized_problem);
  const sourceIds = flattenSourceIds(deepSearchResult);
  step(`deepSearch: ${sourceIds.length} sources found`);

  step("clustering: start");
  const clustering = await deps.clusteringAgent(deepSearchResult);
  step(`clustering: ${clustering.clusters?.length || 0} clusters`);

  step("gapAgent: start");
  const gapResult = await deps.gapAgent(deepSearchResult, discovery.normalized_problem);
  if (gapResult.insufficient_evidence || !gapResult.innovation_angles?.length) {
    step("gapAgent: insufficient evidence, halting");
    return { status: "insufficient_evidence", evidence_summary: gapResult.evidence_summary, log };
  }
  step(`gapAgent: ${gapResult.innovation_angles.length} innovation angle(s) found`);

  const chosenAngle = pickStrongestAngle(gapResult.innovation_angles);

  let plan, curated, criticResult, attempt = 0;
  let priorIssues = [];

  do {
    attempt++;
    step(`plannerAgent: attempt ${attempt}`);
    plan = await deps.plannerAgent(chosenAngle, gapResult.gaps, priorIssues);

    step(`curatorAgent: attempt ${attempt}`);
    curated = await deps.curatorAgent(plan.tech_stack?.join(" ") || discovery.normalized_problem, discovery.normalized_problem);

    step(`criticAgent: attempt ${attempt}`);
    criticResult = await deps.criticAgent({
      innovation_angles: [chosenAngle],
      validSourceIds: sourceIds,
      plan,
      resources: curated,
    });

    if (criticResult.approved) {
      step(`criticAgent: approved on attempt ${attempt}`);
      break;
    }
    step(`criticAgent: ${criticResult.issues.length} issue(s) found on attempt ${attempt}`);
    priorIssues = criticResult.issues;
  } while (attempt < MAX_REVISION_PASSES);

  const projectData = {
    title: discovery.normalized_problem,
    normalized_problem: discovery.normalized_problem,
    evidence_summary: gapResult.evidence_summary,
    gaps: gapResult.gaps,
    chosen_angle: chosenAngle,
    plan,
    resources: curated,
  };

  step("publisher: rendering docx + pptx");
  const docxPath = await deps.docxPublisher(projectData, `output-${studentId}.docx`);
  const pptxPath = await deps.pptxPublisher(projectData, `output-${studentId}.pptx`);
  step("publisher: done");

  return {
    status: criticResult.approved ? "approved" : "approved_with_unresolved_issues",
    projectData,
    critic: criticResult,
    exports: { docxPath, pptxPath },
    log,
  };
}
