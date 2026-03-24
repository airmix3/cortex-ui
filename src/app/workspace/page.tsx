'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppShell from '@/components/layout/AppShell';
import TopNav from '@/components/layout/TopNav';
import {
  Shield, AlertTriangle, CheckCircle2, Clock, Send, Mic,
  FileText, FileCode, FileSpreadsheet, Image, Film, FileType,
  ChevronRight, ChevronDown, Eye, Brain, Zap, X,
  ArrowRight, ArrowUpRight, ChevronUp, Layers, Target,
  Sparkles, TrendingUp, TrendingDown, Minus, ExternalLink,
  MessageSquare, BarChart3, Users, Briefcase,
} from 'lucide-react';
import {
  workspaceMissions,
  missionChats,
  type MissionContext,
  type WorkspaceChatMsg,
  type WorkspaceAgent,
  type AgentStep,
  type ImpactItem,
} from '@/data/workspace-data';

// ── Constants ────────────────────────────────────────────────────────────────────

const priorityConfig = {
  critical: { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.30)', label: 'Critical' },
  high:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'High' },
  medium:   { color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.20)', label: 'Medium' },
  low:      { color: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.15)', label: 'Low' },
};

const columnLabels = {
  'act-now': { label: 'Act Now', color: '#fbbf24' },
  'approve-decide': { label: 'Approve / Decide', color: '#38bdf8' },
  'review': { label: 'Review', color: '#34d399' },
};

const agentStatusConfig = {
  working: { color: '#38bdf8', label: 'Working', pulse: true },
  done:    { color: '#34d399', label: 'Done', pulse: false },
  blocked: { color: '#f43f5e', label: 'Blocked', pulse: true },
  waiting: { color: '#f59e0b', label: 'Waiting', pulse: false },
  idle:    { color: '#64748b', label: 'Idle', pulse: false },
};

const fileIcons: Record<string, React.ElementType> = {
  document: FileText, code: FileCode, spreadsheet: FileSpreadsheet,
  image: Image, video: Film, pdf: FileType, presentation: FileText,
};

const deliverableStatusStyle: Record<string, { bg: string; color: string; label: string }> = {
  draft:         { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', label: 'Draft' },
  'in-progress': { bg: 'rgba(56,189,248,0.12)',  color: '#7dd3fc', label: 'In Progress' },
  ready:         { bg: 'rgba(52,211,153,0.12)',  color: '#6ee7b7', label: 'Ready' },
  approved:      { bg: 'rgba(167,139,250,0.15)', color: '#c4b5fd', label: 'Approved' },
};

// ── Mission Selector Tab ─────────────────────────────────────────────────────────

function MissionTab({ mission, isActive, onClick }: {
  mission: MissionContext; isActive: boolean; onClick: () => void;
}) {
  const prio = priorityConfig[mission.priority];
  const col = columnLabels[mission.column];
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-lg cursor-pointer transition-all"
      style={{
        background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
        border: isActive ? `1px solid ${prio.color}40` : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isActive ? `0 0 12px ${prio.color}15` : 'none',
      }}
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: prio.color, boxShadow: mission.priority === 'critical' ? `0 0 6px ${prio.color}` : 'none' }}
      />
      <span className={`text-[12px] font-medium truncate max-w-[140px] ${isActive ? 'text-white' : 'text-slate-400'}`}>
        {mission.title}
      </span>
      <span
        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0"
        style={{ background: `${col.color}15`, color: col.color }}
      >
        {col.label}
      </span>
    </motion.button>
  );
}

// ── Agent Flow Node ──────────────────────────────────────────────────────────────

function AgentFlowNode({ agent, index, total }: {
  agent: WorkspaceAgent; index: number; total: number;
}) {
  const st = agentStatusConfig[agent.status];
  return (
    <div className="flex items-center gap-0">
      {/* Node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="flex flex-col items-center gap-1.5 shrink-0"
        style={{ width: '110px' }}
      >
        {/* Avatar */}
        <div className="relative">
          <div
            className={`w-11 h-11 rounded-full ${agent.person.color} flex items-center justify-center text-[13px] font-bold text-white`}
            style={{
              boxShadow: `0 0 0 2px ${st.color}30, 0 0 12px ${st.color}20`,
            }}
          >
            {agent.person.avatar}
          </div>
          {/* Status dot */}
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0f1a]"
            style={{ background: st.color }}
            animate={st.pulse ? { scale: [1, 1.3, 1] } : {}}
            transition={st.pulse ? { duration: 1.5, repeat: Infinity } : {}}
          />
        </div>

        {/* Name + Role */}
        <div className="text-center">
          <p className="text-[11px] font-semibold text-white">{agent.person.name}</p>
          <p className="text-[9px] text-slate-500">{agent.role}</p>
        </div>

        {/* Task */}
        <div
          className="w-full px-2 py-1.5 rounded-md text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${st.color}20` }}
        >
          <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">{agent.task}</p>
        </div>

        {/* Status badge */}
        <span
          className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
          style={{ background: `${st.color}15`, color: st.color }}
        >
          {st.label}
        </span>

        {/* Time spent */}
        {agent.timeSpent && (
          <span className="text-[9px] text-slate-600 flex items-center gap-1">
            <Clock size={8} />
            {agent.timeSpent}
          </span>
        )}
      </motion.div>

      {/* Arrow connector */}
      {index < total - 1 && (
        <div className="flex items-center px-1 shrink-0" style={{ marginTop: '-40px' }}>
          <div className="w-6 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <ChevronRight size={10} className="text-slate-600 -ml-1" />
        </div>
      )}
    </div>
  );
}

// ── Thinking Step ────────────────────────────────────────────────────────────────

function ThinkingStep({ step, index }: { step: AgentStep; index: number }) {
  const isActive = step.status === 'active';
  const isDone = step.status === 'done';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-2.5 py-1.5"
    >
      {/* Step indicator */}
      <div className="shrink-0 mt-0.5">
        {isDone && <CheckCircle2 size={13} className="text-emerald-400" />}
        {isActive && (
          <motion.div
            className="w-3.5 h-3.5 rounded-full border-2 border-sky-400 flex items-center justify-center"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          </motion.div>
        )}
        {step.status === 'pending' && (
          <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[12px] leading-relaxed ${isActive ? 'text-sky-300 font-medium' : isDone ? 'text-slate-300' : 'text-slate-500'}`}>
          {step.step}
        </p>
        {step.detail && (
          <p className="text-[10px] text-slate-500 mt-0.5">{step.detail}</p>
        )}
      </div>

      {step.agent && (
        <div
          className={`shrink-0 w-5 h-5 rounded-full ${step.agent.color} flex items-center justify-center text-[8px] font-bold text-white`}
          title={step.agent.name}
        >
          {step.agent.avatar}
        </div>
      )}
    </motion.div>
  );
}

// ── Impact Row ───────────────────────────────────────────────────────────────────

function ImpactRow({ item }: { item: ImpactItem }) {
  const icons = {
    positive: <TrendingUp size={10} className="text-emerald-400" />,
    negative: <TrendingDown size={10} className="text-rose-400" />,
    neutral:  <Minus size={10} className="text-slate-400" />,
  };
  const colors = {
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
    neutral:  'text-slate-400',
  };
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-1.5">
        {icons[item.type]}
        <span className="text-[11px] text-slate-300">{item.label}</span>
      </div>
      <span className={`text-[11px] font-medium ${colors[item.type]}`}>{item.value}</span>
    </div>
  );
}

// ── Deliverable Card ─────────────────────────────────────────────────────────────

function DeliverableCard({ d }: { d: MissionContext['deliverables'][0] }) {
  const Icon = fileIcons[d.type] || FileText;
  const st = deliverableStatusStyle[d.status] || deliverableStatusStyle.draft;
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all hover:brightness-110 cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: st.bg }}
      >
        <Icon size={14} style={{ color: st.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-slate-200 truncate">{d.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {d.size && <span className="text-[9px] text-slate-600">{d.size}</span>}
          {d.updatedAt && <span className="text-[9px] text-slate-600">{d.updatedAt}</span>}
        </div>
      </div>
      <span
        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0"
        style={{ background: st.bg, color: st.color }}
      >
        {st.label}
      </span>
      <Eye size={12} className="text-slate-600 shrink-0" />
    </div>
  );
}

// ── Main Workspace Page ──────────────────────────────────────────────────────────

// ── Launched-from-Tamir mission type ─────────────────────────────────────────────

interface TamirLaunchedMission {
  id: string;
  title: string;
  brief: string;
  department: string;
  estimatedDuration: string;
  successCriteria: string[];
  agents: { name: string; avatar: string; color: string }[];
  launchedAt: string;
}

// ── Launched Mission Banner ───────────────────────────────────────────────────────

function LaunchedMissionBanner({
  mission,
  onDismiss,
}: {
  mission: TamirLaunchedMission;
  onDismiss: () => void;
}) {
  const age = (() => {
    const diff = Date.now() - new Date(mission.launchedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.25 }}
      className="shrink-0 mx-4 mt-3 mb-0 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(56,189,248,0.06)',
        border: '1px solid rgba(56,189,248,0.20)',
        boxShadow: '0 0 20px rgba(56,189,248,0.06)',
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ borderBottom: '1px solid rgba(56,189,248,0.10)', background: 'rgba(56,189,248,0.04)' }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-sky-400 shrink-0"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <span className="text-[9px] font-bold uppercase tracking-widest text-sky-400">
          New · Launched via Tamir
        </span>
        <span className="text-[9px] text-slate-600 ml-1">{age}</span>
        <button
          onClick={onDismiss}
          className="ml-auto text-slate-600 hover:text-slate-400 cursor-pointer transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-white mb-0.5">{mission.title}</p>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{mission.brief}</p>
          {/* Agents */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {mission.agents.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className={`w-4 h-4 rounded-full ${a.color} flex items-center justify-center text-[7px] font-bold text-white`}>
                  {a.avatar}
                </div>
                <span className="text-[10px] text-slate-400">{a.name}</span>
              </div>
            ))}
            <span className="text-[10px] text-slate-600 flex items-center gap-1">
              <Clock size={9} />
              {mission.estimatedDuration}
            </span>
          </div>
        </div>

        {/* Success criteria mini */}
        <div className="shrink-0 hidden sm:block" style={{ minWidth: '160px' }}>
          <p className="text-[9px] text-slate-600 uppercase tracking-wider font-medium mb-1.5">Success Criteria</p>
          <div className="space-y-1">
            {mission.successCriteria.slice(0, 2).map((c, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className="w-2.5 h-2.5 rounded border border-slate-600 shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-500 leading-relaxed line-clamp-1">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live status */}
        <div
          className="shrink-0 flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}
        >
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-emerald-400"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[9px] font-bold text-emerald-400">LIVE</span>
          <span className="text-[8px] text-slate-600">Running</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function WorkspacePage() {
  const [activeMissionId, setActiveMissionId] = useState(workspaceMissions[0].id);
  const [chatMessages, setChatMessages] = useState<Record<string, WorkspaceChatMsg[]>>({ ...missionChats });
  const [chatInput, setChatInput] = useState('');
  const [showThinking, setShowThinking] = useState(true);
  const [showImpact, setShowImpact] = useState<'approve' | 'ignore' | null>('approve');
  const [actionTaken, setActionTaken] = useState<Record<string, 'approved' | 'rejected' | null>>({});
  const [launchedMissions, setLaunchedMissions] = useState<TamirLaunchedMission[]>([]);
  const threadRef = useRef<HTMLDivElement>(null);

  // Read localStorage for Tamir-launched missions on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tamir-launched-missions');
      if (stored) {
        const parsed: TamirLaunchedMission[] = JSON.parse(stored);
        // Only show missions launched in the last 24 hours
        const recent = parsed.filter(
          (m) => Date.now() - new Date(m.launchedAt).getTime() < 86400000
        );
        setLaunchedMissions(recent);
      }
    } catch { /* ignore */ }
  }, []);

  const dismissLaunchedMission = useCallback((id: string) => {
    setLaunchedMissions((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const mission = workspaceMissions.find(m => m.id === activeMissionId)!;
  const messages = chatMessages[activeMissionId] || [];
  const prio = priorityConfig[mission.priority];
  const col = columnLabels[mission.column];
  const isActioned = actionTaken[mission.id];

  // Auto-scroll chat
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!chatInput.trim()) return;
    const msg: WorkspaceChatMsg = {
      id: Date.now(),
      sender: 'ceo',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: chatInput.trim(),
    };
    setChatMessages(prev => ({
      ...prev,
      [activeMissionId]: [...(prev[activeMissionId] || []), msg],
    }));
    setChatInput('');

    // Simulate Tamir response
    setTimeout(() => {
      const response: WorkspaceChatMsg = {
        id: Date.now() + 1,
        sender: 'tamir',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Understood. I'll look into that regarding "${mission.title}". Let me check the latest data from the agents involved.`,
      };
      setChatMessages(prev => ({
        ...prev,
        [activeMissionId]: [...(prev[activeMissionId] || []), response],
      }));
    }, 1500);
  }, [chatInput, activeMissionId, mission.title]);

  const handleAction = useCallback((action: 'approved' | 'rejected') => {
    setActionTaken(prev => ({ ...prev, [mission.id]: action }));
  }, [mission.id]);

  // Count stats
  const blockedAgents = mission.agents.filter(a => a.status === 'blocked').length;
  const doneSteps = mission.thinkingSteps.filter(s => s.status === 'done').length;
  const totalSteps = mission.thinkingSteps.length;
  const readyDeliverables = mission.deliverables.filter(d => d.status === 'ready' || d.status === 'approved').length;

  return (
    <AppShell>
      {/* Ambient bg */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', width: '500px', height: '500px', top: '20%', left: '30%', background: `radial-gradient(circle, ${prio.color}08 0%, transparent 70%)`, filter: 'blur(80px)', animation: 'ambientFloat 20s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', bottom: '10%', right: '5%', background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'ambientFloat 24s ease-in-out infinite reverse' }} />
      </div>

      <TopNav />

      {/* ── Mission Selector Bar ── */}
      <div
        className="shrink-0 flex items-center gap-2 px-5 py-2.5 relative z-10 overflow-x-auto"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          scrollbarWidth: 'none',
        }}
      >
        <div className="flex items-center gap-1.5 shrink-0 mr-2">
          <Target size={13} className="text-sky-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Missions</span>
        </div>
        <div className="w-px h-5 shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
        {workspaceMissions.map(m => (
          <MissionTab
            key={m.id}
            mission={m}
            isActive={m.id === activeMissionId}
            onClick={() => setActiveMissionId(m.id)}
          />
        ))}
      </div>

      {/* ── 3-Column Layout ── */}
      <div className="flex-1 min-h-0 flex relative z-10">

        {/* ════════════ LEFT: Context Panel (22%) ════════════ */}
        <div
          className="shrink-0 flex flex-col overflow-y-auto"
          style={{
            width: '22%', minWidth: '240px', maxWidth: '320px',
            background: 'rgba(6,10,24,0.60)',
            backdropFilter: 'blur(20px) saturate(140%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            scrollbarWidth: 'none',
          }}
        >
          {/* Mission header */}
          <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                style={{ background: prio.bg, color: prio.color, border: `1px solid ${prio.border}` }}
              >
                {prio.label}
              </span>
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{ background: `${col.color}12`, color: col.color }}
              >
                {col.label}
              </span>
              <span className="text-[9px] text-slate-600 ml-auto flex items-center gap-1">
                <Clock size={8} />
                {mission.age}
              </span>
            </div>
            <h2 className="text-[15px] font-bold text-white leading-snug mb-1.5">{mission.title}</h2>
            <p className="text-[11px] text-slate-400 leading-relaxed">{mission.situation}</p>
          </div>

          {/* Owner */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[9px] text-slate-600 uppercase tracking-wider font-medium mb-2">Owner</p>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full ${mission.owner.color} flex items-center justify-center text-[11px] font-bold text-white`}>
                {mission.owner.avatar}
              </div>
              <div>
                <p className="text-[12px] font-medium text-white">{mission.owner.name}</p>
                <p className="text-[10px] text-slate-500">{mission.owner.role} · {mission.department}</p>
              </div>
            </div>
          </div>

          {/* Escalation path */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[9px] text-slate-600 uppercase tracking-wider font-medium mb-2">Escalation Path</p>
            <p className="text-[10px] text-slate-400">{mission.escalationPath}</p>
          </div>

          {/* Blocker */}
          {mission.blocker && (
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[9px] text-slate-600 uppercase tracking-wider font-medium mb-2">Blocker</p>
              <div
                className="flex items-start gap-2 px-2.5 py-2 rounded-lg"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.18)' }}
              >
                <AlertTriangle size={11} className="text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-300 leading-relaxed">{mission.blocker}</p>
              </div>
            </div>
          )}

          {/* Budget */}
          {mission.budget && (
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[9px] text-slate-600 uppercase tracking-wider font-medium mb-2">Budget</p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[10px] text-slate-500">Current</p>
                  <p className="text-[13px] font-bold text-white">{mission.budget.current}</p>
                </div>
                <ArrowRight size={10} className="text-slate-600" />
                <div>
                  <p className="text-[10px] text-slate-500">Projected</p>
                  <p className="text-[13px] font-bold text-amber-400">{mission.budget.projected}</p>
                </div>
                <div className="ml-auto">
                  <p className="text-[10px] text-slate-500">Limit</p>
                  <p className="text-[13px] font-bold text-slate-400">{mission.budget.limit}</p>
                </div>
              </div>
              {/* Budget bar */}
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(parseFloat(mission.budget.current.replace(/[^0-9.]/g, '')) / parseFloat(mission.budget.limit.replace(/[^0-9.]/g, ''))) * 100}%`,
                    background: 'linear-gradient(90deg, #34d399, #f59e0b)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Background */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[9px] text-slate-600 uppercase tracking-wider font-medium mb-2">Background</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">{mission.background}</p>
          </div>

          {/* Activity Timeline */}
          <div className="px-4 py-3">
            <p className="text-[9px] text-slate-600 uppercase tracking-wider font-medium mb-2">Activity</p>
            <div className="space-y-0">
              {mission.timeline.map((entry, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1.5">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: i === 0 ? '#38bdf8' : '#334155' }} />
                    {i < mission.timeline.length - 1 && (
                      <div className="w-px flex-1 mt-0.5" style={{ background: 'rgba(255,255,255,0.06)', minHeight: '16px' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-300 leading-relaxed">{entry.action}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-slate-500">{entry.actor}</span>
                      <span className="text-[9px] text-slate-600">·</span>
                      <span className="text-[9px] text-slate-600">{entry.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════ CENTER: Execution Canvas (48%) ════════════ */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

          {/* ── Tamir-launched mission banners ── */}
          <AnimatePresence>
            {launchedMissions.map((lm) => (
              <LaunchedMissionBanner
                key={lm.id}
                mission={lm}
                onDismiss={() => dismissLaunchedMission(lm.id)}
              />
            ))}
          </AnimatePresence>

          {/* ── CEO Action Banner ── */}
          <div
            className="shrink-0 mx-4 mt-4 mb-3 px-5 py-4 rounded-xl"
            style={{
              background: isActioned
                ? isActioned === 'approved'
                  ? 'rgba(52,211,153,0.08)'
                  : 'rgba(244,63,94,0.08)'
                : `linear-gradient(135deg, ${prio.bg} 0%, rgba(255,255,255,0.03) 100%)`,
              border: isActioned
                ? isActioned === 'approved'
                  ? '1px solid rgba(52,211,153,0.25)'
                  : '1px solid rgba(244,63,94,0.25)'
                : `1px solid ${prio.border}`,
              boxShadow: isActioned ? 'none' : `0 0 20px ${prio.color}10`,
            }}
          >
            {isActioned ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className={isActioned === 'approved' ? 'text-emerald-400' : 'text-rose-400'} />
                <div>
                  <p className="text-[13px] font-bold text-white">
                    {isActioned === 'approved' ? 'Approved' : 'Rejected'} — {mission.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Decision recorded. {isActioned === 'approved' ? 'Agents will proceed automatically.' : 'Tamir will coordinate next steps.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={13} style={{ color: prio.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: prio.color }}>
                    CEO Decision Required
                  </span>
                </div>
                <p className="text-[15px] font-bold text-white mb-3">{mission.ceoAction}</p>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAction('approved')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer"
                    style={{
                      background: mission.column === 'act-now'
                        ? 'linear-gradient(135deg, rgba(245,158,11,0.90), rgba(234,88,12,0.80))'
                        : mission.column === 'approve-decide'
                          ? 'linear-gradient(135deg, rgba(16,185,129,0.90), rgba(5,150,105,0.80))'
                          : 'linear-gradient(135deg, rgba(56,189,248,0.90), rgba(14,165,233,0.80))',
                      color: mission.column === 'act-now' ? '#0a0f1a' : 'white',
                      boxShadow: `0 4px 16px ${col.color}30`,
                    }}
                  >
                    <CheckCircle2 size={14} />
                    {mission.primaryCTA}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAction('rejected')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#94a3b8',
                    }}
                  >
                    <X size={14} />
                    Reject
                  </motion.button>

                  <button
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] text-slate-400 cursor-pointer transition-colors hover:text-slate-200"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <MessageSquare size={11} />
                    Ask Tamir
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── Quick Stats ── */}
          <div className="shrink-0 grid grid-cols-4 gap-2 mx-4 mb-4">
            {[
              { icon: Users, label: 'Agents', value: `${mission.agents.length}`, sub: blockedAgents > 0 ? `${blockedAgents} blocked` : 'All clear', color: blockedAgents > 0 ? '#f43f5e' : '#34d399' },
              { icon: Brain, label: 'Reasoning', value: `${doneSteps}/${totalSteps}`, sub: 'steps complete', color: '#38bdf8' },
              { icon: Layers, label: 'Deliverables', value: `${readyDeliverables}/${mission.deliverables.length}`, sub: 'ready', color: '#a78bfa' },
              { icon: Clock, label: 'Age', value: mission.age, sub: 'since created', color: '#f59e0b' },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <div
                key={label}
                className="px-3 py-2.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={10} style={{ color }} />
                  <span className="text-[9px] text-slate-600 uppercase tracking-wider font-medium">{label}</span>
                </div>
                <p className="text-[16px] font-bold text-white">{value}</p>
                <p className="text-[9px] mt-0.5" style={{ color }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* ── Agent Flow ── */}
          <div className="shrink-0 mx-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={12} className="text-sky-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Agent Pipeline</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div
              className="flex items-start justify-center gap-0 px-4 py-5 rounded-xl overflow-x-auto"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                scrollbarWidth: 'none',
              }}
            >
              {mission.agents.map((agent, i) => (
                <AgentFlowNode key={i} agent={agent} index={i} total={mission.agents.length} />
              ))}

              {/* Final: CEO */}
              <div className="flex items-center px-1 shrink-0" style={{ marginTop: '-40px' }}>
                <div className="w-6 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
                <ChevronRight size={10} className="text-slate-600 -ml-1" />
              </div>
              <div className="flex flex-col items-center gap-1.5 shrink-0" style={{ width: '90px' }}>
                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-full bg-amber-600 flex items-center justify-center text-[13px] font-bold text-white"
                    style={{ boxShadow: `0 0 0 2px ${prio.color}30, 0 0 16px ${prio.color}20` }}
                  >
                    CEO
                  </div>
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0f1a] bg-amber-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-semibold text-amber-400">You</p>
                  <p className="text-[9px] text-slate-500">Decision</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Agent Reasoning ── */}
          <div className="shrink-0 mx-4 mb-4">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center gap-2 mb-2 cursor-pointer group"
            >
              <Brain size={12} className="text-sky-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 group-hover:text-slate-300 transition-colors">
                Agent Reasoning
              </span>
              <span className="text-[9px] text-slate-600">{doneSteps}/{totalSteps} steps</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              {showThinking ? <ChevronUp size={12} className="text-slate-600" /> : <ChevronDown size={12} className="text-slate-600" />}
            </button>

            <AnimatePresence>
              {showThinking && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {mission.thinkingSteps.map((step, i) => (
                      <ThinkingStep key={i} step={step} index={i} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Deliverables ── */}
          <div className="shrink-0 mx-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={12} className="text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Deliverables</span>
              <span className="text-[9px] text-slate-600">{readyDeliverables} of {mission.deliverables.length} ready</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="space-y-1.5">
              {mission.deliverables.map((d, i) => (
                <DeliverableCard key={i} d={d} />
              ))}
            </div>
          </div>

          {/* ── Impact Analysis ── */}
          <div className="shrink-0 mx-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={12} className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Impact Analysis</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            {/* Toggle */}
            <div className="flex gap-1 mb-3">
              {[
                { key: 'approve' as const, label: 'If Approved', color: '#34d399' },
                { key: 'ignore' as const, label: 'If Ignored', color: '#f43f5e' },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setShowImpact(showImpact === key ? null : key)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all"
                  style={{
                    background: showImpact === key ? `${color}12` : 'rgba(255,255,255,0.03)',
                    border: showImpact === key ? `1px solid ${color}30` : '1px solid rgba(255,255,255,0.06)',
                    color: showImpact === key ? color : '#64748b',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {showImpact && (
                <motion.div
                  key={showImpact}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {(showImpact === 'approve' ? mission.impactIfApproved : mission.impactIfIgnored).map((item, i) => (
                    <ImpactRow key={i} item={item} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ════════════ RIGHT: Tamir Assistant (30%) ════════════ */}
        <div
          className="shrink-0 flex flex-col"
          style={{
            width: '28%', minWidth: '280px', maxWidth: '380px',
            background: 'rgba(6,10,24,0.70)',
            backdropFilter: 'blur(24px) saturate(140%) brightness(1.04)',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Header */}
          <div
            className="shrink-0 flex items-center gap-3 px-4 py-3.5"
            style={{
              background: 'linear-gradient(180deg, rgba(6,10,24,0.95) 0%, rgba(8,14,30,0.80) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-[12px] font-bold text-white">T</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#060a18]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">Tamir</p>
              <p className="text-[10px] text-slate-500">Briefing on: {mission.title}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
              <span className="text-[10px] text-emerald-400 font-medium">Live</span>
            </div>
          </div>

          {/* Mission context badge */}
          <div className="shrink-0 px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: `${prio.color}08`, border: `1px solid ${prio.color}15` }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: prio.color }} />
              <span className="text-[11px] text-slate-300 truncate">{mission.title}</span>
              <span className="text-[9px] font-medium ml-auto shrink-0" style={{ color: prio.color }}>{prio.label}</span>
            </div>
          </div>

          {/* Chat thread */}
          <div
            ref={threadRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ scrollbarWidth: 'none' }}
          >
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex flex-col gap-1 ${msg.sender === 'ceo' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-600">
                    {msg.sender === 'tamir' ? 'Tamir' : 'You'}
                  </span>
                  <span className="text-[9px] text-slate-700">{msg.time}</span>
                </div>
                <div
                  className="max-w-[90%] px-3 py-2.5 rounded-xl text-[12px] leading-relaxed"
                  style={msg.sender === 'tamir' ? {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#cbd5e1',
                  } : {
                    background: 'rgba(56,189,248,0.12)',
                    border: '1px solid rgba(56,189,248,0.20)',
                    color: '#bae6fd',
                  }}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick prompts */}
          <div className="shrink-0 px-3 pb-2 flex gap-1.5 flex-wrap">
            {[
              'What unblocks if I approve?',
              'Show me the risks',
              'Who else is affected?',
              'Summarize for me',
            ].map(q => (
              <button
                key={q}
                onClick={() => setChatInput(q)}
                className="shrink-0 px-2 py-1 text-[10px] text-slate-400 rounded-md whitespace-nowrap transition-colors hover:text-slate-200 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            className="shrink-0 px-3 py-3 flex items-center gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about this mission..."
              className="flex-1 bg-transparent text-[12px] text-white placeholder:text-slate-600 outline-none"
            />
            <button
              onClick={sendMessage}
              className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              style={{
                background: chatInput.trim() ? 'rgba(56,189,248,0.20)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <Send size={12} className="text-sky-400" />
            </button>
            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <Mic size={12} className="text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
