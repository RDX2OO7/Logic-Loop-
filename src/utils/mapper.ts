import { CopilotData } from '../types';

export function mapOrchestratorToCopilotData(
  result: any,
  ideaText: string,
  executionTimeSec: number
): CopilotData {
  const status = result?.status || 'approved';
  const projectData = result?.projectData || {};
  const sources = projectData.sources || { papers: [], repos: [], web: [] };

  const papers = (sources.papers || []).map((p: any) => ({
    title: p.title || p.name || 'Untitled Paper',
    url: p.url || '#',
    snippet: p.snippet || p.abstract || '',
    source: p.source || 'Academic Source'
  }));

  const repos = (sources.repos || []).map((r: any) => ({
    name: r.name || 'Repository',
    url: r.url || '#',
    stars: r.stars,
    description: r.description || ''
  }));

  const web = (sources.web || []).map((w: any) => ({
    title: w.title || 'Web Signal',
    url: w.url || '#',
    snippet: w.snippet || ''
  }));

  const totalPapers = papers.length;
  const totalRepos = repos.length;
  const totalWeb = web.length;

  const clusters = [];
  if (totalPapers > 0) clusters.push({ theme: "Academic Literature", item_count: totalPapers });
  if (totalRepos > 0) clusters.push({ theme: "Open Source Codebases", item_count: totalRepos });
  if (totalWeb > 0) clusters.push({ theme: "Web Telemetry & Signals", item_count: totalWeb });

  const innovationAngles = [];
  if (projectData.chosen_angle) {
    if (typeof projectData.chosen_angle === 'object') {
      innovationAngles.push({
        angle: projectData.chosen_angle.angle || '',
        why_novel: projectData.chosen_angle.why_novel || ''
      });
    } else {
      innovationAngles.push({
        angle: String(projectData.chosen_angle),
        why_novel: ''
      });
    }
  }

  const plan = {
    architecture: projectData.plan?.architecture || '',
    tech_stack: Array.isArray(projectData.plan?.tech_stack) ? projectData.plan.tech_stack : [],
    milestones: Array.isArray(projectData.plan?.milestones) ? projectData.plan.milestones : []
  };

  const curatedResources = projectData.resources || {};
  const resources = {
    datasets: Array.isArray(curatedResources.datasets) ? curatedResources.datasets : [],
    repos: Array.isArray(curatedResources.repos) ? curatedResources.repos : [],
    apis: Array.isArray(curatedResources.apis) ? curatedResources.apis : []
  };

  if (Array.isArray(projectData.plan?.apis_needed)) {
    projectData.plan.apis_needed.forEach((apiName: string) => {
      if (apiName && !resources.apis.some((a: any) => a.name === apiName)) {
        resources.apis.push({ name: apiName, url: '#' });
      }
    });
  }

  const critic = result?.critic || {
    approved: status === 'approved',
    issues: []
  };

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    pipelineStatus: status,
    question: result?.question || undefined,
    evidence_summary: result?.evidence_summary || projectData.evidence_summary || undefined,
    log: result?.log || [],
    normalized_problem: projectData.normalized_problem || projectData.title || ideaText,
    status: 'done',
    agent_progress: [
      { name: "Discovery", status: "done", description: status === 'needs_clarification' ? "Clarification requested" : "Idea validated" },
      { name: "DeepSearch", status: status === 'needs_clarification' ? "pending" : "done", description: `${totalPapers + totalRepos + totalWeb} sources` },
      { name: "Clustering", status: status === 'needs_clarification' ? "pending" : "done", description: `${clusters.length} clusters` },
      { name: "Gap & Innovation", status: status === 'needs_clarification' ? "pending" : "done", description: status === 'insufficient_evidence' ? "Insufficient evidence" : `${innovationAngles.length} angle` },
      { name: "Planner", status: status === 'approved' || status === 'approved_with_unresolved_issues' ? "done" : "pending", description: "Architecture" },
      { name: "Curator", status: status === 'approved' || status === 'approved_with_unresolved_issues' ? "done" : "pending", description: "Resources" },
      { name: "Critic", status: status === 'approved' || status === 'approved_with_unresolved_issues' ? "done" : "pending", description: critic.approved ? "Approved" : "Flagged" },
      { name: "Publisher", status: status === 'approved' || status === 'approved_with_unresolved_issues' ? "done" : "pending", description: "Exports" }
    ],
    sources: { papers, repos, web },
    clusters,
    gaps: Array.isArray(projectData.gaps) ? projectData.gaps : [],
    innovation_angles: innovationAngles,
    plan,
    resources,
    critic,
    exports: result?.exports,
    generatedAt: timeString,
    executionTimeSec: Number(executionTimeSec.toFixed(1))
  };
}
