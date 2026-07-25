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
}

export interface Milestone {
  name: string;
  description: string;
  duration_days: number;
}

export interface Plan {
  architecture: string;
  tech_stack: string[];
  milestones: Milestone[];
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
  status: "idle" | "running" | "done";
  agent_progress: AgentProgress[];
  sources: Sources;
  clusters: ClusterTheme[];
  gaps: string[];
  innovation_angles: InnovationAngle[];
  plan: Plan;
  resources: Resources;
  critic: Critic;
}
