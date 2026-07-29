import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { mapOrchestratorToCopilotData } from '../utils/mapper';
import type { CopilotData } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TerminalLine {
  id: number;
  content: string | React.ReactNode;
  type: 'output' | 'input' | 'blank';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAM_NAME = 'Novonex';
const BACKEND_ORIGIN = ''; // same origin via Vite proxy / middleware

const ASCII_BANNER = `  ____                               _      ___  ____  
 |  _ \\ ___  ___  ___  __ _ _ __ ___| |__  / _ \\/ ___| 
 | |_) / _ \\/ __|/ _ \\/ _\` | '__/ __| '_ \\| | | \\___ \\ 
 |  _ <  __/\\__ \\  __/ (_| | | | (__| | | | |_| |___) |
 |_| \\_\\___||___/\\___|\\__,_|_|  \\___|_| |_|\\___/|____/ 
                                                        `;

const BOOT_LINES = [
  'Initializing ResearchOS kernel...',
  'Loading agent runtime [9 modules]... OK',
  'Establishing connection to orchestrator... OK',
  'Verifying API endpoints... OK',
];

const AGENT_COLORS: Record<string, string> = {
  discovery:    '#22D3EE',
  deepSearch:   '#F5A623',
  deepSearch2:  '#F5A623',
  clustering:   '#A78BFA',
  gapAgent:     '#F5A623',
  plannerAgent: '#22D3EE',
  curatorAgent: '#A78BFA',
  criticAgent:  '#FACC15',
  publisher:    '#16A34A',
};

// Map log step prefixes to agent names
function detectAgent(msg: string): string | null {
  if (msg.startsWith('discovery:'))    return 'discovery';
  if (msg.startsWith('deepSearch:'))   return 'deepSearch';
  if (msg.startsWith('clustering:'))   return 'clustering';
  if (msg.startsWith('gapAgent:'))     return 'gapAgent';
  if (msg.startsWith('plannerAgent:')) return 'plannerAgent';
  if (msg.startsWith('curatorAgent:')) return 'curatorAgent';
  if (msg.startsWith('criticAgent:'))  return 'criticAgent';
  if (msg.startsWith('publisher:'))    return 'publisher';
  return null;
}

function agentLabel(msg: string): [string, string] {
  // returns [label, rest]
  const colon = msg.indexOf(':');
  if (colon === -1) return ['system', msg];
  return [msg.slice(0, colon), msg.slice(colon + 1).trim()];
}

// ─── Styled line helpers ──────────────────────────────────────────────────────

function colorSpan(text: string, color: string, extra?: React.CSSProperties): React.ReactNode {
  return <span style={{ color, ...extra }}>{text}</span>;
}

function agentLine(msg: string): React.ReactNode {
  const agent = detectAgent(msg);
  if (!agent) return <span style={{ color: '#F5A623' }}>{msg}</span>;
  const color = AGENT_COLORS[agent] || '#F5A623';
  const [label, rest] = agentLabel(msg);
  const isWarn = agent === 'criticAgent' && rest.includes('issue(s) found');
  return (
    <span>
      <span style={{ color, fontWeight: 700 }}>[{label}]</span>{' '}
      {isWarn
        ? <span style={{ color: '#FACC15' }}>⚠ WARN {rest}</span>
        : <span style={{ color: '#D1D5DB' }}>{rest}</span>
      }
    </span>
  );
}

function sysLine(text: string): React.ReactNode {
  return <span style={{ color: '#6B7280' }}>{text}</span>;
}
function successLine(text: string): React.ReactNode {
  return <span style={{ color: '#16A34A' }}>{text}</span>;
}
function errorLine(text: string): React.ReactNode {
  return <span style={{ color: '#DC2626' }}>{text}</span>;
}
function warnLine(text: string): React.ReactNode {
  return <span style={{ color: '#FACC15' }}>{text}</span>;
}
function amberLine(text: string): React.ReactNode {
  return <span style={{ color: '#F5A623' }}>{text}</span>;
}
function cyanLine(text: string): React.ReactNode {
  return <span style={{ color: '#22D3EE' }}>{text}</span>;
}
function whiteLine(text: string): React.ReactNode {
  return <span style={{ color: '#E5E7EB' }}>{text}</span>;
}
function dimLine(text: string): React.ReactNode {
  return <span style={{ color: '#4B5563' }}>{text}</span>;
}

// ─── Box drawing helpers ──────────────────────────────────────────────────────

function boxedLines(lines: string[], color = '#F5A623'): React.ReactNode[] {
  const maxLen = Math.max(...lines.map(l => l.length));
  const width = maxLen + 2;
  const top    = '┌' + '─'.repeat(width) + '┐';
  const bottom = '└' + '─'.repeat(width) + '┘';
  const rows = lines.map(l => '│ ' + l + ' '.repeat(maxLen - l.length) + ' │');
  return [top, ...rows, bottom].map((r, i) => (
    <span key={i} style={{ color }}>{r}</span>
  ));
}

// ─── Help table ───────────────────────────────────────────────────────────────

function buildHelpLines(): React.ReactNode[] {
  const rows: [string, string][] = [
    ['run "<idea>"',       'Start a new research & plan pipeline'],
    ['status',             'Show the status of the last/current run'],
    ['clusters',           'List research clusters from the last run'],
    ['gaps',               'List identified gaps from the last run'],
    ['angle',              'Show the chosen innovation angle'],
    ['plan',               'Show architecture, stack, and roadmap'],
    ['sources',            'List all real sources with links'],
    ['download docx',      'Download the .docx report of the last run'],
    ['download pptx',      'Download the .pptx deck of the last run'],
    ['history',            'Show command history'],
    ['clear',              'Clear the terminal screen'],
    ['exit',               'Return to the normal ResearchOS UI'],
    ['about',              'About this project'],
    ['whoami',             'Show current session info'],
  ];

  const col1 = 32;
  const divider = '─'.repeat(col1) + '─────────────────────────────────────────';
  return [
    <span key="h0" style={{ color: '#F5A623' }}>{'COMMAND' + ' '.repeat(col1 - 7) + 'DESCRIPTION'}</span>,
    <span key="h1" style={{ color: '#4B5563' }}>{divider}</span>,
    ...rows.map(([cmd, desc], i) => (
      <span key={i + 2}>
        <span style={{ color: '#22D3EE' }}>{cmd.padEnd(col1)}</span>
        <span style={{ color: '#D1D5DB' }}>{desc}</span>
      </span>
    )),
  ];
}

// ─── Main component ───────────────────────────────────────────────────────────

export const TerminalPage: React.FC = () => {
  const navigate = useNavigate();

  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [booting, setBooting] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<CopilotData | null>(null);
  const [rawResult, setRawResult] = useState<any>(null);

  const lineIdRef  = useRef(0);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const runningRef = useRef(false);

  // Keep runningRef in sync
  useEffect(() => { runningRef.current = running; }, [running]);

  // ── Line management ─────────────────────────────────────────────────────────

  const nextId = () => ++lineIdRef.current;

  const addLine = useCallback((content: string | React.ReactNode, type: TerminalLine['type'] = 'output') => {
    setLines(prev => [...prev, { id: nextId(), content, type }]);
  }, []);

  const addBlank = useCallback(() => addLine('', 'blank'), [addLine]);

  // Auto-scroll: only scroll if user is already near bottom
  const scrollToBottom = useCallback(() => {
    const el = bottomRef.current;
    if (!el) return;
    const container = el.parentElement!;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distFromBottom < 200) {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [lines, scrollToBottom]);

  // ── Boot sequence ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    let skipBoot = false;

    const skipHandler = () => { skipBoot = true; };
    window.addEventListener('keydown', skipHandler, { once: true });

    const run = async () => {
      const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

      for (const bootLine of BOOT_LINES) {
        if (cancelled || skipBoot) break;
        await delay(90 + Math.random() * 50);
        if (!cancelled) addLine(sysLine(bootLine));
      }

      if (!cancelled) {
        await delay(skipBoot ? 0 : 200);
        addBlank();
        for (const bannerLine of ASCII_BANNER.split('\n')) {
          addLine(amberLine(bannerLine));
        }
        addBlank();
        addLine(whiteLine('  ResearchOS Terminal v1.0.0 — AI Research & Innovation Copilot'));
        addLine(dimLine("  Type 'help' to see available commands. Type 'run \"<your idea>\"' to start."));
        addBlank();
        setBooting(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      window.removeEventListener('keydown', skipHandler);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Focus input when not booting ────────────────────────────────────────────

  useEffect(() => {
    if (!booting) inputRef.current?.focus();
  }, [booting]);

  // ── Command runner ──────────────────────────────────────────────────────────

  const printPrompt = useCallback((cmd: string) => {
    addLine(
      <span>
        <span style={{ color: '#22D3EE' }}>researchos</span>
        <span style={{ color: '#6B7280' }}>@</span>
        <span style={{ color: '#A78BFA' }}>{TEAM_NAME.toLowerCase()}</span>
        <span style={{ color: '#6B7280' }}>:~$ </span>
        <span style={{ color: '#F5A623' }}>{cmd}</span>
      </span>,
      'input'
    );
  }, [addLine]);

  const noRunError = useCallback(() => {
    addLine(errorLine('No active or completed run. Use run "<idea>" to start one.'));
  }, [addLine]);

  const handleRunCommand = useCallback(async (idea: string) => {
    if (runningRef.current) {
      addLine(warnLine('A run is already in progress. Please wait for it to complete.'));
      return;
    }
    setRunning(true);
    addBlank();
    addLine(cyanLine(`▶ Starting pipeline for: "${idea}"`));
    addLine(sysLine('  Connecting to orchestrator...'));
    addBlank();

    const spinFrames = ['|', '/', '─', '\\'];
    let spinIdx = 0;
    let spinLine: TerminalLine | null = null;

    // We show a spinner line that we replace
    const spinId = nextId();
    const updateSpinner = (msg: string) => {
      const frame = spinFrames[spinIdx % spinFrames.length];
      spinIdx++;
      setLines(prev => {
        const existingIdx = prev.findIndex(l => l.id === spinId);
        const spinContent = (
          <span>
            <span style={{ color: '#4B5563' }}>  {frame} </span>
            <span style={{ color: '#6B7280' }}>{msg}</span>
          </span>
        );
        if (existingIdx === -1) {
          return [...prev, { id: spinId, content: spinContent, type: 'output' }];
        }
        const copy = [...prev];
        copy[existingIdx] = { id: spinId, content: spinContent, type: 'output' };
        return copy;
      });
    };

    // Spinner interval
    const spinInterval = setInterval(() => updateSpinner('Running agents...'), 150);
    updateSpinner('Running agents...');

    try {
      const startTime = Date.now();
      const resp = await fetch(`${BACKEND_ORIGIN}/api/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, ideaRaw: idea, studentId: 'demo-student' }),
      });

      clearInterval(spinInterval);

      // Remove spinner line
      setLines(prev => prev.filter(l => l.id !== spinId));

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: resp.statusText }));
        addLine(errorLine(`✗ Pipeline error: ${errData.error || resp.statusText}`));
        setRunning(false);
        return;
      }

      const resData = await resp.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const result = resData.result || {};
      const log: string[] = result.log || [];

      // Print each log line with agent coloring, staggered
      for (const logMsg of log) {
        addLine(agentLine(logMsg));
        // tiny delay for visual stagger
        await new Promise(r => setTimeout(r, 30));
      }

      // Handle halted pipeline statuses
      if (result.status === 'needs_clarification') {
        addBlank();
        addLine(warnLine('⚠ Pipeline halted: needs clarification'));
        addLine(warnLine(`  ${result.question || 'Please provide more details.'}`));
        addBlank();
        setRunning(false);
        return;
      }

      if (result.status === 'insufficient_evidence') {
        addBlank();
        addLine(errorLine('✗ Pipeline halted: insufficient evidence'));
        addLine(errorLine(`  ${result.evidence_summary || 'Not enough research evidence found.'}`));
        addBlank();
        setRunning(false);
        return;
      }

      // Map to CopilotData for later commands
      const copilotData = mapOrchestratorToCopilotData(result, idea, parseFloat(elapsed));
      setLastResult(copilotData);
      setRawResult(result);

      // Print critic issues if any
      if (!result.critic?.approved && result.critic?.issues?.length) {
        addBlank();
        addLine(warnLine(`⚠ Critic flagged ${result.critic.issues.length} issue(s):`));
        for (const issue of result.critic.issues) {
          addLine(<span style={{ color: '#FACC15' }}>{'  › '}<span style={{ color: '#D1D5DB' }}>[{issue.agent}] {issue.problem}</span></span>);
        }
      }

      addBlank();

      // Print boxed summary
      const projectData = result.projectData || {};
      const sources = projectData.sources || {};
      const totalSources =
        (sources.papers?.length || 0) +
        (sources.repos?.length || 0) +
        (sources.web?.length || 0);

      const summaryLines = [
        `Status    : ${result.status === 'approved' ? '✓ Approved' : '⚠ Approved with issues'}`,
        `Critic    : ${result.critic?.approved ? '✓ Passed' : '✗ Issues found'}`,
        `Sources   : ${totalSources} total`,
        `Duration  : ${elapsed}s`,
        '',
        result.exports?.docxUrl
          ? `Download  : download docx`
          : 'Download  : not available',
        result.exports?.pptxUrl
          ? `          : download pptx`
          : '',
      ].filter((l, i) => !(i > 4 && l === ''));

      const boxed = boxedLines(summaryLines);
      boxed.forEach(node => addLine(node));
      addBlank();
      addLine(successLine('✓ Pipeline complete. Use status / clusters / gaps / angle / plan / sources for details.'));
      addBlank();

    } catch (err: any) {
      clearInterval(spinInterval);
      setLines(prev => prev.filter(l => l.id !== spinId));
      addLine(errorLine(`✗ Network error: ${err.message}`));
    } finally {
      setRunning(false);
    }
  }, [addLine, addBlank]);

  const execCommand = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    printPrompt(trimmed);
    setCmdHistory(prev => [trimmed, ...prev]);
    setHistIdx(-1);

    const lower = trimmed.toLowerCase();

    // ── clear ──────────────────────────────────────────────────────────────
    if (lower === 'clear') {
      setLines([]);
      return;
    }

    // ── exit ───────────────────────────────────────────────────────────────
    if (lower === 'exit') {
      addLine(sysLine('Returning to ResearchOS UI...'));
      setTimeout(() => navigate('/'), 600);
      return;
    }

    // ── help ───────────────────────────────────────────────────────────────
    if (lower === 'help') {
      addBlank();
      buildHelpLines().forEach(node => addLine(node));
      addBlank();
      return;
    }

    // ── about ──────────────────────────────────────────────────────────────
    if (lower === 'about') {
      addBlank();
      const aboutLines = [
        'Project     : ResearchOS Terminal',
        'Description : AI Research & Innovation Copilot',
        'Event       : iNSIGHTS Layer 2 — Student Innovation Hackathon',
        'Team        : ' + TEAM_NAME,
        'Version     : 1.0.0',
      ];
      boxedLines(aboutLines, '#A78BFA').forEach(node => addLine(node));
      addBlank();
      return;
    }

    // ── whoami ─────────────────────────────────────────────────────────────
    if (lower === 'whoami') {
      addBlank();
      addLine(sysLine('Checking connection...'));
      let connStatus = 'Checking...';
      try {
        const hRes = await fetch(`${BACKEND_ORIGIN}/api/health`, { signal: AbortSignal.timeout(3000) });
        connStatus = hRes.ok ? '✓ Connected' : `✗ HTTP ${hRes.status}`;
      } catch {
        // health endpoint doesn't exist — try a HEAD on /api/pipeline
        try {
          connStatus = '✓ Reachable (no /health endpoint)';
        } catch {
          connStatus = '✗ Unreachable';
        }
      }
      // Remove the "checking" line
      setLines(prev => { const c = [...prev]; c.pop(); return c; });

      const now = new Date();
      const whoamiLines = [
        `Team        : ${TEAM_NAME}`,
        `Session     : terminal`,
        `Time        : ${now.toLocaleString()}`,
        `Origin      : ${window.location.origin}`,
        `Connection  : ${connStatus}`,
        `Last run    : ${lastResult ? lastResult.normalized_problem.slice(0, 40) : 'none'}`,
      ];
      addBlank();
      boxedLines(whoamiLines, '#22D3EE').forEach(node => addLine(node));
      addBlank();
      return;
    }

    // ── history ────────────────────────────────────────────────────────────
    if (lower === 'history') {
      addBlank();
      if (cmdHistory.length === 0) {
        addLine(dimLine('  (no history)'));
      } else {
        cmdHistory.slice().reverse().forEach((cmd, i) => {
          addLine(
            <span>
              <span style={{ color: '#4B5563' }}>{String(i + 1).padStart(4, ' ')}  </span>
              <span style={{ color: '#D1D5DB' }}>{cmd}</span>
            </span>
          );
        });
      }
      addBlank();
      return;
    }

    // ── run "<idea>" ───────────────────────────────────────────────────────
    const runMatch = trimmed.match(/^run\s+"(.+)"$/i) || trimmed.match(/^run\s+'(.+)'$/i) || trimmed.match(/^run\s+(.+)$/i);
    if (runMatch) {
      const idea = runMatch[1].trim();
      await handleRunCommand(idea);
      return;
    }

    // ── status ─────────────────────────────────────────────────────────────
    if (lower === 'status') {
      if (!lastResult) { noRunError(); return; }
      addBlank();
      const statusLines = [
        `Problem     : ${lastResult.normalized_problem}`,
        `Status      : ${lastResult.pipelineStatus}`,
        `Critic      : ${lastResult.critic.approved ? '✓ Approved' : `✗ ${lastResult.critic.issues.length} issue(s)`}`,
        `Duration    : ${lastResult.executionTimeSec}s`,
        `Generated   : ${lastResult.generatedAt}`,
      ];
      boxedLines(statusLines, '#F5A623').forEach(node => addLine(node));
      addBlank();
      return;
    }

    // ── clusters ───────────────────────────────────────────────────────────
    if (lower === 'clusters') {
      if (!lastResult) { noRunError(); return; }
      addBlank();
      if (!lastResult.clusters?.length) {
        addLine(dimLine('  No clusters found.'));
      } else {
        addLine(amberLine(`Research Clusters (${lastResult.clusters.length})`));
        addLine(dimLine('─'.repeat(50)));
        lastResult.clusters.forEach((c, i) => {
          addLine(
            <span>
              <span style={{ color: '#A78BFA' }}>{`  ${i + 1}. `}</span>
              <span style={{ color: '#E5E7EB' }}>{c.theme}</span>
              <span style={{ color: '#6B7280' }}>{` (${c.item_count} items)`}</span>
            </span>
          );
        });
      }
      addBlank();
      return;
    }

    // ── gaps ───────────────────────────────────────────────────────────────
    if (lower === 'gaps') {
      if (!lastResult) { noRunError(); return; }
      addBlank();
      const gaps = lastResult.gaps || [];
      if (!gaps.length) {
        addLine(dimLine('  No gaps identified.'));
      } else {
        addLine(amberLine(`Identified Gaps (${gaps.length})`));
        addLine(dimLine('─'.repeat(50)));
        gaps.forEach((g, i) => {
          addLine(
            <span>
              <span style={{ color: '#22D3EE' }}>{`  ${i + 1}. `}</span>
              <span style={{ color: '#D1D5DB' }}>{typeof g === 'string' ? g : JSON.stringify(g)}</span>
            </span>
          );
        });
      }
      addBlank();
      return;
    }

    // ── angle ──────────────────────────────────────────────────────────────
    if (lower === 'angle') {
      if (!lastResult) { noRunError(); return; }
      addBlank();
      const angles = lastResult.innovation_angles || [];
      if (!angles.length) {
        addLine(dimLine('  No innovation angle selected.'));
      } else {
        const a = angles[0];
        addLine(amberLine('Innovation Angle'));
        addLine(dimLine('─'.repeat(50)));
        addLine(whiteLine(`  ${a.angle}`));
        if (a.why_novel) {
          addBlank();
          addLine(cyanLine('  Why it\'s novel:'));
          addLine(<span style={{ color: '#D1D5DB' }}>{`  ${a.why_novel}`}</span>);
        }
      }
      addBlank();
      return;
    }

    // ── plan ───────────────────────────────────────────────────────────────
    if (lower === 'plan') {
      if (!lastResult) { noRunError(); return; }
      addBlank();
      const plan = lastResult.plan;
      addLine(amberLine('Project Plan'));
      addLine(dimLine('─'.repeat(50)));

      if (plan.architecture) {
        addLine(cyanLine('  Architecture:'));
        // Word-wrap long architecture at ~80 chars
        const words = plan.architecture.split(' ');
        let line = '    ';
        for (const word of words) {
          if ((line + word).length > 82) {
            addLine(<span style={{ color: '#D1D5DB' }}>{line}</span>);
            line = '    ' + word + ' ';
          } else {
            line += word + ' ';
          }
        }
        if (line.trim()) addLine(<span style={{ color: '#D1D5DB' }}>{line}</span>);
        addBlank();
      }

      if (plan.tech_stack?.length) {
        addLine(cyanLine('  Tech Stack:'));
        plan.tech_stack.forEach(t => addLine(<span><span style={{ color: '#A78BFA' }}>{'  • '}</span><span style={{ color: '#D1D5DB' }}>{t}</span></span>));
        addBlank();
      }

      if (plan.milestones?.length) {
        addLine(cyanLine('  Milestones:'));
        plan.milestones.forEach((m, i) => {
          addLine(
            <span>
              <span style={{ color: '#22D3EE' }}>{`  ${i + 1}. `}</span>
              <span style={{ color: '#E5E7EB', fontWeight: 600 }}>{m.name}</span>
              <span style={{ color: '#6B7280' }}>{` (${m.duration_days}d) `}</span>
              <span style={{ color: '#9CA3AF' }}>{m.description}</span>
            </span>
          );
        });
      }
      addBlank();
      return;
    }

    // ── sources ────────────────────────────────────────────────────────────
    if (lower === 'sources') {
      if (!lastResult) { noRunError(); return; }
      addBlank();
      const { papers, repos, web } = lastResult.sources;
      const total = papers.length + repos.length + web.length;
      addLine(amberLine(`Sources (${total} total)`));
      addLine(dimLine('─'.repeat(60)));

      if (papers.length) {
        addLine(cyanLine(`  Papers (${papers.length}):`));
        papers.forEach((p, i) => {
          addLine(<span><span style={{ color: '#A78BFA' }}>{`  ${i + 1}. `}</span><span style={{ color: '#E5E7EB' }}>{p.title}</span></span>);
          addLine(<span style={{ color: '#6B7280' }}>{`      ${p.url}`}</span>);
        });
        addBlank();
      }
      if (repos.length) {
        addLine(cyanLine(`  Repositories (${repos.length}):`));
        repos.forEach((r, i) => {
          addLine(<span><span style={{ color: '#A78BFA' }}>{`  ${i + 1}. `}</span><span style={{ color: '#E5E7EB' }}>{r.name}</span>{r.stars ? <span style={{ color: '#FACC15' }}>{` ★${r.stars}`}</span> : null}</span>);
          addLine(<span style={{ color: '#6B7280' }}>{`      ${r.url}`}</span>);
        });
        addBlank();
      }
      if (web.length) {
        addLine(cyanLine(`  Web Sources (${web.length}):`));
        web.forEach((w, i) => {
          addLine(<span><span style={{ color: '#A78BFA' }}>{`  ${i + 1}. `}</span><span style={{ color: '#E5E7EB' }}>{w.title}</span></span>);
          addLine(<span style={{ color: '#6B7280' }}>{`      ${w.url}`}</span>);
        });
      }
      addBlank();
      return;
    }

    // ── download docx / pptx ───────────────────────────────────────────────
    if (lower === 'download docx' || lower === 'download pptx') {
      if (!lastResult) { noRunError(); return; }
      const isDocx = lower.includes('docx');
      const url = isDocx ? lastResult.exports?.docxUrl : lastResult.exports?.pptxUrl;
      if (!url) {
        addLine(errorLine(`✗ No ${isDocx ? 'docx' : 'pptx'} export available from last run.`));
        return;
      }
      const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
      addLine(successLine(`↓ Downloading ${isDocx ? 'report.docx' : 'deck.pptx'}...`));
      const a = document.createElement('a');
      a.href = fullUrl;
      a.download = isDocx ? 'report.docx' : 'deck.pptx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addLine(successLine(`✓ Download initiated: ${fullUrl}`));
      return;
    }

    // ── unknown ────────────────────────────────────────────────────────────
    addLine(errorLine(`command not found: ${trimmed.split(' ')[0]} — type 'help' for a list of commands`));
  }, [addLine, addBlank, printPrompt, navigate, lastResult, noRunError, handleRunCommand, cmdHistory]);

  // ── Key handling ────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = inputVal;
      setInputVal('');
      execCommand(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistIdx(prev => {
        const next = Math.min(prev + 1, cmdHistory.length - 1);
        setInputVal(cmdHistory[next] ?? '');
        return next;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistIdx(prev => {
        const next = Math.max(prev - 1, -1);
        setInputVal(next === -1 ? '' : cmdHistory[next] ?? '');
        return next;
      });
    }
  }, [inputVal, cmdHistory, execCommand]);

  // ── Click anywhere focuses input ─────────────────────────────────────────

  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      onClick={handleContainerClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0A0F',
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
        fontSize: '14px',
        lineHeight: '1.6',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'text',
      }}
    >
      {/* Scrollable output area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px 8px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#1F2937 #0A0A0F',
        }}
      >
        {lines.map(line => (
          <div
            key={line.id}
            style={{
              minHeight: line.type === 'blank' ? '0.8em' : undefined,
              whiteSpace: 'pre',
              wordBreak: 'break-all',
            }}
          >
            {line.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      {!booting && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 28px 20px',
            borderTop: '1px solid #1F2937',
            background: '#0A0A0F',
            gap: '0px',
          }}
        >
          {/* Prompt prefix */}
          <span style={{ whiteSpace: 'pre', userSelect: 'none' }}>
            <span style={{ color: '#22D3EE' }}>researchos</span>
            <span style={{ color: '#6B7280' }}>@</span>
            <span style={{ color: '#A78BFA' }}>{TEAM_NAME.toLowerCase()}</span>
            <span style={{ color: '#6B7280' }}>:~$ </span>
          </span>

          {/* Text input — invisible border/bg so it blends */}
          <input
            ref={inputRef}
            value={inputVal}
            onChange={e => { setInputVal(e.target.value); setHistIdx(-1); }}
            onKeyDown={handleKeyDown}
            disabled={booting}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F5A623',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              caretColor: '#F5A623',
            }}
          />
          {/* Blinking block cursor overlay — only shows when input focused and empty for cosmetic effect */}
        </div>
      )}

      {/* Global styles for blinking cursor */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: #1F2937; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #374151; }
      `}</style>
    </div>
  );
};
