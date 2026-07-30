import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  TrendingUp,
  Wrench,
  Compass,
  BookOpen,
  Lightbulb,
  BarChart3,
  Clock,
} from 'lucide-react';
import { InnovationAngle } from '../types';

interface AngleSelectionScreenProps {
  ideaText: string;
  normalizedProblem?: string;
  angles: InnovationAngle[];
  evidenceSummary?: string;
  gaps?: string[];
  onSelectAngle: (priorityRank: number) => void;
  onSelectAll?: () => void;
}

const IMPACT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  high: { label: 'High Impact', color: '#15803D', bg: '#DCFCE7', border: '#BBF7D0', icon: '🚀' },
  medium: { label: 'Medium Impact', color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', icon: '⚡' },
  low: { label: 'Lower Impact', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', icon: '📍' },
};

const EFFORT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  low: { label: 'Quick Build', color: '#15803D', bg: '#DCFCE7', border: '#BBF7D0' },
  medium: { label: 'Moderate Effort', color: '#92400E', bg: '#FEF3C7', border: '#FDE68A' },
  high: { label: 'Heavy Lift', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB' },
};

const RANK_GLOW: Record<number, string> = {
  1: 'rgba(245,166,35,0.18)',
  2: 'rgba(99,102,241,0.12)',
  3: 'rgba(16,185,129,0.10)',
};

const RANK_ACCENT: Record<number, string> = {
  1: '#F5A623',
  2: '#6366F1',
  3: '#10B981',
};

export const AngleSelectionScreen: React.FC<AngleSelectionScreenProps> = ({
  ideaText,
  normalizedProblem,
  angles,
  evidenceSummary,
  gaps,
  onSelectAngle,
  onSelectAll,
}) => {
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [expandedRank, setExpandedRank] = useState<number | null>(null);
  const [isProceeding, setIsProceeding] = useState(false);

  const problemTitle = normalizedProblem || ideaText;

  const handleProceed = () => {
    if (selectedRank === null) return;
    setIsProceeding(true);
    setTimeout(() => {
      onSelectAngle(selectedRank);
    }, 400);
  };

  const toggleExpand = (rank: number) => {
    setExpandedRank(expandedRank === rank ? null : rank);
  };

  const selectedAngle = angles.find((a) => (a.priority_rank ?? 0) === selectedRank);

  return (
    <div className="flex-1 min-h-screen bg-[#FAFAFA] flex flex-col relative">
      {/* ─── Top Header Strip ─────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E3E5F0] px-8 py-5 flex items-center gap-4 sticky top-0 z-20 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FCEBC8] border border-[#F5A623]/30">
          <Lightbulb className="w-3.5 h-3.5 text-[#F5A623]" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#15193D]">
            Gap &amp; Innovation Analysis
          </span>
        </div>
        <span className="text-[13px] text-[#6B7280]">
          {angles.length} {angles.length === 1 ? 'angle' : 'angles'} discovered — read each one, then pick yours
        </span>
      </div>

      <div className="flex flex-col xl:flex-row flex-1 gap-0">
        {/* ─── Left: Scrollable Angle Cards ─────────────────────────── */}
        <div className="flex-1 px-6 md:px-10 py-10 space-y-6 xl:overflow-y-auto xl:max-h-[calc(100vh-73px)]">

          {/* Problem Statement */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="space-y-2"
          >
            <h1 className="text-[26px] md:text-[30px] font-extrabold text-[#15193D] leading-tight tracking-tight">
              Which innovation angle should we build?
            </h1>
            <p className="text-[14px] text-[#6B7280] italic max-w-2xl">
              "{problemTitle}"
            </p>
          </motion.div>

          {/* Evidence Context Banner */}
          {evidenceSummary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
              className="flex items-start gap-3 bg-white border border-[#E3E5F0] rounded-2xl p-4 shadow-sm"
            >
              <div className="shrink-0 w-8 h-8 rounded-xl bg-[#F4F5FA] flex items-center justify-center mt-0.5">
                <BookOpen className="w-4 h-4 text-[#15193D]" />
              </div>
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                  Evidence Context
                </p>
                <p className="text-[13px] text-[#4B5563] leading-relaxed">{evidenceSummary}</p>
              </div>
            </motion.div>
          )}

          {/* Gaps Chips */}
          {gaps && gaps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-wrap gap-2"
            >
              {gaps.map((gap, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] inline-block" />
                  {gap}
                </span>
              ))}
            </motion.div>
          )}

          {/* Instruction hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[12px] text-[#9CA3AF] flex items-center gap-1.5"
          >
            <span>👆</span>
            Click a card to select it — expand any angle to read full details before deciding
          </motion.p>

          {/* ─── Angle Cards ────────────────────────────────────────── */}
          <div className="space-y-4 pb-4">
            {angles.map((angleItem, idx) => {
              const rank = angleItem.priority_rank ?? idx + 1;
              const isSelected = selectedRank === rank;
              const isExpanded = expandedRank === rank;
              const accentColor = RANK_ACCENT[rank] || '#15193D';
              const glowColor = RANK_GLOW[rank] || 'rgba(21,25,61,0.08)';
              const impactCfg = IMPACT_CONFIG[(angleItem.impact_score || 'medium').toLowerCase()] || IMPACT_CONFIG.medium;
              const effortCfg = EFFORT_CONFIG[(angleItem.effort_score || 'medium').toLowerCase()] || EFFORT_CONFIG.medium;

              return (
                <motion.div
                  key={rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + idx * 0.08, ease: [0.32, 0.72, 0, 1] }}
                >
                  {/* Outer Shell (Double-Bezel) */}
                  <div
                    onClick={() => setSelectedRank(isSelected ? null : rank)}
                    style={{
                      boxShadow: isSelected
                        ? `0 0 0 2.5px ${accentColor}, 0 8px 32px ${glowColor}`
                        : '0 2px 12px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                    }}
                    className={`relative rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden
                      ${isSelected
                        ? 'bg-white'
                        : 'bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5'
                      }`}
                  >
                    {/* Rank Accent Bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                      style={{ backgroundColor: accentColor }}
                    />

                    {/* Selected Glow Background */}
                    {isSelected && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(ellipse at 10% 50%, ${glowColor} 0%, transparent 60%)`,
                        }}
                      />
                    )}

                    {/* Card Content */}
                    <div className="pl-5 pr-5 pt-5 pb-4 relative">

                      {/* Top Row: Rank + Title + Selected Check */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span
                            className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-extrabold"
                            style={{
                              backgroundColor: isSelected ? accentColor : '#F4F5FA',
                              color: isSelected ? '#fff' : '#15193D',
                            }}
                          >
                            {rank}
                          </span>
                          <h2 className="text-[15px] md:text-[16px] font-bold text-[#15193D] leading-snug">
                            {angleItem.angle}
                          </h2>
                        </div>

                        {/* Selected check */}
                        <div className="shrink-0 flex items-center gap-2 mt-0.5">
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                            >
                              <CheckCircle2 className="w-5 h-5" style={{ color: accentColor }} />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Why Novel — always visible */}
                      {angleItem.why_novel && (
                        <p className="text-[13px] text-[#4B5563] leading-relaxed mb-4 pl-10">
                          {angleItem.why_novel}
                        </p>
                      )}

                      {/* Score Pills Row */}
                      <div className="flex flex-wrap items-center gap-2 pl-10 mb-3">
                        {/* Impact Badge */}
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                          style={{
                            backgroundColor: impactCfg.bg,
                            color: impactCfg.color,
                            borderColor: impactCfg.border,
                          }}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {impactCfg.label}
                        </span>

                        {/* Effort Badge */}
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                          style={{
                            backgroundColor: effortCfg.bg,
                            color: effortCfg.color,
                            borderColor: effortCfg.border,
                          }}
                        >
                          <Wrench className="w-3 h-3" />
                          {effortCfg.label}
                        </span>

                        {rank === 1 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FCEBC8] text-[#15193D] border border-[#F5A623]/40 uppercase tracking-wider">
                            <Sparkles className="w-2.5 h-2.5 text-[#F5A623]" />
                            Top Pick
                          </span>
                        )}
                      </div>

                      {/* Expand / Collapse Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(rank);
                        }}
                        className="flex items-center gap-1.5 pl-10 text-[12px] font-semibold text-[#6B7280] hover:text-[#15193D] transition-colors duration-200"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Hide details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Read full rationale
                          </>
                        )}
                      </button>

                      {/* Expanded Detail Panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            key="detail"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pl-10 pt-4 mt-3 border-t border-[#F0F1F5] grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Impact Rationale */}
                              {angleItem.impact_rationale && (
                                <div className="bg-[#F8F9FC] rounded-xl p-3.5 space-y-1.5 border border-[#E3E5F0]">
                                  <div className="flex items-center gap-1.5">
                                    <BarChart3 className="w-3.5 h-3.5 text-[#6366F1]" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                                      Impact Rationale
                                    </span>
                                  </div>
                                  <p className="text-[12px] text-[#4B5563] leading-relaxed">
                                    {angleItem.impact_rationale}
                                  </p>
                                </div>
                              )}

                              {/* Effort Rationale */}
                              {angleItem.effort_rationale && (
                                <div className="bg-[#F8F9FC] rounded-xl p-3.5 space-y-1.5 border border-[#E3E5F0]">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-[#F5A623]" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                                      Effort Rationale
                                    </span>
                                  </div>
                                  <p className="text-[12px] text-[#4B5563] leading-relaxed">
                                    {angleItem.effort_rationale}
                                  </p>
                                </div>
                              )}

                              {/* Evidence IDs */}
                              {angleItem.evidence_ids && angleItem.evidence_ids.length > 0 && (
                                <div className="sm:col-span-2 bg-[#F8F9FC] rounded-xl p-3.5 space-y-2 border border-[#E3E5F0]">
                                  <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-[#10B981]" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                                      Grounded In {angleItem.evidence_ids.length} Source{angleItem.evidence_ids.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {angleItem.evidence_ids.map((id) => (
                                      <span
                                        key={id}
                                        className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                      >
                                        {id}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Compare All Option */}
          {onSelectAll && angles.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pb-10 flex justify-center"
            >
              <button
                onClick={onSelectAll}
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-[#E3E5F0] bg-white text-[#6B7280] text-[13px] font-semibold hover:border-[#15193D]/30 hover:text-[#15193D] hover:bg-[#F4F5FA] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-sm"
              >
                <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
                Not sure? Research all {angles.length} angles and compare outputs
                <span className="w-6 h-6 rounded-full bg-[#F4F5FA] group-hover:bg-[#E3E5F0] flex items-center justify-center transition-colors duration-300">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </motion.div>
          )}
        </div>

        {/* ─── Right: Selection Panel (sticky sidebar) ─────────────── */}
        <div className="xl:w-[340px] xl:shrink-0 xl:sticky xl:top-[73px] xl:max-h-[calc(100vh-73px)] xl:overflow-y-auto border-t xl:border-t-0 xl:border-l border-[#E3E5F0] bg-white">
          <div className="p-6 md:p-8 space-y-6">

            {/* Selection Status */}
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#6B7280] mb-3">
                Your Selection
              </h3>

              <AnimatePresence mode="wait">
                {selectedRank === null ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl border-2 border-dashed border-[#E3E5F0] p-5 text-center space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#F4F5FA] flex items-center justify-center mx-auto">
                      <Lightbulb className="w-5 h-5 text-[#9CA3AF]" />
                    </div>
                    <p className="text-[13px] text-[#9CA3AF] font-medium">
                      No angle selected yet
                    </p>
                    <p className="text-[12px] text-[#C4C9D4]">
                      Click any card on the left to choose your direction
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`selected-${selectedRank}`}
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    className="space-y-3"
                  >
                    {/* Selected Angle Preview */}
                    <div
                      className="rounded-2xl p-4 border"
                      style={{
                        borderColor: RANK_ACCENT[selectedRank] || '#E3E5F0',
                        backgroundColor: `${RANK_GLOW[selectedRank] ? 'rgba(245,246,250,1)' : '#F4F5FA'}`,
                        boxShadow: `0 0 0 1px ${RANK_ACCENT[selectedRank] || '#E3E5F0'}20`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-extrabold text-white"
                          style={{ backgroundColor: RANK_ACCENT[selectedRank] || '#15193D' }}
                        >
                          {selectedRank}
                        </span>
                        <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                          Angle #{selectedRank} Selected
                        </span>
                        <CheckCircle2
                          className="w-4 h-4 ml-auto"
                          style={{ color: RANK_ACCENT[selectedRank] || '#15193D' }}
                        />
                      </div>
                      <p className="text-[13px] font-semibold text-[#15193D] leading-snug">
                        {selectedAngle?.angle}
                      </p>
                    </div>

                    {/* Score Summary */}
                    <div className="grid grid-cols-2 gap-2">
                      {selectedAngle?.impact_score && (
                        <div className="bg-[#F8F9FC] rounded-xl p-3 border border-[#E3E5F0] space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Impact</p>
                          <p
                            className="text-[13px] font-bold capitalize"
                            style={{ color: IMPACT_CONFIG[selectedAngle.impact_score]?.color || '#15193D' }}
                          >
                            {selectedAngle.impact_score}
                          </p>
                        </div>
                      )}
                      {selectedAngle?.effort_score && (
                        <div className="bg-[#F8F9FC] rounded-xl p-3 border border-[#E3E5F0] space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Effort</p>
                          <p
                            className="text-[13px] font-bold capitalize"
                            style={{ color: EFFORT_CONFIG[selectedAngle.effort_score]?.color || '#15193D' }}
                          >
                            {selectedAngle.effort_score}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Proceed CTA */}
            <div>
              <AnimatePresence>
                {selectedRank !== null && (
                  <motion.div
                    key="cta"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <button
                      onClick={handleProceed}
                      disabled={isProceeding}
                      className="group w-full inline-flex items-center justify-between gap-3 px-5 py-4 rounded-2xl font-bold text-[14px] text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] shadow-lg"
                      style={{
                        backgroundColor: isProceeding ? '#6B7280' : '#15193D',
                        boxShadow: isProceeding
                          ? 'none'
                          : `0 4px 20px rgba(21,25,61,0.3), 0 0 0 0 transparent`,
                      }}
                    >
                      <span>
                        {isProceeding ? 'Starting…' : `Build Angle #${selectedRank}`}
                      </span>
                      <span className="w-8 h-8 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-colors duration-300">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </span>
                    </button>

                    <p className="text-[11px] text-[#9CA3AF] text-center mt-2">
                      This will launch the full planning pipeline for your selected angle
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Disabled state hint */}
              {selectedRank === null && (
                <button
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-bold text-[14px] text-[#9CA3AF] bg-[#F4F5FA] border border-[#E3E5F0] cursor-not-allowed"
                >
                  <Lightbulb className="w-4 h-4" />
                  Select an angle to proceed
                </button>
              )}
            </div>

            {/* Quick Overview Table */}
            {angles.length > 1 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
                  All Angles At a Glance
                </h3>
                <div className="space-y-2">
                  {angles.map((a, idx) => {
                    const r = a.priority_rank ?? idx + 1;
                    const isThis = selectedRank === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setSelectedRank(isThis ? null : r)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]"
                        style={{
                          backgroundColor: isThis ? `${RANK_GLOW[r] || 'rgba(21,25,61,0.06)'}` : '#F8F9FC',
                          borderWidth: 1,
                          borderStyle: 'solid',
                          borderColor: isThis ? RANK_ACCENT[r] || '#15193D' : '#E3E5F0',
                        }}
                      >
                        <span
                          className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold"
                          style={{
                            backgroundColor: isThis ? RANK_ACCENT[r] || '#15193D' : '#E3E5F0',
                            color: isThis ? '#fff' : '#6B7280',
                          }}
                        >
                          {r}
                        </span>
                        <span className="text-[12px] font-semibold text-[#15193D] leading-snug line-clamp-2 flex-1">
                          {a.angle}
                        </span>
                        {isThis && (
                          <CheckCircle2
                            className="shrink-0 w-4 h-4"
                            style={{ color: RANK_ACCENT[r] || '#15193D' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
