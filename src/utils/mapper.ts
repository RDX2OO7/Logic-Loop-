import { CopilotData, InnovationAngle } from '../types';

export function mapOrchestratorToCopilotData(
  result: any,
  ideaText: string,
  executionTimeSec: number
): CopilotData {
  const status = result?.status || 'approved';
  const projectData = result?.projectData || result || {};
  const sources = projectData.sources || result?.sources || { papers: [], repos: [], web: [] };

  const papers = (sources.papers || []).map((p: any) => ({
    title: p.title || p.name || 'Untitled Paper',
    url: p.url || '#',
    snippet: p.snippet || p.abstract || '',
    source: p.source || 'Academic Source',
  }));

  const repos = (sources.repos || []).map((r: any) => ({
    name: r.name || r.full_name || 'Repository',
    url: r.url || r.html_url || '#',
    stars: r.stars ?? r.stargazers_count,
    description: r.description || '',
  }));

  const web = (sources.web || []).map((w: any) => ({
    title: w.title || 'Web Signal',
    url: w.url || '#',
    snippet: w.snippet || w.content || '',
  }));

  const totalPapers = papers.length;
  const totalRepos = repos.length;
  const totalWeb = web.length;

  const clusters = [];
  if (totalPapers > 0) clusters.push({ theme: "Academic Literature", item_count: totalPapers });
  if (totalRepos > 0) clusters.push({ theme: "Open Source Codebases", item_count: totalRepos });
  if (totalWeb > 0) clusters.push({ theme: "Web Telemetry & Signals", item_count: totalWeb });

  // Gather chosen angle or angles
  const chosenAngle = projectData.chosen_angle || result?.chosen_angle;
  const rawAngles = [
    ...(chosenAngle ? [chosenAngle] : []),
    ...(projectData.innovation_angles || []),
    ...(result?.innovation_angles || []),
    ...(projectData.angles || []),
    ...(result?.angles || []),
    ...(projectData.ranked_angles || []),
    ...(result?.ranked_angles || []),
  ];

  const seenAngles = new Set<string>();
  const innovationAngles: InnovationAngle[] = [];

  for (const item of rawAngles) {
    if (!item) continue;
    const angleObj = typeof item === 'object' ? item : { angle: String(item), why_novel: '' };
    const title = angleObj.angle?.trim();
    if (title && !seenAngles.has(title)) {
      seenAngles.add(title);
      innovationAngles.push({
        angle: title,
        why_novel: angleObj.why_novel || '',
        evidence_ids: angleObj.evidence_ids,
        impact_score: angleObj.impact_score,
        impact_rationale: angleObj.impact_rationale,
        effort_score: angleObj.effort_score,
        effort_rationale: angleObj.effort_rationale,
        priority_rank: angleObj.priority_rank,
      });
    }
  }

  const rawPlan = projectData.plan || result?.plan || {};
  const plan = {
    architecture: rawPlan.architecture || '',
    tech_stack: Array.isArray(rawPlan.tech_stack) ? rawPlan.tech_stack : [],
    milestones: Array.isArray(rawPlan.milestones) ? rawPlan.milestones : [],
  };

  const curatedResources = projectData.resources || result?.resources || {};
  const resources = {
    datasets: Array.isArray(curatedResources.datasets) ? curatedResources.datasets : [],
    repos: Array.isArray(curatedResources.repos) ? curatedResources.repos : [],
    apis: Array.isArray(curatedResources.apis) ? curatedResources.apis : [],
  };

  const apisNeeded = rawPlan.apis_needed;
  if (Array.isArray(apisNeeded)) {
    apisNeeded.forEach((apiName: string) => {
      if (apiName && !resources.apis.some((a: any) => a.name === apiName)) {
        resources.apis.push({ name: apiName, url: '#' });
      }
    });
  }

  const critic = result?.critic || {
    approved: status === 'approved',
    issues: [],
  };

  const exports = result?.exports || projectData.exports || {};

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
      { name: "Publisher", status: status === 'approved' || status === 'approved_with_unresolved_issues' ? "done" : "pending", description: "Exports" },
    ],
    sources: { papers, repos, web },
    clusters,
    gaps: Array.isArray(projectData.gaps) ? projectData.gaps : Array.isArray(result?.gaps) ? result.gaps : [],
    innovation_angles: innovationAngles,
    plan,
    resources,
    critic,
    exports,
    generatedAt: timeString,
    executionTimeSec: Number(executionTimeSec.toFixed(1)),
    projectId: result?.projectId || undefined,
  };
}
