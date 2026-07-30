import { runDiscoveryAgent } from "./agents/discoveryAgent.js";
import { runDeepSearchAgent } from "./services/deepSearch.js";
import { runClusteringAgent } from "./agents/clusteringAgent.js";
import { runGapReasoningOnSources } from "./agents/gapInnovationAgent.js";
import { runProjectPlannerAgent, rankAnglesByImpact } from "./agents/projectPlannerAgent.js";
import { runResourceCuratorAgent } from "./agents/resourceCuratorAgent.js";
import { runCriticAgent } from "./agents/criticAgent.js";
import { generateDocxReport, generatePptxDeck } from "./agents/publisherAgent.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORTS_DIR = path.join(__dirname, "exports");

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
    ...(deepSearchResult?.papers || []).map((p) => p.id),
    ...(deepSearchResult?.repos || []).map((r) => r.id),
    ...(deepSearchResult?.web || []).map((w) => w.id),
  ];
}

/**
 * Phase 1: Discovery, DeepSearch, Clustering, Gap & Innovation reasoning, and Angle Ranking.
 * Does NOT auto-pick a single angle — returns ALL ranked angles for the student to select from.
 */
export async function runDiscoveryPhase(ideaRaw, studentId, deps = defaultDeps) {
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

  const rankedAngles = rankAnglesByImpact(gapResult.innovation_angles);
  step(`ranking: ${rankedAngles.length} angle(s) ranked by impact/effort`);

  return {
    status: "angles_ready",
    studentId,
    normalized_problem: discovery.normalized_problem,
    sources: deepSearchResult,
    sourceIds,
    clusters: clustering.clusters || [],
    evidence_summary: gapResult.evidence_summary,
    gaps: gapResult.gaps || [],
    ranked_angles: rankedAngles,
    log,
  };
}

/**
 * Helper to execute the planning, curation, critic revision loop, and publication for ONE angle.
 */
export async function planOneAngle(chosenAngle, phase1Data, studentId, deps = defaultDeps) {
  const log = [...(phase1Data.log || [])];
  const step = (msg) => log.push(msg);

  step(`planOneAngle: starting for angle "${chosenAngle.angle}"`);

  const sourceIds = phase1Data.sourceIds || flattenSourceIds(phase1Data.sources);
  let plan, curated, criticResult, attempt = 0;
  let priorIssues = [];

  do {
    attempt++;
    step(`plannerAgent: attempt ${attempt}`);
    plan = await deps.plannerAgent(chosenAngle, phase1Data.gaps, priorIssues);

    step(`curatorAgent: attempt ${attempt}`);
    curated = await deps.curatorAgent(
      plan.tech_stack?.join(" ") || phase1Data.normalized_problem,
      phase1Data.normalized_problem
    );

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

  const safeAngleName = (chosenAngle.angle || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 30);
  const ts = Date.now();
  const docxFile = `output-${studentId}-${safeAngleName}-${ts}.docx`;
  const pptxFile = `output-${studentId}-${safeAngleName}-${ts}.pptx`;

  const projectData = {
    title: phase1Data.normalized_problem,
    normalized_problem: phase1Data.normalized_problem,
    evidence_summary: phase1Data.evidence_summary,
    gaps: phase1Data.gaps,
    chosen_angle: chosenAngle,
    sources: phase1Data.sources,
    plan,
    resources: curated,
  };

  step("publisher: rendering docx + pptx");
  await deps.docxPublisher(projectData, path.join(EXPORTS_DIR, docxFile));
  await deps.pptxPublisher(projectData, path.join(EXPORTS_DIR, pptxFile));
  step("publisher: done");

  return {
    status: criticResult.approved ? "approved" : "approved_with_unresolved_issues",
    chosen_angle: chosenAngle,
    projectData,
    critic: criticResult,
    exports: { docxUrl: `/exports/${docxFile}`, pptxUrl: `/exports/${pptxFile}` },
    log,
  };
}

/**
 * Phase 2: Project Planning & Publication for selected innovation angle(s).
 * Selection can be a single index (0, 1, ...), an angle object, or "all" to run all angles in parallel.
 */
export async function runPlanningPhase(phase1Data, selection, studentId, deps = defaultDeps) {
  const anglesToPlan = [];

  if (selection === "all") {
    anglesToPlan.push(...(phase1Data.ranked_angles || []));
  } else if (typeof selection === "number") {
    if (phase1Data.ranked_angles && phase1Data.ranked_angles[selection]) {
      anglesToPlan.push(phase1Data.ranked_angles[selection]);
    }
  } else if (typeof selection === "object" && selection !== null && selection.angle) {
    anglesToPlan.push(selection);
  } else if (Array.isArray(selection)) {
    for (const item of selection) {
      if (typeof item === "number" && phase1Data.ranked_angles?.[item]) {
        anglesToPlan.push(phase1Data.ranked_angles[item]);
      } else if (typeof item === "object" && item?.angle) {
        anglesToPlan.push(item);
      }
    }
  } else {
    if (phase1Data.ranked_angles?.[0]) {
      anglesToPlan.push(phase1Data.ranked_angles[0]);
    }
  }

  if (anglesToPlan.length === 0) {
    throw new Error("runPlanningPhase: No valid innovation angle selected for planning.");
  }

  if (selection === "all" || anglesToPlan.length > 1) {
    const results = await Promise.all(
      anglesToPlan.map((angle) => planOneAngle(angle, phase1Data, studentId || phase1Data.studentId, deps))
    );
    return {
      status: "completed",
      results,
    };
  } else {
    return await planOneAngle(anglesToPlan[0], phase1Data, studentId || phase1Data.studentId, deps);
  }
}

/**
 * End-to-end convenience wrapper: Runs Phase 1 then automatically plans top angle (rank 1).
 */
export async function runResearchOSPipeline(ideaRaw, studentId, deps = defaultDeps) {
  const phase1 = await runDiscoveryPhase(ideaRaw, studentId, deps);
  if (phase1.status !== "angles_ready") {
    return phase1;
  }
  return await runPlanningPhase(phase1, 0, studentId, deps);
}
