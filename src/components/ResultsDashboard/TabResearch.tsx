import React from 'react';
import { Sources } from '../../types';
import { BookOpen, GitFork, Globe, ExternalLink, Star } from 'lucide-react';

interface TabResearchProps {
  sources: Sources;
}

export const TabResearch: React.FC<TabResearchProps> = ({ sources }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Column 1: Academic Papers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E5F0]">
          <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[#15193D]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#15193D]">
              Academic Papers ({sources.papers.length})
            </h3>
            <span className="text-[11px] text-[#6B7280]">Peer-reviewed & preprint literature</span>
          </div>
        </div>

        <div className="space-y-3">
          {sources.papers.map((paper, idx) => (
            <div
              key={idx}
              className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#15193D]/30 transition-all duration-150 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold text-[#15193D] hover:underline flex items-center gap-1.5 leading-snug"
                  >
                    <span>{paper.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#6B7280] shrink-0 inline" />
                  </a>
                </div>
                <p className="text-[12px] text-[#6B7280] leading-relaxed line-clamp-3">
                  {paper.snippet}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E3E5F0]/60 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-white border border-[#E3E5F0] text-[11px] font-medium text-[#15193D]">
                  {paper.source}
                </span>
                <span className="text-[11px] text-[#6B7280]">Verified reference</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: Code Repositories */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E5F0]">
          <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <GitFork className="w-4 h-4 text-[#15193D]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#15193D]">
              Open Repositories ({sources.repos.length})
            </h3>
            <span className="text-[11px] text-[#6B7280]">Implementations & datasets</span>
          </div>
        </div>

        <div className="space-y-3">
          {sources.repos.map((repo, idx) => (
            <div
              key={idx}
              className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#15193D]/30 transition-all duration-150 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold text-[#15193D] hover:underline flex items-center gap-1.5 leading-snug"
                  >
                    <span>{repo.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#6B7280] shrink-0 inline" />
                  </a>
                </div>
                <p className="text-[12px] text-[#6B7280] leading-relaxed line-clamp-3">
                  {repo.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E3E5F0]/60 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-white border border-[#E3E5F0] text-[11px] font-medium text-[#15193D]">
                  GitHub
                </span>
                {repo.stars !== undefined && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#15193D]">
                    <Star className="w-3 h-3 text-[#F5A623] fill-[#F5A623]" />
                    {repo.stars} stars
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3: Web Signals */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E5F0]">
          <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#15193D]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#15193D]">
              Web Signals ({sources.web.length})
            </h3>
            <span className="text-[11px] text-[#6B7280]">Reports, benchmarks & industry news</span>
          </div>
        </div>

        <div className="space-y-3">
          {sources.web.map((webItem, idx) => (
            <div
              key={idx}
              className="bg-[#F4F5FA] border border-[#E3E5F0] rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#15193D]/30 transition-all duration-150 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={webItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold text-[#15193D] hover:underline flex items-center gap-1.5 leading-snug"
                  >
                    <span>{webItem.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#6B7280] shrink-0 inline" />
                  </a>
                </div>
                <p className="text-[12px] text-[#6B7280] leading-relaxed line-clamp-3">
                  {webItem.snippet}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E3E5F0]/60 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-white border border-[#E3E5F0] text-[11px] font-medium text-[#15193D]">
                  Web Report
                </span>
                <span className="text-[11px] text-[#6B7280]">Public domain</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
