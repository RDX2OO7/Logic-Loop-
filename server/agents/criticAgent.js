import { generateJSON } from "../lib/geminiClient.js";

export function verifyEvidenceIntegrity(innovationAngles, validSourceIds) {
  const validSet = new Set(validSourceIds);
  const issues = [];
  for (const angle of innovationAngles || []) {
    const badIds = (angle.evidence_ids || []).filter((id) => !validSet.has(id));
    if (badIds.length > 0) {
      issues.push({
        agent: "gaps",
        problem: `Innovation angle "${angle.angle?.slice(0, 60)}..." cites evidence_id(s) not present in the real source list: ${badIds.join(", ")}`,
      });
    }
  }
  return issues;
}

export function verifyPlanSanity(plan) {
  const issues = [];
  if (!plan?.architecture || plan.architecture.trim().length < 20) {
    issues.push({ agent: "planner", problem: "architecture description is missing or too short to be meaningful." });
  }
  if (!plan?.tech_stack || plan.tech_stack.length === 0) {
    issues.push({ agent: "planner", problem: "tech_stack is empty." });
  }
  if (!plan?.milestones || plan.milestones.length === 0) {
    issues.push({ agent: "planner", problem: "milestones array is empty." });
  } else {
    const totalDays = plan.milestones.reduce((sum, m) => sum + (m.duration_days || 0), 0);
    if (totalDays <= 0) {
      issues.push({ agent: "planner", problem: "milestone durations sum to zero or less." });
    } else if (totalDays > 180) {
      issues.push({ agent: "planner", problem: `milestones sum to ${totalDays} days — unrealistically long for the described scope.` });
    }
    const badMilestone = plan.milestones.find((m) => !m.duration_days || m.duration_days <= 0);
    if (badMilestone) {
      issues.push({ agent: "planner", problem: `milestone "${badMilestone.name}" has an invalid duration_days value.` });
    }
  }
  return issues;
}

const HOLISTIC_SYSTEM_INSTRUCTION = `You are the Critic Agent in ResearchOS — the final quality gate before a project plan is shown to a student.

You will be given the full assembled draft: the chosen innovation angle with its evidence, the generated plan (architecture, tech_stack, milestones, apis_needed), and the curated resources.

YOUR JOB: find real problems, not invent them.
- Flag any part of the architecture or plan that doesn't logically follow from the chosen innovation angle.
- Flag any item in apis_needed or tech_stack that seems disconnected from what the milestones actually describe building (scope creep).
- Flag any api or service listed that is known to require a billing account for its free tier (this is a real recurring issue in this codebase — e.g. Google Cloud Vision, Google Cloud Translation).
- Do NOT flag things that are simply your personal stylistic preference — only flag genuine inconsistencies, ungrounded claims, or scope creep.
- If you find nothing wrong, say so plainly — do not manufacture an issue just to have something to report.

Respond with ONLY valid JSON, no markdown fences:
{
  "issues": [{ "agent": "planner"|"curator"|"gaps", "problem": "string" }]
}`;

export async function runCriticAgent(draft) {
  const mechanicalIssues = [
    ...verifyEvidenceIntegrity(draft.innovation_angles, draft.validSourceIds || []),
    ...verifyPlanSanity(draft.plan),
  ];

  const holisticPrompt = `Chosen angle + evidence:\n${JSON.stringify(draft.innovation_angles, null, 2)}\n\nPlan:\n${JSON.stringify(draft.plan, null, 2)}\n\nResources:\n${JSON.stringify(draft.resources, null, 2)}`;
  const holisticResult = await generateJSON(HOLISTIC_SYSTEM_INSTRUCTION, holisticPrompt);
  const holisticIssues = holisticResult.issues || [];

  const allIssues = [...mechanicalIssues, ...holisticIssues];
  return {
    approved: allIssues.length === 0,
    issues: allIssues,
  };
}
