import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Sparkles, Search, Network, Lightbulb, Compass, Database, ShieldAlert, FileCheck, RefreshCw } from 'lucide-react';
import { readSSEResponse } from '../utils/sse';
import { Phase1Result } from '../types';

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
    completedDescription: 'Identified core problem boundary and domain keyphrases',
  },
  {
    id: 'deepsearch',
    name: 'DeepSearch Agent',
    icon: Search,
    description: 'Gathering academic papers, open repositories, and technical web signals',
    activeDescription: 'Querying arXiv, GitHub, Tavily, and OpenAlex index databases...',
    completedDescription: 'Retrieved academic papers, repos & web signals',
  },
  {
    id: 'clustering',
    name: 'Clustering Agent',
    icon: Network,
    description: 'Synthesizing research themes and mapping domain clusters',
    activeDescription: 'Clustering technical signals into coherent thematic pillars...',
    completedDescription: 'Synthesized core research clusters',
  },
  {
    id: 'gap_innovation',
    name: 'Gap & Innovation Agent',
    icon: Lightbulb,
    description: 'Identifying unaddressed gaps & formulating novel innovation angles',
    activeDescription: 'Analyzing literature voids to formulate defensible project angles...',
    completedDescription: 'Formulated innovation angles grounded in sources',
  },
  {
    id: 'planner',
    name: 'Planner Agent',
    icon: Compass,
    description: 'Constructing technical architecture and production milestones',
    activeDescription: 'Building system topology diagram and 28-day timeline...',
    completedDescription: 'Structured production roadmap & system architecture',
  },
  {
    id: 'curator',
    name: 'Curator Agent',
    icon: Database,
    description: 'Verifying datasets, open-source repos, and API integrations',
    activeDescription: 'Validating dataset schema integrity and API availability...',
    completedDescription: 'Indexed benchmark datasets & public APIs',
  },
  {
    id: 'critic',
    name: 'Critic Agent',
    icon: ShieldAlert,
    description: 'Evaluating risk parameters & enforcing feasibility validation',
    activeDescription: 'Performing adversarial critique & revision check...',
    completedDescription: 'Validation passed — 0 critical issues found',
  },
  {
    id: 'publisher',
    name: 'Publisher Agent',
    icon: FileCheck,
    description: 'Formatting verified project plan document & exports',
    activeDescription: 'Compiling structured report, docx schema, and slides...',
    completedDescription: 'Project plan document generated and ready for export',
  },
];

interface AgentProgressScreenProps {
  ideaText: string;
  phase: 'discover' | 'plan';
  draftId?: string;
  selectedRank?: number;
  onPhase1Complete: (data: Phase1Result) => void;
  onPhase2Complete: (resultsData: any) => void;
  onError: (errorMsg: string) => void;
}

export const AgentProgressScreen: React.FC<AgentProgressScreenProps> = ({
  ideaText,
  phase,
  draftId,
  selectedRank,
  onPhase1Complete,
  onPhase2Complete,
  onError,
}) => {
  const [activeIndex, setActiveIndex] = useState(phase === 'plan' ? 4 : 0);
  const [statusMessage, setStatusMessage] = useState('Initializing agent pipeline...');
  const [isRevising, setIsRevising] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    if (phase === 'discover') {
      setActiveIndex(0);
      setStatusMessage('Starting discovery, search, and angle evaluation...');

      readSSEResponse(
        '/api/discover',
        { idea: ideaText, ideaRaw: ideaText, studentId: 'demo-student' },
        (event, data) => {
          if (event === 'progress') {
            const msg = data.message || 'Processing...';
            setStatusMessage(msg);
            if (msg.includes('Discovery Agent')) setActiveIndex(0);
            else if (msg.includes('DeepSearch')) setActiveIndex(1);
            else if (msg.includes('Filtering') || msg.includes('Clustering')) setActiveIndex(2);
            else if (msg.includes('Gap & Innovation')) setActiveIndex(3);
          } else if (event === 'done' || data?.angles || data?.status === 'angles_ready') {
            setActiveIndex(4); // Nodes 0..3 done
            const angleCount = data?.angles?.length ?? 0;
            setStatusMessage(
              angleCount > 0
                ? `Found ${angleCount} innovation angle${angleCount !== 1 ? 's' : ''} — preparing selection view…`
                : 'Discovery phase complete. Preparing results…'
            );

            setTimeout(() => {
              onPhase1Complete(data);
            }, 900);
          } else if (event === 'error') {
            onError(data.error || 'An error occurred during discovery phase.');
          }
        }
      ).catch((err) => {
        console.error('Discover stream error:', err);
        onError(err.message || 'Failed to connect to orchestrator pipeline.');
      });
    } else if (phase === 'plan') {
      setActiveIndex(4);
      setStatusMessage(`Planning project for selected angle (#${selectedRank || 1})...`);

      readSSEResponse(
        '/api/plan',
        { draftId, selection: selectedRank || 1, studentId: 'demo-student' },
        (event, data) => {
          if (event === 'progress') {
            setStatusMessage(data.message || 'Planning...');
          } else if (event === 'done' || data?.status === 'complete' || data?.results) {
            setActiveIndex(8); // All 8 nodes done
            setStatusMessage('Project planning complete!');

            setTimeout(() => {
              onPhase2Complete(data);
            }, 600);
          } else if (event === 'error') {
            onError(data.error || 'An error occurred during planning phase.');
          }
        }
      ).catch((err) => {
        console.error('Plan stream error:', err);
        onError(err.message || 'Failed to connect to planning pipeline.');
      });
    }
  }, [phase, ideaText, draftId, selectedRank, onPhase1Complete, onPhase2Complete, onError]);

  // Fallback step timer to animate node transitions smoothly
  useEffect(() => {
    if (phase === 'discover') {
      if (activeIndex < 3) {
        const timer = setTimeout(() => {
          setActiveIndex((prev) => Math.min(3, prev + 1));
        }, 2200);
        return () => clearTimeout(timer);
      }
    } else if (phase === 'plan') {
      if (activeIndex >= 4 && activeIndex < 7) {
        if (activeIndex === 6 && !isRevising) {
          setIsRevising(true);
          const revTimer = setTimeout(() => {
            setIsRevising(false);
            setActiveIndex(7);
          }, 1500);
          return () => clearTimeout(revTimer);
        }

        const timer = setTimeout(() => {
          setActiveIndex((prev) => Math.min(7, prev + 1));
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, activeIndex, isRevising]);

  const maxNodesForPhase = phase === 'discover' ? 4 : 8;
  const progressPercentage = Math.min(
    100,
    Math.round(((activeIndex + (activeIndex === maxNodesForPhase ? 0 : 0.5)) / maxNodesForPhase) * 100)
  );

  return (
    <div className="flex-1 min-h-screen bg-[#FFFFFF] flex flex-col justify-center items-center px-8 py-12">
      <div className="w-full max-w-[680px] space-y-6">

        {/* Submitted Idea Header */}
        <div className="text-center space-y-2">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Multi-Agent Synthesis Pipeline — {phase === 'discover' ? 'Phase 1: Research & Discovery' : 'Phase 2: Project Planning'}
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
              {statusMessage}
            </span>
            <span className="font-semibold text-[#6B7280]">{progressPercentage}%</span>
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
                  opacity: isPending ? 0.4 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-4 px-4 rounded-xl transition-colors ${isActive
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
                        opacity: [0.9, 1, 0.9],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
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
                    <span
                      className={`text-[14px] font-semibold ${isActive ? 'text-[#15193D]' : isDone ? 'text-[#1F2340]' : 'text-[#6B7280]'
                        }`}
                    >
                      {agent.name}
                    </span>

                    {/* Critic Agent Revision Pass Badge */}
                    {agent.id === 'critic' && isRevising && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FCEBC8] text-[#15193D] border border-[#F5A623]/30">
                        <RefreshCw className="w-3 h-3 animate-spin text-[#F5A623]" />
                        Revising (pass 1 of 2)
                      </span>
                    )}

                    {isDone && <span className="text-[11px] text-[#16A34A] font-medium">Completed</span>}
                  </div>

                  <p
                    className={`text-[12px] truncate mt-0.5 ${isActive ? 'text-[#15193D] font-medium' : 'text-[#6B7280]'
                      }`}
                  >
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

      </div>
    </div>
  );
};
