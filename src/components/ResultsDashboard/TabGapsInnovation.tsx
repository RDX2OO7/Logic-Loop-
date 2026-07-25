import React from 'react';
import { InnovationAngle } from '../../types';
import { AlertCircle, Lightbulb, Compass, Sparkles } from 'lucide-react';

interface TabGapsInnovationProps {
  gaps: string[];
  innovationAngles: InnovationAngle[];
}

export const TabGapsInnovation: React.FC<TabGapsInnovationProps> = ({ gaps, innovationAngles }) => {
  return (
    <div className="space-y-8">
      {/* Top Section: Identified Unaddressed Gaps */}
      <div className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-[#F5A623]" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#15193D]">
              Identified Domain Gaps & Opportunities ({gaps.length})
            </h3>
            <p className="text-[12px] text-[#6B7280]">
              Unaddressed limitations extracted from literature & repository analysis
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {gaps.map((gap, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-white border border-[#E3E5F0] rounded-lg flex items-start gap-3 shadow-2xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#F5A623]" />
              </div>
              <p className="text-[13px] text-[#1F2340] leading-relaxed">
                {gap}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Formulated Innovation Angles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#15193D]" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#15193D]">
              Formulated Innovation Angles ({innovationAngles.length})
            </h3>
            <p className="text-[12px] text-[#6B7280]">
              Key novelty differentiators designed to maximize project impact
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {innovationAngles.map((angle, idx) => (
            <div
              key={idx}
              className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#15193D]/30 transition-all duration-150 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-[#15193D] text-[#F5A623] text-[12px] font-bold flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FCEBC8] text-[#15193D] text-[11px] font-semibold">
                    Novel Vector
                  </span>
                </div>

                <h4 className="text-[14px] font-semibold text-[#15193D] leading-snug">
                  {angle.angle}
                </h4>

                <p className="text-[12px] text-[#6B7280] leading-relaxed border-t border-[#E3E5F0] pt-3 mt-2">
                  <strong className="text-[#15193D] block font-medium mb-1">Why this is novel:</strong>
                  {angle.why_novel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
