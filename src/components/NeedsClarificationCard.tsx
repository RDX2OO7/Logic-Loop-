import React, { useState } from 'react';
import { HelpCircle, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

interface NeedsClarificationCardProps {
  originalIdea: string;
  question: string;
  onResubmitIdea: (clarifiedIdea: string) => void;
}

export const NeedsClarificationCard: React.FC<NeedsClarificationCardProps> = ({
  originalIdea,
  question,
  onResubmitIdea,
}) => {
  const [answerText, setAnswerText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    const combinedIdea = `${originalIdea} - Additional Context: ${answerText.trim()}`;
    onResubmitIdea(combinedIdea);
  };

  return (
    <div className="flex-1 min-h-screen bg-white flex flex-col justify-center items-center px-8 py-16">
      <div className="w-full max-w-[640px] space-y-6">
        
        {/* Warning / Clarification Header */}
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FCD34D]">
          <HelpCircle className="w-4 h-4 text-[#D97706]" />
          <span className="text-[12px] font-medium text-[#92400E]">
            Discovery Agent — Clarification Requested
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-[24px] font-semibold text-[#15193D] tracking-tight">
            Your idea needs a bit more detail
          </h1>
          <p className="text-[14px] text-[#6B7280]">
            The Discovery Agent analyzed your prompt but needs clarification before proceeding with deep research.
          </p>
        </div>

        {/* Original Idea Box */}
        <div className="p-4 bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl text-[13px]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
            Original Idea Prompt
          </span>
          <p className="text-[#1F2340] italic font-medium">"{originalIdea}"</p>
        </div>

        {/* Agent Question Box */}
        <div className="p-5 bg-[#15193D] text-white rounded-2xl border border-white/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[#F5A623] text-[13px] font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Discovery Agent Question:</span>
          </div>
          <p className="text-[15px] font-medium leading-relaxed text-white/90">
            {question || "Could you provide more specific context or target constraints for this project idea?"}
          </p>
        </div>

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-[#1F2340]">
              Provide clarification to unblock research:
            </label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="e.g. Focus on post-meal tray waste analytics using computer vision for university cafeterias"
              rows={3}
              className="w-full bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-4 text-[14px] text-[#1F2340] focus:outline-none focus:border-[#15193D] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#6B7280]">
              This will update your idea and re-run the research pipeline.
            </span>

            <button
              type="submit"
              disabled={!answerText.trim()}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${
                answerText.trim()
                  ? 'bg-[#F5A623] text-[#15193D] hover:brightness-105 shadow-sm'
                  : 'bg-[#E3E5F0] text-[#6B7280] cursor-not-allowed'
              }`}
            >
              <span>Submit & Resume Research</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
