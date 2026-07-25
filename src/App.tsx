import { useState } from 'react';
import { LeftRail } from './components/LeftRail';
import { IdeaInputScreen } from './components/IdeaInputScreen';
import { AgentProgressScreen } from './components/AgentProgressScreen';
import { ResultsDashboard } from './components/ResultsDashboard/ResultsDashboard';
import { mockCopilotData } from './mockData';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'input' | 'progress' | 'results'>('input');
  const [submittedIdea, setSubmittedIdea] = useState<string>("Build an AI solution to reduce food waste in college hostels");

  const handleIdeaSubmit = (ideaText: string) => {
    setSubmittedIdea(ideaText);
    setCurrentScreen('progress');
  };

  const handleNewIdea = () => {
    setSubmittedIdea("");
    setCurrentScreen('input');
  };

  return (
    <div className="min-h-screen bg-white text-[#1F2340] flex">
      {/* Left Rail Navigation (Fixed 240px width) */}
      <LeftRail
        currentScreen={currentScreen}
        onNavigateScreen={setCurrentScreen}
        onNewIdea={handleNewIdea}
        activeProjectName={submittedIdea ? (submittedIdea.length > 22 ? submittedIdea.slice(0, 22) + "..." : submittedIdea) : "Campus Food Waste AI"}
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
          <ResultsDashboard data={mockCopilotData} />
        )}
      </main>
    </div>
  );
}
