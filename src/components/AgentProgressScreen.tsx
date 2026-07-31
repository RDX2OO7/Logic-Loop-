import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
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

const NODE_RADIUS = 24; // matches w-12 h-12 icon circle

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

  // ---- Measured-position connector system ----
  const rowRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [rowSize, setRowSize] = useState({ width: 0, height: 0 });
  const [centers, setCenters] = useState<{ x: number; y: number }[]>([]);

  useLayoutEffect(() => {
    const measure = () => {
      const rowEl = rowRef.current;
      if (!rowEl) return;
      const rowRect = rowEl.getBoundingClientRect();
      const pts = nodeRefs.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return { x: r.left - rowRect.left + r.width / 2, y: r.top - rowRect.top + r.height / 2 };
      });
      setCenters(pts);
      setRowSize({ width: rowRect.width, height: rowRect.height });
    };

    measure();
    window.addEventListener('resize', measure);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && rowRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(rowRef.current);
    }

    return () => {
      window.removeEventListener('resize', measure);
      if (ro) ro.disconnect();
    };
  }, []);

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
            setStatusMessage(data.message || 'Processing...');
          } else if (event === 'done') {
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
          } else if (event === 'done') {
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

  // Build connector path strings from REAL measured icon centers, offset to the
  // circle's edge (not center) so lines visually touch the node boundary exactly.
  const connectors = centers.length === 8
    ? AGENTS.slice(0, -1).map((_, i) => {
      const p = centers[i];
      const q = centers[i + 1];
      if (!p || !q || (p.x === 0 && p.y === 0) || (q.x === 0 && q.y === 0)) return null;
      const x1 = p.x + NODE_RADIUS;
      const y1 = p.y;
      const x2 = q.x - NODE_RADIUS;
      const y2 = q.y;
      const midX = (x1 + x2) / 2;
      const wave = i % 2 === 0 ? -16 : 16;
      return {
        from: i,
        to: i + 1,
        d: `M ${x1} ${y1} C ${midX} ${y1 + wave} ${midX} ${y2 + wave} ${x2} ${y2}`,
      };
    })
    : [];

  return (
    <div className="flex-1 min-h-screen bg-[#FFFFFF] flex flex-col justify-center items-center px-8 py-12">
      <div className="w-full max-w-[980px] space-y-6">

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
          <div className="relative w-full bg-[#E3E5F0] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#F5A623] h-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progressPercentage}%` }}
            >
              <motion.div
                className="absolute inset-y-0 w-8 bg-white/40"
                style={{ filter: 'blur(4px)' }}
                animate={{ x: ['-40px', '80px'] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
        </div>

        {/* Horizontal Agent Pipeline — single row, positions measured from the real DOM */}
        <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-2xl p-6 shadow-sm">
          <div ref={rowRef} className="relative flex items-start justify-between">

            {/* Connector layer — sized exactly to the measured row, drawn between real icon edges */}
            {rowSize.width > 0 && (
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                width={rowSize.width}
                height={rowSize.height}
              >
                <defs>
                  <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F5A623" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#F5A623" stopOpacity="1" />
                    <stop offset="100%" stopColor="#F5A623" stopOpacity="0.15" />
                  </linearGradient>

                  <marker id="arrowDone" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 Z" style={{ fill: '#15193D' }} />
                  </marker>
                  <marker id="arrowActive" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 Z" style={{ fill: '#F5A623' }} />
                  </marker>
                  <marker id="arrowPending" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 Z" style={{ fill: '#C7CBDD' }} />
                  </marker>
                </defs>

                {connectors.map((seg) => {
                  if (!seg) return null;
                  const segDone = seg.to < activeIndex;
                  const isActiveSeg = seg.to === activeIndex;

                  if (segDone) {
                    return (
                      <path
                        key={seg.to}
                        d={seg.d}
                        fill="none"
                        style={{ stroke: '#15193D' }}
                        strokeWidth="3"
                        strokeLinecap="round"
                        markerEnd="url(#arrowDone)"
                      />
                    );
                  }

                  if (isActiveSeg) {
                    return (
                      <g key={seg.to}>
                        <path
                          d={seg.d}
                          fill="none"
                          style={{ stroke: '#F5A623', filter: 'blur(5px)' }}
                          strokeWidth="9"
                          strokeLinecap="round"
                          opacity="0.3"
                        />
                        <motion.path
                          d={seg.d}
                          fill="none"
                          style={{ stroke: 'url(#flowGradient)' }}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray="14 10"
                          animate={{ strokeDashoffset: [260, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          markerEnd="url(#arrowActive)"
                        />
                        <g>
                          <circle r="7" style={{ fill: '#F5A623', filter: 'blur(3px)' }} opacity="0.6">
                            <animateMotion dur="1.1s" repeatCount="indefinite" path={seg.d} />
                          </circle>
                          <circle r="3" style={{ fill: '#FFF6E5' }}>
                            <animateMotion dur="1.1s" repeatCount="indefinite" path={seg.d} />
                          </circle>
                        </g>
                      </g>
                    );
                  }

                  return (
                    <path
                      key={seg.to}
                      d={seg.d}
                      fill="none"
                      style={{ stroke: '#C7CBDD' }}
                      strokeWidth="2"
                      strokeDasharray="3 6"
                      strokeLinecap="round"
                      markerEnd="url(#arrowPending)"
                    />
                  );
                })}
              </svg>
            )}

            {/* Node columns — icon + label live in the same column, so they're always aligned by construction */}
            {AGENTS.map((agent, idx) => {
              const isDone = idx < activeIndex;
              const isActive = idx === activeIndex;
              const isPending = idx > activeIndex;
              const IconComponent = agent.icon;

              const caption = isActive
                ? agent.activeDescription
                : isDone
                  ? agent.completedDescription
                  : agent.description;

              return (
                <motion.div
                  key={agent.id}
                  className="relative z-10 flex flex-col items-center flex-1 min-w-0 px-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.35 }}
                >
                  <div
                    ref={(el) => { nodeRefs.current[idx] = el; }}
                    className="relative w-12 h-12 flex items-center justify-center shrink-0"
                  >
                    {isActive && (
                      <>
                        <motion.div
                          className="absolute -inset-3 rounded-full bg-[#F5A623]"
                          animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                        />
                        <motion.div
                          className="absolute -inset-1.5 rounded-full bg-[#F5A623] opacity-25 blur-md"
                          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                          className="absolute -inset-1 rounded-full border-2 border-transparent border-t-[#F5A623] border-r-[#F5A623]/50"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                        />
                      </>
                    )}

                    {isDone && (
                      <div className="w-10 h-10 rounded-full bg-[#15193D] text-white flex items-center justify-center shadow-sm">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}

                    {isActive && (
                      <motion.div
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative w-10 h-10 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center shadow-sm border border-[#F5A623]/50"
                      >
                        <IconComponent className="w-4 h-4 text-[#15193D]" />
                      </motion.div>
                    )}

                    {isPending && (
                      <div className="w-10 h-10 rounded-full bg-[#E3E5F0] text-[#6B7280] flex items-center justify-center">
                        <IconComponent className="w-4 h-4 opacity-50" />
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 flex flex-col items-center text-center max-w-[110px]" title={caption}>
                    <div className="flex items-center gap-1 justify-center">
                      <span className={`text-[11px] font-semibold leading-tight ${isActive ? 'text-[#15193D]' : isDone ? 'text-[#1F2340]' : 'text-[#9CA3AF]'}`}>
                        {agent.name}
                      </span>
                      {isDone && <Check className="w-3 h-3 text-[#16A34A] shrink-0" />}
                    </div>

                    {agent.id === 'critic' && isRevising && (
                      <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#FCEBC8] text-[#15193D] border border-[#F5A623]/30">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#F5A623]" />
                        Revising
                      </span>
                    )}

                    <p className={`mt-0.5 leading-snug line-clamp-2 ${isActive ? 'text-[10px] font-medium text-[#15193D]' : 'text-[10px] text-[#9CA3AF]'}`}>
                      {isActive ? caption : isDone ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};