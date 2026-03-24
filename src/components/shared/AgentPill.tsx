'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Target, Zap } from 'lucide-react';
import { employees } from '@/data/pages-data';
import type { Person } from '@/types';

// ── Status config ──────────────────────────────────────────────────────────────

const statusConfig = {
  active:     { color: '#34d399', label: 'Active',   pulse: false },
  busy:       { color: '#f59e0b', label: 'Busy',     pulse: true  },
  idle:       { color: '#64748b', label: 'Idle',     pulse: false },
  terminated: { color: '#f43f5e', label: 'Offline',  pulse: false },
} as const;

// ── AgentPill ─────────────────────────────────────────────────────────────────
// Accepts either a Person (name-matched to employees) or a direct employeeId.
// Hover shows a floating tooltip with status, current task, mission, escalation.

interface AgentPillProps {
  person?: Person;
  employeeId?: string;
  size?: 'sm' | 'md';
  showName?: boolean;
  className?: string;
}

export default function AgentPill({
  person,
  employeeId,
  size = 'md',
  showName = true,
  className = '',
}: AgentPillProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Resolve employee by id or by name match
  const emp =
    employeeId
      ? employees.find((e) => e.id === employeeId)
      : person
      ? employees.find((e) => e.name === person.name)
      : undefined;

  const display = emp ?? person;
  if (!display) return null;

  const st = emp ? (statusConfig[emp.status as keyof typeof statusConfig] ?? statusConfig.idle) : null;

  const avatarSize = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[10px]';
  const nameSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  const handleMouseEnter = useCallback(() => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setPos({ x: rect.left, y: rect.bottom + 6 });
    }
  }, []);

  const handleMouseLeave = useCallback(() => setPos(null), []);

  return (
    <>
      <div
        ref={ref}
        className={`inline-flex items-center gap-1.5 ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: emp ? 'pointer' : 'default' }}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className={`${avatarSize} rounded-full ${display.color} flex items-center justify-center font-bold text-white ring-1 ring-white/10`}
          >
            {display.avatar}
          </div>
          {st && (
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0a0f1a]"
              style={{ backgroundColor: st.color }}
            />
          )}
        </div>

        {/* Name */}
        {showName && (
          <span className={`${nameSize} font-medium text-slate-300 whitespace-nowrap`}>
            {display.name}
          </span>
        )}
      </div>

      {/* ── Floating tooltip ── */}
      <AnimatePresence>
        {pos && emp && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[9999] w-[260px] rounded-xl p-3.5 pointer-events-none"
            style={{
              left: Math.min(pos.x, window.innerWidth - 276),
              top: pos.y,
              background: 'rgba(8,14,28,0.97)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className={`w-8 h-8 rounded-full ${emp.color} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}
              >
                {emp.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold text-white truncate">{emp.name}</p>
                  {/* Status dot + label */}
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
                    style={{ background: `${st!.color}18`, color: st!.color }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: st!.color }}
                    />
                    {st!.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{emp.role} · {emp.department}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06] mb-2.5" />

            {/* Current task */}
            {emp.currentTask && (
              <div className="mb-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Current Task
                </p>
                <div className="flex items-start gap-1.5">
                  {emp.status === 'busy' && (
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-[3px]"
                      style={{ background: st!.color }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  )}
                  <p className="text-[11px] text-slate-300 leading-relaxed">{emp.currentTask}</p>
                </div>
              </div>
            )}

            {/* Linked mission */}
            {emp.currentMissionId && emp.currentMissionTitle && (
              <div className="mb-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Active Mission
                </p>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.12)' }}>
                  <Target size={10} className="text-sky-400 shrink-0" />
                  <span className="text-[11px] text-sky-300 truncate">{emp.currentMissionTitle}</span>
                </div>
              </div>
            )}

            {/* Linked escalation */}
            {emp.linkedEscalationId && (
              <div className="mb-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Active Escalation
                </p>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.15)' }}>
                  <AlertTriangle size={10} className="text-rose-400 shrink-0" />
                  <span className="text-[11px] text-rose-300">Escalation {emp.linkedEscalationId.toUpperCase()} blocking this agent</span>
                </div>
              </div>
            )}

            {/* Footer: tasks done + profile link hint */}
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/[0.05]">
              <span className="text-[10px] text-slate-600">{emp.tasksCompleted} tasks completed</span>
              <div className="flex items-center gap-1 text-[10px] text-sky-500/70">
                <Zap size={9} />
                <span>View profile →</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
