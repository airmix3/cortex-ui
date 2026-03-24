'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { missions as allMissions } from '@/data/mock-data';
import { Shield, ScanEye, CheckCircle2 } from 'lucide-react';
import MissionColumn from './MissionColumn';

export default function MissionBoard({ focusMode }: { focusMode?: boolean }) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [decisionsToday, setDecisionsToday] = useState(0);

  function handleComplete(id: string) {
    setCompletedIds((prev) => [...prev, id]);
    setDecisionsToday((prev) => prev + 1);
  }

  const visible = allMissions.filter((m) => !completedIds.includes(m.id));
  // Focus mode: only show the single most critical mission across all columns
  const focusVisible = focusMode
    ? visible
        .slice()
        .sort((a, b) => {
          const order = { critical: 0, high: 1, medium: 2, low: 3 };
          return order[a.priority] - order[b.priority];
        })
        .slice(0, 1)
    : visible;

  const actNow = focusVisible.filter((m) => m.column === 'act-now');
  const approveDecide = focusVisible.filter((m) => m.column === 'approve-decide');
  const review = focusVisible.filter((m) => m.column === 'review');
  const totalPending = actNow.length + approveDecide.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-full rounded-2xl overflow-hidden relative"
      style={{
        background: 'rgba(8,14,32,0.50)',
        backdropFilter: 'blur(20px) saturate(150%) brightness(1.06)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%) brightness(1.06)',
        border: '1.5px solid rgba(56,189,248,0.40)',
        boxShadow:
          '0 0 0 1px rgba(56,189,248,0.15), ' +
          '0 0 24px rgba(56,189,248,0.18), ' +
          '0 0 60px rgba(56,189,248,0.08), ' +
          '0 12px 48px rgba(0,0,0,0.5), ' +
          'inset 0 1px 0 rgba(255,255,255,0.14)',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-10"
        style={{
          background: 'linear-gradient(90deg, rgba(56,189,248,0.0) 0%, rgba(56,189,248,0.80) 30%, rgba(245,158,11,0.60) 70%, rgba(56,189,248,0.0) 100%)',
        }}
      />

      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-4 px-5 py-3"
        style={{
          background: 'linear-gradient(180deg, rgba(6,12,28,0.85) 0%, rgba(8,16,36,0.70) 100%)',
          borderBottom: '1px solid rgba(56,189,248,0.14)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0.06) 100%)',
            border: '1px solid rgba(56,189,248,0.35)',
            boxShadow: '0 0 16px rgba(56,189,248,0.20), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}
        >
          <ScanEye className="w-5 h-5 text-sky-300" />
        </div>

        {/* Title */}
        <div
          className="text-base font-bold tracking-tight shrink-0"
          style={{
            background: 'linear-gradient(90deg, #e0f2fe 0%, #7dd3fc 50%, #bae6fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Attention Center
        </div>

        {/* Divider */}
        <div className="w-px h-5 shrink-0" style={{ background: 'rgba(56,189,248,0.18)' }} />

        {/* Count pills */}
        <div className="flex items-center gap-1.5">
          {[
            { count: actNow.length, label: 'Act Now', color: 'rgba(245,158,11,0.85)', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.22)' },
            { count: approveDecide.length, label: 'Decide', color: 'rgba(56,189,248,0.90)', bg: 'rgba(56,189,248,0.10)', border: 'rgba(56,189,248,0.22)' },
            { count: review.length, label: 'Review', color: 'rgba(52,211,153,0.90)', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
          ].map(({ count, label, color, bg, border }) => (
            <motion.div
              key={label}
              layout
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <motion.span
                key={count}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="text-sm font-bold tabular-nums"
                style={{ color }}
              >
                {count}
              </motion.span>
              <span className="text-[11px] text-slate-400">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Decisions made today counter */}
        <AnimatePresence>
          {decisionsToday > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0"
              style={{
                background: 'rgba(52,211,153,0.10)',
                border: '1px solid rgba(52,211,153,0.25)',
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <motion.span
                key={decisionsToday}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="text-sm font-bold tabular-nums text-emerald-400"
              >
                {decisionsToday}
              </motion.span>
              <span className="text-[11px] text-emerald-500/70">
                {decisionsToday === 1 ? 'decision' : 'decisions'} made
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending urgency signal */}
        {totalPending > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: '#fbbf24', boxShadow: '0 0 6px rgba(251,191,36,0.9)' }}
            />
            <span className="text-[11px] font-medium text-amber-400/70 whitespace-nowrap">
              {totalPending} pending
            </span>
          </div>
        )}

        {/* Directive button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.95) 0%, rgba(234,130,8,0.95) 100%)',
            color: '#0a0f1a',
            border: '1px solid rgba(245,158,11,0.60)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 16px rgba(245,158,11,0.30)',
          }}
        >
          <Shield className="w-3.5 h-3.5" />
          Send Directive
        </motion.button>
      </div>

      {/* Mission Columns */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        <div className="grid grid-cols-3 gap-3 h-full">
          <MissionColumn columnKey="act-now" missions={actNow} onComplete={handleComplete} />
          <MissionColumn columnKey="approve-decide" missions={approveDecide} onComplete={handleComplete} />
          <MissionColumn columnKey="review" missions={review} onComplete={handleComplete} />
        </div>
      </div>
    </motion.div>
  );
}
