import { useState } from 'react';
import { LeftRail } from './components/LeftRail';
import { IdeaInputScreen } from './components/IdeaInputScreen';
import { AgentProgressScreen } from './components/AgentProgressScreen';
import { ResultsDashboard } from './components/ResultsDashboard/ResultsDashboard';
import { NeedsClarificationCard } from './components/NeedsClarificationCard';
import { InsufficientEvidenceCard } from './components/InsufficientEvidenceCard';
import { CopilotData } from './types';
import { mapOrchestratorToCopilotData } from './utils/mapper';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'input' | 'progress' | 'results'>('input');
  const [submittedIdea, setSubmittedIdea] = useState<string>("");
  const [copilotData, setCopilotData] = useState<CopilotData | null>(null);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState<boolean>(false);

  const handleIdeaSubmit = async (ideaText: string) => {
    setSubmittedIdea(ideaText);
    setCurrentScreen('progress');
    setIsLoadingPipeline(true);

    const startTime = Date.now();
    try {
      console.log('[UI] Sending idea to orchestrator agent pipeline:', ideaText);
      const response = await fetch('/api/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: ideaText,
          ideaRaw: ideaText,
          studentId: 'demo-student',
        }),
      });

      const resData = await response.json();
      console.log('[UI] Received response from orchestrator:', resData);

      const elapsedTimeSec = (Date.now() - startTime) / 1000;
      const durationSec = resData.durationMs ? resData.durationMs / 1000 : elapsedTimeSec;

      const realCopilotData = mapOrchestratorToCopilotData(
        resData.result || {},
        ideaText,
        durationSec
      );

      setCopilotData(realCopilotData);
    } catch (err) {
      console.error('[UI] Error running orchestrator agent pipeline:', err);
      const elapsedTimeSec = (Date.now() - startTime) / 1000;
      const fallbackData = mapOrchestratorToCopilotData({ status: 'error' }, ideaText, elapsedTimeSec);
      setCopilotData(fallbackData);
    } finally {
      setIsLoadingPipeline(false);
    }
  };

  const handleNewIdea = () => {
    setSubmittedIdea("");
    setCopilotData(null);
    setCurrentScreen('input');
  };

  return (
    <div className="min-h-screen bg-white text-[#1F2340] flex">
      {/* Left Rail Navigation (Fixed 240px width) */}
      <LeftRail
        currentScreen={currentScreen}
        onNavigateScreen={setCurrentScreen}
        onNewIdea={handleNewIdea}
        activeProjectName={submittedIdea ? (submittedIdea.length > 22 ? submittedIdea.slice(0, 22) + "..." : submittedIdea) : "New Research Plan"}
      />

      {/* Main Content Area (Offset by 240px left rail width) */}
      <main className="flex-1 ml-[240px] min-h-screen flex flex-col">
        {currentScreen === 'input' && (
          <IdeaInputScreen onSubmitIdea={handleIdeaSubmit} />
        )}

        {currentScreen === 'progress' && (
          <AgentProgressScreen
            ideaText={submittedIdea}
            onComplete={() => setCurrentScreen('results')}
          />
        )}

        {currentScreen === 'results' && (
          copilotData ? (
            copilotData.pipelineStatus === 'needs_clarification' ? (
              <NeedsClarificationCard
                originalIdea={submittedIdea}
                question={copilotData.question || 'Please provide more details about your project.'}
                onResubmitIdea={handleIdeaSubmit}
              />
            ) : copilotData.pipelineStatus === 'insufficient_evidence' ? (
              <InsufficientEvidenceCard
                originalIdea={submittedIdea}
                evidenceSummary={copilotData.evidence_summary || 'Insufficient research evidence found for this query.'}
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
          )
        )}
      </main>
    </div>
  );
}
