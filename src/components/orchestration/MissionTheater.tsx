'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertTriangle,
  Zap, Target, ExternalLink, Users,
} from 'lucide-react';
import { employees } from '@/data/pages-data';
import { agentTasks } from '@/data/control-center-data';

// ── Mission flow definitions ──────────────────────────────────────────────────

interface FlowAgent {
  agentId: string;
  stageLabel: string;
  status: 'done' | 'active' | 'blocked' | 'waiting';
  taskSummary: string;  // what they're doing / did
}

interface MissionFlow {
  missionId: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  department: string;
  currentStageIdx: number;
  linkedEscalationLevel?: string;
  agents: FlowAgent[];
  recentEvents: { time: string; actor: string; message: string; done: boolean }[];
}

const MISSION_FLOWS: MissionFlow[] = [
  {
    missionId: 'm4',
    title: 'ZUNA Deployment',
    priority: 'high',
    department: 'Tech',
    currentStageIdx: 1,
    linkedEscalationLevel: 'L4',
    agents: [
      { agentId: 'dev1', stageLabel: 'Build & Test', status: 'done', taskSummary: 'Manifest v2.1 + 47/47 tests passed' },
      { agentId: 'dev2', stageLabel: 'Infrastructure', status: 'blocked', taskSummary: 'GPU allocation blocked — no us-east-1 capacity' },
      { agentId: 'cto', stageLabel: 'CTO Review', status: 'waiting', taskSummary: 'Waiting on GPU unblock before final sign-off' },
      { agentId: 'tamir', stageLabel: 'CEO Package', status: 'waiting', taskSummary: 'L4 escalation already filed with CEO' },
    ],
    recentEvents: [
      { time: '2m', actor: 'Dev Agent', message: 'Applied CTO review comments → manifest v2.1 ready', done: true },
      { time: '32m', actor: 'Dev Agent', message: 'Integration test suite: 47/47 tests passed', done: true },
      { time: '1h', actor: 'CTO', message: 'Architecture review complete — approved with 3 comments', done: true },
      { time: '2h', actor: 'Dev Agent', message: 'Initial manifest generated, submitted for CTO review', done: true },
    ],
  },
  {
    missionId: 'm1',
    title: 'AWS Capacity Blocker',
    priority: 'critical',
    department: 'Tech',
    currentStageIdx: 2,
    linkedEscalationLevel: 'L4',
    agents: [
      { agentId: 'dev2', stageLabel: 'Research', status: 'done', taskSummary: 'capacity_analysis.pdf — 3 AZs evaluated' },
      { agentId: 'cto', stageLabel: 'Escalation', status: 'done', taskSummary: 'Filed L4 with Tamir — us-west-2 proposal ready' },
      { agentId: 'tamir', stageLabel: 'CEO Review', status: 'active', taskSummary: 'Packaging decision context for CEO — ETA 5m' },
    ],
    recentEvents: [
      { time: '47s', actor: 'CTO', message: 'Blocked: us-west-2 provisioning pending CEO approval', done: false },
      { time: '28m', actor: 'Infra Agent', message: 'Evaluated CPU-only inference — 12x latency, unacceptable', done: true },
      { time: '1h', actor: 'Infra Agent', message: 'us-east-2 attempt failed — same capacity issue', done: true },
      { time: '3h', actor: 'Infra Agent', message: 'AWS Support request denied — 48hr wait quoted', done: true },
    ],
  },
  {
    missionId: 'm3',
    title: 'Content Strategy Plans',
    priority: 'medium',
    department: 'Marketing',
    currentStageIdx: 2,
    agents: [
      { agentId: 'mkt1', stageLabel: 'Content Creation', status: 'done', taskSummary: 'Editorial calendar + 36 social posts + SEO research done' },
      { agentId: 'cmo', stageLabel: 'CMO Review', status: 'active', taskSummary: 'Brand guidelines alignment check in progress' },
      { agentId: 'tamir', stageLabel: 'CEO Package', status: 'waiting', taskSummary: 'Awaiting CMO sign-off before routing to CEO' },
    ],
    recentEvents: [
      { time: '10m', actor: 'Content Agent', message: 'SEO keyword research complete — 15 high-intent terms', done: true },
      { time: '30m', actor: 'Content Agent', message: 'Q2 editorial calendar (12 article slots) submitted to CMO', done: true },
      { time: '1h', actor: 'CMO', message: 'Reviewing content strategy — brand alignment check started', done: false },
    ],
  },
  {
    missionId: 'eeg',
    title: 'EEG Model Optimization',
    priority: 'high',
    department: 'Tech',
    currentStageIdx: 1,
    agents: [
      { agentId: 'temp1', stageLabel: 'Protocol Testing', status: 'active', taskSummary: 'Batch 5/5 — 14-channel dry electrode impedance analysis' },
      { agentId: 'temp2', stageLabel: 'ML Benchmarking', status: 'active', taskSummary: 'SMOTE balancing + generating benchmark_results.xlsx' },
      { agentId: 'res1', stageLabel: 'Research Review', status: 'waiting', taskSummary: 'Awaiting next directive from CTO' },
      { agentId: 'cto', stageLabel: 'Tech Decision', status: 'waiting', taskSummary: 'Will review consolidated results before architecture call' },
    ],
    recentEvents: [
      { time: '3m', actor: 'Data Scientist', message: 'SMOTE class balancing started — batch 5 initiated', done: false },
      { time: '10m', actor: 'EEG Researcher', message: 'Interim results (batch 4/5) submitted to CTO', done: true },
      { time: '1h', actor: 'Data Scientist', message: 'ZUNA v2.1 accuracy benchmark: 95.1% — best result yet', done: true },
    ],
  },
];

// ── Priority config ───────────────────────────────────────────────────────────

const priorityConfig = {
  critical: { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', label: 'Critical' },
  high:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'High' },
  medium:   { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', label: 'Medium' },
  low:      { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'Low' },
};

const statusConfig = {
  done:    { color: '#34d399', icon: CheckCircle2,  label: 'Done'    },
  active:  { color: '#f59e0b', icon: Zap,           label: 'Active'  },
  blocked: { color: '#f43f5e', icon: AlertTriangle, label: 'Blocked' },
  waiting: { color: '#475569', icon: Clock,         label: 'Waiting' },
};

// ── Flow Node ─────────────────────────────────────────────────────────────────

function FlowNode({ agent, isLast }: { agent: FlowAgent; isLast: boolean }) {
  const emp = employees.find((e) => e.id === agent.agentId);
  const st = statusConfig[agent.status];
  const StatusIcon = st.icon;

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center gap-0">
        {/* Node circle */}
        <div className="relative">
          <div
            className={`w-11 h-11 rounded-full ${emp?.color ?? 'bg-slate-700'} flex items-center justify-center text-white text-[12px] font-bold ring-2 transition-all`}
            style={{
              boxShadow: agent.status === 'active'
                ? `0 0 16px ${st.color}50, 0 0 0 2px ${st.color}`
                : agent.status === 'blocked'
                ? `0 0 12px ${st.color}40, 0 0 0 2px ${st.color}`
                : `0 0 0 2px ${st.color}60`,
            }}
          >
            {emp?.avatar ?? '?'}
          </div>
          {/* Status badge */}
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2"
            style={{ background: 'rgba(6,10,19,0.98)', borderColor: st.color }}
          >
            {agent.status === 'active' ? (
              <motion.div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: st.color }}
                animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            ) : (
              <StatusIcon size={9} style={{ color: st.color }} />
            )}
          </div>
        </div>

        {/* Connector line */}
        {!isLast && (
          <div
            className="w-px mt-2"
            style={{ height: 20, background: `linear-gradient(to bottom, ${st.color}60, rgba(255,255,255,0.08))` }}
          />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5 pb-4">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[12px] font-semibold text-white">{emp?.name ?? agent.agentId}</span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold"
            style={{ background: `${st.color}15`, color: st.color }}
          >
            {st.label}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mb-1 font-medium uppercase tracking-wider">{agent.stageLabel}</p>
        <p className="text-[11px] text-slate-400 leading-relaxed">{agent.taskSummary}</p>
      </div>
    </div>
  );
}

// ── Mission Card (compact) ─────────────────────────────────────────────────────

function MissionCard({
  flow,
  onClick,
}: {
  flow: MissionFlow;
  onClick: () => void;
}) {
  const pc = priorityConfig[flow.priority];
  const activeAgents = flow.agents.filter((a) => a.status === 'active').length;
  const blockedAgents = flow.agents.filter((a) => a.status === 'blocked').length;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="text-left w-full rounded-xl p-3.5 cursor-pointer transition-all"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${blockedAgents > 0 ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[13px] font-semibold text-white leading-snug">{flow.title}</span>
        <div className="flex items-center gap-1 shrink-0">
          {flow.linkedEscalationLevel && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: 'rgba(244,63,94,0.12)', color: '#fca5a5', border: '1px solid rgba(244,63,94,0.2)' }}
            >
              {flow.linkedEscalationLevel}
            </span>
          )}
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
            style={{ background: pc.bg, color: pc.color }}
          >
            {pc.label}
          </span>
        </div>
      </div>

      {/* Agent pipeline preview */}
      <div className="flex items-center gap-1 mb-2.5">
        {flow.agents.map((a, i) => {
          const emp = employees.find((e) => e.id === a.agentId);
          const st = statusConfig[a.status];
          return (
            <div key={a.agentId} className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full ${emp?.color ?? 'bg-slate-700'} flex items-center justify-center text-[8px] font-bold text-white`}
                style={{ boxShadow: `0 0 0 1.5px ${st.color}` }}
                title={`${emp?.name}: ${st.label}`}
              >
                {emp?.avatar}
              </div>
              {i < flow.agents.length - 1 && (
                <ChevronRight size={9} className="text-slate-700 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Users size={9} />
          {flow.agents.length} agents
        </span>
        {activeAgents > 0 && (
          <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
            <motion.span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }} />
            {activeAgents} active
          </span>
        )}
        {blockedAgents > 0 && (
          <span className="flex items-center gap-1 text-rose-400">
            <AlertTriangle size={9} />
            {blockedAgents} blocked
          </span>
        )}
        <ChevronRight size={10} className="ml-auto text-slate-600" />
      </div>
    </motion.button>
  );
}

// ── Theater View (expanded) ───────────────────────────────────────────────────

function TheaterView({ flow, onBack }: { flow: MissionFlow; onBack: () => void }) {
  const pc = priorityConfig[flow.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer mr-1"
        >
          <ChevronLeft size={14} />
          <span className="text-[11px]">All missions</span>
        </button>
        <div className="w-px h-3.5 bg-white/10" />
        <Target size={13} style={{ color: pc.color }} />
        <span className="text-[14px] font-bold text-white">{flow.title}</span>
        {flow.linkedEscalationLevel && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-bold"
            style={{ background: 'rgba(244,63,94,0.12)', color: '#fca5a5', border: '1px solid rgba(244,63,94,0.2)' }}
          >
            {flow.linkedEscalationLevel}
          </span>
        )}
        <span
          className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
          style={{ background: pc.bg, color: pc.color }}
        >
          {pc.label}
        </span>
        <Link href="/missions" className="ml-auto text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1">
          Open in Missions <ExternalLink size={9} />
        </Link>
      </div>

      <div className="flex-1 flex gap-0 min-h-0 overflow-hidden">
        {/* Agent flow column */}
        <div
          className="w-[280px] shrink-0 overflow-y-auto px-4 py-4"
          style={{ borderRight: '1px solid rgba(255,255,255,0.05)', scrollbarWidth: 'none' }}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-4">Agent Pipeline</p>
          {flow.agents.map((agent, i) => (
            <FlowNode key={agent.agentId} agent={agent} isLast={i === flow.agents.length - 1} />
          ))}
        </div>

        {/* Right: Stage progress + recent events */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'none' }}>

          {/* Stage progress */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-3">Stage Progress</p>
            <div className="flex gap-0">
              {flow.agents.map((a, i) => {
                const st = statusConfig[a.status];
                const done = a.status === 'done';
                const active = a.status === 'active';
                return (
                  <div key={a.agentId} className="flex-1 relative">
                    {/* connector */}
                    {i < flow.agents.length - 1 && (
                      <div
                        className="absolute top-3 left-1/2 w-full h-0.5 z-0"
                        style={{ background: done ? st.color : 'rgba(255,255,255,0.06)' }}
                      />
                    )}
                    {/* step dot */}
                    <div className="relative flex flex-col items-center gap-1.5 z-10">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          background: done ? `${st.color}20` : active ? `${st.color}20` : 'rgba(255,255,255,0.04)',
                          border: `1.5px solid ${done || active ? st.color : 'rgba(255,255,255,0.1)'}`,
                        }}
                      >
                        {done ? (
                          <CheckCircle2 size={11} style={{ color: st.color }} />
                        ) : active ? (
                          <motion.div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: st.color }}
                            animate={{ scale: [0.8, 1.1, 0.8] }}
                            transition={{ duration: 1.4, repeat: Infinity }}
                          />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-700" />
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 text-center leading-tight">{a.stageLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent events */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-2">Recent Activity</p>
            <div className="space-y-2">
              {flow.recentEvents.map((ev, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                    style={{ background: ev.done ? '#34d399' : '#f59e0b' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-300 leading-relaxed">{ev.message}</p>
                    <span className="text-[9px] text-slate-600 font-mono">{ev.actor} · {ev.time} ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

// ── Mission Theater ───────────────────────────────────────────────────────────

export default function MissionTheater() {
  const [selectedFlow, setSelectedFlow] = useState<MissionFlow | null>(null);

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {selectedFlow ? (
          <TheaterView
            key="theater"
            flow={selectedFlow}
            onBack={() => setSelectedFlow(null)}
          />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            <div className="shrink-0 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mission Theater</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Click any mission to see the full agent flow</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: 'none' }}>
              {MISSION_FLOWS.map((flow) => (
                <MissionCard
                  key={flow.missionId}
                  flow={flow}
                  onClick={() => setSelectedFlow(flow)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
