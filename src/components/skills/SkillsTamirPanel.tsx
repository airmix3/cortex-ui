'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send, Brain, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Sparkles, Zap, Star, Wrench, Plus, RefreshCw,
} from 'lucide-react';
import type { Skill, OrgTool } from '@/data/skills-data';
import { LEVEL_META } from '@/data/skills-data';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: number;
  sender: 'tamir' | 'ceo';
  time: string;
  content: string;
  type?: 'brief' | 'insight';
  bullets?: { icon: 'alert' | 'ok' | 'pending'; text: string; detail: string }[];
}

// ─── URGENCY / BULLET ICONS ──────────────────────────────────────────────────

const bulletIcons: Record<string, { icon: React.ElementType; color: string }> = {
  alert:   { icon: AlertTriangle,  color: 'text-amber-400' },
  pending: { icon: Clock,          color: 'text-sky-400' },
  ok:      { icon: CheckCircle2,   color: 'text-emerald-400' },
};

// ─── COLOR TOKENS ─────────────────────────────────────────────────────────────

const glassCard   = 'rgba(255,255,255,0.04)';
const glassMuted  = 'rgba(255,255,255,0.03)';
const textSecondary = '#94a3b8';
const textMuted     = '#64748b';
const divider       = 'rgba(255,255,255,0.09)';

// ─── MONITORING STATUS ───────────────────────────────────────────────────────

const monitoringStates = [
  { text: 'Scanning skill gaps…',    color: '#7dd3fc' },
  { text: 'All systems nominal',     color: '#34d399' },
  { text: 'Checking for rusty nodes', color: '#fcd34d' },
  { text: 'Training queue ready',    color: '#34d399' },
];

// ─── QUICK ACTIONS ───────────────────────────────────────────────────────────

const quickActions = [
  { label: 'Add Skill',  emoji: '✨' },
  { label: 'Rusty?',     emoji: '🔧' },
  { label: 'Recommend',  emoji: '🎯' },
  { label: 'Full Audit', emoji: '📊' },
];

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};
const msgAnim = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ─── TYPING INDICATOR ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-2"
    >
      <div
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
        style={{ background: glassCard, border: `1px solid ${divider}` }}
      >
        <span className="text-[10px] font-bold text-amber-400">Tamir</span>
        <div className="flex items-center gap-0.5 ml-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1 h-1 rounded-full bg-amber-400/60"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── SKILL SNAPSHOT CARD ─────────────────────────────────────────────────────

function SkillSnapshotCard({ skills, tools }: { skills: Skill[]; tools: OrgTool[] }) {
  const active   = skills.filter((s) => s.status === 'active').length;
  const rusty    = skills.filter((s) => s.status === 'rusty').length;
  const mastered = skills.filter((s) => s.level === 5).length;
  const connected = tools.filter((t) => t.status === 'connected').length;

  const stats = [
    { icon: Brain,     label: 'Active',   value: active,    color: '#38bdf8' },
    { icon: Star,      label: 'Mastered', value: mastered,  color: '#f59e0b' },
    { icon: RefreshCw, label: 'Rusty',    value: rusty,     color: '#f59e0b', warn: rusty > 0 },
    { icon: Wrench,    label: 'Tools',    value: connected, color: '#34d399' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl overflow-hidden mb-2"
      style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(56,189,248,0.05) 100%)',
        border: '1px solid rgba(167,139,250,0.18)',
        boxShadow: '0 0 20px rgba(167,139,250,0.06)',
      }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-1.5"
        style={{ borderBottom: '1px solid rgba(167,139,250,0.12)', background: 'rgba(167,139,250,0.06)' }}
      >
        <Sparkles size={9} className="text-violet-400" />
        <span className="text-[9px] font-bold text-violet-300 uppercase tracking-wider">Skill Snapshot</span>
      </div>
      <div className="grid grid-cols-4 gap-0 px-2 py-2">
        {stats.map(({ icon: Icon, label, value, color, warn }) => (
          <div key={label} className="flex flex-col items-center gap-0.5 py-1">
            <Icon size={12} style={{ color: warn && value > 0 ? '#f59e0b' : color }} />
            <span
              className="text-[15px] font-bold"
              style={{ color: warn && value > 0 ? '#fcd34d' : 'white' }}
            >
              {value}
            </span>
            <span className="text-[8px]" style={{ color: textMuted }}>{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isTamir = msg.sender === 'tamir';

  if (!isTamir) {
    return (
      <motion.div variants={msgAnim} className="flex justify-end">
        <div
          className="max-w-[82%] px-3 py-2 rounded-2xl rounded-br-sm text-[12px] leading-relaxed"
          style={{
            background: 'rgba(167,139,250,0.12)',
            border: '1px solid rgba(167,139,250,0.2)',
            color: '#e2e8f0',
          }}
        >
          {msg.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={msgAnim} className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[7px] font-bold text-black shrink-0">
          T
        </div>
        <span className="text-[9px] font-bold text-amber-400">Tamir</span>
        <span className="text-[9px]" style={{ color: textMuted }}>{msg.time}</span>
      </div>

      {/* Brief style */}
      {msg.type === 'brief' && msg.bullets ? (
        <div
          className="ml-6 rounded-xl overflow-hidden"
          style={{ background: glassCard, border: `1px solid ${divider}` }}
        >
          <div className="px-3 py-2 text-[12px] leading-relaxed" style={{ color: textSecondary }}>
            {msg.content}
          </div>
          <div className="border-t" style={{ borderColor: divider }}>
            {msg.bullets.map((b, i) => {
              const { icon: Icon, color } = bulletIcons[b.icon];
              return (
                <div
                  key={i}
                  className="flex items-start gap-2 px-3 py-2"
                  style={{ borderBottom: i < msg.bullets!.length - 1 ? `1px solid ${divider}` : 'none' }}
                >
                  <Icon size={11} className={`${color} shrink-0 mt-0.5`} />
                  <div className="min-w-0">
                    <div className="text-[11px] text-white font-medium leading-tight">{b.text}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: textMuted }}>{b.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="ml-6 px-3 py-2 rounded-2xl rounded-tl-sm text-[12px] leading-relaxed"
          style={{ background: glassCard, border: `1px solid ${divider}`, color: textSecondary }}
        >
          {msg.content}
        </div>
      )}
    </motion.div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function SkillsTamirPanel({
  skills,
  tools,
  onAddSkill,
}: {
  skills: Skill[];
  tools: OrgTool[];
  onAddSkill?: () => void;
}) {
  const [input, setInput]       = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [unread, setUnread]     = useState(0);
  const scrollRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  // Build context-aware initial messages from live data
  const initialMessages = useMemo<ChatMessage[]>(() => {
    const rustySkills   = skills.filter((s) => s.status === 'rusty');
    const draftSkills   = skills.filter((s) => s.status === 'draft');
    const topSkill      = [...skills].filter(s => s.status === 'active').sort((a, b) => b.level - a.level)[0];
    const disconnected  = tools.filter((t) => t.status !== 'connected');

    const bullets: ChatMessage['bullets'] = [];

    if (topSkill) {
      const lm = LEVEL_META[topSkill.level as keyof typeof LEVEL_META];
      bullets.push({ icon: 'ok', text: `${topSkill.name} is your strongest skill`, detail: `${lm.name} · Level ${topSkill.level}` });
    }
    if (rustySkills.length > 0) {
      bullets.push({ icon: 'alert', text: `${rustySkills.length} skill${rustySkills.length > 1 ? 's' : ''} going rusty`, detail: rustySkills.map(s => s.name).join(', ') });
    }
    if (draftSkills.length > 0) {
      bullets.push({ icon: 'pending', text: `${draftSkills.length} draft skill${draftSkills.length > 1 ? 's' : ''} need committing`, detail: draftSkills.map(s => s.name).join(', ') });
    }
    if (disconnected.length > 0) {
      bullets.push({ icon: 'pending', text: `${disconnected.length} tools not yet connected`, detail: disconnected.slice(0, 3).map(t => t.name).join(', ') + (disconnected.length > 3 ? '…' : '') });
    }

    const msgs: ChatMessage[] = [
      {
        id: 1,
        sender: 'tamir',
        type: 'brief',
        time: '08:00',
        content: "Here's your skill system overview:",
        bullets: bullets.length > 0 ? bullets : [{ icon: 'ok', text: 'All skills operational', detail: 'No gaps detected' }],
      },
    ];

    if (rustySkills.length > 0) {
      msgs.push({
        id: 2,
        sender: 'tamir',
        time: '08:01',
        content: `Your ${rustySkills[0].name} skill hasn't been used in a while. I'd recommend a quick refresher — it only needs one active mission to restore it to full strength.`,
      });
    }

    if (draftSkills.length > 0) {
      msgs.push({
        id: 3,
        sender: 'tamir',
        time: '08:02',
        content: `You have pending skill drafts. Committing them will expand your capability score and unlock new quest suggestions. Want me to walk you through each one?`,
      });
    }

    return msgs;
  }, [skills, tools]);

  // Load initial messages with staggered reveal
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      for (let i = 0; i < initialMessages.length; i++) {
        await new Promise((r) => setTimeout(r, i === 0 ? 600 : 1200));
        if (cancelled) return;
        setMessages((prev) => [...prev, initialMessages[i]]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [initialMessages]);

  // Cycling monitoring status
  useEffect(() => {
    const id = setInterval(() => setStatusIdx((i) => (i + 1) % monitoringStates.length), 4000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'ceo',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      content: input.trim(),
    };
    setInput('');
    setMessages((prev) => [...prev, userMsg]);

    // Simulate Tamir typing then responding
    setTimeout(() => setIsTyping(true), 300);
    setTimeout(() => {
      setIsTyping(false);
      const responses: ChatMessage[] = [
        {
          id: Date.now() + 1,
          sender: 'tamir',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          content: generateTamirResponse(userMsg.content, skills, tools),
        },
      ];
      setMessages((prev) => [...prev, ...responses]);
    }, 1800);
  };

  const handleQuickAction = (label: string) => {
    if (label === 'Add Skill' && onAddSkill) {
      onAddSkill();
      return;
    }
    const queries: Record<string, string> = {
      'Add Skill':  'I want to add a new skill to the system',
      'Rusty?':     'Which of my skills are getting rusty?',
      'Recommend':  'What skills should I prioritize training next?',
      'Full Audit': 'Give me a full audit of my current skill and tool coverage',
    };
    setInput(queries[label] || label);
    inputRef.current?.focus();
  };

  const status = monitoringStates[statusIdx];

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* Tamir avatar */}
          <div className="relative">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-black"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 0 14px rgba(245,158,11,0.35)',
              }}
            >
              T
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: '#34d399', borderColor: 'var(--bg-base)' }}
            />
          </div>
          <div>
            <div className="text-[13px] font-bold text-white">Tamir</div>
            <motion.div
              key={statusIdx}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-[10px] flex items-center gap-1"
              style={{ color: status.color }}
            >
              <span className="w-1 h-1 rounded-full inline-block" style={{ background: status.color }} />
              {status.text}
            </motion.div>
          </div>
        </div>
        {unread > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-bold text-black"
          >
            {unread}
          </motion.div>
        )}
      </div>

      {/* ── Skill Snapshot Card ── */}
      <div className="px-3 pt-3 shrink-0">
        <SkillSnapshotCard skills={skills} tools={tools} />
      </div>

      {/* ── Chat thread ── */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-2"
        style={{ scrollbarWidth: 'none' }}
      >
        <motion.div
          variants={containerAnim}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          <AnimatePresence>
            {isTyping && <TypingIndicator />}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Quick actions ── */}
      <div
        className="shrink-0 px-3 py-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {quickActions.map(({ label, emoji }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleQuickAction(label)}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer"
              style={{
                background: glassMuted,
                border: `1px solid ${divider}`,
                color: textSecondary,
              }}
            >
              <span>{emoji}</span> {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div
        className="shrink-0 px-3 pb-3 pt-1.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Tamir about your skills…"
            className="flex-1 bg-transparent text-[12px] text-white placeholder-slate-700 outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-1.5 rounded-lg cursor-pointer disabled:opacity-20"
            style={{ background: input.trim() ? 'rgba(245,158,11,0.15)' : 'transparent' }}
          >
            <Send size={11} className="text-amber-400" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── RESPONSE GENERATOR ──────────────────────────────────────────────────────

function generateTamirResponse(query: string, skills: Skill[], tools: OrgTool[]): string {
  const q = query.toLowerCase();

  if (q.includes('rusty') || q.includes('rust')) {
    const rusty = skills.filter((s) => s.status === 'rusty');
    if (rusty.length === 0) return "No rusty skills detected right now — everything looks healthy. Keep up the active usage!";
    return `${rusty.length} skill${rusty.length > 1 ? 's' : ''} flagged as rusty: ${rusty.map(s => s.name).join(', ')}. Each one needs at least one active mission to restore. I'd start with ${rusty[0].name} — it's the most at-risk.`;
  }

  if (q.includes('add') || q.includes('new skill')) {
    return "To add a new skill, click any empty area in the constellation or describe what you need. I'll classify it, set its initial level, and slot it into the right category branch. What capability are you thinking?";
  }

  if (q.includes('recommend') || q.includes('prioritize') || q.includes('train')) {
    const trainable = skills
      .filter((s) => s.status === 'active' && s.level < 5)
      .sort((a, b) => b.xp - a.xp);
    if (trainable.length === 0) return "All active skills are at max level — you're at peak capability. Focus on expanding with new skills.";
    const top = trainable.slice(0, 2);
    return `I'd prioritize ${top.map(s => `${s.name} (${Math.round(s.xp)}% to next level)`).join(' and ')}. They're closest to leveling up and will have the biggest near-term impact.`;
  }

  if (q.includes('audit') || q.includes('coverage')) {
    const active = skills.filter((s) => s.status === 'active').length;
    const connected = tools.filter((t) => t.status === 'connected').length;
    const missing = ['data analysis', 'financial modeling', 'stakeholder alignment']
      .filter(() => Math.random() > 0.5).slice(0, 2);
    return `Active skills: ${active} | Connected tools: ${connected}. ${missing.length > 0 ? `Potential gaps I see: ${missing.join(', ')}. Want me to draft skill profiles for these?` : 'Coverage looks solid across all 5 categories.'}`;
  }

  if (q.includes('tool') || q.includes('connect')) {
    const disconnected = tools.filter((t) => t.status !== 'connected');
    if (disconnected.length === 0) return "All tools are connected and operational. Your arsenal is fully equipped.";
    return `${disconnected.length} tool${disconnected.length > 1 ? 's' : ''} not yet connected: ${disconnected.slice(0, 3).map(t => t.name).join(', ')}. Each connection unlocks SP and expands your execution capability. I'd prioritize ${disconnected[0].name} first.`;
  }

  // Generic fallback
  return "Got it. I'll analyse your skill graph and cross-reference with active mission requirements. Give me a moment and I'll surface the most relevant insights.";
}
