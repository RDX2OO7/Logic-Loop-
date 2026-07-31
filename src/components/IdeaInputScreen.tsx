import React, { useState } from 'react';
import { Globe, ArrowRight, Sparkles, Lightbulb, Compass, FileCode, Check } from 'lucide-react';

interface IdeaInputScreenProps {
  onSubmitIdea: (ideaText: string) => void;
}

const EXAMPLE_IDEAS = [
  "Build an AI solution to reduce food waste in college hostels",
  "Design a privacy-preserving computer vision system for traffic analytics",
  "Create an autonomous drone routing framework for micro-logistics"
];

// Same engines the DeepSearch agent actually queries (mirrors the evidence
// ledger on the progress screen) — stated here quietly, before the run even
// starts, so the "verified, not hallucinated" promise is set up early.
const VERIFIED_SOURCES = ["arXiv", "Semantic Scholar", "OpenAlex", "GitHub", "Tavily"];

export const IdeaInputScreen: React.FC<IdeaInputScreenProps> = ({ onSubmitIdea }) => {
  const [ideaText, setIdeaText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    onSubmitIdea(ideaText);
  };

  const handleChipClick = (idea: string) => {
    setIdeaText(idea);
  };

  return (
    <div className="flex-1 min-h-screen bg-white flex flex-col justify-center items-center px-8 py-16">
      {/* Center Column Container */}
      <div className="w-full max-w-[680px] space-y-8">

        {/* Header Block */}
        <div className="space-y-3">
          {/* Step 1: Eyebrow Label — mono/uppercase/tracked, matches the
              progress screen's "PHASE 01 · ..." label so both screens read
              as one product. */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#F4F5FA] border border-[#E3E5F0]">
            <div className="w-5 h-5 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-[#15193D]" />
            </div>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
              New research &amp; project plan
            </span>
          </div>

          {/* Large Prompt */}
          <h1 className="text-[28px] font-semibold text-[#15193D] tracking-tight leading-tight">
            What do you want to build?
          </h1>

          {/* Step 2: Trust strip — plants the "real, verifiable sources"
              promise before the user even submits. Quiet, not a banner. */}
          <div className="flex items-center gap-1.5 font-mono text-[12px] text-[#6B7280]">
            <Check className="w-3.5 h-3.5 text-[#1F7A6C]" />
            <span>verifies against</span>
            <span className="text-[#1F2340]">
              {VERIFIED_SOURCES.join(' · ')}
            </span>
          </div>
        </div>

        {/* Input Card Container */}
        <form
          onSubmit={handleSubmit}
          className={`relative bg-[#F4F5FA] border rounded-[16px] p-5 shadow-sm transition-all duration-150 ${isFocused ? 'border-[#F5A623]/60 shadow-[0_0_0_3px_rgba(245,166,35,0.12)]' : 'border-[#E3E5F0] hover:border-[#15193D]/20'
            }`}
        >

          {/* Top Control Bar inside Textarea Card (Language Selector) */}
          <div className="flex items-center justify-between mb-3 border-b border-[#E3E5F0]/60 pb-3">
            <span className="text-[12px] font-medium text-[#6B7280] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#15193D]" />
              Project specification
            </span>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#1F2340] bg-white border border-[#E3E5F0] rounded-md shadow-2xs hover:bg-[#F4F5FA] transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>{selectedLanguage}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-[#E3E5F0] rounded-md shadow-md py-1 z-20">
                  {['English', 'Spanish', 'German', 'French'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setIsLangOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-[#1F2340] hover:bg-[#F4F5FA] transition-colors"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Textarea — Step 3: mono "&gt;" prompt glyph + amber focus glow
              (glow is applied on the form wrapper above via isFocused) */}
          <div className="flex items-start gap-2">
            <span className="font-mono text-[15px] leading-relaxed text-[#1F7A6C] select-none">&gt;</span>
            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="e.g. build an ai tool that can help visually disabled people to use android phone "
              rows={4}
              className="w-full bg-transparent text-[#1F2340] placeholder-[#6B7280] text-[15px] leading-relaxed resize-none focus:outline-none"
            />
          </div>

          {/* Bottom Toolbar & Submit Button */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#E3E5F0]/60">
            <span className="text-[12px] text-[#6B7280]">
              {ideaText.length > 0 ? `${ideaText.length} characters` : 'Describe your core thesis or challenge'}
            </span>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={!ideaText.trim()}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 ${ideaText.trim()
                ? 'bg-[#F5A623] text-[#15193D] hover:brightness-105 shadow-sm active:scale-[0.98]'
                : 'bg-[#E3E5F0] text-[#6B7280] cursor-not-allowed'
                }`}
            >
              <span>Generate project plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Example Idea Chips Section */}
        <div className="space-y-3">
          {/* Step 4: relabeled to the same mono/uppercase eyebrow treatment
              as Step 1, for consistency across the screen. */}
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
            Or try an example prompt
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {EXAMPLE_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(idea)}
                className="w-full text-left p-3.5 rounded-xl bg-[#F4F5FA] border border-[#E3E5F0] hover:border-[#F5A623]/50 transition-all duration-150 flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#F5A623] transition-colors">
                  {idx === 0 ? (
                    <Lightbulb className="w-4 h-4 text-[#15193D]" />
                  ) : idx === 1 ? (
                    <FileCode className="w-4 h-4 text-[#15193D]" />
                  ) : (
                    <Compass className="w-4 h-4 text-[#15193D]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-[#1F2340] group-hover:text-[#15193D] transition-colors">
                    {idea}
                  </div>
                  <div className="text-[12px] text-[#6B7280] mt-0.5">
                    Click to load prompt into generator
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
