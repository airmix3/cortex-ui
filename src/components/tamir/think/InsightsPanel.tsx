'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Star, Gavel, X, ChevronLeft, ChevronRight, Archive, Sparkles } from 'lucide-react';
import type { ThinkMessage } from '@/data/think-data';

interface InsightsPanelProps {
  messages: ThinkMessage[];
  onRemoveBookmark: (messageId: string) => void;
  onExportToVault: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const CONFIDENCE_COLORS: Record<string, { color: string; label: string }> = {
  high: { color: '#34d399', label: 'High' },
  medium: { color: '#f59e0b', label: 'Medium' },
  low: { color: '#f43f5e', label: 'Low' },
};

export default function InsightsPanel({
  messages,
  onRemoveBookmark,
  onExportToVault,
  collapsed,
  onToggleCollapse,
}: InsightsPanelProps) {
  const bookmarked = messages.filter((m) => m.isBookmarked);
  const decisions = messages.filter((m) => m.capturedDecision);
  const totalCount = bookmarked.length + decisions.length;

  return (
    <motion.div
      className="shrink-0 flex flex-col border-l h-full"
      style={{
        width: collapsed ? 48 : 280,
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.015)',
      }}
      animate={{ width: collapsed ? 48 : 280 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Toggle */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-white/5 transition-colors"
        style={{ height: 40, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {collapsed ? (
          <ChevronLeft size={14} className="text-slate-500" />
        ) : (
          <ChevronRight size={14} className="text-slate-500" />
        )}
      </button>

      {collapsed ? (
        /* Collapsed: just a count badge */
        <div className="flex flex-col items-center gap-3 pt-4">
          {totalCount > 0 && (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}
            >
              {totalCount}
            </div>
          )}
          <Star size={14} className="text-slate-600" />
          <Gavel size={14} className="text-slate-600" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 shrink-0">
            <Sparkles size={13} className="text-amber-400" />
            <span className="text-[12px] font-semibold text-slate-300">Session Insights</span>
            {totalCount > 0 && (
              <span
                className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}
              >
                {totalCount}
              </span>
            )}
          </div>

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto px-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
          >
            {totalCount === 0 ? (
              <div className="text-center mt-12 px-4">
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  Bookmark insights with <Star size={10} className="inline text-amber-400/50" /> and capture decisions with <Gavel size={10} className="inline text-violet-400/50" /> as they emerge in conversation.
                </div>
              </div>
            ) : (
              <>
                {/* Bookmarks section */}
                {bookmarked.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Star size={10} className="text-amber-400" />
                      <span className="text-[9px] uppercase tracking-widest text-amber-400/70 font-semibold">
                        Bookmarks ({bookmarked.length})
                      </span>
                    </div>
                    <AnimatePresence>
                      {bookmarked.map((msg) => (
                        <motion.div
                          key={msg.id}
                          layout
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="rounded-lg px-2.5 py-2 mb-1.5 group relative"
                          style={{
                            background: 'rgba(245,158,11,0.04)',
                            border: '1px solid rgba(245,158,11,0.1)',
                          }}
                        >
                          <div className="text-[10.5px] text-slate-400 leading-relaxed line-clamp-3">
                            {msg.content.slice(0, 140)}{msg.content.length > 140 ? '...' : ''}
                          </div>
                          <div className="text-[8.5px] text-slate-600 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <button
                            onClick={() => onRemoveBookmark(msg.id)}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-0.5 rounded cursor-pointer transition-opacity hover:bg-white/10"
                          >
                            <X size={10} className="text-slate-500" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Decisions section */}
                {decisions.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Gavel size={10} className="text-violet-400" />
                      <span className="text-[9px] uppercase tracking-widest text-violet-400/70 font-semibold">
                        Decisions ({decisions.length})
                      </span>
                    </div>
                    <AnimatePresence>
                      {decisions.map((msg) => {
                        const d = msg.capturedDecision!;
                        const conf = CONFIDENCE_COLORS[d.confidence];
                        return (
                          <motion.div
                            key={msg.id}
                            layout
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="rounded-lg px-2.5 py-2 mb-1.5"
                            style={{
                              background: 'rgba(139,92,246,0.04)',
                              border: '1px solid rgba(139,92,246,0.1)',
                            }}
                          >
                            <div className="flex items-start gap-1.5">
                              <div className="text-[11px] text-slate-300 font-medium flex-1 leading-snug">
                                {d.title}
                              </div>
                              <span
                                className="shrink-0 w-2 h-2 rounded-full mt-1"
                                style={{ background: conf.color }}
                                title={`${conf.label} confidence`}
                              />
                            </div>
                            {d.rationale && (
                              <div className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                                {d.rationale}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Export to Vault */}
          {decisions.length > 0 && (
            <div className="shrink-0 px-3 pb-3">
              <button
                onClick={onExportToVault}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium cursor-pointer transition-all"
                style={{
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  color: '#c4b5fd',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139,92,246,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139,92,246,0.08)';
                }}
              >
                <Archive size={12} />
                Export {decisions.length} decision{decisions.length > 1 ? 's' : ''} to Vault
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
