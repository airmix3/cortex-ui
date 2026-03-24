'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import Link from 'next/link';
import { Mission } from '@/types';
import { Zap, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import DeliverableChip from './DeliverableChip';
import AgentPill from '@/components/shared/AgentPill';

const flowStages = ['Created', 'Agent Work', 'Dept Review', 'CEO Review', 'Done'];
const priorityBorder: Record<string, string> = {
  critical: 'rgba(244,63,94,0.35)',
  high: 'rgba(245,158,11,0.25)',
  medium: 'rgba(255,255,255,0.12)',
  low: 'rgba(255,255,255,0.12)',
};
const priorityBadge: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'rgba(244,63,94,0.20)', text: '#fda4af' },
  high: { bg: 'rgba(245,158,11,0.20)', text: '#fcd34d' },
  medium: { bg: 'rgba(100,116,139,0.20)', text: '#94a3b8' },
  low: { bg: 'rgba(100,116,139,0.20)', text: '#64748b' },
};

const buttonConfig: Record<string, { bg: string; border: string }> = {
  'act-now': { bg: 'rgba(245,158,11,0.85)', border: 'rgba(245,158,11,0.40)' },
  'approve-decide': { bg: 'rgba(16,185,129,0.85)', border: 'rgba(16,185,129,0.40)' },
  review: { bg: 'rgba(14,165,233,0.85)', border: 'rgba(14,165,233,0.40)' },
};

// ─── AGE URGENCY ───
type AgeTier = 'fresh' | 'aging' | 'stale' | 'critical';

function parseAge(age?: string): AgeTier {
  if (!age) return 'fresh';
  const num = parseInt(age);
  if (age.endsWith('d')) return 'critical';
  if (age.endsWith('h') && num >= 6) return 'stale';
  if (age.endsWith('h') && num >= 1) return 'aging';
  return 'fresh';
}

const ageTierStyle: Record<AgeTier, { color: string; glow?: string; borderTint?: string }> = {
  fresh:    { color: '#94a3b8' },
  aging:    { color: '#fbbf24' },
  stale:    { color: '#f97316', glow: 'rgba(249,115,22,0.7)', borderTint: 'rgba(249,115,22,0.12)' },
  critical: { color: '#f43f5e', glow: 'rgba(244,63,94,0.8)', borderTint: 'rgba(244,63,94,0.15)' },
};

const secondaryBtn = {
  background: 'rgba(20,31,53,0.5)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
} as React.CSSProperties;

export default function MissionCard({
  mission,
  showIntervene,
  onComplete,
}: {
  mission: Mission;
  showIntervene?: boolean;
  onComplete?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(false);
  const btn = buttonConfig[mission.column] || buttonConfig['review'];
  const ageTier = parseAge(mission.age);
  const ageStyle = ageTierStyle[ageTier];

  function handlePrimaryAction() {
    setDone(true);
    setTimeout(() => onComplete?.(), 650);
  }

  return (
    <motion.div
      whileHover={done ? {} : { y: -2, filter: 'brightness(1.06)' }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-xl p-4 relative overflow-hidden"
      style={{
        border: done
          ? '1px solid rgba(52,211,153,0.45)'
          : `1px solid ${ageStyle.borderTint || priorityBorder[mission.priority]}`,
        backdropFilter: 'blur(12px) saturate(140%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(12px) saturate(140%) brightness(1.05)',
        ...(done
          ? { boxShadow: '0 0 20px rgba(52,211,153,0.18), inset 0 0 12px rgba(52,211,153,0.06)' }
          : ageStyle.borderTint
          ? { boxShadow: `0 0 16px ${ageStyle.borderTint}, inset 0 0 8px ${ageStyle.borderTint}` }
          : {}),
      }}
    >
      {/* ── SUCCESS OVERLAY ── */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-xl flex items-center justify-center gap-2 z-10"
            style={{ background: 'rgba(6,20,14,0.82)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">Done</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ZONE 1: WHAT ── */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-[13px] font-bold text-white leading-tight">{mission.title}</h4>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {/* L4 escalation badge */}
          {mission.linkedEscalationId && (
            <Link href="/escalations" onClick={(e) => e.stopPropagation()}>
              <motion.span
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold cursor-pointer"
                style={{
                  background: 'rgba(244,63,94,0.12)',
                  border: '1px solid rgba(244,63,94,0.25)',
                  color: '#fca5a5',
                }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                title="Active escalation blocking this mission"
              >
                <AlertTriangle size={8} />
                {mission.linkedEscalationLevel ?? 'ESC'}
              </motion.span>
            </Link>
          )}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${mission.priority === 'critical' ? 'priority-pulse' : ''}`}
            style={{
              background: priorityBadge[mission.priority].bg,
              color: priorityBadge[mission.priority].text,
            }}
          >
            {mission.priority}
          </span>
        </div>
      </div>

      {/* ── ZONE 2: WHY ── */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {mission.blocker ? (
            <>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: '#f43f5e', boxShadow: '0 0 6px rgba(244,63,94,0.8)' }}
              />
              <span className="text-[11px] text-rose-300 truncate" title={mission.blocker}>
                {mission.blocker}
              </span>
              {mission.attempts && (
                <span className="text-[10px] text-slate-500 shrink-0">&middot; {mission.attempts} retries</span>
              )}
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="text-[11px] text-amber-300/80 truncate" title={mission.ceoAction}>
                {mission.ceoAction}
              </span>
            </>
          )}
        </div>
        {mission.age && (
          <span className="flex items-center gap-1 shrink-0">
            {ageStyle.glow && (
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 priority-pulse"
                style={{ background: ageStyle.color, boxShadow: `0 0 6px ${ageStyle.glow}` }}
              />
            )}
            <span
              className="text-[10px] font-semibold tabular-nums"
              style={{ color: ageStyle.color }}
            >
              {mission.age}
            </span>
          </span>
        )}
      </div>

      {/* ── ZONE 3: ACTION ── */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handlePrimaryAction}
          disabled={done}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg"
          style={{
            background: btn.bg,
            color: '#0a0f1a',
            border: `1px solid ${btn.border}`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {mission.primaryCTA}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setExpanded(!expanded)}
          disabled={done}
          className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-400 rounded-lg transition-colors hover:text-slate-200"
          style={secondaryBtn}
        >
          Details
          <ChevronDown
            className="w-3 h-3 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </motion.button>
      </div>

      {/* ── EXPANDED DETAILS ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Escalation path */}
              <p className="text-[11px] text-slate-500">{mission.escalationPath}</p>

              {/* Full blocker alert */}
              {mission.blocker && (
                <div
                  className="text-[11px] text-rose-400 px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: 'rgba(244,63,94,0.08)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(244,63,94,0.18)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  Blocker: {mission.blocker}
                  {mission.attempts && (
                    <span className="ml-2 text-slate-500">&middot; {mission.attempts} retries</span>
                  )}
                </div>
              )}

              {/* CEO Action */}
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                style={{
                  background: 'rgba(245,158,11,0.06)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(245,158,11,0.18)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-300 font-medium">{mission.ceoAction}</span>
              </div>

              {/* Deliverables */}
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Deliverables
                </div>
                <div className="flex flex-col gap-1.5">
                  {mission.deliverables.map((d, i) => (
                    <DeliverableChip key={i} deliverable={d} />
                  ))}
                </div>
              </div>

              {/* Flow stage */}
              <div>
                <div className="flex items-center gap-0.5">
                  {flowStages.map((stage, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i < mission.flowStage
                          ? 'w-4 bg-emerald-500'
                          : i === mission.flowStage
                            ? 'w-6 bg-amber-400'
                            : 'w-4 bg-slate-700'
                      }`}
                      title={stage}
                    />
                  ))}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Stage: <span className="text-slate-300">{flowStages[mission.flowStage]}</span>
                </div>
              </div>

              {/* Touch trail — agent chain with hover cards */}
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Agent Chain
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {mission.touchTrail.map((person, i) => (
                    <div key={i} className="flex items-center gap-0.5">
                      <div className={i === mission.touchTrail.length - 1 ? 'ring-1 ring-amber-400/50 rounded-full' : 'opacity-70'}>
                        <AgentPill person={person} size="sm" showName={true} />
                      </div>
                      {i < mission.touchTrail.length - 1 && (
                        <ChevronRight className="w-2.5 h-2.5 text-slate-600" />
                      )}
                    </div>
                  ))}
                </div>
                {mission.linkedEscalationId && (
                  <Link href="/escalations" onClick={(e) => e.stopPropagation()}>
                    <div
                      className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-lg cursor-pointer hover:brightness-110 transition-all w-fit"
                      style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.15)' }}
                    >
                      <AlertTriangle size={10} className="text-rose-400" />
                      <span className="text-[10px] text-rose-300">
                        Active {mission.linkedEscalationLevel} escalation blocking this mission
                      </span>
                      <ExternalLink size={9} className="text-rose-400/60" />
                    </div>
                  </Link>
                )}
              </div>

              {/* Secondary actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-3 py-1.5 text-[11px] font-medium text-slate-400 rounded-lg transition-colors hover:text-slate-200"
                  style={secondaryBtn}
                >
                  Send Directive
                </motion.button>
                {mission.column === 'approve-decide' && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-3 py-1.5 text-[11px] font-medium text-slate-400 rounded-lg transition-colors hover:text-slate-200"
                    style={secondaryBtn}
                  >
                    Decline Hire
                  </motion.button>
                )}
                {mission.column === 'review' && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-3 py-1.5 text-[11px] font-medium text-slate-400 rounded-lg transition-colors hover:text-slate-200"
                    style={secondaryBtn}
                  >
                    Request Changes
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
