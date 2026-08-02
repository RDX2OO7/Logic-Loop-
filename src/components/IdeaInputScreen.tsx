import React, { useState } from 'react';
import { Globe, ArrowRight, Sparkles, Lightbulb, Compass, FileCode, Mic, MicOff, Wand2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedVariations, setEnhancedVariations] = useState<string[]>([]);
  const [showVariations, setShowVariations] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    onSubmitIdea(ideaText);
  };

  const handleChipClick = (idea: string) => {
    setIdeaText(idea);
  };

  const handleEnhancePrompt = async () => {
    if (!ideaText.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setShowVariations(false);
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: ideaText }),
      });
      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }
      const data = await response.json();
      if (data.variations && Array.isArray(data.variations)) {
        setEnhancedVariations(data.variations);
        setShowVariations(true);
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      alert('Failed to connect to the prompt enhancer. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Map language locales
    let langCode = 'en-US';
    if (selectedLanguage === 'Spanish') langCode = 'es-ES';
    else if (selectedLanguage === 'German') langCode = 'de-DE';
    else if (selectedLanguage === 'French') langCode = 'fr-FR';
    recognition.lang = langCode;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone permission was denied. Please allow microphone access in your browser settings.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIdeaText((prev) => prev ? `${prev.trim()} ${transcript}` : transcript);
    };

    recognition.start();
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

          {/* Top Control Bar inside Textarea Card (Language Selector & Enhancer) */}
          <div className="flex items-center justify-between mb-3 border-b border-[#E3E5F0]/60 dark:border-[#262e4a] pb-3">
            <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#94a3b8] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#15193D] dark:text-[#F5A623]" />
              Project specification
            </span>

            <div className="flex items-center gap-2">
              {/* Prompt Enhancer Button */}
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !ideaText.trim()}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-md shadow-2xs transition-colors ${
                  isEnhancing
                    ? 'bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#F5A623] cursor-wait'
                    : !ideaText.trim()
                    ? 'bg-transparent text-[#6B7280] dark:text-[#64748b] border border-[#E3E5F0]/50 dark:border-[#262e4a]/50 cursor-not-allowed opacity-50'
                    : 'bg-white dark:bg-[#1e243b] border border-[#E3E5F0] dark:border-[#262e4a] text-[#1F2340] dark:text-[#f8fafc] hover:bg-[#F4F5FA] dark:hover:bg-[#252d4a]'
                }`}
                title="Enhance prompt with AI"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#94a3b8]" />
                )}
                <span>Enhance</span>
              </button>

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
          </div>

          {/* Textarea */}
          <textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="e.g. build an ai tool that can help visually disabled people to use android phone "
            rows={4}
            className="w-full bg-transparent text-[#1F2340] dark:text-[#f8fafc] placeholder-[#6B7280] dark:placeholder-[#64748b] text-[15px] leading-relaxed resize-none focus:outline-none"
          />

          {/* AI-enhanced variations panel */}
          <AnimatePresence>
            {showVariations && enhancedVariations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3 mb-1 bg-[#FFFFFF]/40 dark:bg-[#121626]/60 border border-[#E3E5F0]/80 dark:border-[#262e4a] rounded-xl p-4 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#F5A623] dark:text-[#F5A623] uppercase tracking-wider">
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>AI-enhanced prompts — click to use</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVariations(false)}
                    className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#6B7280] dark:text-[#94a3b8]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {enhancedVariations.map((variation, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setIdeaText(variation);
                        setShowVariations(false);
                      }}
                      className="w-full text-left p-3 rounded-lg text-[13.5px] leading-relaxed transition-all duration-150 border border-[#E3E5F0]/60 dark:border-[#262e4a]/60 bg-white dark:bg-[#1c223a] text-[#1F2340] dark:text-[#f8fafc] hover:bg-[#F4F5FA] dark:hover:bg-[#252d4a] hover:border-[#15193D]/20 dark:hover:border-[#F5A623]/40 shadow-3xs"
                    >
                      {variation}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Toolbar & Submit Button */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#E3E5F0]/60 dark:border-[#262e4a]">
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[#6B7280] dark:text-[#94a3b8]">
                {ideaText.length > 0 ? `${ideaText.length} characters` : 'Describe your core thesis or challenge'}
              </span>

              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`inline-flex items-center justify-center p-2 rounded-lg transition-all duration-200 border ${isListening
                  ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444] animate-pulse scale-105'
                  : 'bg-white dark:bg-[#1e243b] border-[#E3E5F0] dark:border-[#262e4a] text-[#6B7280] dark:text-[#94a3b8] hover:bg-[#F4F5FA] dark:hover:bg-[#252d4a] hover:text-[#15193D] dark:hover:text-[#f8fafc]'
                  }`}
                title={isListening ? "Listening... click to stop" : "Describe idea with voice"}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                {isListening && (
                  <span className="text-[11px] font-semibold ml-1.5 pr-0.5">Listening...</span>
                )}
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={!ideaText.trim() || isListening}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 ${ideaText.trim() && !isListening
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
