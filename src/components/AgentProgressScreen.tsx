import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Sparkles, Search, Network, Lightbulb, Compass, Database, ShieldAlert, FileCheck, ArrowRight, RefreshCw } from 'lucide-react';

interface AgentItem {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  activeDescription: string;
  completedDescription: string;
}

const AGENTS: AgentItem[] = [
  {
    id: 'discovery',
    name: 'Discovery Agent',
    icon: Sparkles,
    description: 'Scanning domain literature and defining problem boundary',
    activeDescription: 'Deconstructing core problem vectors and operational constraints...',
    completedDescription: 'Identified core problem boundary and domain keyphrases'
  },
  {
    id: 'deepsearch',
    name: 'DeepSearch Agent',
    icon: Search,
    description: 'Gathering academic papers, open repositories, and technical web signals',
    activeDescription: 'Querying arXiv, GitHub, and IEEE Xplore index databases...',
    completedDescription: 'Retrieved 14 academic papers & 8 open-source repositories'
  },
  {
    id: 'clustering',
    name: 'Clustering Agent',
    icon: Network,
    description: 'Synthesizing research themes and mapping domain clusters',
    activeDescription: 'Clustering 42 raw technical signals into coherent thematic pillars...',
    completedDescription: 'Synthesized 4 core research clusters'
  },
  {
    id: 'gap_innovation',
    name: 'Gap & Innovation Agent',
    icon: Lightbulb,
    description: 'Identifying unaddressed gaps & formulating novel innovation angles',
    activeDescription: 'Analyzing literature voids to formulate defensible project angles...',
    completedDescription: 'Formulated 3 distinct innovation angles'
  },
  {
    id: 'planner',
    name: 'Planner Agent',
    icon: Compass,
    description: 'Constructing technical architecture and production milestones',
    activeDescription: 'Building system topology diagram and 28-day timeline...',
    completedDescription: 'Structured 28-day production roadmap & system architecture'
  },
  {
    id: 'curator',
    name: 'Curator Agent',
    icon: Database,
    description: 'Verifying datasets, open-source repos, and API integrations',
    activeDescription: 'Validating dataset schema integrity and API availability...',
    completedDescription: 'Indexed 2 benchmark datasets & 2 public APIs'
  },
  {
    id: 'critic',
    name: 'Critic Agent',
    icon: ShieldAlert,
    description: 'Evaluating risk parameters & enforcing feasibility validation',
    activeDescription: 'Performing adversarial critique & revision check...',
    completedDescription: 'Validation passed — 0 critical issues found'
  },
  {
    id: 'publisher',
    name: 'Publisher Agent',
    icon: FileCheck,
    description: 'Formatting verified project plan document & exports',
    activeDescription: 'Compiling structured report, docx schema, and slides...',
    completedDescription: 'Project plan document generated and ready for export'
  }
];

interface AgentProgressScreenProps {
  ideaText: string;
  onComplete: () => void;
}

export const AgentProgressScreen: React.FC<AgentProgressScreenProps> = ({ ideaText, onComplete }) => {
  // Current active agent index (0 to 7)
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRevising, setIsRevising] = useState(false);

  useEffect(() => {
    if (activeIndex >= AGENTS.length) return;

    // Simulate Critic revision pass at agent index 6
    if (activeIndex === 6 && !isRevising) {
      const revisionTimer = setTimeout(() => {
        setIsRevising(true);
        // After 1.5s revision pass, continue to publisher
        setTimeout(() => {
          setIsRevising(false);
          setActiveIndex(7);
        }, 1500);
      }, 1000);
      return () => clearTimeout(revisionTimer);
    }

    const timer = setTimeout(() => {
      setActiveIndex((prev) => prev + 1);
    }, 1800);

    return () => clearTimeout(timer);
  }, [activeIndex, isRevising]);

  const progressPercentage = Math.min(100, Math.round(((activeIndex + (activeIndex === AGENTS.length ? 0 : 0.5)) / AGENTS.length) * 100));

  return (
    <div className="flex-1 min-h-screen bg-[#FFFFFF] flex flex-col justify-center items-center px-8 py-12">
      <div className="w-full max-w-[680px] space-y-6">
        
        {/* Submitted Idea Header */}
        <div className="text-center space-y-2">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Multi-Agent Synthesis Pipeline
          </div>
          <p className="text-[15px] font-medium text-[#1F2340] italic bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl px-4 py-3 text-left">
            "{ideaText || 'Build an AI solution to reduce food waste in college hostels'}"
          </p>
        </div>

        {/* Progress Bar Header */}
        <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-[#15193D] flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#F5A623] animate-spin" />
              {activeIndex < AGENTS.length 
                ? `Running ${AGENTS[activeIndex].name}...`
                : 'Pipeline synthesis complete'}
            </span>
            <span className="font-semibold text-[#6B7280]">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-[#E3E5F0] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#F5A623] h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Vertical Checklist of 8 Agents */}
        <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-2xl p-4 shadow-sm space-y-2">
          {AGENTS.map((agent, idx) => {
            const isDone = idx < activeIndex;
            const isActive = idx === activeIndex;
            const isPending = idx > activeIndex;
            const IconComponent = agent.icon;

            return (
              <motion.div
                key={agent.id}
                initial={false}
                animate={{
                  paddingTop: isDone ? 8 : 12,
                  paddingBottom: isDone ? 8 : 12,
                  opacity: isPending ? 0.5 : 1
                }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-4 px-4 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white border border-[#E3E5F0] shadow-xs'
                    : isDone
                    ? 'bg-transparent'
                    : 'bg-transparent'
                }`}
              >
                {/* Agent Icon Circle */}
                <div className="relative shrink-0">
                  {isDone && (
                    <div className="w-9 h-9 rounded-full bg-[#15193D] text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  {isActive && (
                    <motion.div
                      animate={{
                        scale: [1, 1.06, 1],
                        opacity: [0.9, 1, 0.9]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-9 h-9 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center shadow-xs border border-[#F5A623]/40"
                    >
                      <IconComponent className="w-4 h-4 text-[#15193D]" />
                    </motion.div>
                  )}

                  {isPending && (
                    <div className="w-9 h-9 rounded-full bg-[#E3E5F0] text-[#6B7280] flex items-center justify-center">
                      <IconComponent className="w-4 h-4 opacity-50" />
                    </div>
                  )}
                </div>

                {/* Agent Text Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[14px] font-semibold ${
                      isActive ? 'text-[#15193D]' : isDone ? 'text-[#1F2340]' : 'text-[#6B7280]'
                    }`}>
                      {agent.name}
                    </span>

                    {/* Critic Agent Revision Pass Badge */}
                    {agent.id === 'critic' && isRevising && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FCEBC8] text-[#15193D] border border-[#F5A623]/30">
                        <RefreshCw className="w-3 h-3 animate-spin text-[#F5A623]" />
                        Revising (pass 1 of 2)
                      </span>
                    )}

                    {isDone && (
                      <span className="text-[11px] text-[#16A34A] font-medium">Completed</span>
                    )}
                  </div>

                  <p className={`text-[12px] truncate mt-0.5 ${
                    isActive ? 'text-[#15193D] font-medium' : 'text-[#6B7280]'
                  }`}>
                    {isActive
                      ? agent.activeDescription
                      : isDone
                      ? agent.completedDescription
                      : agent.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View Results Trigger Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onComplete}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 ${
              activeIndex >= AGENTS.length
                ? 'bg-[#F5A623] text-[#15193D] hover:brightness-105 shadow-sm active:scale-[0.98]'
                : 'bg-[#15193D] text-white hover:bg-[#15193D]/90'
            }`}
          >
            <span>{activeIndex >= AGENTS.length ? 'View results dashboard' : 'Skip to results dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
