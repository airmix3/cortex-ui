'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  GitBranch, Target, AlertTriangle, Zap, DollarSign,
  ChevronDown, ArrowRight, ExternalLink, Users, BookOpen,
} from 'lucide-react';
import AgentPill from './AgentPill';
import { employees } from '@/data/pages-data';
import type { Escalation } from '@/types';

// ── Priority style ─────────────────────────────────────────────────────────────

const priorityColor = {
  critical: '#f43f5e',
  high: '#f59e0b',
  medium: '#38bdf8',
  low: '#64748b',
} as const;

// ── ContextThread ──────────────────────────────────────────────────────────────
// Expandable "Pull Thread" section that appears at the bottom of escalation cards.
// Shows: linked mission → blocked agents → skill gap → financial impact

interface ContextThreadProps {
  escalation: Escalation;
}

export default function ContextThread({ escalation }: ContextThreadProps) {
  const [open, setOpen] = useState(false);

  // Resolve blocked agents
  const blockedAgents = (escalation.blockedAgentIds ?? [])
    .map((id) => employees.find((e) => e.id === id))
    .filter(Boolean) as typeof employees;

  const missionPriColor = escalation.linkedMissionPriority
    ? priorityColor[escalation.linkedMissionPriority]
    : '#64748b';

  const hasThread =
    escalation.linkedMissionTitle ||
    blockedAgents.length > 0 ||
    escalation.skillGap ||
    escalation.financialImpact;

  if (!hasThread) return null;

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full text-left group cursor-pointer"
      >
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
          style={{
            background: open ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${open ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`,
          }}
        >
          <GitBranch size={12} style={{ color: open ? '#818cf8' : '#475569' }} />
          <span
            className="text-[11px] font-medium transition-colors"
            style={{ color: open ? '#818cf8' : '#64748b' }}
          >
            Pull thread
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}
          >
            {[
              escalation.linkedMissionTitle && '1 mission',
              blockedAgents.length > 0 && `${blockedAgents.length} agent${blockedAgents.length > 1 ? 's' : ''}`,
              escalation.skillGap && '1 skill gap',
            ].filter(Boolean).join(' · ')}
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto shrink-0"
        >
          <ChevronDown size={13} style={{ color: '#475569' }} />
        </motion.div>
      </button>

      {/* Thread content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">

              {/* ── Step 1: Linked Mission ── */}
              {escalation.linkedMissionTitle && (
                <ThreadRow
                  step={1}
                  label="Blocking Mission"
                  icon={<Target size={12} style={{ color: missionPriColor }} />}
                  accentColor={missionPriColor}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase"
                        style={{
                          background: `${missionPriColor}18`,
                          color: missionPriColor,
                          border: `1px solid ${missionPriColor}25`,
                        }}
                      >
                        {escalation.linkedMissionPriority ?? 'mission'}
                      </span>
                      <span className="text-[12px] font-semibold text-white">
                        {escalation.linkedMissionTitle}
                      </span>
                    </div>
                    <Link
                      href="/missions"
                      className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 transition-colors shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open <ExternalLink size={9} />
                    </Link>
                  </div>
                </ThreadRow>
              )}

              {/* ── Step 2: Blocked Agents ── */}
              {blockedAgents.length > 0 && (
                <ThreadRow
                  step={2}
                  label="Agents Blocked"
                  icon={<Users size={12} className="text-amber-400" />}
                  accentColor="#f59e0b"
                >
                  <div className="flex flex-wrap gap-2">
                    {blockedAgents.map((emp) => (
                      <Link
                        key={emp.id}
                        href={`/agents/${emp.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-all hover:brightness-110"
                          style={{
                            background: 'rgba(245,158,11,0.06)',
                            border: '1px solid rgba(245,158,11,0.15)',
                          }}
                        >
                          <AgentPill employeeId={emp.id} size="sm" showName={true} />
                          <ArrowRight size={9} className="text-slate-600" />
                          <Link
                            href="/people"
                            className="text-[10px] text-slate-500 hover:text-slate-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            profile
                          </Link>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {blockedAgents.some((e) => e.status === 'busy') && (
                    <p className="text-[10px] text-amber-400/70 mt-1.5 flex items-center gap-1">
                      <motion.span
                        className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                      />
                      Agents are spinning — waiting on your decision
                    </p>
                  )}
                </ThreadRow>
              )}

              {/* ── Step 3: Skill Gap ── */}
              {escalation.skillGap && (
                <ThreadRow
                  step={3}
                  label="Root Cause Skill Gap"
                  icon={<Zap size={12} className="text-violet-400" />}
                  accentColor="#a78bfa"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] px-2 py-1 rounded-lg font-medium"
                      style={{ background: 'rgba(167,139,250,0.08)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.15)' }}
                    >
                      {escalation.skillGap}
                    </span>
                    <Link
                      href="/skills"
                      className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Train skill <ExternalLink size={9} />
                    </Link>
                  </div>
                </ThreadRow>
              )}

              {/* ── Step 4: Financial Impact ── */}
              {escalation.financialImpact && (
                <ThreadRow
                  step={4}
                  label="Financial Impact"
                  icon={<DollarSign size={12} className="text-rose-400" />}
                  accentColor="#f43f5e"
                  isLast
                >
                  <p className="text-[11px] text-rose-300/90 leading-relaxed">
                    {escalation.financialImpact}
                  </p>
                </ThreadRow>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ThreadRow ─────────────────────────────────────────────────────────────────

function ThreadRow({
  step,
  label,
  icon,
  accentColor,
  isLast,
  children,
}: {
  step: number;
  label: string;
  icon: React.ReactNode;
  accentColor: string;
  isLast?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      {/* Step connector */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 20 }}>
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}
        >
          {step}
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 mt-1 min-h-[12px]"
            style={{ background: `${accentColor}20` }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          {icon}
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">{label}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
