import { generateJSON } from "../lib/geminiClient.js";

const SYSTEM_INSTRUCTION = `You are the Project Planner Agent in ResearchOS, a multi-agent research system.

You will be given ONE chosen innovation angle (with its supporting evidence) plus the broader gap context it came from. Turn it into a comprehensive, deeply technical, buildable project plan covering everything from UI construction to production deployment.

RULES:
- Ground the plan in the actual angle given — do not drift into a generic version of the idea that ignores what makes this specific angle novel.
- tech_stack must name real, specific technologies (e.g. "React 18", "TypeScript", "FastAPI", "TensorFlow Lite", "PostgreSQL", "Docker") — never vague placeholders like "AI/ML" or "cloud infrastructure" alone.
- milestones should be realistic, sequential, and deeply granular — covering initial architecture, UI building, backend/AI integration, through to production deployment with duration_days that sum to a sensible total (roughly 2-6 weeks total).
- Each milestone MUST include concrete subtasks, key deliverables, and tech focus.
- tech_stack_breakdown must categorize technologies across 5 distinct domains: frontend_ui, backend_api, database_storage, ai_ml_data, and dev_ops_deployment.
- ui_implementation_plan must specify the design system philosophy, core page views (with key UI components for each view), and client state management/data syncing approach.
- data_flow_and_endpoints must specify key API endpoints (HTTP method, endpoint path, purpose, payload summary).
- deployment_strategy must specify hosting environments, CI/CD pipeline, required environment variables, and telemetry/monitoring.
- apis_needed should list only APIs/services that are plausibly free-tier or low-cost for a student project.
- Do not invent named datasets, papers, or companies that weren't part of the input — if you reference the evidence, describe it generically (e.g. "the retrieved GitHub prototypes").
- Every entry in apis_needed must directly support a task described in the milestones or architecture — do not add APIs for speculative future features not part of this plan.

Respond with ONLY valid JSON, no markdown fences, matching this exact shape:
{
  "architecture": "string — 2-4 sentences describing system structure and data flow",
  "tech_stack": ["string", ...],
  "milestones": [
    {
      "name": "string",
      "description": "string",
      "duration_days": number,
      "subtasks": ["string", ...],
      "deliverables": ["string", ...],
      "tech_focus": ["string", ...]
    }
  ],
  "apis_needed": ["string", ...],
  "tech_stack_breakdown": {
    "frontend_ui": ["string", ...],
    "backend_api": ["string", ...],
    "database_storage": ["string", ...],
    "ai_ml_data": ["string", ...],
    "dev_ops_deployment": ["string", ...]
  },
  "ui_implementation_plan": {
    "design_system": "string — visual theme, responsive layout strategy, component guidelines",
    "core_views": [
      {
        "page_name": "string",
        "purpose": "string",
        "key_components": ["string", ...]
      }
    ],
    "state_management": "string — state architecture, caching, websockets, sync handling"
  },
  "data_flow_and_endpoints": [
    {
      "endpoint": "string",
      "method": "string (GET|POST|PUT|DELETE|WS)",
      "purpose": "string",
      "payload_summary": "string"
    }
  ],
  "deployment_strategy": {
    "hosting_environments": "string — frontend, backend, database, and ML model deployment hosts",
    "ci_cd_pipeline": "string — step-by-step build, test, and zero-downtime deploy workflow",
    "environment_variables": ["string", ...],
    "monitoring_and_logs": "string — logging, health checks, error tracking"
  }
}`;

export async function runProjectPlannerAgent(chosenAngle, gaps = [], priorIssues = []) {
  if (!chosenAngle || !chosenAngle.angle) {
    throw new Error("runProjectPlannerAgent requires a chosenAngle object with at least an 'angle' field.");
  }

  let prompt = `Chosen innovation angle:\n${JSON.stringify(chosenAngle, null, 2)}\n\nBroader gap context this angle addresses:\n${JSON.stringify(gaps, null, 2)}`;

  if (priorIssues.length > 0) {
    const issueLines = priorIssues.map((iss, i) => `  ${i + 1}. [${iss.agent}] ${iss.problem}`).join("\n");
    prompt += `\n\nCRITIC FEEDBACK FROM PREVIOUS ATTEMPT — you MUST address all of these in your revised plan:\n${issueLines}\n\nDo NOT repeat any of the listed problems. Revise the architecture, tech_stack, milestones, and apis_needed accordingly.`;
  }

  const result = await generateJSON(SYSTEM_INSTRUCTION, prompt);

  return {
    architecture: result.architecture ?? "",
    tech_stack: Array.isArray(result.tech_stack) ? result.tech_stack : [],
    milestones: Array.isArray(result.milestones)
      ? result.milestones.map((m) => ({
          name: m.name ?? "",
          description: m.description ?? "",
          duration_days: typeof m.duration_days === "number" ? m.duration_days : 0,
          subtasks: Array.isArray(m.subtasks) ? m.subtasks : [],
          deliverables: Array.isArray(m.deliverables) ? m.deliverables : [],
          tech_focus: Array.isArray(m.tech_focus) ? m.tech_focus : [],
        }))
      : [],
    apis_needed: Array.isArray(result.apis_needed) ? result.apis_needed : [],
    tech_stack_breakdown:
      result.tech_stack_breakdown && typeof result.tech_stack_breakdown === "object"
        ? {
            frontend_ui: Array.isArray(result.tech_stack_breakdown.frontend_ui) ? result.tech_stack_breakdown.frontend_ui : [],
            backend_api: Array.isArray(result.tech_stack_breakdown.backend_api) ? result.tech_stack_breakdown.backend_api : [],
            database_storage: Array.isArray(result.tech_stack_breakdown.database_storage) ? result.tech_stack_breakdown.database_storage : [],
            ai_ml_data: Array.isArray(result.tech_stack_breakdown.ai_ml_data) ? result.tech_stack_breakdown.ai_ml_data : [],
            dev_ops_deployment: Array.isArray(result.tech_stack_breakdown.dev_ops_deployment) ? result.tech_stack_breakdown.dev_ops_deployment : [],
          }
        : { frontend_ui: [], backend_api: [], database_storage: [], ai_ml_data: [], dev_ops_deployment: [] },
    ui_implementation_plan:
      result.ui_implementation_plan && typeof result.ui_implementation_plan === "object"
        ? {
            design_system: result.ui_implementation_plan.design_system ?? "",
            core_views: Array.isArray(result.ui_implementation_plan.core_views)
              ? result.ui_implementation_plan.core_views.map((v) => ({
                  page_name: v.page_name ?? "",
                  purpose: v.purpose ?? "",
                  key_components: Array.isArray(v.key_components) ? v.key_components : [],
                }))
              : [],
            state_management: result.ui_implementation_plan.state_management ?? "",
          }
        : { design_system: "", core_views: [], state_management: "" },
    data_flow_and_endpoints: Array.isArray(result.data_flow_and_endpoints)
      ? result.data_flow_and_endpoints.map((ep) => ({
          endpoint: ep.endpoint ?? "",
          method: ep.method ?? "GET",
          purpose: ep.purpose ?? "",
          payload_summary: ep.payload_summary ?? "",
        }))
      : [],
    deployment_strategy:
      result.deployment_strategy && typeof result.deployment_strategy === "object"
        ? {
            hosting_environments: result.deployment_strategy.hosting_environments ?? "",
            ci_cd_pipeline: result.deployment_strategy.ci_cd_pipeline ?? "",
            environment_variables: Array.isArray(result.deployment_strategy.environment_variables) ? result.deployment_strategy.environment_variables : [],
            monitoring_and_logs: result.deployment_strategy.monitoring_and_logs ?? "",
          }
        : { hosting_environments: "", ci_cd_pipeline: "", environment_variables: [], monitoring_and_logs: "" },
  };
}

const IMPACT_WEIGHT = { high: 3, medium: 2, low: 1 };
const EFFORT_WEIGHT = { low: 3, medium: 2, high: 1 };

export function rankAnglesByImpact(innovationAngles) {
  if (!innovationAngles || innovationAngles.length === 0) return [];
  return [...innovationAngles]
    .map((angle, i) => ({ ...angle, _originalIndex: i }))
    .sort((a, b) => {
      const impactDiff = (IMPACT_WEIGHT[b.impact_score] || 0) - (IMPACT_WEIGHT[a.impact_score] || 0);
      if (impactDiff !== 0) return impactDiff;
      return (EFFORT_WEIGHT[b.effort_score] || 0) - (EFFORT_WEIGHT[a.effort_score] || 0);
    })
    .map((angle, rank) => ({ ...angle, priority_rank: rank + 1 }));
}
