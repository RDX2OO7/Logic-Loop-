import React, { useState } from 'react';
import { GitCompare, FileDown, Presentation, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { InnovationAngle } from '../types';

interface Milestone {
  name: string;
  duration_days: number;
  description?: string;
}

interface CompareResult {
  chosen_angle: InnovationAngle;
  projectData: {
    title?: string;
    normalized_problem?: string;
    plan?: {
      architecture?: string;
      tech_stack?: string[];
      milestones?: Milestone[];
      apis_needed?: string[];
    };
    resources?: {
      apis?: { name: string; url?: string }[];
      datasets?: { name: string; url?: string }[];
      repos?: { name: string; url?: string }[];
    };
  };
  status: string;
  critic?: { approved: boolean; issues: { agent: string; problem: string }[] };
  exports?: { docxUrl?: string; pptxUrl?: string };
}

interface CompareResultsScreenProps {
  ideaText: string;
  results: CompareResult[];
}

const getImpactBadgeClass = (score?: string) => {
  switch (score?.toLowerCase()) {
    case 'high': return 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]';
    case 'medium': return 'bg-[#FEF7E0] text-[#B06000] border-[#FDE8D3]';
    default: return 'bg-[#F1F3F4] text-[#5F6368] border-[#E8EAED]';
  }
};

const getEffortBadgeClass = (score?: string) => {
  switch (score?.toLowerCase()) {
    case 'low': return 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]';
    case 'medium': return 'bg-[#FEF7E0] text-[#B06000] border-[#FDE8D3]';
    default: return 'bg-[#F1F3F4] text-[#5F6368] border-[#E8EAED]';
  }
};

const SERVER_BASE = '';

function resolveExportUrl(relativeUrl?: string): string {
  if (!relativeUrl) return '#';
  if (relativeUrl.startsWith('http')) return relativeUrl;
  return `${SERVER_BASE}${relativeUrl}`;
}

interface PlanCardProps {
  result: CompareResult;
  idx: number;
}

const PlanCard: React.FC<PlanCardProps> = ({ result, idx }) => {
  const [milestonesExpanded, setMilestonesExpanded] = useState(false);

  const angle = result.chosen_angle || ({} as InnovationAngle);
  const plan = result.projectData?.plan || {};
  const critic = result.critic;
  const exports = result.exports || {};

  const rank = angle.priority_rank ?? idx + 1;
  const totalDays = (plan.milestones || []).reduce(
    (acc, m) => acc + (m.duration_days || 0),
    0
  );
  const criticApproved = critic?.approved ?? (result.status === 'approved');
  const issueCount = critic?.issues?.length ?? 0;

  const docxUrl = resolveExportUrl(exports.docxUrl);
  const pptxUrl = resolveExportUrl(exports.pptxUrl);
  const hasExports = exports.docxUrl && exports.pptxUrl;

  const milestonesToShow = milestonesExpanded
    ? plan.milestones || []
    : (plan.milestones || []).slice(0, 4);

  return (
    <div className="flex flex-col h-full bg-[#F4F5FA] border border-[#E3E5F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* Card Header */}
      <div className="p-5 bg-white border-b border-[#E3E5F0] space-y-3">
        {/* Rank + Critic Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center justify-center font-bold text-[12px] rounded-lg px-2.5 py-1 bg-[#E3E5F0] text-[#15193D]">
            #{rank}
          </span>
          {criticApproved ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] text-[11px] font-semibold">
              <CheckCircle className="w-3 h-3" />
              <span>Critic approved</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF7E0] border border-[#FDE8D3] text-[#B06000] text-[11px] font-semibold">
              <AlertTriangle className="w-3 h-3" />
              <span>Flagged {issueCount} issue{issueCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Angle Text */}
        <h2 className="text-[15px] font-bold text-[#15193D] leading-snug">
          {angle.angle || 'Untitled angle'}
        </h2>

        {/* Why Novel */}
        {angle.why_novel && (
          <p className="text-[12px] text-[#6B7280] leading-relaxed">
            {angle.why_novel}
          </p>
        )}

        {/* Impact / Effort / Timeline badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {angle.impact_score && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getImpactBadgeClass(angle.impact_score)}`}>
              Impact: {angle.impact_score}
            </span>
          )}
          {angle.effort_score && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getEffortBadgeClass(angle.effort_score)}`}>
              Effort: {angle.effort_score}
            </span>
          )}
          {totalDays > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border border-[#E3E5F0] bg-[#F4F5FA] text-[#374151]">
              ~{totalDays}d
            </span>
          )}
        </div>
      </div>

      {/* Card Body — scrollable */}
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">

        {/* Tech Stack */}
        {plan.tech_stack && plan.tech_stack.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {plan.tech_stack.map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-white border border-[#E3E5F0] rounded-md text-[12px] text-[#374151] font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Architecture */}
        {plan.architecture && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Architecture
            </h4>
            <p className="text-[13px] text-[#374151] leading-relaxed">
              {plan.architecture}
            </p>
          </div>
        )}

        {/* Milestones */}
        {plan.milestones && plan.milestones.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Milestones ({plan.milestones.length}) · {totalDays}d total
              </h4>
              {plan.milestones.length > 4 && (
                <button
                  onClick={() => setMilestonesExpanded((v) => !v)}
                  className="text-[11px] text-[#6B7280] hover:text-[#15193D] flex items-center gap-0.5 transition-colors"
                >
                  {milestonesExpanded ? (
                    <><ChevronUp className="w-3 h-3" /> Show less</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" /> +{plan.milestones.length - 4} more</>
                  )}
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              {milestonesToShow.map((m, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-[#E3E5F0]"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#15193D] truncate">{m.name}</div>
                    {m.description && (
                      <div className="text-[11px] text-[#6B7280] line-clamp-2 mt-0.5">{m.description}</div>
                    )}
                  </div>
                  <span className="text-[12px] text-[#6B7280] shrink-0 font-medium whitespace-nowrap">
                    {m.duration_days}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critic Issues (if any) */}
        {!criticApproved && critic?.issues && critic.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#B06000]">
              Critic Flags
            </h4>
            <div className="space-y-1.5">
              {critic.issues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 bg-[#FFFBEB] border border-[#FDE8D3] rounded-lg px-3 py-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#B06000] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-[#B06000]">[{issue.agent}]</span>{' '}
                    <span className="text-[12px] text-[#374151]">{issue.problem}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Card Footer — Export Buttons */}
      <div className="p-4 border-t border-[#E3E5F0] bg-white space-y-2">
        {hasExports ? (
          <>
            <a
              href={docxUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-[#15193D] text-white hover:bg-[#15193D]/90 active:scale-[0.98] transition-all duration-150 shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Report (.docx)</span>
            </a>
            <a
              href={pptxUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-white border border-[#E3E5F0] text-[#15193D] hover:bg-[#F4F5FA] hover:border-[#15193D]/20 active:scale-[0.98] transition-all duration-150"
            >
              <Presentation className="w-4 h-4" />
              <span>Download Slides (.pptx)</span>
            </a>
          </>
        ) : (
          <div className="text-[12px] text-[#9CA3AF] text-center py-1">
            Exports not available for this angle
          </div>
        )}
      </div>
    </div>
  );
};

export const CompareResultsScreen: React.FC<CompareResultsScreenProps> = ({
  ideaText,
  results,
}) => {
  // Tab state for narrow screens (only used when < 2xl breakpoint)
  const [activeTab, setActiveTab] = useState(0);

  if (!results || results.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#6B7280] text-[15px]">
        No comparison results available.
      </div>
    );
  }

  // Sort by priority_rank so cards are in rank order
  const sortedResults = [...results].sort((a, b) => {
    const ra = a.chosen_angle?.priority_rank ?? 999;
    const rb = b.chosen_angle?.priority_rank ?? 999;
    return ra - rb;
  });

  const gridCols =
    sortedResults.length === 1
      ? 'grid-cols-1 max-w-[500px] mx-auto'
      : sortedResults.length === 2
        ? 'grid-cols-1 lg:grid-cols-2'
        : 'grid-cols-1 lg:grid-cols-3';

  return (
    <div className="flex-1 min-h-screen bg-[#FAFAFA] px-6 py-10 overflow-y-auto">
      <div className="w-full max-w-[1200px] mx-auto space-y-7">

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FCEBC8] text-[#15193D] text-[12px] font-semibold tracking-wide border border-[#F5A623]/30">
            <GitCompare className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Full Parallel Research — {sortedResults.length} angles completed</span>
          </div>
          <h1 className="text-[26px] font-bold text-[#15193D] tracking-tight">
            Compare all {sortedResults.length} planned directions
          </h1>
          <p className="text-[14px] text-[#6B7280] italic bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl px-4 py-3">
            "{ideaText}"
          </p>
          <p className="text-[13px] text-[#9CA3AF]">
            Each card is a fully independent plan for its angle — export whichever one(s) you want.
          </p>
        </div>

        {/* Desktop: side-by-side cards */}
        <div className={`hidden lg:grid gap-5 ${gridCols}`} style={{ alignItems: 'start' }}>
          {sortedResults.map((result, idx) => (
            <PlanCard key={idx} result={result} idx={idx} />
          ))}
        </div>

        {/* Mobile/Tablet: tab switcher */}
        <div className="lg:hidden space-y-4">
          {/* Tab Pills */}
          <div className="flex gap-2 flex-wrap">
            {sortedResults.map((result, idx) => {
              const rank = result.chosen_angle?.priority_rank ?? idx + 1;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 ${activeTab === idx
                    ? 'bg-[#15193D] text-white shadow-sm'
                    : 'bg-white border border-[#E3E5F0] text-[#6B7280] hover:border-[#15193D]/20 hover:text-[#15193D]'
                    }`}
                >
                  #{rank} — Angle {rank}
                </button>
              );
            })}
          </div>

          {/* Active Tab Card */}
          <PlanCard result={sortedResults[activeTab]} idx={activeTab} />
        </div>

      </div>
    </div>
  );
};
