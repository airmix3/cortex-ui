'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Star, Gavel, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ThinkSession } from '@/data/think-data';

interface SessionListProps {
  sessions: ThinkSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupSessions(sessions: ThinkSession[]): { label: string; items: ThinkSession[] }[] {
  const today: ThinkSession[] = [];
  const earlier: ThinkSession[] = [];
  const now = new Date();

  for (const s of sessions) {
    const d = new Date(s.createdAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) today.push(s);
    else earlier.push(s);
  }

  const groups: { label: string; items: ThinkSession[] }[] = [];
  if (today.length) groups.push({ label: 'Today', items: today });
  if (earlier.length) groups.push({ label: 'Earlier', items: earlier });
  return groups;
}

function insightCount(session: ThinkSession): number {
  return session.messages.filter((m) => m.isBookmarked || m.capturedDecision).length;
}

const TAG_COLORS: Record<string, string> = {
  Strategy: '#a78bfa',
  Hiring: '#38bdf8',
  Product: '#34d399',
  Fundraising: '#f59e0b',
  Operations: '#64748b',
  Culture: '#f472b6',
  Marketing: '#c084fc',
  Tech: '#22d3ee',
  Partnership: '#fb923c',
  General: '#94a3b8',
};

export default function SessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  collapsed,
  onToggleCollapse,
}: SessionListProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? sessions.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.topicTag.toLowerCase().includes(search.toLowerCase())
      )
    : sessions;

  const groups = groupSessions(filtered);

  return (
    <motion.div
      className="shrink-0 flex flex-col border-r h-full"
      style={{
        width: collapsed ? 48 : 240,
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.015)',
      }}
      animate={{ width: collapsed ? 48 : 240 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-white/5 transition-colors"
        style={{ height: 40, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {collapsed ? <ChevronRight size={14} className="text-slate-500" /> : <ChevronLeft size={14} className="text-slate-500" />}
      </button>

      {collapsed ? (
        /* Collapsed: just new-session icon */
        <div className="flex flex-col items-center gap-2 pt-3">
          <button
            onClick={onNewSession}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            style={{ background: 'rgba(245,158,11,0.1)' }}
          >
            <Plus size={14} className="text-amber-400" />
          </button>
        </div>
      ) : (
        <>
          {/* New session button */}
          <button
            onClick={onNewSession}
            className="flex items-center gap-2 mx-3 mt-3 mb-2 px-3 py-2 rounded-lg cursor-pointer transition-all"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.15)',
              color: '#fbbf24',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Plus size={13} />
            New Session
          </button>

          {/* Search */}
          <div className="mx-3 mb-2 relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions..."
              className="w-full pl-7 pr-2 py-1.5 rounded-lg text-[11px] text-slate-400 placeholder:text-slate-700 outline-none"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            />
          </div>

          {/* Session list */}
          <div
            className="flex-1 overflow-y-auto px-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
          >
            <AnimatePresence>
              {groups.map((group) => (
                <div key={group.label} className="mb-3">
                  <div className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold px-2 mb-1.5">
                    {group.label}
                  </div>
                  {group.items.map((session) => {
                    const isActive = session.id === activeSessionId;
                    const count = insightCount(session);
                    const tagColor = TAG_COLORS[session.topicTag] ?? '#94a3b8';

                    return (
                      <motion.button
                        key={session.id}
                        layout
                        onClick={() => onSelectSession(session.id)}
                        className="w-full text-left px-2.5 py-2 rounded-lg mb-1 cursor-pointer transition-all"
                        style={{
                          background: isActive ? 'rgba(245,158,11,0.06)' : 'transparent',
                          borderLeft: isActive ? '2px solid #f59e0b' : '2px solid transparent',
                        }}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                      >
                        <div className="text-[11.5px] text-slate-300 font-medium truncate leading-tight">
                          {session.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              background: `${tagColor}12`,
                              color: tagColor,
                            }}
                          >
                            {session.topicTag}
                          </span>
                          <span className="text-[9px] text-slate-600">
                            {formatRelativeDate(session.createdAt)}
                          </span>
                          {count > 0 && (
                            <span className="flex items-center gap-0.5 text-[9px] text-amber-500/70 ml-auto">
                              <Star size={8} />
                              {count}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center text-slate-600 text-[11px] mt-8 px-2">
                {search ? 'No sessions match your search.' : 'No thinking sessions yet.'}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
