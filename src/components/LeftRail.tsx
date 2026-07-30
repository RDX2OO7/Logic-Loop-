import React from 'react';
import { Plus, FolderKanban, Settings, Sparkles, FileText, ChevronRight, Layers, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type ScreenState = 'input' | 'progress_discover' | 'angle_selection' | 'progress_plan' | 'progress_plan_all' | 'compare' | 'results';

interface LeftRailProps {
  currentScreen: ScreenState;
  onNavigateScreen: (screen: ScreenState) => void;
  onNewIdea: () => void;
  activeProjectName?: string;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  currentScreen,
  onNavigateScreen,
  onNewIdea,
  activeProjectName = "Campus Food Waste AI"
}) => {
  const navigate = useNavigate();
  const isProgress =
    currentScreen === 'progress_discover' ||
    currentScreen === 'progress_plan' ||
    currentScreen === 'progress_plan_all' ||
    currentScreen === 'angle_selection';

  return (
    <aside className="w-[240px] min-w-[240px] bg-[#15193D] text-white h-screen fixed left-0 top-0 flex flex-col z-30 border-r border-[#1F2340]">
      {/* Top Header & Serif Wordmark */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F5A623] text-[#15193D] flex items-center justify-center font-bold text-lg">
            R
          </div>
          <div>
            <h1 className="font-serif text-[20px] font-semibold text-white leading-none tracking-tight">
              ResearchOS
            </h1>
            <span className="text-[11px] text-white/50 font-sans uppercase tracking-wider block mt-0.5">
              By Novonex
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-4">
        <button
          onClick={onNewIdea}
          className={`w-full py-2.5 px-3.5 rounded-lg font-medium text-[13px] flex items-center justify-center gap-2 transition-all duration-150 ${currentScreen === 'input'
            ? 'bg-[#F5A623] text-[#15193D] shadow-sm font-semibold'
            : 'bg-white/10 text-white hover:bg-white/15'
            }`}
        >
          <Plus className="w-4 h-4" />
          <span>New idea</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">
            Navigation
          </div>
          <button
            onClick={() => onNavigateScreen('input')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${currentScreen === 'input'
              ? 'bg-white/15 text-white font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
          >
            <Sparkles className="w-4 h-4 text-[#F5A623]" />
            <span>Idea generator</span>
          </button>

          {isProgress && (
            <button
              onClick={() => onNavigateScreen('progress_discover')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium bg-white/15 text-white font-semibold"
            >
              <div className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
              <span>Agent pipeline</span>
            </button>
          )}

          <button
            onClick={() => onNavigateScreen('results')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${currentScreen === 'results'
              ? 'bg-white/15 text-white font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
          >
            <Layers className="w-4 h-4 text-white/60" />
            <span>Active plan</span>
          </button>
        </div>

        {/* Workspaces Section */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2 flex items-center justify-between">
            <span>Workspaces</span>
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">3</span>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => onNavigateScreen('results')}
              className={`w-full text-left px-3 py-2 rounded-md text-[13px] flex items-center justify-between transition-colors ${currentScreen === 'results'
                ? 'bg-white/10 text-white font-medium'
                : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                <span className="truncate">{activeProjectName}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
            </button>

            <button className="w-full text-left px-3 py-2 rounded-md text-[13px] text-white/50 hover:text-white/80 hover:bg-white/5 flex items-center gap-2.5 truncate transition-colors">
              <FolderKanban className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <span className="truncate">Autonomous Solar Grid</span>
            </button>

            <button className="w-full text-left px-3 py-2 rounded-md text-[13px] text-white/50 hover:text-white/80 hover:bg-white/5 flex items-center gap-2.5 truncate transition-colors">
              <FolderKanban className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <span className="truncate">Lab Diagnostics Vision</span>
            </button>
          </div>
        </div>

        {/* System & Settings */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">
            System
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-4 h-4 text-white/60" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => navigate('/terminal')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Terminal className="w-4 h-4 text-[#F5A623]" />
            <span>Terminal</span>
          </button>
        </div>
      </nav>

      {/* User / Org Footer */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FCEBC8] text-[#15193D] font-semibold text-xs flex items-center justify-center">
            UI
          </div>
          <div className="truncate">
            <div className="text-[13px] font-medium text-white truncate">University Lab</div>
            <div className="text-[11px] text-white/50 truncate">Research tier • Active</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
