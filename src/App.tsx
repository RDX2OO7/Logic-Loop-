import { useState, useEffect } from 'react';
import { LeftRail, ScreenState } from './components/LeftRail';
import { IdeaInputScreen } from './components/IdeaInputScreen';
import { AgentProgressScreen } from './components/AgentProgressScreen';
import { AngleSelectionScreen } from './components/AngleSelectionScreen';
import { MultiAngleProgressScreen } from './components/MultiAngleProgressScreen';
import { CompareResultsScreen } from './components/CompareResultsScreen';
import { ResultsDashboard } from './components/ResultsDashboard/ResultsDashboard';
import { NeedsClarificationCard } from './components/NeedsClarificationCard';
import { InsufficientEvidenceCard } from './components/InsufficientEvidenceCard';
import { HelpChatBot } from './components/HelpChatBot';
import { CopilotData, Phase1Result } from './types';
import { mapOrchestratorToCopilotData } from './utils/mapper';

export interface HistoryEntry {
  id: string;
  title: string;
  idea: string;
  createdAt: Date;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('input');
  const [submittedIdea, setSubmittedIdea] = useState<string>(() => {
    return localStorage.getItem('researchos_idea') || '';
  });
  const [phase1Data, setPhase1Data] = useState<Phase1Result | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [copilotData, setCopilotData] = useState<CopilotData | null>(() => {
    const saved = localStorage.getItem('researchos_copilot_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  // Raw results array for the compare screen (all angles)
  const [compareResults, setCompareResults] = useState<any[]>([]);
  // Persistent in-session history of completed plans
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('researchos_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({ ...item, createdAt: new Date(item.createdAt) }));
      } catch (e) { return []; }
    }
    return [];
  });

  // Save history to localStorage on change
  useEffect(() => {
    localStorage.setItem('researchos_history', JSON.stringify(history));
  }, [history]);

  // Save submittedIdea to localStorage on change
  useEffect(() => {
    if (submittedIdea) {
      localStorage.setItem('researchos_idea', submittedIdea);
    }
  }, [submittedIdea]);

  const hasValidPlanData = (data: CopilotData | null): boolean => {
    if (!data) return false;
    if (data.pipelineStatus === 'error') return false;
    const paperCount = data.sources?.papers?.length || 0;
    const repoCount = data.sources?.repos?.length || 0;
    const webCount = data.sources?.web?.length || 0;
    return paperCount + repoCount + webCount > 0 || !!data.plan?.architecture;
  };

  // Save copilotData to localStorage on change if valid
  useEffect(() => {
    if (copilotData && hasValidPlanData(copilotData)) {
      localStorage.setItem('researchos_copilot_data', JSON.stringify(copilotData));
    }
  }, [copilotData]);

  // On initial render: if we have cached copilotData and no active workflow screen, show results
  useEffect(() => {
    if (copilotData && hasValidPlanData(copilotData) && currentScreen === 'input') {
      setCurrentScreen('results');
    }
  }, []);

  const handleIdeaSubmit = (ideaText: string) => {
    setSubmittedIdea(ideaText);
    setPhase1Data(null);
    setSelectedRank(null);
    setCopilotData(null);
    setCompareResults([]);
    setCurrentScreen('progress_discover');
  };

  const handlePhase1Complete = (data: Phase1Result) => {
    setPhase1Data(data);
    if (data.status === 'needs_clarification' || data.status === 'insufficient_evidence') {
      const realCopilotData = mapOrchestratorToCopilotData(data, submittedIdea, 2.0);
      setCopilotData(realCopilotData);
      localStorage.setItem('researchos_copilot_data', JSON.stringify(realCopilotData));
      setCurrentScreen('results');
    } else {
      setCurrentScreen('angle_selection');
    }
  };

  const handleSelectAngle = (priorityRank: number) => {
    setSelectedRank(priorityRank);
    setCurrentScreen('progress_plan');
  };

  const handleSelectAllAngles = () => {
    setCurrentScreen('progress_plan_all');
  };

  // Helper — push a completed plan into history
  const pushToHistory = (title: string, idea: string) => {
    setHistory((prev) => [
      { id: `h-${Date.now()}`, title, idea, createdAt: new Date() },
      ...prev,
    ]);
  };

  // Single-angle planning done → map and show single Results
  const handleSinglePhase2Complete = (resultsData: any) => {
    const singleResult = resultsData.results ? resultsData.results[0] : resultsData;
    const realCopilotData = mapOrchestratorToCopilotData(singleResult, submittedIdea, 5.0);
    setCopilotData(realCopilotData);
    localStorage.setItem('researchos_copilot_data', JSON.stringify(realCopilotData));
    pushToHistory(singleResult?.projectData?.title || submittedIdea, submittedIdea);
    setCurrentScreen('results');
  };

  // Multi-angle "all" planning done → route to Compare screen
  const handleAllAnglesComplete = (resultsData: any) => {
    const rawResults: any[] = Array.isArray(resultsData.results)
      ? resultsData.results
      : [resultsData];
    setCompareResults(rawResults);
    setCurrentScreen('compare');
  };

  // When user picks a result from Compare → also add to history
  const handlePickFromCompareWithHistory = (result: any) => {
    pushToHistory(result?.projectData?.title || submittedIdea, submittedIdea);
    handlePickFromCompare(result);
  };

  // User picked one result from the Compare screen → show it as Results
  const handlePickFromCompare = (result: any) => {
    const realCopilotData = mapOrchestratorToCopilotData(result, submittedIdea, 5.0);
    setCopilotData(realCopilotData);
    localStorage.setItem('researchos_copilot_data', JSON.stringify(realCopilotData));
    setCurrentScreen('results');
  };

  const handleError = (errorMsg: string) => {
    console.error('[UI Pipeline Error]:', errorMsg);
    // If we already have a valid cached plan, retain it!
    const saved = localStorage.getItem('researchos_copilot_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (hasValidPlanData(parsed)) {
          setCopilotData(parsed);
          setCurrentScreen('results');
          return;
        }
      } catch (e) { /* ignore */ }
    }
    const fallbackData = mapOrchestratorToCopilotData({ status: 'error' }, submittedIdea, 0);
    setCopilotData(fallbackData);
    setCurrentScreen('results');
  };

  const handleNewIdea = () => {
    setSubmittedIdea('');
    setPhase1Data(null);
    setSelectedRank(null);
    setCopilotData(null);
    setCompareResults([]);
    localStorage.removeItem('researchos_copilot_data');
    localStorage.removeItem('researchos_idea');
    setCurrentScreen('input');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('researchos_history');
  };

  // Initialise html.dark from localStorage on first load
  useEffect(() => {
    const stored = localStorage.getItem('pref_dark') === 'true';
    document.documentElement.classList.toggle('dark', stored);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e17] text-[#1F2340] dark:text-[#f8fafc] flex transition-colors duration-200">
      <LeftRail
        currentScreen={currentScreen}
        onNavigateScreen={setCurrentScreen}
        onNewIdea={handleNewIdea}
        onClearHistory={handleClearHistory}
        history={history}
        activeProjectName={
          submittedIdea
            ? submittedIdea.length > 22
              ? submittedIdea.slice(0, 22) + '...'
              : submittedIdea
            : 'New Research Plan'
        }
      />

      <main className="flex-1 ml-[240px] min-h-screen flex flex-col">
        {currentScreen === 'input' && <IdeaInputScreen onSubmitIdea={handleIdeaSubmit} />}

        {currentScreen === 'progress_discover' && (
          <AgentProgressScreen
            ideaText={submittedIdea}
            phase="discover"
            onPhase1Complete={handlePhase1Complete}
            onPhase2Complete={() => {}}
            onError={handleError}
          />
        )}

        {currentScreen === 'angle_selection' && phase1Data && (
          <AngleSelectionScreen
            ideaText={submittedIdea}
            normalizedProblem={phase1Data.normalized_problem}
            angles={phase1Data.angles || []}
            evidenceSummary={phase1Data.evidence_summary}
            gaps={phase1Data.gaps}
            onSelectAngle={handleSelectAngle}
            onSelectAll={handleSelectAllAngles}
          />
        )}

        {currentScreen === 'progress_plan' && phase1Data && selectedRank !== null && (
          <AgentProgressScreen
            ideaText={submittedIdea}
            phase="plan"
            draftId={phase1Data.draftId}
            selectedRank={selectedRank}
            onPhase1Complete={() => {}}
            onPhase2Complete={handleSinglePhase2Complete}
            onError={handleError}
          />
        )}

        {currentScreen === 'progress_plan_all' && phase1Data && (
          <MultiAngleProgressScreen
            ideaText={submittedIdea}
            draftId={phase1Data.draftId}
            angles={phase1Data.angles || []}
            onComplete={handleAllAnglesComplete}
            onError={handleError}
          />
        )}

        {currentScreen === 'compare' && compareResults.length > 0 && (
          <CompareResultsScreen
            ideaText={submittedIdea}
            results={compareResults}
          />
        )}

        {currentScreen === 'results' &&
          (copilotData ? (
            copilotData.pipelineStatus === 'needs_clarification' ? (
              <NeedsClarificationCard
                originalIdea={submittedIdea}
                question={copilotData.question || 'Please provide more details about your project.'}
                onResubmitIdea={handleIdeaSubmit}
              />
            ) : copilotData.pipelineStatus === 'insufficient_evidence' ? (
              <InsufficientEvidenceCard
                originalIdea={submittedIdea}
                evidenceSummary={copilotData.evidence_summary || 'Insufficient research evidence found.'}
                onTryAnotherIdea={handleNewIdea}
              />
            ) : (
              <ResultsDashboard data={copilotData} />
            )
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center p-12 text-[#6B7280]">
              <p className="text-[16px] font-medium">No results generated yet.</p>
              <button
                onClick={() => setCurrentScreen('input')}
                className="mt-4 px-4 py-2 bg-[#15193D] text-white rounded-lg text-[14px]"
              >
                Create New Research Plan
              </button>
            </div>
          ))}
      </main>

      {/* Global Help Chatbot — bottom-right, visible on all screens */}
      <HelpChatBot />
    </div>
  );
}
