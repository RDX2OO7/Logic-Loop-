import React from 'react';
import { Resources } from '../../types';
import { Database, GitBranch, Cpu, ExternalLink } from 'lucide-react';

interface TabResourcesProps {
  resources: Resources;
}

export const TabResources: React.FC<TabResourcesProps> = ({ resources }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Datasets Column */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E5F0]">
          <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <Database className="w-4 h-4 text-[#15193D]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#15193D]">
              Datasets ({resources.datasets.length})
            </h3>
            <span className="text-[11px] text-[#6B7280]">Verified benchmark data</span>
          </div>
        </div>

        <div className="space-y-3">
          {resources.datasets.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#15193D]/30 transition-all duration-150 flex items-center justify-between group block"
            >
              <div className="space-y-1 pr-2">
                <div className="text-[13px] font-semibold text-[#15193D] group-hover:underline">
                  {item.name}
                </div>
                <div className="text-[11px] text-[#6B7280] font-mono truncate max-w-[200px]">
                  {item.url}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white border border-[#E3E5F0] flex items-center justify-center text-[#15193D] group-hover:bg-[#15193D] group-hover:text-white transition-colors shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Code Repos Column */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E5F0]">
          <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-[#15193D]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#15193D]">
              Code Repositories ({resources.repos.length})
            </h3>
            <span className="text-[11px] text-[#6B7280]">Foundation libraries & frameworks</span>
          </div>
        </div>

        <div className="space-y-3">
          {resources.repos.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#15193D]/30 transition-all duration-150 flex items-center justify-between group block"
            >
              <div className="space-y-1 pr-2">
                <div className="text-[13px] font-semibold text-[#15193D] group-hover:underline">
                  {item.name}
                </div>
                <div className="text-[11px] text-[#6B7280] font-mono truncate max-w-[200px]">
                  {item.url}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white border border-[#E3E5F0] flex items-center justify-center text-[#15193D] group-hover:bg-[#15193D] group-hover:text-white transition-colors shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* APIs Column */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E5F0]">
          <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <Cpu className="w-4 h-4 text-[#15193D]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#15193D]">
              APIs & Services ({resources.apis.length})
            </h3>
            <span className="text-[11px] text-[#6B7280]">External integrations & data streams</span>
          </div>
        </div>

        <div className="space-y-3">
          {resources.apis.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#15193D]/30 transition-all duration-150 flex items-center justify-between group block"
            >
              <div className="space-y-1 pr-2">
                <div className="text-[13px] font-semibold text-[#15193D] group-hover:underline">
                  {item.name}
                </div>
                <div className="text-[11px] text-[#6B7280] font-mono truncate max-w-[200px]">
                  {item.url}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white border border-[#E3E5F0] flex items-center justify-center text-[#15193D] group-hover:bg-[#15193D] group-hover:text-white transition-colors shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
