import React, { useState, useEffect, useRef } from 'react';
import { Plan, SubTask } from '../../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Layout,
  Server,
  Database,
  Brain,
  Rocket,
  GitBranch,
  Code,
  ShieldCheck,
  CheckSquare,
  Globe,
  Terminal,
  Activity
} from 'lucide-react';

interface TabRoadmapProps {
  plan: Plan;
  projectId?: string;
}

export const TabRoadmap: React.FC<TabRoadmapProps> = ({ plan, projectId }) => {
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'stack' | 'ui' | 'endpoints' | 'deployment'>('timeline');
  // Live task progress from the server — keyed by flatIndex
  const [liveProgress, setLiveProgress] = useState<SubTask[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/tasks`);
        if (!res.ok) return;
        const milestones: { subtasks: SubTask[] }[] = await res.json();
        const flat: SubTask[] = [];
        milestones.forEach(m => m.subtasks?.forEach(s => flat.push(s)));
        setLiveProgress(flat);
      } catch {
        // silently ignore network errors during polling
      }
    };

    fetchProgress(); // immediate first load
    intervalRef.current = setInterval(fetchProgress, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [projectId]);

  // Helper: look up live done state by flatIndex; fall back to false
  const isTaskDone = (flatIndex: number) =>
    liveProgress.find(s => s.flatIndex === flatIndex)?.done ?? false;

  const selectedMilestone = plan.milestones[selectedMilestoneIndex] || plan.milestones[0];
  const totalDays = plan.milestones.reduce((acc, m) => acc + (m.duration_days || 0), 0);

  // Fallback defaults if backend/agent returned simplified fields
  const breakdown = plan.tech_stack_breakdown || {
    frontend_ui: plan.tech_stack.filter(t => /react|next|tailwind|css|vue|ui|frontend|lucide/i.test(t)),
    backend_api: plan.tech_stack.filter(t => /fastapi|python|node|express|api|mqtt|websocket/i.test(t)),
    database_storage: plan.tech_stack.filter(t => /postgres|redis|sql|mongo|db|minio|s3/i.test(t)),
    ai_ml_data: plan.tech_stack.filter(t => /pytorch|yolo|tensorflow|onnx|transformer|ai|ml/i.test(t)),
    dev_ops_deployment: plan.tech_stack.filter(t => /docker|vercel|render|ci\/cd|github|actions/i.test(t)),
  };

  const uiPlan = plan.ui_implementation_plan || {
    design_system: "High-contrast dark navy theme with vibrant amber accents, clean component cards, responsive grid, and live status pills.",
    core_views: [
      {
        page_name: "Primary Analytics Dashboard",
        purpose: "Main user portal presenting high-level metrics, system performance, and active alerts.",
        key_components: ["Metrics KPI Cards", "Live Activity Feed", "Interactive Performance Charts"]
      },
      {
        page_name: "Real-Time Telemetry Inspector",
        purpose: "Operational control view for deep-diving into streaming telemetry, hardware status, and diagnostic logs.",
        key_components: ["Live Data Feed Table", "Filter Controls", "Node Status Indicators"]
      }
    ],
    state_management: "Client-side state management paired with REST query caching and WebSocket event listeners."
  };

  const endpoints = plan.data_flow_and_endpoints || [
    {
      endpoint: "POST /api/v1/telemetry/ingest",
      method: "POST",
      purpose: "Main entry point for streaming edge node payload ingestion.",
      payload_summary: "{ node_id: string, payload: object, timestamp: number } → { status: 'processed' }"
    },
    {
      endpoint: "GET /api/v1/analytics/overview",
      method: "GET",
      purpose: "Fetches aggregated system analytics and KPI summary data.",
      payload_summary: "{ timeframe: string } → { kpi_metrics: object, trends: array }"
    }
  ];

  const deployment = plan.deployment_strategy || {
    hosting_environments: "Frontend deployed on Vercel Edge. Backend microservices hosted on Render / AWS ECS. Managed PostgreSQL database.",
    ci_cd_pipeline: "Automated GitHub Actions CI pipeline executing linting, automated unit tests, Docker container builds, and zero-downtime deployment triggers.",
    environment_variables: ["DATABASE_URL", "REDIS_URL", "JWT_SECRET", "NEXT_PUBLIC_API_URL"],
    monitoring_and_logs: "Sentry for client & server exception monitoring, Prometheus metrics collection, and Grafana alert dashboards."
  };

  return (
    <div className="space-y-8">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E3E5F0]">
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl">
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${activeSubTab === 'timeline'
                ? 'bg-[#15193D] text-[#F5A623] shadow-xs'
                : 'text-[#6B7280] hover:text-[#15193D] hover:bg-white/60'
              }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Milestone Roadmap ({totalDays}d)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('stack')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${activeSubTab === 'stack'
                ? 'bg-[#15193D] text-[#F5A623] shadow-xs'
                : 'text-[#6B7280] hover:text-[#15193D] hover:bg-white/60'
              }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Detailed Tech Stack</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ui')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${activeSubTab === 'ui'
                ? 'bg-[#15193D] text-[#F5A623] shadow-xs'
                : 'text-[#6B7280] hover:text-[#15193D] hover:bg-white/60'
              }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>UI & Frontend Spec</span>
          </button>

          <button
            onClick={() => setActiveSubTab('endpoints')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${activeSubTab === 'endpoints'
                ? 'bg-[#15193D] text-[#F5A623] shadow-xs'
                : 'text-[#6B7280] hover:text-[#15193D] hover:bg-white/60'
              }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API & Data Pipeline</span>
          </button>

          <button
            onClick={() => setActiveSubTab('deployment')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${activeSubTab === 'deployment'
                ? 'bg-[#15193D] text-[#F5A623] shadow-xs'
                : 'text-[#6B7280] hover:text-[#15193D] hover:bg-white/60'
              }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Deployment & DevOps</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#15193D] text-white border border-[#15193D] rounded-full text-[11px] font-mono">
            Target Execution: {totalDays} Days Total
          </span>
        </div>
      </div>

      {/* Top Architecture Overview Banner */}
      <div className="bg-[#15193D] text-white border border-white/10 rounded-xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5 text-[#15193D]" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-white tracking-tight">
                System Architecture & Data Topology
              </h3>
              <span className="text-[11px] text-white/60">Verified production blueprint for target implementation</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-[#F5A623]/20 border border-[#F5A623]/30 text-[#F5A623] text-[11px] font-semibold">
            End-to-End Specified
          </span>
        </div>

        <p className="text-[13px] text-white/90 leading-relaxed bg-[#0E112A] border border-white/10 rounded-lg p-4 font-mono text-[12px]">
          {plan.architecture}
        </p>
      </div>

      {/* SUB-TAB 1: Production Milestones & Timeline */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#15193D]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[#15193D]">
                    Production Implementation Phases
                  </h3>
                  <span className="text-[11px] text-[#6B7280]">Select any milestone node to inspect phase subtasks and deliverables</span>
                </div>
              </div>

              <div className="px-3 py-1 bg-white border border-[#E3E5F0] rounded-full text-[12px] font-semibold text-[#15193D]">
                Total Duration: {totalDays} days
              </div>
            </div>

            {/* Milestone Node Track */}
            <div className="relative pt-4 pb-2 px-4">
              <div className="absolute top-1/2 left-8 right-8 h-1 bg-[#E3E5F0] -translate-y-1/2 z-0" />

              <div className="relative z-10 grid gap-4" style={{ gridTemplateColumns: `repeat(${plan.milestones.length}, minmax(0, 1fr))` }}>
                {plan.milestones.map((milestone, idx) => {
                  const isSelected = selectedMilestoneIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedMilestoneIndex(idx)}
                      className="flex flex-col items-center group transition-all duration-150 focus:outline-none"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] border-2 transition-all duration-150 ${isSelected
                            ? 'bg-[#15193D] text-[#F5A623] border-[#F5A623] scale-110 shadow-md'
                            : 'bg-white text-[#15193D] border-[#E3E5F0] hover:border-[#15193D]'
                          }`}
                      >
                        0{idx + 1}
                      </div>

                      <div className="mt-3 text-center space-y-1">
                        <div className={`text-[12px] font-semibold line-clamp-1 transition-colors ${isSelected ? 'text-[#15193D]' : 'text-[#6B7280] group-hover:text-[#15193D]'
                          }`}>
                          {milestone.name.split(':')[0]}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#E3E5F0] text-[10px] font-medium text-[#6B7280]">
                          <Clock className="w-2.5 h-2.5 text-[#F5A623]" />
                          {milestone.duration_days} days
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Milestone Detail Box */}
            <div className="bg-white border border-[#E3E5F0] rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E3E5F0] pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] text-[13px] font-bold flex items-center justify-center shrink-0">
                    0{selectedMilestoneIndex + 1}
                  </span>
                  <div>
                    <h4 className="text-[16px] font-semibold text-[#15193D]">
                      {selectedMilestone.name}
                    </h4>
                    <span className="text-[12px] text-[#6B7280]">
                      Phase {selectedMilestoneIndex + 1} of {plan.milestones.length}
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#15193D] text-[#F5A623] text-[12px] font-semibold self-start sm:self-auto">
                  Duration: {selectedMilestone.duration_days} Days
                </span>
              </div>

              <p className="text-[13.5px] text-[#1F2340] leading-relaxed">
                {selectedMilestone.description}
              </p>

              {/* Subtasks Checklist */}
              {selectedMilestone.subtasks && selectedMilestone.subtasks.length > 0 && (() => {
                // Compute the flat-index offset for this milestone
                const milestoneStartIndex = plan.milestones
                  .slice(0, selectedMilestoneIndex)
                  .reduce((acc, m) => acc + (m.subtasks?.length ?? 0), 0);
                return (
                  <div className="space-y-3 pt-2">
                    <h5 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-[#F5A623]" />
                      Actionable Task Breakdown
                      {liveProgress.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] text-[10px] font-bold">
                          Live
                        </span>
                      )}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {selectedMilestone.subtasks.map((task, i) => {
                        const flatIdx = milestoneStartIndex + i;
                        const taskText = typeof task === 'string' ? task : (task as SubTask).text;
                        const done = liveProgress.length > 0 ? isTaskDone(flatIdx) : false;
                        return (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border text-[12.5px] font-medium flex items-start gap-2.5 transition-colors duration-300 ${done
                                ? 'bg-[#F0FDF4] border-[#16A34A]/20'
                                : 'bg-[#F4F5FA] border-[#E3E5F0]'
                              }`}
                          >
                            {done ? (
                              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-dashed border-[#D1D5DB] shrink-0 mt-0.5" />
                            )}
                            <span className={done ? 'line-through text-[#6B7280]' : 'text-[#1F2340]'}>
                              {taskText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}


              {/* Deliverables & Tech Focus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#E3E5F0]">
                {selectedMilestone.deliverables && selectedMilestone.deliverables.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      Key Deliverables
                    </span>
                    <ul className="space-y-1">
                      {selectedMilestone.deliverables.map((del, i) => (
                        <li key={i} className="text-[12px] text-[#1F2340] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedMilestone.tech_focus && selectedMilestone.tech_focus.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      Technologies Involved
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMilestone.tech_focus.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md bg-[#15193D]/5 border border-[#15193D]/10 text-[11px] font-medium text-[#15193D]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Detailed Tech Stack Matrix */}
      {activeSubTab === 'stack' && (
        <div className="space-y-6">
          <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
                <Code className="w-4 h-4 text-[#15193D]" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#15193D]">
                  Categorized Technology Stack Matrix
                </h3>
                <span className="text-[11px] text-[#6B7280]">Domain-by-domain technical breakdown</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Frontend UI */}
              <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E3E5F0]">
                  <Layout className="w-4 h-4 text-[#F5A623]" />
                  <h4 className="text-[14px] font-semibold text-[#15193D]">Frontend & UI</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(breakdown.frontend_ui.length > 0 ? breakdown.frontend_ui : ["React 18", "Tailwind CSS", "Lucide"]).map((tech, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-[#F4F5FA] border border-[#E3E5F0] text-[12px] font-medium text-[#15193D]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Backend API */}
              <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E3E5F0]">
                  <Server className="w-4 h-4 text-[#F5A623]" />
                  <h4 className="text-[14px] font-semibold text-[#15193D]">Backend & APIs</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(breakdown.backend_api.length > 0 ? breakdown.backend_api : ["Python FastAPI", "WebSockets", "REST API"]).map((tech, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-[#F4F5FA] border border-[#E3E5F0] text-[12px] font-medium text-[#15193D]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Database & Storage */}
              <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E3E5F0]">
                  <Database className="w-4 h-4 text-[#F5A623]" />
                  <h4 className="text-[14px] font-semibold text-[#15193D]">Database & Caching</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(breakdown.database_storage.length > 0 ? breakdown.database_storage : ["PostgreSQL", "Redis"]).map((tech, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-[#F4F5FA] border border-[#E3E5F0] text-[12px] font-medium text-[#15193D]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI & ML */}
              <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E3E5F0]">
                  <Brain className="w-4 h-4 text-[#F5A623]" />
                  <h4 className="text-[14px] font-semibold text-[#15193D]">AI & ML Data Engines</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(breakdown.ai_ml_data.length > 0 ? breakdown.ai_ml_data : ["PyTorch", "YOLOv8", "ONNX Runtime"]).map((tech, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-[#F4F5FA] border border-[#E3E5F0] text-[12px] font-medium text-[#15193D]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* DevOps & Deployment */}
              <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-3 shadow-2xs md:col-span-2 lg:col-span-2">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E3E5F0]">
                  <Rocket className="w-4 h-4 text-[#F5A623]" />
                  <h4 className="text-[14px] font-semibold text-[#15193D]">DevOps & Infrastructure</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(breakdown.dev_ops_deployment.length > 0 ? breakdown.dev_ops_deployment : ["Docker", "Vercel", "Render", "GitHub Actions"]).map((tech, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-[#F4F5FA] border border-[#E3E5F0] text-[12px] font-medium text-[#15193D]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: UI & Frontend Specification */}
      {activeSubTab === 'ui' && (
        <div className="space-y-6">
          <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
                <Layout className="w-4 h-4 text-[#15193D]" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#15193D]">
                  UI Build Architecture & Screen Specifications
                </h3>
                <span className="text-[11px] text-[#6B7280]">Design system, page views, and state management</span>
              </div>
            </div>

            {/* Design System & Visual Theme */}
            <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Design System & Visual Language
              </span>
              <p className="text-[13px] text-[#1F2340] leading-relaxed">
                {uiPlan.design_system}
              </p>
            </div>

            {/* Core Views / Pages Grid */}
            <div className="space-y-3">
              <h4 className="text-[13px] font-semibold text-[#15193D] uppercase tracking-wider">
                Core UI Views & Key Components
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uiPlan.core_views.map((view, idx) => (
                  <div key={idx} className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#15193D] text-[#F5A623] text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h5 className="text-[14px] font-semibold text-[#15193D]">
                        {view.page_name}
                      </h5>
                    </div>

                    <p className="text-[12.5px] text-[#6B7280] leading-relaxed">
                      {view.purpose}
                    </p>

                    <div className="pt-2 border-t border-[#E3E5F0] space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                        Key UI Components
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {view.key_components.map((comp, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-md bg-[#F4F5FA] border border-[#E3E5F0] text-[11.5px] font-medium text-[#15193D]"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* State Management */}
            <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Client State Management & Real-Time Sync Strategy
              </span>
              <p className="text-[13px] text-[#1F2340] leading-relaxed font-mono text-[12px]">
                {uiPlan.state_management}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: API & Data Pipeline */}
      {activeSubTab === 'endpoints' && (
        <div className="space-y-6">
          <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
                <Terminal className="w-4 h-4 text-[#15193D]" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#15193D]">
                  API Endpoints & Data Contract Specifications
                </h3>
                <span className="text-[11px] text-[#6B7280]">Request/response schemas and communication protocol</span>
              </div>
            </div>

            <div className="space-y-3">
              {endpoints.map((ep, idx) => (
                <div key={idx} className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-mono ${ep.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        ep.method === 'GET' ? 'bg-green-100 text-green-800' :
                          ep.method === 'WS' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {ep.method}
                    </span>
                    <span className="text-[14px] font-mono font-semibold text-[#15193D]">
                      {ep.endpoint}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#1F2340]">
                    {ep.purpose}
                  </p>

                  <div className="bg-[#0E112A] text-[#F5A623] p-3 rounded-lg font-mono text-[11.5px] border border-white/10">
                    {ep.payload_summary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Deployment & DevOps */}
      {activeSubTab === 'deployment' && (
        <div className="space-y-6">
          <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
                <Rocket className="w-4 h-4 text-[#15193D]" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#15193D]">
                  Production Deployment & Infrastructure Strategy
                </h3>
                <span className="text-[11px] text-[#6B7280]">Hosting, CI/CD pipeline, secrets management, and telemetry</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Hosting Setup */}
              <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E3E5F0]">
                  <Globe className="w-4 h-4 text-[#F5A623]" />
                  <h4 className="text-[14px] font-semibold text-[#15193D]">Hosting Environments</h4>
                </div>
                <p className="text-[13px] text-[#1F2340] leading-relaxed">
                  {deployment.hosting_environments}
                </p>
              </div>

              {/* CI/CD Pipeline */}
              <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E3E5F0]">
                  <GitBranch className="w-4 h-4 text-[#F5A623]" />
                  <h4 className="text-[14px] font-semibold text-[#15193D]">CI/CD Pipeline</h4>
                </div>
                <p className="text-[13px] text-[#1F2340] leading-relaxed">
                  {deployment.ci_cd_pipeline}
                </p>
              </div>

              {/* Required Environment Variables */}
              <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E3E5F0]">
                  <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                  <h4 className="text-[14px] font-semibold text-[#15193D]">Environment Variables</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {deployment.environment_variables.map((env, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-[#0E112A] text-[#F5A623] font-mono text-[11px]"
                    >
                      {env}
                    </span>
                  ))}
                </div>
              </div>

              {/* Monitoring & Telemetry */}
              <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E3E5F0]">
                  <Activity className="w-4 h-4 text-[#F5A623]" />
                  <h4 className="text-[14px] font-semibold text-[#15193D]">Monitoring & Observability</h4>
                </div>
                <p className="text-[13px] text-[#1F2340] leading-relaxed">
                  {deployment.monitoring_and_logs}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
