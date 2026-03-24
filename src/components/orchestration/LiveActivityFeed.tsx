'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, CheckCircle2, ArrowRight, AlertTriangle, Brain,
  AlertOctagon, Download, Zap, Circle,
} from 'lucide-react';
import {
  SEED_ACTIVITIES, generateActivity, activityTypeConfig,
  type LiveActivity, type ActivityType,
} from '@/data/live-feed-data';

// ── Type icon map ─────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<ActivityType, React.ElementType> = {
  start:     Play,
  complete:  CheckCircle2,
  handoff:   ArrowRight,
  escalate:  AlertTriangle,
  think:     Brain,
  block:     AlertOctagon,
  receive:   Download,
  directive: Zap,
};

// ── Relative time ─────────────────────────────────────────────────────────────

function fmtTime(secs: number): string {
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const m = Math.floor(secs / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

const FILTERS: { key: ActivityType | 'all'; label: string }[] = [
  { key: 'all',      label: 'All'       },
  { key: 'handoff',  label: 'Handoffs'  },
  { key: 'complete', label: 'Completed' },
  { key: 'block',    label: 'Blocked'   },
  { key: 'escalate', label: 'Escalated' },
];

// ── Activity row ──────────────────────────────────────────────────────────────

function ActivityRow({ activity, isNew }: { activity: LiveActivity; isNew?: boolean }) {
  const cfg = activityTypeConfig[activity.type];
  const Icon = TYPE_ICONS[activity.type];

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -16, scale: 0.97 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-2.5 py-2.5 relative"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* New flash */}
      {isNew && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          style={{ background: `${cfg.dot}` + '18' }}
        />
      )}

      {/* Agent avatar */}
      <div
        className={`w-6 h-6 rounded-full ${activity.agentColor} flex items-center justify-center text-white text-[8px] font-bold shrink-0 mt-0.5`}
      >
        {activity.agentAvatar}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {/* Type badge */}
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            <Icon size={8} />
            {cfg.label}
          </span>
          {/* Agent name */}
          <span className="text-[10px] font-medium text-slate-400 truncate">{activity.agentName}</span>
        </div>

        {/* Message */}
        <p className="text-[11px] text-slate-300 leading-relaxed">{activity.message}</p>

        {/* Handoff target */}
        {activity.toAgentName && (
          <div className="flex items-center gap-1 mt-1">
            <ArrowRight size={9} className="text-slate-600" />
            <div className={`w-3.5 h-3.5 rounded-full ${activity.toAgentColor} flex items-center justify-center text-[6px] font-bold text-white shrink-0`}>
              {activity.toAgentName[0]}
            </div>
            <span className="text-[10px] text-slate-500">{activity.toAgentName}</span>
          </div>
        )}

        {/* Mission tag */}
        {activity.missionTitle && (
          <span className="inline-block mt-1 text-[9px] text-slate-600 px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            {activity.missionTitle}
          </span>
        )}
      </div>

      {/* Timestamp */}
      <span className="text-[9px] text-slate-600 shrink-0 mt-1 tabular-nums font-mono">
        {fmtTime(activity.secsAgo)}
      </span>
    </motion.div>
  );
}

// ── Live Activity Feed ────────────────────────────────────────────────────────

interface LiveActivityFeedProps {
  filterAgentId?: string | null;
}

export default function LiveActivityFeed({ filterAgentId }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<LiveActivity[]>(SEED_ACTIVITIES);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Age all activities by 1 second every second
  useEffect(() => {
    const id = setInterval(() => {
      setActivities((prev) => prev.map((a) => ({ ...a, secsAgo: a.secsAgo + 1 })));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Generate a new activity every 5-9 seconds
  const scheduleNext = useCallback(() => {
    const delay = 5000 + Math.random() * 4000;
    timerRef.current = setTimeout(() => {
      const next = generateActivity();
      setActivities((prev) => [next, ...prev].slice(0, 60));
      setNewIds((prev) => new Set([...prev, next.id]));
      setTimeout(() => setNewIds((prev) => { const s = new Set(prev); s.delete(next.id); return s; }), 2000);
      scheduleNext();
    }, delay);
  }, []);

  useEffect(() => {
    scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [scheduleNext]);

  // Filter
  const visible = activities.filter((a) => {
    if (filterAgentId && a.agentId !== filterAgentId) return false;
    if (filter !== 'all' && a.type !== filter) return false;
    return true;
  });

  const newCount = activities.filter((a) => a.secsAgo === 0).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-3 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <motion.span
            className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Live Activity</span>
          <span className="text-[9px] text-slate-600 ml-auto">{visible.length} events</span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            const cfg = f.key !== 'all' ? activityTypeConfig[f.key as ActivityType] : null;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="px-2 py-0.5 rounded text-[9px] font-medium transition-all cursor-pointer"
                style={{
                  background: isActive ? (cfg?.bg ?? 'rgba(255,255,255,0.1)') : 'transparent',
                  color: isActive ? (cfg?.color ?? 'white') : '#475569',
                  border: `1px solid ${isActive ? (cfg?.dot ?? 'rgba(255,255,255,0.15)') + '40' : 'transparent'}`,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-3" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence initial={false}>
          {visible.slice(0, 50).map((a) => (
            <ActivityRow key={a.id} activity={a} isNew={newIds.has(a.id)} />
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 gap-2">
            <Circle size={16} className="text-slate-700" />
            <p className="text-[11px] text-slate-600">No activity matching filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
