'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/shared/PageShell';
import AgentPill from '@/components/shared/AgentPill';
import ContextThread from '@/components/shared/ContextThread';
import { useSettings, escalationPassesThreshold } from '@/contexts/SettingsContext';
import { escalations } from '@/data/pages-data';
import type { Escalation, Person } from '@/types';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ChevronRight,
  Zap,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Timer,
  Shield,
  Flame,
  CircleDot,
  SlidersHorizontal,
} from 'lucide-react';

// ─── Helpers ───

const levelConfig: Record<Escalation['level'], { color: string; bg: string; border: string }> = {
  L4: { color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  L3: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  L2: { color: 'text-sky-400', bg: 'bg-sky-500/15', border: 'border-sky-500/30' },
  L1: { color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30' },
};

const priorityConfig: Record<Escalation['priority'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  critical: { label: 'Critical', color: 'text-rose-400', bg: 'bg-rose-500/10', icon: <Flame className="w-3 h-3" /> },
  high: { label: 'High', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <AlertTriangle className="w-3 h-3" /> },
  medium: { label: 'Medium', color: 'text-sky-400', bg: 'bg-sky-500/10', icon: <Shield className="w-3 h-3" /> },
};

const statusConfig: Record<Escalation['status'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <CircleDot className="w-3 h-3" /> },
  resolved: { label: 'Resolved', color: 'text-slate-400', bg: 'bg-slate-500/10', icon: <CheckCircle2 className="w-3 h-3" /> },
  waiting: { label: 'Waiting', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <Timer className="w-3 h-3" /> },
};

type StatusFilter = 'all' | Escalation['status'];
type LevelFilter = 'all' | Escalation['level'];

// ─── Components ───

function AgentPillChain({ chain }: { chain: Person[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {chain.map((person, i) => (
        <div key={i} className="flex items-center gap-1">
          <AgentPill person={person} size="md" showName={true} />
          {i < chain.length - 1 && (
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 mx-0.5 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1">{children}</p>;
}

function EscalationCard({ esc, index }: { esc: Escalation; index: number }) {
  const level = levelConfig[esc.level];
  const priority = priorityConfig[esc.priority];
  const status = statusConfig[esc.status];
  const isL4 = esc.level === 'L4';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`card-depth rounded-xl border ${
        isL4 ? 'intervention-glow border-amber-500/20' : 'border-[var(--border-subtle)]'
      }`}
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="p-5 space-y-4">
        {/* Header row: badges */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Level badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${level.bg} ${level.color} ${level.border}`}
            >
              {esc.level}
            </span>
            {/* Priority badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${priority.bg} ${priority.color}`}
            >
              {priority.icon}
              {priority.label}
            </span>
            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${status.bg} ${status.color}`}
            >
              {status.icon}
              {status.label}
            </span>
          </div>
          {/* Department */}
          <span className="text-[11px] font-medium text-slate-500 px-2 py-0.5 rounded-full border border-[var(--border-subtle)]" style={{ background: 'var(--bg-elevated)' }}>
            {esc.department}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white leading-snug">{esc.title}</h3>

        {/* Escalation Chain */}
        <div>
          <SectionLabel>Escalation Chain</SectionLabel>
          <AgentPillChain chain={esc.chain} />
        </div>

        {/* Originated by */}
        <div>
          <SectionLabel>Originated by</SectionLabel>
          <div className="flex items-center gap-2">
            <AgentPill person={esc.originatedBy} size="md" showName={false} />
            <span className="text-sm text-slate-300">
              {esc.originatedBy.name}{' '}
              <span className="text-slate-500">/ {esc.originatedBy.role}</span>
            </span>
          </div>
        </div>

        {/* Situation */}
        <div>
          <SectionLabel>Situation</SectionLabel>
          <p className="text-sm text-slate-300 leading-relaxed">{esc.situation}</p>
        </div>

        {/* Blocker */}
        <div className="rounded-lg px-3.5 py-2.5 border border-rose-500/15" style={{ background: 'rgba(244, 63, 94, 0.05)' }}>
          <SectionLabel>Blocker</SectionLabel>
          <p className="text-sm text-rose-300/90 leading-relaxed">{esc.blocker}</p>
        </div>

        {/* Attempts Made */}
        <div>
          <SectionLabel>Attempts Made</SectionLabel>
          <ol className="space-y-1.5 ml-0.5">
            {esc.attemptsMade.map((attempt, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-[11px] font-mono text-slate-500 mt-0.5 flex-shrink-0 w-4 text-right">
                  {i + 1}.
                </span>
                <span className="leading-relaxed">{attempt}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* What We Need From You */}
        <div className="rounded-lg px-3.5 py-2.5 border border-amber-500/20" style={{ background: 'rgba(245, 158, 11, 0.05)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <SectionLabel>What We Need From You</SectionLabel>
          </div>
          <p className="text-sm text-amber-200/90 leading-relaxed">{esc.needFromFounder}</p>
        </div>

        {/* Impact if Ignored */}
        <div>
          <SectionLabel>Impact If Ignored</SectionLabel>
          <p className="text-sm text-rose-400 leading-relaxed">{esc.impactIfIgnored}</p>
        </div>

        {/* Context thread — pull thread to see mission → agents → skill gap → impact */}
        <ContextThread escalation={esc} />

        {/* Footer: actions + timestamp */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button className="directive-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer">
              <Send className="w-3 h-3" />
              Send Directive
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-300 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-colors cursor-pointer">
              <MessageSquare className="w-3 h-3" />
              Ask Tamir
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer">
              <CheckCircle2 className="w-3 h-3" />
              Resolve
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-500/10 border border-slate-500/20 hover:bg-slate-500/20 transition-colors cursor-pointer">
              <Timer className="w-3 h-3" />
              Defer
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock className="w-3 h-3" />
            {esc.createdAt}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ───

export default function EscalationsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const { escalationThreshold } = useSettings();
  const thresholdActive = escalationThreshold !== 'L1';

  const filtered = escalations.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (levelFilter !== 'all' && e.level !== levelFilter) return false;
    if (!escalationPassesThreshold(e.level, escalationThreshold)) return false;
    return true;
  });

  const activeCount = escalations.filter((e) => e.status === 'active').length;
  const resolvedCount = escalations.filter((e) => e.status === 'resolved').length;
  const waitingCount = escalations.filter((e) => e.status === 'waiting').length;

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'waiting', label: 'Waiting' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const levelFilters: { key: LevelFilter; label: string }[] = [
    { key: 'all', label: 'All Levels' },
    { key: 'L4', label: 'L4' },
    { key: 'L3', label: 'L3' },
    { key: 'L2', label: 'L2' },
    { key: 'L1', label: 'L1' },
  ];

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Escalations</h1>
              <p className="text-sm text-slate-500">Structured decision packets requiring attention</p>
            </div>
          </div>
        </motion.div>

        {/* Summary Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="panel p-3 flex items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-slate-400">Active</span>
            <span className="text-sm font-semibold text-white">{activeCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-sm text-slate-400">Resolved</span>
            <span className="text-sm font-semibold text-white">{resolvedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-sm text-slate-400">Waiting</span>
            <span className="text-sm font-semibold text-white">{waitingCount}</span>
          </div>
        </motion.div>

        {/* Threshold banner */}
        {thresholdActive && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={12} className="text-amber-400 shrink-0" />
              <span className="text-[12px] text-amber-300/90">
                Threshold active: showing <strong>{escalationThreshold}+</strong> escalations only.{' '}
                {escalations.length - filtered.length} lower-level escalation{escalations.length - filtered.length !== 1 ? 's' : ''} hidden.
              </span>
            </div>
            <Link href="/settings">
              <span className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer">
                Change in Settings →
              </span>
            </Link>
          </motion.div>
        )}

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex items-center gap-3 flex-wrap"
        >
          {/* Status filters */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}>
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === f.key
                    ? 'bg-white/10 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-[var(--border-subtle)]" />

          {/* Level filters */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}>
            {levelFilters.map((f) => {
              const lc = f.key !== 'all' ? levelConfig[f.key as Escalation['level']] : null;
              return (
                <button
                  key={f.key}
                  onClick={() => setLevelFilter(f.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    levelFilter === f.key
                      ? lc
                        ? `${lc.bg} ${lc.color}`
                        : 'bg-white/10 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Escalation Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="panel p-8 text-center"
            >
              <p className="text-slate-500 text-sm">No escalations match the current filters.</p>
            </motion.div>
          ) : (
            filtered.map((esc, i) => (
              <EscalationCard key={esc.id} esc={esc} index={i} />
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}
