import React from 'react';
import { CopilotData } from '../../types';
import { Layers, Lightbulb, Calendar, FileText } from 'lucide-react';

interface TabOverviewProps {
  data: CopilotData;
}

export const TabOverview: React.FC<TabOverviewProps> = ({ data }) => {
  const totalSources = data.sources.papers.length + data.sources.repos.length + data.sources.web.length;
  const totalAngles = data.innovation_angles.length;
  const totalDays = data.plan.milestones.reduce((acc, m) => acc + m.duration_days, 0);

  return (
    <div className="space-y-6">
      {/* 3 Stat Cards Row - Navy background with Amber numbers */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-[#15193D] text-white p-5 rounded-xl border border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[12px] font-medium text-white/60 uppercase tracking-wider">
              Sources Analyzed
            </div>
            <div className="text-3xl font-bold text-[#F5A623] mt-1 tracking-tight">
              {totalSources}
            </div>
            <div className="text-[12px] text-white/50 mt-1">
              Papers, GitHub repos & web signals
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <Layers className="w-5 h-5 text-[#15193D]" />
          </div>
        </div>

        <div className="bg-[#15193D] text-white p-5 rounded-xl border border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[12px] font-medium text-white/60 uppercase tracking-wider">
              Innovation Angles
            </div>
            <div className="text-3xl font-bold text-[#F5A623] mt-1 tracking-tight">
              {totalAngles}
            </div>
            <div className="text-[12px] text-white/50 mt-1">
              Verified novel technical vectors
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-[#15193D]" />
          </div>
        </div>

        <div className="bg-[#15193D] text-white p-5 rounded-xl border border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[12px] font-medium text-white/60 uppercase tracking-wider">
              Roadmap Timeline
            </div>
            <div className="text-3xl font-bold text-[#F5A623] mt-1 tracking-tight">
              {totalDays} Days
            </div>
            <div className="text-[12px] text-white/50 mt-1">
              4 sequential production phases
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#15193D]" />
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Executive Summary */}
        <div className="lg:col-span-2 bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#15193D]" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#15193D]">
              Executive Summary & Technical Thesis
            </h3>
          </div>

          <div className="text-[14px] text-[#1F2340] leading-relaxed space-y-3">
            {data.plan.architecture ? (
              <p>{data.plan.architecture}</p>
            ) : null}
            {data.evidence_summary ? (
              <p className="text-[13px] text-[#6B7280] italic bg-white p-3 rounded-lg border border-[#E3E5F0]">
                {data.evidence_summary}
              </p>
            ) : null}
            {!data.plan.architecture && !data.evidence_summary && (
              <p>Verified project architecture and technical thesis formulated from research evidence.</p>
            )}
          </div>

          {/* Tech Stack Pills */}
          <div className="pt-2 border-t border-[#E3E5F0]">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-2">
              Recommended Core Tech Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.plan.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md bg-white border border-[#E3E5F0] text-[12px] font-medium text-[#15193D] shadow-2xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Cluster Themes */}
        <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-[16px] font-semibold text-[#15193D]">
            Synthesized Research Clusters
          </h3>
          <div className="space-y-2.5">
            {data.clusters.map((cluster) => (
              <div
                key={cluster.theme}
                className="p-3 bg-white border border-[#E3E5F0] rounded-lg flex items-center justify-between shadow-2xs hover:border-[#15193D]/30 transition-colors"
              >
                <span className="text-[13px] font-medium text-[#1F2340] pr-2">
                  {cluster.theme}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FCEBC8] text-[#15193D] text-[11px] font-semibold shrink-0">
                  {cluster.item_count} items
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
