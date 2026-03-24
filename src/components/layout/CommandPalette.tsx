'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  Search, Home, Radio, AlertTriangle, Users, Layers, ClipboardCheck,
  Shield, Clock, Target, Zap, Terminal, Sparkles, ArrowRight,
  TrendingUp, MessageSquare, Filter, CheckCircle2, Brain,
  DollarSign, BarChart3, Cpu, BookOpen, ChevronRight, Lightbulb, Wrench,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type CommandCategory = 'navigate' | 'action' | 'ask' | 'filter';

interface Command {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: CommandCategory;
  color: string;
  keywords: string[];
  action: (router: ReturnType<typeof useRouter>, close: () => void) => void;
  answer?: string; // for 'ask' commands — inline Tamir response
}

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_META: Record<CommandCategory, { label: string; color: string }> = {
  navigate: { label: 'Navigate',   color: '#38bdf8' },
  action:   { label: 'Action',     color: '#f59e0b' },
  ask:      { label: 'Ask Tamir',  color: '#a78bfa' },
  filter:   { label: 'Filter',     color: '#34d399' },
};

// ── Command registry ──────────────────────────────────────────────────────────

const COMMANDS: Command[] = [
  // ── Navigate ─────────────────────────────────────────────────────────────
  {
    id: 'nav-home',
    label: 'Go to Home',
    description: 'Mission board & Tamir panel',
    icon: Home,
    category: 'navigate',
    color: '#f43f5e',
    keywords: ['home', 'dashboard', 'mission board'],
    action: (r, c) => { r.push('/'); c(); },
  },
  {
    id: 'nav-desk',
    label: 'Go to CEO Desk',
    description: 'Your deep-work & mission initiation space',
    icon: Sparkles,
    category: 'navigate',
    color: '#f59e0b',
    keywords: ['desk', 'ceo desk', 'tamir', 'deep work', 'initiate'],
    action: (r, c) => { r.push('/tamir'); c(); },
  },
  {
    id: 'nav-control',
    label: 'Go to Control Center',
    description: 'Live agent orchestration & task board',
    icon: Radio,
    category: 'navigate',
    color: '#f43f5e',
    keywords: ['control center', 'agents', 'live', 'tasks', 'orchestration'],
    action: (r, c) => { r.push('/control-center'); c(); },
  },
  {
    id: 'nav-escalations',
    label: 'Go to Escalations',
    description: 'Critical decisions requiring CEO sign-off',
    icon: AlertTriangle,
    category: 'navigate',
    color: '#f43f5e',
    keywords: ['escalations', 'critical', 'urgent', 'decisions', 'alerts'],
    action: (r, c) => { r.push('/escalations'); c(); },
  },
  {
    id: 'nav-workspace',
    label: 'Go to Workspace',
    description: 'Mission execution canvas & agent pipeline',
    icon: Layers,
    category: 'navigate',
    color: '#38bdf8',
    keywords: ['workspace', 'missions', 'execution', 'pipeline'],
    action: (r, c) => { r.push('/workspace'); c(); },
  },
  {
    id: 'nav-people',
    label: 'Go to People',
    description: 'Your agent roster by department',
    icon: Users,
    category: 'navigate',
    color: '#38bdf8',
    keywords: ['people', 'agents', 'team', 'roster', 'departments'],
    action: (r, c) => { r.push('/people'); c(); },
  },
  {
    id: 'nav-evaluations',
    label: 'Go to Evaluations',
    description: 'Agent performance reviews & corrective actions',
    icon: ClipboardCheck,
    category: 'navigate',
    color: '#38bdf8',
    keywords: ['evaluations', 'performance', 'reviews', 'corrective'],
    action: (r, c) => { r.push('/evaluations'); c(); },
  },
  {
    id: 'nav-vault',
    label: 'Go to Vault',
    description: 'Company memory — strategy, decisions, policies',
    icon: Shield,
    category: 'navigate',
    color: '#a78bfa',
    keywords: ['vault', 'memory', 'strategy', 'decisions', 'policies', 'knowledge'],
    action: (r, c) => { r.push('/vault'); c(); },
  },
  {
    id: 'nav-timeline',
    label: 'Go to Timeline',
    description: 'Full company activity history',
    icon: Clock,
    category: 'navigate',
    color: '#a78bfa',
    keywords: ['timeline', 'history', 'activity', 'events', 'log'],
    action: (r, c) => { r.push('/timeline'); c(); },
  },
  {
    id: 'nav-missions',
    label: 'Go to Missions',
    description: 'All active and past missions',
    icon: Target,
    category: 'navigate',
    color: '#a78bfa',
    keywords: ['missions', 'projects', 'campaigns', 'initiatives'],
    action: (r, c) => { r.push('/missions'); c(); },
  },
  {
    id: 'nav-skills',
    label: 'Go to Skills',
    description: 'Capability nexus — skill tree & tool arsenal',
    icon: Zap,
    category: 'navigate',
    color: '#34d399',
    keywords: ['skills', 'capabilities', 'nexus', 'tools', 'training'],
    action: (r, c) => { r.push('/skills'); c(); },
  },
  {
    id: 'nav-terminal',
    label: 'Go to Terminal',
    description: 'System access & advanced commands',
    icon: Terminal,
    category: 'navigate',
    color: '#34d399',
    keywords: ['terminal', 'system', 'cli', 'logs', 'commands'],
    action: (r, c) => { r.push('/terminal'); c(); },
  },

  {
    id: 'nav-tools',
    label: 'Go to Tools',
    description: 'Connect and manage integrations — Gmail, Slack, GitHub and more',
    icon: Wrench,
    category: 'navigate',
    color: '#34d399',
    keywords: ['tools', 'integrations', 'connect', 'gmail', 'slack', 'github', 'plugins'],
    action: (r, c) => { r.push('/tools'); c(); },
  },
  {
    id: 'nav-think',
    label: 'Go to Think Mode',
    description: 'Deep thinking sessions with Tamir — bookmark insights, capture decisions',
    icon: Lightbulb,
    category: 'navigate',
    color: '#f59e0b',
    keywords: ['think', 'thinking', 'brainstorm', 'work through', 'deep work', 'explore', 'analyze'],
    action: (r, c) => { r.push('/tamir/think'); c(); },
  },

  // ── Actions ───────────────────────────────────────────────────────────────
  {
    id: 'action-think',
    label: 'Start a thinking session',
    description: 'Open Think Mode and start working through a problem with Tamir',
    icon: Lightbulb,
    category: 'action',
    color: '#f59e0b',
    keywords: ['think', 'thinking session', 'brainstorm', 'work through', 'problem'],
    action: (r, c) => { r.push('/tamir/think'); c(); },
  },
  {
    id: 'action-escalate',
    label: 'Create Escalation',
    description: 'Raise a new critical issue for CEO review',
    icon: AlertTriangle,
    category: 'action',
    color: '#f43f5e',
    keywords: ['escalate', 'create escalation', 'raise issue', 'urgent', 'critical'],
    action: (r, c) => { r.push('/escalations'); c(); },
  },
  {
    id: 'action-approve-gpu',
    label: 'Approve GPU · $0.12/hr',
    description: 'AWS Capacity Blocker — unblocks ZUNA deployment',
    icon: CheckCircle2,
    category: 'action',
    color: '#34d399',
    keywords: ['approve gpu', 'gpu', 'aws', 'capacity', 'blocker', 'approve'],
    action: (r, c) => { r.push('/workspace'); c(); },
  },
  {
    id: 'action-approve-hiring',
    label: 'Approve Research Analyst Hire',
    description: 'Pending hiring brief — Research Dept',
    icon: CheckCircle2,
    category: 'action',
    color: '#34d399',
    keywords: ['approve hiring', 'hire', 'research analyst', 'hiring brief', 'approve'],
    action: (r, c) => { r.push('/workspace'); c(); },
  },
  {
    id: 'action-train-skill',
    label: 'Train Market Analysis Skill',
    description: 'Spend 100 SP · Lv.2 → Lv.3 · Expert',
    icon: TrendingUp,
    category: 'action',
    color: '#38bdf8',
    keywords: ['train', 'market analysis', 'skill', 'level up', 'sp'],
    action: (r, c) => { r.push('/skills'); c(); },
  },
  {
    id: 'action-new-mission',
    label: 'Initiate New Mission',
    description: 'Open CEO Desk to start a new mission with Tamir',
    icon: Sparkles,
    category: 'action',
    color: '#f59e0b',
    keywords: ['new mission', 'initiate', 'start', 'create mission', 'launch'],
    action: (r, c) => { r.push('/tamir'); c(); },
  },
  {
    id: 'action-connect-tool',
    label: 'Connect Notion',
    description: 'Unlock +75 SP by connecting Notion to your arsenal',
    icon: Zap,
    category: 'action',
    color: '#34d399',
    keywords: ['connect notion', 'notion', 'tool', 'connect', 'arsenal', 'sp'],
    action: (r, c) => { r.push('/skills'); c(); },
  },
  {
    id: 'action-resolve-escalation',
    label: 'Resolve AWS Capacity Blocker',
    description: 'Mark L4 escalation as resolved',
    icon: CheckCircle2,
    category: 'action',
    color: '#34d399',
    keywords: ['resolve', 'aws', 'escalation', 'blocker', 'close', 'done'],
    action: (r, c) => { r.push('/escalations'); c(); },
  },

  // ── Filter ────────────────────────────────────────────────────────────────
  {
    id: 'filter-blocked',
    label: 'Show Blocked Agents',
    description: 'Filter Control Center to blocked tasks only',
    icon: Filter,
    category: 'filter',
    color: '#34d399',
    keywords: ['blocked', 'show blocked', 'agents blocked', 'stuck', 'filter'],
    action: (r, c) => { r.push('/control-center'); c(); },
  },
  {
    id: 'filter-active-missions',
    label: 'Show Active Missions',
    description: 'Filter Missions page to in-progress only',
    icon: Target,
    category: 'filter',
    color: '#34d399',
    keywords: ['active missions', 'in progress', 'running', 'filter missions'],
    action: (r, c) => { r.push('/missions'); c(); },
  },
  {
    id: 'filter-critical',
    label: 'Show Critical Escalations',
    description: 'Filter to L4 critical escalations only',
    icon: AlertTriangle,
    category: 'filter',
    color: '#34d399',
    keywords: ['critical', 'l4', 'highest priority', 'filter escalations'],
    action: (r, c) => { r.push('/escalations'); c(); },
  },
  {
    id: 'filter-idle-agents',
    label: 'Show Idle Agents',
    description: 'Find agents with no active tasks right now',
    icon: Users,
    category: 'filter',
    color: '#34d399',
    keywords: ['idle', 'available', 'free agents', 'no tasks'],
    action: (r, c) => { r.push('/control-center'); c(); },
  },

  // ── Ask Tamir ─────────────────────────────────────────────────────────────
  {
    id: 'ask-burn',
    label: "What's the burn rate?",
    description: 'Get current spend & projected monthly cost',
    icon: DollarSign,
    category: 'ask',
    color: '#a78bfa',
    keywords: ['burn rate', 'spend', 'cost', 'budget', 'money', 'how much'],
    answer: "Current daily burn: **$5.71** across 9 agents. Projected monthly: ~$171 at current pace. Tech dept is the largest spend at $1.5K of $4K budget (36% consumed). You're well within budget.",
    action: (_r, _c) => {},
  },
  {
    id: 'ask-urgent',
    label: "What's most urgent right now?",
    description: "Get Tamir's priority assessment",
    icon: AlertTriangle,
    category: 'ask',
    color: '#a78bfa',
    keywords: ['urgent', 'priority', 'most important', 'what needs attention', 'critical'],
    answer: "Top priority: **AWS GPU Capacity Blocker** — the ZUNA deployment is blocked and 3 agents are waiting on your approval. Second: **Research Analyst Hire** brief is pending sign-off. Both actions can be done in under 30 seconds from Workspace.",
    action: (_r, _c) => {},
  },
  {
    id: 'ask-agents',
    label: 'How are the agents performing?',
    description: 'Summary of agent health & output today',
    icon: BarChart3,
    category: 'ask',
    color: '#a78bfa',
    keywords: ['agents performing', 'performance', 'agent health', 'output', 'how are agents'],
    answer: "12 agents active today. **72 tasks completed**, 25 deliverables produced. Alex (CTO) and Dev Agent are your highest output. 2 agents are currently idle. No corrective actions pending. Average value score: 74/100.",
    action: (_r, _c) => {},
  },
  {
    id: 'ask-risk',
    label: "What's at risk?",
    description: 'Identify current blockers and risks',
    icon: Brain,
    category: 'ask',
    color: '#a78bfa',
    keywords: ['risk', 'at risk', 'blockers', 'problems', 'issues', 'dangers'],
    answer: "Two active risks: (1) **ZUNA deployment** blocked on GPU approval — every hour of delay costs ~$2K in delayed revenue. (2) **Marketing capacity** — 3 tasks queued, 1 agent handling them. May need redistribution by EOD.",
    action: (_r, _c) => {},
  },
  {
    id: 'ask-decisions',
    label: 'What decisions are pending?',
    description: 'All items waiting on CEO sign-off',
    icon: CheckCircle2,
    category: 'ask',
    color: '#a78bfa',
    keywords: ['pending decisions', 'sign off', 'waiting', 'approve', 'decisions', 'pending'],
    answer: "3 decisions pending your sign-off: (1) GPU approval · $0.12/hr · **Act Now**. (2) Research Analyst Hire · Medium priority. (3) Q2 Budget plans · Review stage. All accessible from Workspace.",
    action: (_r, _c) => {},
  },
  {
    id: 'ask-skills',
    label: 'Which skills should I prioritize?',
    description: "Tamir's recommendation on skill training",
    icon: Cpu,
    category: 'ask',
    color: '#a78bfa',
    keywords: ['skills prioritize', 'train', 'skill recommendation', 'what to train', 'level up'],
    answer: "Top two: **Market Analysis** (68% XP to Expert) and **LinkedIn Outreach** (rusty — needs one active mission to restore). You have 420 SP available. Training Market Analysis costs 100 SP and will boost your Intelligence capability score by ~8 points.",
    action: (_r, _c) => {},
  },
];

// ── Highlight match ───────────────────────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-transparent font-bold" style={{ color: 'inherit', opacity: 1 }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [askAnswer, setAskAnswer] = useState<{ id: string; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setAskAnswer(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter commands
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default: show a curated selection of most useful commands
      return COMMANDS.filter((c) =>
        ['ask-urgent', 'ask-burn', 'action-approve-gpu', 'action-new-mission',
         'filter-blocked', 'ask-risk', 'action-train-skill', 'ask-decisions',
         'nav-desk', 'nav-workspace'].includes(c.id)
      );
    }
    return COMMANDS.filter((c) =>
      c.label.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.keywords.some((k) => k.includes(q))
    );
  }, [query]);

  // Reset active index when filtered changes
  useEffect(() => {
    setActiveIdx(0);
    setAskAnswer(null);
  }, [filtered]);

  // Execute command
  const execute = useCallback((cmd: Command) => {
    if (cmd.category === 'ask' && cmd.answer) {
      setAskAnswer({ id: cmd.id, text: cmd.answer });
    } else {
      cmd.action(router, onClose);
    }
  }, [router, onClose]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filtered[activeIdx]) { execute(filtered[activeIdx]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, activeIdx, execute, onClose]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Partial<Record<CommandCategory, Command[]>> = {};
    filtered.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category]!.push(cmd);
    });
    return groups;
  }, [filtered]);

  // Render markdown-style bold in answers
  function renderAnswer(text: string) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1
        ? <strong key={i} className="text-white font-semibold">{part}</strong>
        : <span key={i}>{part}</span>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[18%] -translate-x-1/2 z-[101] w-full max-w-[580px] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(8,14,32,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(32px) saturate(160%)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), 0 0 40px rgba(56,189,248,0.06)',
            }}
          >
            {/* Specular top edge */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent 10%, rgba(255,255,255,0.12) 50%, transparent 90%)' }} />

            {/* Search input */}
            <div
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Search size={16} className="text-slate-500 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actions, navigate, or ask Tamir…"
                className="flex-1 bg-transparent text-[14px] text-white placeholder-slate-600 outline-none"
              />
              <div className="flex items-center gap-1 shrink-0">
                <kbd
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  ESC
                </kbd>
              </div>
            </div>

            {/* Tamir answer panel */}
            <AnimatePresence>
              {askAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 py-3.5 flex gap-3"
                    style={{ background: 'rgba(167,139,250,0.06)', borderBottom: '1px solid rgba(167,139,250,0.12)' }}
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-bold text-black shrink-0 mt-0.5">
                      T
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-amber-400 mb-1.5">Tamir</p>
                      <p className="text-[12px] text-slate-300 leading-relaxed">
                        {renderAnswer(askAnswer.text)}
                      </p>
                      <button
                        onClick={() => setAskAnswer(null)}
                        className="mt-2 flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                      >
                        <ChevronRight size={10} /> Go deeper on CEO Desk
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <div className="overflow-y-auto max-h-[360px] py-2" style={{ scrollbarWidth: 'none' }}>
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[13px] text-slate-600">No results for &ldquo;{query}&rdquo;</p>
                  <p className="text-[11px] text-slate-700 mt-1">Try &ldquo;approve&rdquo;, &ldquo;train&rdquo;, or &ldquo;burn rate&rdquo;</p>
                </div>
              ) : (
                (['ask', 'action', 'filter', 'navigate'] as CommandCategory[]).map((cat) => {
                  const cmds = grouped[cat];
                  if (!cmds?.length) return null;
                  const meta = CATEGORY_META[cat];
                  return (
                    <div key={cat} className="mb-1">
                      {/* Category header */}
                      <div className="flex items-center gap-2 px-4 py-1.5">
                        <span
                          className="text-[9px] font-bold uppercase tracking-[0.14em]"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        <div className="flex-1 h-px" style={{ background: `${meta.color}20` }} />
                      </div>

                      {/* Commands */}
                      {cmds.map((cmd) => {
                        const globalIdx = filtered.indexOf(cmd);
                        const isActive = globalIdx === activeIdx;
                        const isAnswered = askAnswer?.id === cmd.id;
                        return (
                          <motion.button
                            key={cmd.id}
                            onClick={() => execute(cmd)}
                            onMouseEnter={() => setActiveIdx(globalIdx)}
                            className="relative w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all cursor-pointer"
                            style={{
                              background: isActive
                                ? 'rgba(255,255,255,0.05)'
                                : isAnswered
                                ? 'rgba(167,139,250,0.06)'
                                : 'transparent',
                            }}
                          >
                            {/* Active left bar */}
                            {isActive && (
                              <motion.span
                                layoutId="palette-active"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
                                style={{ background: cmd.color, boxShadow: `0 0 8px ${cmd.color}60` }}
                                transition={{ duration: 0.15 }}
                              />
                            )}

                            {/* Icon */}
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                              style={{
                                background: isActive ? `${cmd.color}18` : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${isActive ? cmd.color + '30' : 'rgba(255,255,255,0.06)'}`,
                              }}
                            >
                              <cmd.icon size={15} style={{ color: isActive ? cmd.color : '#64748b' }} />
                            </div>

                            {/* Label + description */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-white truncate">
                                <Highlight text={cmd.label} query={query} />
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">{cmd.description}</p>
                            </div>

                            {/* Category badge */}
                            <span
                              className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                              style={{
                                background: `${meta.color}12`,
                                color: isActive ? meta.color : '#475569',
                                border: `1px solid ${isActive ? meta.color + '30' : 'transparent'}`,
                              }}
                            >
                              {cat === 'navigate' ? '↗' : cat === 'action' ? '⚡' : cat === 'ask' ? 'T' : '⊞'}
                            </span>

                            {/* Arrow on active */}
                            {isActive && (
                              <ArrowRight size={13} style={{ color: cmd.color }} className="shrink-0" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-3">
                {[
                  { keys: ['↑', '↓'], label: 'navigate' },
                  { keys: ['↵'], label: 'select' },
                  { keys: ['esc'], label: 'close' },
                ].map(({ keys, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {k}
                      </kbd>
                    ))}
                    <span className="text-[10px] text-slate-700 ml-0.5">{label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen size={10} className="text-slate-700" />
                <span className="text-[10px] text-slate-700">{filtered.length} commands</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
