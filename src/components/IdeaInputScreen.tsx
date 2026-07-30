import React, { useState } from 'react';
import { Globe, ArrowRight, Sparkles, Lightbulb, Compass, FileCode } from 'lucide-react';

interface IdeaInputScreenProps {
  onSubmitIdea: (ideaText: string) => void;
}

const EXAMPLE_IDEAS = [
  "Build an AI solution to reduce food waste in college hostels",
  "Design a privacy-preserving computer vision system for traffic analytics",
  "Create an autonomous drone routing framework for micro-logistics"
];

export const IdeaInputScreen: React.FC<IdeaInputScreenProps> = ({ onSubmitIdea }) => {
  const [ideaText, setIdeaText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    onSubmitIdea(ideaText);
  };

  const handleChipClick = (idea: string) => {
    setIdeaText(idea);
  };

  return (
    <div className="flex-1 min-h-screen bg-white dark:bg-[#0b0e17] flex flex-col justify-center items-center px-8 py-16 transition-colors duration-200">
      {/* Center Column Container */}
      <div className="w-full max-w-[680px] space-y-8">

        {/* Header Block */}
        <div className="space-y-3">
          {/* Eyebrow Label with Amber-Tint Icon Badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#F4F5FA] dark:bg-[#151929] border border-[#E3E5F0] dark:border-[#262e4a]">
            <div className="w-5 h-5 rounded-full bg-[#FCEBC8] dark:bg-[#382c11] text-[#15193D] dark:text-[#F5A623] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-[#15193D] dark:text-[#F5A623]" />
            </div>
            <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#94a3b8]">
              New research & project plan
            </span>
          </div>

          {/* Large Prompt */}
          <h1 className="text-[28px] font-semibold text-[#15193D] dark:text-[#f8fafc] tracking-tight leading-tight">
            What do you want to build?
          </h1>
        </div>

        {/* Input Card Container */}
        <form onSubmit={handleSubmit} className="relative bg-[#F4F5FA] dark:bg-[#151929] border border-[#E3E5F0] dark:border-[#262e4a] rounded-[16px] p-5 shadow-sm hover:border-[#15193D]/20 dark:hover:border-[#F5A623]/30 transition-all duration-150">

          {/* Top Control Bar inside Textarea Card (Language Selector) */}
          <div className="flex items-center justify-between mb-3 border-b border-[#E3E5F0]/60 dark:border-[#262e4a] pb-3">
            <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#94a3b8] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#15193D] dark:text-[#F5A623]" />
              Project specification
            </span>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#1F2340] dark:text-[#f8fafc] bg-white dark:bg-[#1e243b] border border-[#E3E5F0] dark:border-[#262e4a] rounded-md shadow-2xs hover:bg-[#F4F5FA] dark:hover:bg-[#252d4a] transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#94a3b8]" />
                <span>{selectedLanguage}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#1e243b] border border-[#E3E5F0] dark:border-[#262e4a] rounded-md shadow-md py-1 z-20">
                  {['English', 'Spanish', 'German', 'French'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setIsLangOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-[#1F2340] dark:text-[#f8fafc] hover:bg-[#F4F5FA] dark:hover:bg-[#252d4a] transition-colors"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="e.g. build an ai tool that can help visually disabled people to use android phone "
            rows={4}
            className="w-full bg-transparent text-[#1F2340] dark:text-[#f8fafc] placeholder-[#6B7280] dark:placeholder-[#64748b] text-[15px] leading-relaxed resize-none focus:outline-none"
          />

          {/* Bottom Toolbar & Submit Button */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#E3E5F0]/60 dark:border-[#262e4a]">
            <span className="text-[12px] text-[#6B7280] dark:text-[#94a3b8]">
              {ideaText.length > 0 ? `${ideaText.length} characters` : 'Describe your core thesis or challenge'}
            </span>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={!ideaText.trim()}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 ${ideaText.trim()
                  ? 'bg-[#F5A623] text-[#15193D] hover:brightness-105 shadow-sm active:scale-[0.98]'
                  : 'bg-[#E3E5F0] dark:bg-[#262e4a] text-[#6B7280] dark:text-[#64748b] cursor-not-allowed'
                }`}
            >
              <span>Generate project plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Example Idea Chips Section */}
        <div className="space-y-3">
          <div className="text-[12px] font-medium text-[#6B7280] dark:text-[#94a3b8] uppercase tracking-wider">
            Or try an example prompt
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {EXAMPLE_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(idea)}
                className="w-full text-left p-3.5 rounded-xl bg-[#F4F5FA] dark:bg-[#151929] border border-[#E3E5F0] dark:border-[#262e4a] hover:border-[#15193D]/30 dark:hover:border-[#F5A623]/40 transition-all duration-150 flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-[#FCEBC8] dark:bg-[#382c11] text-[#15193D] dark:text-[#F5A623] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#F5A623] dark:group-hover:bg-[#F5A623] group-hover:text-[#15193D] dark:group-hover:text-[#15193D] transition-colors">
                  {idx === 0 ? (
                    <Lightbulb className="w-4 h-4 text-[#15193D] dark:text-[#F5A623] group-hover:text-[#15193D]" />
                  ) : idx === 1 ? (
                    <FileCode className="w-4 h-4 text-[#15193D] dark:text-[#F5A623] group-hover:text-[#15193D]" />
                  ) : (
                    <Compass className="w-4 h-4 text-[#15193D] dark:text-[#F5A623] group-hover:text-[#15193D]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-[#1F2340] dark:text-[#f8fafc] group-hover:text-[#15193D] dark:group-hover:text-[#F5A623] transition-colors">
                    {idea}
                  </div>
                  <div className="text-[12px] text-[#6B7280] dark:text-[#94a3b8] mt-0.5">
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
