export interface AgentProgress {
  name: string;
  status: "pending" | "active" | "done";
  description?: string;
}

export interface PaperSource {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface RepoSource {
  name: string;
  url: string;
  stars?: number;
  description?: string;
}

export interface WebSource {
  title: string;
  url: string;
  snippet: string;
}

export interface Sources {
  papers: PaperSource[];
  repos: RepoSource[];
  web: WebSource[];
}

export interface ClusterTheme {
  theme: string;
  item_count: number;
}

export interface InnovationAngle {
  angle: string;
  why_novel: string;
  evidence_ids?: string[];
  impact_score?: 'high' | 'medium' | 'low';
  impact_rationale?: string;
  effort_score?: 'high' | 'medium' | 'low';
  effort_rationale?: string;
  priority_rank?: number;
  _originalIndex?: number;
}

export interface Phase1Result {
  status: string;
  draftId: string;
  angles: InnovationAngle[];
  evidence_summary: string;
  gaps: string[];
  normalized_problem: string;
  question?: string;
  log?: string[];
}

export interface SubTask {
  text: string;
  done: boolean;
  flatIndex: number;
}

export interface Milestone {
  name: string;
  description: string;
  duration_days: number;
  subtasks?: string[] | SubTask[];
  deliverables?: string[];
  tech_focus?: string[];
}

export interface TechStackBreakdown {
  frontend_ui: string[];
  backend_api: string[];
  database_storage: string[];
  ai_ml_data: string[];
  dev_ops_deployment: string[];
}

export interface UIViewDetail {
  page_name: string;
  purpose: string;
  key_components: string[];
}

export interface UIImplementationPlan {
  design_system: string;
  core_views: UIViewDetail[];
  state_management: string;
}

export interface APIEndpointSpec {
  endpoint: string;
  method: string;
  purpose: string;
  payload_summary: string;
}

export interface DeploymentStrategy {
  hosting_environments: string;
  ci_cd_pipeline: string;
  environment_variables: string[];
  monitoring_and_logs: string;
}

export interface Plan {
  architecture: string;
  tech_stack: string[];
  milestones: Milestone[];
  apis_needed?: string[];
  tech_stack_breakdown?: TechStackBreakdown;
  ui_implementation_plan?: UIImplementationPlan;
  data_flow_and_endpoints?: APIEndpointSpec[];
  deployment_strategy?: DeploymentStrategy;
}

export interface ResourceItem {
  name: string;
  url: string;
}

export interface Resources {
  datasets: ResourceItem[];
  repos: ResourceItem[];
  apis: ResourceItem[];
}

export interface CriticIssue {
  agent: string;
  problem: string;
}

export interface Critic {
  approved: boolean;
  issues: CriticIssue[];
}

export interface CopilotData {
  normalized_problem: string;
  evidence_summary?: string;
  pipelineStatus: "approved" | "approved_with_unresolved_issues" | "needs_clarification" | "insufficient_evidence" | "error";
  question?: string;
  log?: string[];
  status: "idle" | "running" | "done";
  agent_progress: AgentProgress[];
  sources: Sources;
  clusters: ClusterTheme[];
  gaps: string[];
  innovation_angles: InnovationAngle[];
  plan: Plan;
  resources: Resources;
  critic: Critic;
  generatedAt?: string;
  executionTimeSec?: number;
  exports?: {
    docxUrl?: string;
    pptxUrl?: string;
    docxPath?: string;
    pptxPath?: string;
  };
  projectId?: string;
}
