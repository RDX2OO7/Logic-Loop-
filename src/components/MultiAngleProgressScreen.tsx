import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Compass, Database, ShieldAlert, FileCheck, Sparkles } from 'lucide-react';
import { readSSEResponse } from '../utils/sse';
import { InnovationAngle } from '../types';

interface MiniAgentNode {
  id: string;
  name: string;
  icon: React.ElementType;
}

const PHASE2_AGENTS: MiniAgentNode[] = [
  { id: 'planner', name: 'Planner', icon: Compass },
  { id: 'curator', name: 'Curator', icon: Database },
  { id: 'critic', name: 'Critic', icon: ShieldAlert },
  { id: 'publisher', name: 'Publisher', icon: FileCheck },
];

// Per-column step intervals to make parallel execution look genuinely independent
const COLUMN_STEP_INTERVALS_MS = [1600, 2100, 1850, 1400, 2300];

interface MultiAngleProgressScreenProps {
  ideaText: string;
  draftId: string;
  angles: InnovationAngle[];
  onComplete: (resultsData: any) => void;
  onError: (errorMsg: string) => void;
}

export const MultiAngleProgressScreen: React.FC<MultiAngleProgressScreenProps> = ({
  ideaText,
  draftId,
  angles,
  onComplete,
  onError,
}) => {
  const [columnIndices, setColumnIndices] = useState<number[]>(() => angles.map(() => 0));
  const [statusMessage, setStatusMessage] = useState(`Running parallel planning for all ${angles.length} angles...`);
  const [isDone, setIsDone] = useState(false);
  const hasStartedRef = useRef(false);

  // SSE stream — fires real request, listens for "done"
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    readSSEResponse(
      '/api/plan',
      { draftId, selection: 'all', studentId: 'demo-student' },
      (event, data) => {
        if (event === 'progress') {
          setStatusMessage(data.message || 'Running parallel pipeline pass...');
        } else if (event === 'done') {
          setIsDone(true);
          setColumnIndices(angles.map(() => 4)); // snap all to complete
          setStatusMessage('All angles planned! Routing to comparison...');
          setTimeout(() => {
            onComplete(data);
          }, 700);
        } else if (event === 'error') {
          onError(data.error || 'An error occurred during parallel planning.');
        }
      }
    ).catch((err) => {
      console.error('Multi-angle stream error:', err);
      onError(err.message || 'Failed to connect to parallel planning pipeline.');
    });
  }, [draftId, angles, onComplete, onError]);

  // Independent per-column step animation (different cadences per column)
  useEffect(() => {
    if (isDone) return;

    const timers = angles.map((_, colIdx) => {
      const intervalMs = COLUMN_STEP_INTERVALS_MS[colIdx % COLUMN_STEP_INTERVALS_MS.length];
      return setInterval(() => {
        setColumnIndices((prev) => {
          const next = [...prev];
          if (next[colIdx] < 3) next[colIdx] = next[colIdx] + 1;
          return next;
        });
      }, intervalMs);
    });

    return () => timers.forEach(clearInterval);
  }, [isDone, angles.length]);

  const totalPossible = angles.length * 4;
  const currentTotal = columnIndices.reduce((acc, curr) => acc + curr, 0);
  const progressPercentage = Math.min(100, Math.round((currentTotal / totalPossible) * 100));

  return (
    <div className="flex-1 min-h-screen bg-[#FFFFFF] flex flex-col justify-center items-center px-8 py-12">
      <div className="w-full max-w-[900px] space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCEBC8] text-[#15193D] text-[12px] font-semibold tracking-wide border border-[#F5A623]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Parallel Multi-Angle Pipeline — {angles.length} directions running simultaneously</span>
          </div>
          <p className="text-[15px] font-medium text-[#1F2340] italic bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl px-4 py-3 text-left">
            "{ideaText}"
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-[#15193D] flex items-center gap-2">
              <Loader2 className={`w-4 h-4 text-[#F5A623] ${isDone ? '' : 'animate-spin'}`} />
              {statusMessage}
            </span>
            <span className="font-semibold text-[#6B7280]">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-[#E3E5F0] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#F5A623] h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Multi-Column Parallel Pipeline Grid */}
        <div
          className={`grid gap-4 ${
            angles.length === 1
              ? 'grid-cols-1 max-w-[400px] mx-auto'
              : angles.length === 2
              ? 'grid-cols-2'
              : angles.length === 4
              ? 'grid-cols-2 md:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {angles.map((angleItem, colIdx) => {
            const activeNodeIdx = columnIndices[colIdx] ?? 0;
            const rank = angleItem.priority_rank ?? colIdx + 1;
            const colDone = activeNodeIdx >= 4;

            return (
              <div
                key={colIdx}
                className={`rounded-2xl p-4 shadow-sm flex flex-col gap-4 transition-all duration-300 ${
                  colDone
                    ? 'bg-[#F0FDF4] border border-[#86EFAC]/60'
                    : 'bg-[#F4F5FA] border border-[#E3E5F0]'
                }`}
              >
                {/* Column Header */}
                <div className="space-y-1.5 pb-3 border-b border-[#E3E5F0]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#15193D] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                        #{rank}
                      </span>
                      {colDone && (
                        <span className="text-[11px] font-semibold text-[#16A34A]">Done</span>
                      )}
                    </div>
                    {!colDone && (
                      <span className="text-[11px] font-medium text-[#F5A623] bg-[#FCEBC8] px-2 py-0.5 rounded-full border border-[#F5A623]/30">
                        Running...
                      </span>
                    )}
                  </div>
                  <h3 className="text-[13px] font-bold text-[#15193D] line-clamp-2 leading-snug">
                    {angleItem.angle}
                  </h3>
                </div>

                {/* Mini Node Pipeline — 4 nodes (Planner, Curator, Critic, Publisher) */}
                <div className="space-y-2">
                  {PHASE2_AGENTS.map((agent, nodeIdx) => {
                    const isNodeDone = nodeIdx < activeNodeIdx;
                    const isNodeActive = nodeIdx === activeNodeIdx && !colDone;
                    const isNodePending = nodeIdx > activeNodeIdx;
                    const IconComponent = agent.icon;

                    return (
                      <div
                        key={agent.id}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] transition-all duration-200 ${
                          isNodeActive
                            ? 'bg-white border border-[#E3E5F0] shadow-sm font-semibold text-[#15193D]'
                            : isNodeDone
                            ? 'bg-transparent text-[#374151]'
                            : 'bg-transparent text-[#9CA3AF] opacity-50'
                        }`}
                      >
                        <div className="shrink-0">
                          {isNodeDone && (
                            <div className="w-5 h-5 rounded-full bg-[#15193D] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                          {isNodeActive && (
                            <motion.div
                              animate={{ scale: [1, 1.1, 1], opacity: [0.85, 1, 0.85] }}
                              transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                              className="w-5 h-5 rounded-full bg-[#FCEBC8] flex items-center justify-center border border-[#F5A623]/50"
                            >
                              <IconComponent className="w-2.5 h-2.5 text-[#15193D]" />
                            </motion.div>
                          )}
                          {isNodePending && (
                            <div className="w-5 h-5 rounded-full bg-[#E3E5F0] flex items-center justify-center">
                              <IconComponent className="w-2.5 h-2.5 opacity-40" />
                            </div>
                          )}
                        </div>
                        <span className="truncate">{agent.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
