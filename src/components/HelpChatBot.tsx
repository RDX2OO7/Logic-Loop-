import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, ChevronDown } from 'lucide-react';

interface Message {
    id: string;
    role: 'bot' | 'user';
    text: string;
    timestamp: Date;
}

interface QuickReply {
    label: string;
    query: string;
}

interface KBEntry {
    patterns: string[];
    answer: string;
    followUp?: string[];
}

const KNOWLEDGE_BASE: KBEntry[] = [
    {
        patterns: ['what is this', 'what does this app do', 'how does this work', 'explain this', 'what is researchos', 'about'],
        answer: '**ResearchOS** is an AI-powered research & project planning assistant.\n\nYou describe a tech idea or challenge, and a pipeline of **8 specialist AI agents** does the heavy lifting:\n\n1. **Discovery Agent** – maps your problem domain\n2. **DeepSearch Agent** – mines papers, GitHub repos & web signals\n3. **Clustering Agent** – groups sources into themes\n4. **Gap & Innovation Agent** – finds novel angles no one has solved\n5. **Planner Agent** – builds a 4-phase technical roadmap\n6. **Curator Agent** – verifies datasets, APIs & open-source tools\n7. **Critic Agent** – quality-checks the plan\n8. **Publisher Agent** – renders a downloadable DOCX + PPTX report',
        followUp: ['How do I validate my idea?', 'What are innovation angles?', 'How do I export my plan?'],
    },
    {
        patterns: ['how to validate', 'validate idea', 'validate my idea', 'idea validation', 'is my idea good', 'check idea'],
        answer: 'To validate your idea with ResearchOS:\n\n**Step 1** – Type your idea in the input box. Be specific: include the domain, target users, and the core problem.\n\n**Step 2** – Click **Generate project plan**. The Discovery + DeepSearch agents will pull academic papers, GitHub repos, and web articles to assess existing solutions.\n\n**Step 3** – Review the **Gaps & Innovation** tab. If real gaps appear, your idea has unexplored territory. If the Critic Agent flags 0 issues — that\'s a strong signal.\n\n**Step 4** – Check the **Research** tab. A high source count means the domain is active and your idea can be built on prior work.\n\n**Tip:** A great idea has high evidence (research exists) but a clear gap (nobody solved it your way).',
        followUp: ['What are innovation angles?', 'What does the Critic Agent do?', 'What counts as a good gap?'],
    },
    {
        patterns: ['innovation angle', 'angles', 'what are angles', 'angle selection', 'select angle', 'choose angle', 'pick angle'],
        answer: '**Innovation Angles** are unique project directions the Gap & Innovation Agent proposes based on research gaps.\n\nEach angle is scored on:\n- **Impact** (High / Medium / Low) — how much value it creates\n- **Effort** (Quick Build / Moderate / Heavy Lift) — how hard to build\n- **Priority Rank** — the agent\'s recommended order\n\n**How to choose:**\n- Pick **Rank 1** for the highest-value, most feasible angle\n- Pick a lower rank if you have specific constraints\n- Use **"Explore all angles"** to run the full pipeline in parallel and compare side-by-side',
        followUp: ['How do I compare all angles?', 'What is the Critic Agent?', 'How do I export my plan?'],
    },
    {
        patterns: ['compare angles', 'explore all', 'all angles', 'parallel', 'multiple angles'],
        answer: 'Clicking **"Explore all angles"** runs the full planning pipeline **in parallel** for every innovation angle simultaneously.\n\nThe result is a **side-by-side Compare screen** where you can:\n- See each angle\'s full plan, roadmap, and resources\n- Pick the one that best fits your constraints\n- Export your chosen plan as DOCX or PPTX\n\n**Note:** This takes longer (2-4x) since all agents run for each angle. Use it when you\'re genuinely undecided.',
        followUp: ['How do I export my plan?', 'What is the Roadmap tab?'],
    },
    {
        patterns: ['export', 'download', 'docx', 'pptx', 'powerpoint', 'word', 'report'],
        answer: 'After your plan is generated, you can export it in two formats:\n\n**Export .docx** – A structured Word document with:\n- Executive Summary\n- Technical Architecture\n- 4-Phase Milestone Roadmap\n- Dataset & API Resources\n- Critic Review\n\n**Export .pptx** – A ready-to-present PowerPoint with:\n- Title slide with problem statement\n- Innovation angle & novelty rationale\n- Tech stack overview\n- Roadmap timeline slides\n\nBoth buttons appear in the **top-right corner** of the Results Dashboard.',
        followUp: ['What is in the Overview tab?', 'What is the Roadmap tab?'],
    },
    {
        patterns: ['roadmap', 'milestones', 'timeline', 'phases', 'duration'],
        answer: 'The **Roadmap tab** shows your project\'s 4-phase production plan:\n\n**Phase 1** – Foundation & Setup (infra, tooling, datasets)\n**Phase 2** – Core Pipeline / ML Model Development\n**Phase 3** – UI / API Integration\n**Phase 4** – Testing, Deployment & Monitoring\n\nEach milestone has:\n- Duration in days\n- Subtasks (you can mark them done via the Telegram bot)\n- Tech focus areas\n- Deliverables\n\nThe total project duration is shown as **"X Days"** in the Overview stats.',
        followUp: ['How do I use the Telegram bot?', 'What is in the Resources tab?'],
    },
    {
        patterns: ['research tab', 'sources', 'papers', 'repos', 'github', 'arxiv', 'web signals', 'evidence'],
        answer: 'The **Research tab** shows all evidence the DeepSearch Agent gathered:\n\n**Papers** – Academic articles from arXiv and OpenAlex, with titles, snippets, and source links\n\n**Repos** – GitHub repositories relevant to your domain (with star counts)\n\n**Web Signals** – Blog posts, articles, and news relevant to your problem\n\nThe **Sources Analyzed** counter in Overview reflects the total count across all three types.\n\nA plan with 15+ total sources has strong evidential grounding.',
        followUp: ['What is the Gaps & Innovation tab?', 'How do I validate my idea?'],
    },
    {
        patterns: ['gaps', 'gaps tab', 'gaps and innovation', 'gap analysis', 'what is a gap', 'good gap'],
        answer: 'The **Gaps & Innovation tab** shows:\n\n**Research Gaps** – Problems the literature acknowledges but hasn\'t solved\n\n**Innovation Angles** – Novel directions that exploit those gaps, with impact/effort scores\n\n**Evidence Summary** – A synthesized paragraph on what research has found\n\n**What counts as a good gap?**\n- The domain has active research (papers exist)\n- The specific sub-area lacks a complete solution\n- No dominant open-source implementation exists\n- Your angle addresses a use-case nobody targets yet',
        followUp: ['How do I validate my idea?', 'What are innovation angles?'],
    },
    {
        patterns: ['resources tab', 'datasets', 'apis', 'tools', 'open source'],
        answer: 'The **Resources tab** has three sections curated by the Resource Curator Agent:\n\n**Datasets** – Public datasets relevant to training or testing your solution\n\n**APIs** – Third-party APIs you can integrate (maps, AI, IoT, etc.)\n\n**Repos** – Existing open-source projects you can build on or extend\n\nAll items include names and direct links. This tab saves you hours of research by pre-vetting the best starting points.',
        followUp: ['How do I export my plan?', 'What is the Roadmap tab?'],
    },
    {
        patterns: ['critic', 'critic agent', 'flagged', 'issues', 'quality check'],
        answer: 'The **Critic Agent** is the quality gate of the pipeline.\n\nIt reviews the generated plan and flags problems across:\n- **Architecture** – Is the tech stack coherent?\n- **Feasibility** – Are the timelines realistic?\n- **Evidence** – Are the innovation claims grounded in research?\n- **Resource Gaps** – Are critical datasets or APIs missing?\n\n**"Critic flagged 0 items"** = your plan passed all checks.\n\nThe plan still proceeds even with flags — the Critic\'s job is advisory, not a blocker.',
        followUp: ['How do I validate my idea?', 'How do I export my plan?'],
    },
    {
        patterns: ['telegram', 'telegram bot', 'task tracking', 'mark done', 'progress tracking'],
        answer: 'ResearchOS integrates with a **Telegram Bot** for task tracking:\n\n1. After your plan is generated, you receive a **Project ID**\n2. Link it to your Telegram chat using the bot\n3. Use /tasks to see your subtask list\n4. Use /done 3 to mark subtask #3 as complete\n5. Use /explain 2 to get an AI explanation of task #2\n\nThis lets you track your project progress directly in Telegram without opening the web app.\n\nYour **Project ID** appears in the Results Dashboard header — click it to copy.',
        followUp: ['What is in the Roadmap tab?', 'How do I export my plan?'],
    },
    {
        patterns: ['history', 'past plans', 'previous plans', 'saved plans', 'left sidebar', 'navigation'],
        answer: 'Your **plan history** is stored in the left sidebar under "HISTORY".\n\nEach time you complete a full plan, it\'s automatically saved with:\n- The project title\n- The original idea text\n- The creation date\n\nYou can click any history item to jump back to that plan\'s results.\n\n**Persistence:** History is saved in your browser\'s localStorage, so it survives page refreshes. Use **"Clear History"** in settings to reset it.\n\nHistory is browser-local and does not sync across devices.',
        followUp: ['How do I start a new idea?', 'How do I export my plan?'],
    },
    {
        patterns: ['new idea', 'start over', 'reset', 'start new', 'another idea'],
        answer: 'To start a new research plan:\n\n1. Click **"+ New idea"** in the top of the left sidebar\n2. This clears your current plan and returns to the idea input screen\n3. Type your new idea and click **Generate project plan**\n\nYour previous plan stays in the History sidebar so you can return to it.',
        followUp: ['How do I validate my idea?', 'What are innovation angles?'],
    },
    {
        patterns: ['how long', 'how fast', 'generation time', 'wait time', 'slow', 'takes time'],
        answer: 'Generation time depends on the phase:\n\n**Discovery phase** (Phase 1): ~30-90 seconds\n- Runs Discovery, DeepSearch, Clustering, Gap Analysis\n\n**Planning phase** (Phase 2): ~60-120 seconds\n- Runs Planner, Curator, Critic, Publisher\n\n**"Explore all angles":** Multiply by the number of angles (usually 2-4 minutes)\n\nThe progress screen shows a real-time log of which agent is currently active.',
        followUp: ['What are the 8 agents?', 'How do I select an angle?'],
    },
    {
        patterns: ['good idea', 'best idea', 'tip', 'tips', 'advice', 'suggestions', 'write a good'],
        answer: 'Tips for a great idea input:\n\n**Be specific:**\n- Bad: "AI for hospitals"\n- Good: "AI triage assistant for rural clinics using offline-capable edge ML"\n\n**Include your constraints:**\n- Target domain, user group, infrastructure limitations\n\n**Name the core problem:**\n- What existing pain point are you solving?\n\n**Avoid buzzword-only ideas:**\n- Focus on the concrete workflow being improved\n\nThe more specific your idea, the better the research evidence and gap analysis.',
        followUp: ['How do I validate my idea?', 'What are innovation angles?', 'How does this work?'],
    },
    {
        patterns: ['hello', 'hi', 'hey', 'help', 'what can you do', 'support'],
        answer: 'Hi! I\'m the **ResearchOS Assistant**.\n\nI can help you with:\n\n- **Validating your idea** — how to write a strong prompt\n- **Understanding the agents** — what each AI agent does\n- **Choosing an innovation angle** — impact vs effort tradeoffs\n- **Reading your roadmap** — milestones, subtasks, timelines\n- **Exporting your plan** — DOCX and PPTX downloads\n- **Interpreting results** — tabs, sources, gaps, and critic scores\n\nWhat would you like to know?',
        followUp: ['How do I validate my idea?', 'What does this app do?', 'How do I export my plan?'],
    },
];

const FALLBACK_ENTRY: KBEntry = {
    patterns: [],
    answer: 'I\'m not sure about that specific question, but here are some things I can help with:\n\n- How to write a strong idea\n- Understanding the 8 AI agents\n- Reading your innovation angles\n- Exporting your report\n- Using the Telegram task tracker\n\nTry rephrasing your question, or click one of the quick replies below!',
    followUp: ['How do I validate my idea?', 'What does this app do?', 'How do I export my plan?'],
};

function findAnswer(input: string): KBEntry {
    const normalized = input.toLowerCase().trim();
    let best: KBEntry | null = null;
    let bestScore = 0;

    for (const entry of KNOWLEDGE_BASE) {
        for (const pattern of entry.patterns) {
            if (normalized.includes(pattern)) {
                const score = pattern.length;
                if (score > bestScore) {
                    bestScore = score;
                    best = entry;
                }
            }
        }
    }

    return best ?? FALLBACK_ENTRY;
}

function renderText(text: string): React.ReactNode {
    return text.split('\n').map((line, i, arr) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const formatted = parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
        });
        return (
            <React.Fragment key={i}>
                {formatted}
                {i < arr.length - 1 && <br />}
            </React.Fragment>
        );
    });
}

const INITIAL_QUICK_REPLIES: QuickReply[] = [
    { label: '🧪 Validate an idea', query: 'How do I validate my idea?' },
    { label: '🤖 What are the agents?', query: 'What does this app do?' },
    { label: '💡 Innovation angles', query: 'What are innovation angles?' },
    { label: '📤 Export my plan', query: 'How do I export my plan?' },
];

export const HelpChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'bot',
            text: 'Hi! I\'m the **ResearchOS Assistant**. Ask me anything about validating ideas, understanding agents, reading your plan, or exporting results!',
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentFollowUps, setCurrentFollowUps] = useState<string[]>(
        INITIAL_QUICK_REPLIES.map((q) => q.query)
    );
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => inputRef.current?.focus(), 120);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = (text: string) => {
        if (!text.trim() || isTyping) return;
        const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: text.trim(), timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);
        setCurrentFollowUps([]);

        const delay = 600 + Math.random() * 400;
        setTimeout(() => {
            const result = findAnswer(text);
            const botMsg: Message = { id: `b-${Date.now()}`, role: 'bot', text: result.answer, timestamp: new Date() };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
            setCurrentFollowUps(result.followUp ?? []);
        }, delay);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputText);
    };

    return (
        <>
            {/* ── Floating Toggle Button ── */}
            <motion.button
                id="help-chatbot-toggle"
                onClick={() => setIsOpen((o) => !o)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#15193D] dark:bg-[#F5A623] text-white dark:text-[#15193D] shadow-2xl flex items-center justify-center"
                aria-label="Open help chat"
                style={{ boxShadow: '0 8px 32px rgba(21,25,61,0.35)' }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <MessageCircle className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F5A623] dark:bg-[#6366F1] border-2 border-white dark:border-[#0b0e17] animate-pulse" />
                )}
            </motion.button>

            {/* ── Chat Panel ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 28, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 28, scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0f1321] border border-[#E3E5F0] dark:border-[#1e2640] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        style={{ maxHeight: 'min(580px, calc(100vh - 120px))' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3.5 bg-[#15193D] dark:bg-[#0d1020] text-white shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4 text-[#15193D]" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold leading-none">ResearchOS Assistant</p>
                                    <p className="text-[11px] text-white/55 mt-0.5">App guide & help</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 scroll-smooth">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'bot' && (
                                        <div className="w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center mr-2 shrink-0 mt-0.5">
                                            <Sparkles className="w-3 h-3 text-[#15193D]" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user'
                                            ? 'bg-[#15193D] dark:bg-[#F5A623] text-white dark:text-[#15193D] rounded-tr-sm'
                                            : 'bg-[#F4F5FA] dark:bg-[#1a2035] text-[#1F2340] dark:text-[#f8fafc] rounded-tl-sm'
                                            }`}
                                    >
                                        {renderText(msg.text)}
                                    </div>
                                </div>
                            ))}

                            {/* Typing dots */}
                            {isTyping && (
                                <div className="flex items-start justify-start">
                                    <div className="w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center mr-2 shrink-0">
                                        <Sparkles className="w-3 h-3 text-[#15193D]" />
                                    </div>
                                    <div className="bg-[#F4F5FA] dark:bg-[#1a2035] px-4 py-3 rounded-2xl rounded-tl-sm">
                                        <div className="flex gap-1 items-center">
                                            {[0, 1, 2].map((i) => (
                                                <motion.span
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full bg-[#6B7280] dark:bg-[#94a3b8] block"
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Follow-up chips */}
                            {!isTyping && currentFollowUps.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pl-8 pt-1">
                                    {currentFollowUps.map((reply) => (
                                        <button
                                            key={reply}
                                            onClick={() => sendMessage(reply)}
                                            className="text-[11px] px-2.5 py-1.5 rounded-full bg-[#F4F5FA] dark:bg-[#1e2640] text-[#15193D] dark:text-[#94a3b8] border border-[#E3E5F0] dark:border-[#2a3250] hover:bg-[#15193D] hover:text-white dark:hover:bg-[#F5A623] dark:hover:text-[#15193D] transition-all duration-150"
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div ref={bottomRef} />
                        </div>

                        {/* Initial quick reply chips (shown only before first user message) */}
                        {messages.length === 1 && !isTyping && (
                            <div className="px-4 pb-3 flex flex-wrap gap-1.5 border-t border-[#E3E5F0] dark:border-[#1e2640] pt-3 shrink-0">
                                {INITIAL_QUICK_REPLIES.map((qr) => (
                                    <button
                                        key={qr.query}
                                        onClick={() => sendMessage(qr.query)}
                                        className="text-[11px] px-3 py-1.5 rounded-full bg-[#F4F5FA] dark:bg-[#1e2640] text-[#15193D] dark:text-[#94a3b8] border border-[#E3E5F0] dark:border-[#2a3250] hover:bg-[#15193D] hover:text-white dark:hover:bg-[#F5A623] dark:hover:text-[#15193D] transition-all duration-150 font-medium"
                                    >
                                        {qr.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center gap-2 px-3 py-3 border-t border-[#E3E5F0] dark:border-[#1e2640] bg-white dark:bg-[#0f1321] shrink-0"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ask something..."
                                className="flex-1 text-[13px] px-3.5 py-2 rounded-xl bg-[#F4F5FA] dark:bg-[#1a2035] text-[#1F2340] dark:text-[#f8fafc] placeholder-[#9CA3AF] dark:placeholder-[#4b5563] border border-[#E3E5F0] dark:border-[#2a3250] focus:outline-none focus:border-[#15193D] dark:focus:border-[#F5A623] transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isTyping}
                                className="w-9 h-9 rounded-xl bg-[#15193D] dark:bg-[#F5A623] text-white dark:text-[#15193D] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
