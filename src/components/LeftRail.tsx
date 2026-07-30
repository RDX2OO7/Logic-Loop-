import React, { useState, useEffect } from 'react';
import {
  Plus, FolderKanban, Settings, Sparkles, FileText,
  ChevronRight, Layers, Terminal, Moon, Sun, Trash2,
  PanelLeftClose, X, Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HistoryEntry } from '../App';

export type ScreenState =
  | 'input'
  | 'progress_discover'
  | 'angle_selection'
  | 'progress_plan'
  | 'progress_plan_all'
  | 'compare'
  | 'results';

interface LeftRailProps {
  currentScreen: ScreenState;
  onNavigateScreen: (screen: ScreenState) => void;
  onNewIdea: () => void;
  onClearHistory: () => void;
  activeProjectName?: string;
  history?: HistoryEntry[];
}

// ─── Settings helpers ──────────────────────────────────────────────────────────
function getStoredBool(key: string, def: boolean) {
  const v = localStorage.getItem(key);
  return v === null ? def : v === 'true';
}

export const LeftRail: React.FC<LeftRailProps> = ({
  currentScreen,
  onNavigateScreen,
  onNewIdea,
  onClearHistory,
  activeProjectName = 'New Research Plan',
  history = [],
}) => {
  const navigate = useNavigate();

  // ── local UI state ────────────────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // ── persisted settings ────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => getStoredBool('pref_dark', false));
  const [compactMode, setCompactMode] = useState(() => getStoredBool('pref_compact', false));

  // Apply dark mode to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('pref_dark', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('pref_compact', String(compactMode));
  }, [compactMode]);

  const isProgress =
    currentScreen === 'progress_discover' ||
    currentScreen === 'progress_plan' ||
    currentScreen === 'progress_plan_all' ||
    currentScreen === 'angle_selection';

  // ── clear history with confirm step ──────────────────────────────────────
  const handleClearHistory = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClearHistory();
    setConfirmClear(false);
  };

  return (
    <aside className="w-[240px] min-w-[240px] bg-[#15193D] text-white h-screen fixed left-0 top-0 flex flex-col z-30 border-r border-[#1F2340]">

      {/* ── Top Header & Wordmark ─────────────────────────────────────────── */}
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

      {/* ── New Idea Button ───────────────────────────────────────────────── */}
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

      {/* ── Navigation + History ─────────────────────────────────────────── */}
      <nav className={`flex-1 px-3 py-2 space-y-6 overflow-y-auto ${compactMode ? 'space-y-3' : 'space-y-6'}`}>
        {/* Main nav */}
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

        {/* History */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2 flex items-center justify-between">
            <span>History</span>
            {history.length > 0 && (
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">
                {history.length}
              </span>
            )}
          </div>

          <div className="space-y-0.5">
            {/* Active project pill */}
            {currentScreen === 'results' && (
              <button
                onClick={() => onNavigateScreen('results')}
                className="w-full text-left px-3 py-2 rounded-md text-[13px] flex items-center justify-between bg-white/10 text-white font-medium"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                  <span className="truncate">{activeProjectName}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
              </button>
            )}

            {history.length === 0 ? (
              <div className="px-3 py-3 text-[12px] text-white/30 italic">
                No plans yet — run your first idea!
              </div>
            ) : (
              history.map((entry) => (
                <button
                  key={entry.id}
                  className="w-full text-left px-3 py-2 rounded-md text-[13px] text-white/50 hover:text-white/80 hover:bg-white/5 flex items-center gap-2.5 truncate transition-colors"
                  title={entry.idea}
                >
                  <FolderKanban className="w-3.5 h-3.5 text-white/40 shrink-0" />
                  <span className="truncate">{entry.title}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* System */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">
            System
          </div>
          <button
            onClick={() => { setSettingsOpen((v) => !v); setConfirmClear(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${settingsOpen ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
          >
            <Settings className={`w-4 h-4 text-white/60 transition-transform duration-300 ${settingsOpen ? 'rotate-45' : ''}`} />
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

        {/* ── Settings Panel (inline slide-down) ─────────────────────────── */}
        {settingsOpen && (
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                Preferences
              </span>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-white/30 hover:text-white/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 space-y-1">
              {/* Dark mode */}
              <SettingRow
                icon={darkMode ? <Moon className="w-3.5 h-3.5 text-[#F5A623]" /> : <Sun className="w-3.5 h-3.5 text-white/50" />}
                label="Dark mode"
                description={darkMode ? 'On' : 'Off'}
              >
                <Toggle checked={darkMode} onChange={setDarkMode} />
              </SettingRow>

              {/* Compact mode */}
              <SettingRow
                icon={<PanelLeftClose className="w-3.5 h-3.5 text-white/50" />}
                label="Compact sidebar"
                description={compactMode ? 'On' : 'Off'}
              >
                <Toggle checked={compactMode} onChange={setCompactMode} />
              </SettingRow>

              {/* Divider */}
              <div className="h-px bg-white/10 my-2" />

              {/* Clear history */}
              <button
                onClick={handleClearHistory}
                disabled={history.length === 0}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 ${history.length === 0
                  ? 'opacity-30 cursor-not-allowed text-white/40'
                  : confirmClear
                    ? 'bg-red-500/20 border border-red-400/40 text-red-300 hover:bg-red-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                  }`}
              >
                {confirmClear ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Confirm clear ({history.length} items)</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Clear history</span>
                  </>
                )}
              </button>

              {confirmClear && (
                <button
                  onClick={() => setConfirmClear(false)}
                  className="w-full text-center text-[11px] text-white/30 hover:text-white/60 py-1 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── User / Org Footer ─────────────────────────────────────────────── */}
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

// ─── Sub-components ────────────────────────────────────────────────────────────

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, label, description, children }) => (
  <div className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors">
    <div className="flex items-center gap-2.5">
      {icon}
      <div>
        <div className="text-[12px] font-medium text-white/80">{label}</div>
        {description && <div className="text-[10px] text-white/35">{description}</div>}
      </div>
    </div>
    {children}
  </div>
);

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-8 h-4.5 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-[#F5A623]' : 'bg-white/20'
      }`}
    style={{ width: 32, height: 18 }}
    aria-checked={checked}
    role="switch"
  >
    <span
      className="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200"
      style={{
        width: 14,
        height: 14,
        transform: checked ? 'translateX(14px)' : 'translateX(0)',
      }}
    />
  </button>
);
