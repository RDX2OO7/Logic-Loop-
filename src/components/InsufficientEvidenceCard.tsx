import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface InsufficientEvidenceCardProps {
  originalIdea: string;
  evidenceSummary: string;
  onTryAnotherIdea: () => void;
}

export const InsufficientEvidenceCard: React.FC<InsufficientEvidenceCardProps> = ({
  originalIdea,
  evidenceSummary,
  onTryAnotherIdea,
}) => {
  return (
    <div className="flex-1 min-h-screen bg-white flex flex-col justify-center items-center px-8 py-16">
      <div className="w-full max-w-[640px] space-y-6">
        
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FCA5A5]">
          <AlertCircle className="w-4 h-4 text-[#DC2626]" />
          <span className="text-[12px] font-medium text-[#991B1B]">
            Gap & Innovation Agent — Insufficient Evidence
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-[24px] font-semibold text-[#15193D] tracking-tight">
            Insufficient Evidence Found
          </h1>
          <p className="text-[14px] text-[#6B7280]">
            The DeepSearch agent retrieved fewer sources than required to responsibly formulate novel technical gaps.
          </p>
        </div>

        <div className="p-4 bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl text-[13px]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
            Research Prompt
          </span>
          <p className="text-[#1F2340] italic font-medium">"{originalIdea}"</p>
        </div>

        <div className="p-5 bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl space-y-2">
          <span className="text-[12px] font-semibold text-[#15193D] uppercase tracking-wider block">
            Agent Evidence Summary
          </span>
          <p className="text-[14px] text-[#1F2340] leading-relaxed">
            {evidenceSummary || "Too few sources retrieved to formulate defensible project innovation gaps."}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onTryAnotherIdea}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold bg-[#15193D] text-white hover:bg-[#15193D]/90 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Refine Prompt or Try Another Idea</span>
          </button>
        </div>
      </div>
    </div>
  );
};
