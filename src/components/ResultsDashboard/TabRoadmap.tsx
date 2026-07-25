import React, { useState } from 'react';
import { Plan, Milestone } from '../../types';
import { Calendar, CheckCircle2, Clock, Cpu, Layers } from 'lucide-react';

interface TabRoadmapProps {
  plan: Plan;
}

export const TabRoadmap: React.FC<TabRoadmapProps> = ({ plan }) => {
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number>(0);
  const selectedMilestone = plan.milestones[selectedMilestoneIndex] || plan.milestones[0];
  const totalDays = plan.milestones.reduce((acc, m) => acc + m.duration_days, 0);

  return (
    <div className="space-y-8">
      {/* Top Architecture Overview */}
      <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <Cpu className="w-4 h-4 text-[#15193D]" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#15193D]">
              System Architecture & Topology
            </h3>
            <span className="text-[11px] text-[#6B7280]">Target production environment</span>
          </div>
        </div>

        <p className="text-[13px] text-[#1F2340] leading-relaxed bg-white border border-[#E3E5F0] rounded-lg p-4 font-mono text-[12px]">
          {plan.architecture}
        </p>
      </div>

      {/* Horizontal Timeline Component */}
      <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#15193D]" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#15193D]">
                Production Milestones Timeline
              </h3>
              <span className="text-[11px] text-[#6B7280]">Click any milestone node to view phase details</span>
            </div>
          </div>

          <div className="px-3 py-1 bg-white border border-[#E3E5F0] rounded-full text-[12px] font-semibold text-[#15193D]">
            Total duration: {totalDays} days
          </div>
        </div>

        {/* Milestone Node Track */}
        <div className="relative pt-4 pb-2 px-4">
          {/* Track Connecting Line */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-[#E3E5F0] -translate-y-1/2 z-0" />

          {/* Nodes */}
          <div className="relative z-10 grid grid-cols-4 gap-4">
            {plan.milestones.map((milestone, idx) => {
              const isSelected = selectedMilestoneIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedMilestoneIndex(idx)}
                  className={`flex flex-col items-center group transition-all duration-150 focus:outline-none`}
                >
                  {/* Node Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] border-2 transition-all duration-150 ${
                      isSelected
                        ? 'bg-[#15193D] text-[#F5A623] border-[#F5A623] scale-110 shadow-md'
                        : 'bg-white text-[#15193D] border-[#E3E5F0] hover:border-[#15193D]'
                    }`}
                  >
                    0{idx + 1}
                  </div>

                  {/* Node Title & Duration */}
                  <div className="mt-3 text-center space-y-1">
                    <div className={`text-[12px] font-semibold transition-colors ${
                      isSelected ? 'text-[#15193D]' : 'text-[#6B7280] group-hover:text-[#15193D]'
                    }`}>
                      {milestone.name.split(':')[0]}
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#E3E5F0] text-[10px] font-medium text-[#6B7280]">
                      <Clock className="w-2.5 h-2.5 text-[#F5A623]" />
                      {milestone.duration_days} days
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Milestone Detail Box */}
        <div className="bg-white border border-[#E3E5F0] rounded-xl p-5 shadow-xs space-y-3 mt-4">
          <div className="flex items-center justify-between border-b border-[#E3E5F0] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FCEBC8] text-[#15193D] text-[11px] font-bold flex items-center justify-center">
                0{selectedMilestoneIndex + 1}
              </span>
              <h4 className="text-[15px] font-semibold text-[#15193D]">
                {selectedMilestone.name}
              </h4>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#15193D] text-[#F5A623] text-[11px] font-semibold">
              Duration: {selectedMilestone.duration_days} days
            </span>
          </div>

          <p className="text-[13px] text-[#1F2340] leading-relaxed">
            {selectedMilestone.description}
          </p>

          <div className="flex items-center gap-4 text-[12px] text-[#6B7280] pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              Executable deliverable verified
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#F5A623]" />
              Phase {selectedMilestoneIndex + 1} of {plan.milestones.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
