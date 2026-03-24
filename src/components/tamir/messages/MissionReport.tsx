'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Wrench, Check, X, ChevronDown, ChevronUp, MessageSquarePlus } from 'lucide-react';
import type { FullChatMessage, MissionEvaluation, SystemLearning, LearningType, LearningStatus } from '../chat-data';

// ── Grade helpers ────────────────────────────────────────────────────────────

function gradeLabel(g: number) {
  if (g >= 9) return { letter: 'A', label: 'Excellent', color: '#34d399' };
  if (g >= 7) return { letter: 'B', label: 'Strong',    color: '#38bdf8' };
  if (g >= 5) return { letter: 'C', label: 'Adequate',  color: '#f59e0b' };
  return             { letter: 'D', label: 'Needs work', color: '#f43f5e' };
}

// ── Learning type config ─────────────────────────────────────────────────────

const learningConfig: Record<LearningType, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  'workflow-memory': { icon: Brain,    label: 'Workflow Memory',  color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  'new-skill':       { icon: Sparkles, label: 'New Skill',        color: '#38bdf8', bg: 'rgba(56,189,248,0.08)'  },
  'mcp-tool':        { icon: Wrench,   label: 'MCP Tool Request', color: '#34d399', bg: 'rgba(52,211,153,0.08)'  },
};

// ── Evaluation card ──────────────────────────────────────────────────────────

function EvalCard({ ev }: { ev: MissionEvaluation }) {
  const [expanded, setExpanded] = useState(false);
  const { letter, label, color } = gradeLabel(ev.grade);
  const isCEO = ev.evaluatorName === 'You';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3.5"
      style={{
        background: isCEO ? `${color}08` : 'rgba(255,255,255,0.03)',
        border: isCEO ? `1px solid ${color}22` : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Evaluator header */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-6 h-6 rounded-full ${ev.evaluatorColor} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
          {ev.evaluatorAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[12px] font-semibold text-white">{ev.evaluatorName}</span>
          <span className="text-[10px] text-slate-600 ml-1.5">{ev.evaluatorRole}</span>
          {isCEO && <span className="text-[9px] text-amber-400 ml-1.5 font-bold">· your review</span>}
        </div>
        <div
          className="w-9 h-9 rounded-xl flex flex-col items-center justify-center shrink-0"
          style={{ background: `${color}14`, border: `1px solid ${color}30` }}
        >
          <span className="text-[14px] font-black leading-none" style={{ color }}>{letter}</span>
          <span className="text-[8px] font-bold" style={{ color: `${color}99` }}>{ev.grade}/10</span>
        </div>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: `${color}bb` }}>{label}</p>
      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{ev.summary}</p>

      {ev.dimensions.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {expanded ? 'Hide' : 'Show'} breakdown
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2 space-y-1.5"
              >
                {ev.dimensions.map((d) => {
                  const { color: dc } = gradeLabel(d.score);
                  return (
                    <div key={d.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 w-24 shrink-0">{d.label}</span>
                      <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div className="h-full rounded-full" style={{ background: dc }}
                          initial={{ width: 0 }} animate={{ width: `${d.score * 10}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }} />
                      </div>
                      <span className="text-[10px] text-slate-500 w-4 text-right shrink-0">{d.score}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

// ── CEO feedback form ─────────────────────────────────────────────────────────

const GRADE_OPTIONS = [
  { letter: 'A', value: 9, color: '#34d399' },
  { letter: 'B', value: 7, color: '#38bdf8' },
  { letter: 'C', value: 5, color: '#f59e0b' },
  { letter: 'D', value: 3, color: '#f43f5e' },
];

function CEOFeedbackSection({ onSubmit }: { onSubmit: (ev: MissionEvaluation) => void }) {
  const [open, setOpen]       = useState(false);
  const [grade, setGrade]     = useState<number>(7);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!comment.trim()) return;
    onSubmit({
      evaluatorName:   'You',
      evaluatorAvatar: 'CE',
      evaluatorColor:  'bg-amber-500',
      evaluatorRole:   'CEO · Your evaluation',
      grade,
      summary:         comment.trim(),
      dimensions:      [],
    });
    setSubmitted(true);
    setOpen(false);
  };

  if (submitted) return null;

  return (
    <div>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="trigger"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <MessageSquarePlus size={11} />
            Add your review
          </motion.button>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="rounded-xl p-3.5 space-y-3"
            style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.18)' }}
          >
            {/* Grade picker */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Your grade</p>
              <div className="flex gap-1.5">
                {GRADE_OPTIONS.map((opt) => (
                  <button
                    key={opt.letter}
                    onClick={() => setGrade(opt.value)}
                    className="w-10 h-10 rounded-xl flex flex-col items-center justify-center font-black text-[15px] transition-all cursor-pointer"
                    style={{
                      background: grade === opt.value ? `${opt.color}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${grade === opt.value ? opt.color : 'rgba(255,255,255,0.09)'}`,
                      color: grade === opt.value ? opt.color : '#64748b',
                    }}
                  >
                    {opt.letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Your feedback</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What worked, what didn't, what you'd change..."
                rows={3}
                className="w-full text-[12px] text-white placeholder-slate-600 resize-none rounded-lg px-3 py-2 outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!comment.trim()}
                className="flex-1 py-1.5 rounded-lg text-[12px] font-bold text-slate-900 cursor-pointer disabled:opacity-40"
                style={{ background: '#f59e0b' }}
              >
                Submit review
              </motion.button>
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Learning card ────────────────────────────────────────────────────────────

function LearningCard({ learning }: { learning: SystemLearning }) {
  const [status, setStatus] = useState<LearningStatus>('proposed');
  const cfg  = learningConfig[learning.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      animate={{ opacity: status === 'dismissed' ? 0.35 : 1 }}
      className="rounded-xl p-3 flex gap-3"
      style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}>
        <Icon size={13} style={{ color: cfg.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
          <span className="text-[9px] text-slate-600">· proposed by {learning.proposedBy}</span>
        </div>
        <p className="text-[12px] font-semibold text-white mb-0.5">{learning.title}</p>
        <p className="text-[11px] text-slate-400 leading-relaxed">{learning.description}</p>

        <AnimatePresence mode="wait">
          {status === 'proposed' && (
            <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex gap-1.5 mt-2.5">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setStatus('committed')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer"
                style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
                <Check size={9} /> Commit to system
              </motion.button>
              <button onClick={() => setStatus('dismissed')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                <X size={9} /> Dismiss
              </button>
            </motion.div>
          )}
          {status === 'committed' && (
            <motion.div key="committed" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 mt-2.5">
              <Check size={10} style={{ color: cfg.color }} />
              <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>Committed · will load next mission</span>
            </motion.div>
          )}
          {status === 'dismissed' && (
            <motion.p key="dismissed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[10px] text-slate-600 mt-2 line-through">Dismissed</motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function MissionReport({ msg }: { msg: FullChatMessage }) {
  const report = msg.missionReport!;
  const [evaluations, setEvaluations] = useState<MissionEvaluation[]>(report.evaluations);

  const avgGrade = Math.round(evaluations.reduce((s, e) => s + e.grade, 0) / evaluations.length);
  const { letter, label, color } = gradeLabel(avgGrade);
  const hasCEOReview = evaluations.some((e) => e.evaluatorName === 'You');

  const handleCEOSubmit = (ev: MissionEvaluation) => {
    setEvaluations((prev) => [...prev, ev]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-1.5"
    >
      {/* Tamir byline */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-amber-400 font-medium">Tamir</span>
        <span className="text-[10px] text-slate-600">· {msg.time} · Mission report</span>
      </div>

      {/* Card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.08)', maxWidth: 520 }}>

        {/* Header — grade updates dynamically when CEO submits */}
        <div className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Mission Review</p>
            <p className="text-[13px] font-bold text-white truncate">{report.goal}</p>
          </div>
          <motion.div
            key={letter}
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0"
            style={{ background: `${color}10`, border: `1px solid ${color}25` }}
          >
            <span className="text-[24px] font-black leading-none" style={{ color }}>{letter}</span>
            <span className="text-[9px] font-bold text-slate-500">{label}</span>
          </motion.div>
        </div>

        {/* Evaluations */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Evaluations</p>
          <div className="space-y-2">
            {evaluations.map((ev) => (
              <EvalCard key={ev.evaluatorName} ev={ev} />
            ))}
          </div>

          {/* CEO feedback form — only show if CEO hasn't reviewed yet */}
          {!hasCEOReview && (
            <div className="mt-2 mb-1">
              <CEOFeedbackSection onSubmit={handleCEOSubmit} />
            </div>
          )}
        </div>

        {/* System learnings */}
        <div className="px-4 pt-3 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">System Learnings</p>
          <div className="space-y-2">
            {report.learnings.map((l) => (
              <LearningCard key={l.id} learning={l} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
