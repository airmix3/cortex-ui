'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import AppShell from '@/components/layout/AppShell';
import TopNav from '@/components/layout/TopNav';
import { INBOX_ITEMS, type InboxItem, type InboxSource, type InboxPriority } from '@/data/tamir-data';
import {
  Mail, Hash, Zap, AlertTriangle, ChevronRight, Sparkles,
  Star, CheckCheck, Circle, Filter, ArrowRight, Brain,
  Clock, MessageSquare,
} from 'lucide-react';

// ── Config ────────────────────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<InboxSource, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  email: { icon: Mail,         label: 'Email',  color: '#38bdf8', bg: 'rgba(56,189,248,0.08)'  },
  slack: { icon: Hash,         label: 'Slack',  color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  agent: { icon: Brain,        label: 'Agent',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
};

const PRIORITY_CONFIG: Record<InboxPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: 'Urgent', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)'   },
  high:   { label: 'High',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  normal: { label: 'Normal', color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
  low:    { label: 'Low',    color: '#334155', bg: 'rgba(51,65,85,0.08)'    },
};

type FilterKey = 'all' | InboxSource | InboxPriority;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',    label: 'All'    },
  { key: 'urgent', label: 'Urgent' },
  { key: 'email',  label: 'Email'  },
  { key: 'slack',  label: 'Slack'  },
  { key: 'agent',  label: 'Agent'  },
];

// ── Inbox Item Row ────────────────────────────────────────────────────────────

function InboxRow({ item, isSelected, onClick }: {
  item: InboxItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const src = SOURCE_CONFIG[item.source];
  const SrcIcon = src.icon;
  const pri = PRIORITY_CONFIG[item.priority];
  const isUnread = item.status === 'unread';
  const isFlagged = item.status === 'flagged';

  return (
    <motion.div
      layout
      onClick={onClick}
      className="rounded-xl border cursor-pointer transition-all overflow-hidden"
      style={{
        background: isSelected
          ? 'rgba(245,158,11,0.04)'
          : isUnread
            ? 'rgba(255,255,255,0.025)'
            : 'var(--bg-card)',
        borderColor: isSelected
          ? 'rgba(245,158,11,0.2)'
          : isFlagged
            ? 'rgba(244,63,94,0.2)'
            : isUnread
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(255,255,255,0.05)',
      }}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Unread dot */}
        <div className="mt-1.5 shrink-0">
          {isUnread ? (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 block" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-transparent block" />
          )}
        </div>

        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full ${item.fromColor} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
          {item.fromAvatar.length > 1 ? item.fromAvatar.slice(0, 2) : item.fromAvatar}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[12px] font-semibold ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                {item.from}
              </span>
              <span className="text-[9px] text-slate-600">{item.fromRole}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Priority badge */}
              {item.priority !== 'normal' && item.priority !== 'low' && (
                <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: pri.bg, color: pri.color }}>
                  {pri.label}
                </span>
              )}
              {/* Source badge */}
              <span className="flex items-center gap-0.5 text-[8px] font-medium px-1.5 py-0.5 rounded"
                style={{ background: src.bg, color: src.color }}>
                <SrcIcon size={7} />
                {src.label}
              </span>
              {/* Time */}
              <span className="text-[9px] text-slate-600 font-mono">{item.receivedAt}</span>
              {isFlagged && <Star size={10} className="text-rose-400" />}
            </div>
          </div>

          <p className={`text-[11px] mb-0.5 ${isUnread ? 'font-medium text-slate-200' : 'text-slate-400'}`}>
            {item.subject}
          </p>
          <p className="text-[10px] text-slate-600 truncate">{item.preview}</p>
        </div>

        <ChevronRight
          size={12}
          className="text-slate-600 shrink-0 mt-1 transition-transform duration-200"
          style={{ transform: isSelected ? 'rotate(90deg)' : 'none' }}
        />
      </div>

      {/* Expanded: Tamir's digest + actions */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="px-4 py-3 space-y-3">
              {/* Full body */}
              {item.fullBody && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Original message</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line">{item.fullBody}</p>
                </div>
              )}

              {/* Tamir's summary */}
              <div className="flex items-start gap-2.5 rounded-lg p-3"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5">
                  T
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wider mb-1">Tamir's read</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-2">{item.tamirSummary}</p>
                  <div className="flex items-start gap-1.5">
                    <ArrowRight size={9} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-300/80 leading-snug">{item.tamirAction}</p>
                  </div>
                </div>
              </div>

              {/* Mission/escalation links */}
              {(item.linkedMissionTitle || item.linkedEscalationId) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {item.linkedMissionTitle && (
                    <span className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(56,189,248,0.07)', color: '#7dd3fc', border: '1px solid rgba(56,189,248,0.15)' }}>
                      <Zap size={8} /> {item.linkedMissionTitle}
                    </span>
                  )}
                  {item.linkedEscalationId && (
                    <Link href="/escalations">
                      <span className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg cursor-pointer"
                        style={{ background: 'rgba(244,63,94,0.07)', color: '#fca5a5', border: '1px solid rgba(244,63,94,0.15)' }}>
                        <AlertTriangle size={8} /> {item.linkedEscalationId.toUpperCase()} escalation
                      </span>
                    </Link>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/tamir?msg=${item.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <Sparkles size={10} /> Ask Tamir about this
                </Link>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <CheckCheck size={10} /> Mark actioned
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────

function InboxStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className="text-[20px] font-bold" style={{ color }}>{value}</p>
      <p className="text-[9px] text-slate-600">{label}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InboxPage() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return INBOX_ITEMS;
    if (activeFilter === 'urgent') return INBOX_ITEMS.filter(i => i.priority === 'urgent');
    if (activeFilter === 'email' || activeFilter === 'slack' || activeFilter === 'agent') {
      return INBOX_ITEMS.filter(i => i.source === activeFilter);
    }
    return INBOX_ITEMS;
  }, [activeFilter]);

  const urgentCount = INBOX_ITEMS.filter(i => i.priority === 'urgent').length;
  const unreadCount = INBOX_ITEMS.filter(i => i.status === 'unread').length;
  const actionableCount = INBOX_ITEMS.filter(i => i.tamirAction && i.status !== 'actioned').length;

  return (
    <AppShell>
      {/* Ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          top: '35%', left: '45%', transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </div>

      <TopNav />

      <div className="flex-1 min-h-0 flex gap-4 px-5 py-4 relative z-10 overflow-hidden">

        {/* ── Left sidebar ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="w-[220px] shrink-0 flex flex-col gap-3"
        >
          {/* Stats */}
          <div className="rounded-xl border px-4 py-3"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-1.5 mb-3">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-amber-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Tamir's Digest</span>
            </div>
            <div className="flex justify-between">
              <InboxStat label="unread"     value={unreadCount}    color="#38bdf8" />
              <InboxStat label="urgent"     value={urgentCount}    color="#f43f5e" />
              <InboxStat label="actionable" value={actionableCount} color="#f59e0b" />
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-xl border px-3 py-3"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-2 px-1">Filter</p>
            {FILTERS.map(f => {
              const isActive = activeFilter === f.key;
              const count = f.key === 'all'
                ? INBOX_ITEMS.length
                : f.key === 'urgent'
                  ? INBOX_ITEMS.filter(i => i.priority === 'urgent').length
                  : INBOX_ITEMS.filter(i => i.source === f.key).length;

              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer mb-0.5"
                  style={{
                    background: isActive ? 'rgba(245,158,11,0.08)' : 'transparent',
                    color: isActive ? '#f59e0b' : '#64748b',
                  }}
                >
                  <span>{f.label}</span>
                  <span className="text-[9px] rounded px-1 py-0.5"
                    style={{ background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', color: isActive ? '#f59e0b' : '#475569' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ask Tamir */}
          <div className="rounded-xl border px-4 py-3"
            style={{ background: 'rgba(245,158,11,0.03)', borderColor: 'rgba(245,158,11,0.1)' }}>
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-[11px] font-bold mx-auto mb-2">
              T
            </div>
            <p className="text-[10px] text-slate-400 text-center leading-snug mb-2">
              Tamir has already read and triaged all {INBOX_ITEMS.length} items
            </p>
            <Link
              href="/tamir"
              className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <Sparkles size={9} /> Ask about inbox
            </Link>
          </div>
        </motion.div>

        {/* ── Main: inbox list ── */}
        <div className="flex-1 min-w-0 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between mb-3"
          >
            <div>
              <h2 className="text-[16px] font-bold text-white">Inbox</h2>
              <p className="text-[11px] text-slate-500">
                Tamir has triaged {INBOX_ITEMS.length} items · {unreadCount} unread
              </p>
            </div>
            <span className="text-[10px] text-slate-600">
              {filtered.length} showing
            </span>
          </motion.div>

          {/* Items */}
          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <InboxRow
                    item={item}
                    isSelected={selectedItem === item.id}
                    onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <CheckCheck size={20} className="text-slate-700" />
                <p className="text-[12px] text-slate-600">No items matching filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
