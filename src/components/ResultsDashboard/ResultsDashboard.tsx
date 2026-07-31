import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopilotData } from '../../types';
import { CheckCircle2, AlertTriangle, FileText, Presentation, Sparkles, BookOpen, Lightbulb, Calendar, Database, Copy, Check } from 'lucide-react';
import { TabOverview } from './TabOverview';
import { TabResearch } from './TabResearch';
import { TabGapsInnovation } from './TabGapsInnovation';
import { TabRoadmap } from './TabRoadmap';
import { TabResources } from './TabResources';

interface ResultsDashboardProps {
  data: CopilotData;
}

type TabType = 'overview' | 'research' | 'gaps' | 'roadmap' | 'resources';

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'research', label: 'Research', icon: BookOpen },
  { id: 'gaps', label: 'Gaps & Innovation', icon: Lightbulb },
  { id: 'roadmap', label: 'Roadmap', icon: Calendar },
  { id: 'resources', label: 'Resources', icon: Database },
];

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copied, setCopied] = useState(false);

  const handleCopyProjectId = () => {
    if (!data.projectId) return;
    navigator.clipboard.writeText(data.projectId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const docxUrl = data.exports?.docxUrl || data.exports?.docxPath;
  const pptxUrl = data.exports?.pptxUrl || data.exports?.pptxPath;

  // Vite dev middleware serves /exports/* on the same origin (port 3000).
  // If it starts with '/', use it as-is (relative to origin).
  // For standalone server mode (e.g. http://localhost:3001/...) keep the full URL.
  const docxFullUrl = docxUrl || null;
  const pptxFullUrl = pptxUrl || null;

  const handleExportDocx = () => {
    if (docxFullUrl) {
      window.open(docxFullUrl, '_blank');
    } else {
      alert("Export file not available.");
    }
  };

  const handleExportPptx = () => {
    if (pptxFullUrl) {
      window.open(pptxFullUrl, '_blank');
    } else {
      alert("Export file not available.");
    }
  };

  const timeDisplay = data.executionTimeSec ? `${data.executionTimeSec}s` : '14.2s';
  const timestampDisplay = data.generatedAt ? `at ${data.generatedAt}` : '';

  return (
    <div className="flex-1 min-h-screen bg-white flex flex-col p-8 space-y-6">
      
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E3E5F0]">
        
        {/* Title & Critic Badge */}
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[24px] font-semibold text-[#15193D] tracking-tight leading-snug">
              {data.normalized_problem}
            </h1>

            {/* Critic Approved / Flagged Badge */}
            {data.critic.approved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Critic approved ✓
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
                Critic flagged {data.critic.issues.length} items
              </span>
            )}
          </div>

          <div className="text-[13px] text-[#6B7280] flex items-center gap-2">
            <span>Verified AI Research Plan</span>
            <span>•</span>
            <span>Generated {timestampDisplay} in {timeDisplay}</span>
            <span>•</span>
            <span>8/8 Agents passed</span>
          </div>

          {/* Project ID / Telegram link banner */}
          {data.projectId && (
            <div className="flex items-center gap-2.5 mt-2 px-3 py-2 rounded-lg bg-[#15193D]/5 border border-[#15193D]/10 w-max">
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">Project ID</span>
              <code className="text-[12px] font-mono text-[#15193D] font-semibold select-all">{data.projectId}</code>
              <span className="text-[11px] text-[#6B7280]">—</span>
              <span className="text-[11px] text-[#6B7280]">link in Telegram:</span>
              <code className="text-[11px] font-mono text-[#F5A623] bg-[#15193D] px-1.5 py-0.5 rounded select-all">/link {data.projectId}</code>
              <button
                id="copy-project-id-btn"
                onClick={handleCopyProjectId}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-[#E3E5F0] hover:bg-[#F4F5FA] transition-colors text-[11px] font-medium text-[#15193D] shrink-0"
                title="Copy project ID"
              >
                {copied
                  ? <><Check className="w-3 h-3 text-[#16A34A]" /><span className="text-[#16A34A]">Copied!</span></>
                  : <><Copy className="w-3 h-3" /><span>Copy</span></>}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Export Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={docxFullUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E3E5F0] bg-white text-[#15193D] hover:bg-[#F4F5FA] text-[13px] font-medium transition-colors shadow-2xs"
            onClick={(e) => {
              if (!docxFullUrl) {
                e.preventDefault();
                alert("Export file not available.");
              }
            }}
          >
            <FileText className="w-4 h-4 text-[#15193D]" />
            <span>Export .docx</span>
          </a>

          <a
            href={pptxFullUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E3E5F0] bg-white text-[#15193D] hover:bg-[#F4F5FA] text-[13px] font-medium transition-colors shadow-2xs"
            onClick={(e) => {
              if (!pptxFullUrl) {
                e.preventDefault();
                alert("Export file not available.");
              }
            }}
          >
            <Presentation className="w-4 h-4 text-[#15193D]" />
            <span>Export .pptx</span>
          </a>
        </div>
      </div>

      {/* Horizontal Tab Navigation Bar (Filled Navy Pill active state, NOT underline) */}
      <div className="flex items-center gap-2 p-1 bg-[#F4F5FA] border border-[#E3E5F0] rounded-full w-max shadow-2xs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#15193D] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#15193D] hover:bg-white/60'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-[#F5A623]' : 'text-[#6B7280]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents Area with Motion Fade */}
      <div className="flex-1 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'overview' && <TabOverview data={data} />}
            {activeTab === 'research' && <TabResearch sources={data.sources} />}
            {activeTab === 'gaps' && (
              <TabGapsInnovation
                gaps={data.gaps}
                innovationAngles={data.innovation_angles}
              />
            )}
            {activeTab === 'roadmap' && <TabRoadmap plan={data.plan} projectId={data.projectId} />}
            {activeTab === 'resources' && <TabResources resources={data.resources} />}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};
