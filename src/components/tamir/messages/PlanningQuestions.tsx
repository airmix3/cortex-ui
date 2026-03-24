'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight } from 'lucide-react';
import type { FullChatMessage, PlanningQuestion } from '../chat-data';

// ── Single question input ────────────────────────────────────────────────────

function QuestionInput({
  q,
  value,
  onChange,
  index,
}: {
  q: PlanningQuestion;
  value: string;
  onChange: (v: string) => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.25 }}
      className="space-y-1.5"
    >
      <div className="flex items-center gap-1.5">
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
          style={{ background: value ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.07)', color: value ? '#34d399' : 'rgba(255,255,255,0.4)' }}
        >
          {value ? <Check size={8} strokeWidth={3} /> : index + 1}
        </span>
        <span className="text-[12px] font-semibold text-white">{q.label}</span>
      </div>

      {/* Chip options if provided */}
      {q.options && (
        <div className="flex flex-wrap gap-1.5 pl-5">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt === value ? '' : opt)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
              style={{
                background: value === opt ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${value === opt ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                color: value === opt ? '#38bdf8' : 'rgba(255,255,255,0.45)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Text input if no options (or also show for free-form) */}
      {!q.options && (
        <div className="pl-5">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.placeholder}
            className="w-full px-3 py-2 rounded-lg text-[12px] text-white placeholder-slate-600 outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
      )}

      {q.hint && !value && (
        <p className="text-[10px] text-slate-600 pl-5">{q.hint}</p>
      )}
    </motion.div>
  );
}

// ── Submitted summary view ───────────────────────────────────────────────────

function SubmittedSummary({
  questions,
  answers,
}: {
  questions: PlanningQuestion[];
  answers: Record<string, string>;
}) {
  return (
    <div className="space-y-1.5">
      {questions.map((q) => (
        <div key={q.id} className="flex gap-2">
          <Check size={10} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-500">{q.label} </span>
            <span className="text-[10px] font-semibold text-slate-300">{answers[q.id] || '—'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PlanningQuestions({
  msg,
  onSubmit,
}: {
  msg: FullChatMessage;
  onSubmit: (answers: Record<string, string>) => void;
}) {
  const questions = msg.planningQuestions ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id]?.trim());

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    onSubmit(answers);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-1.5"
    >
      {/* Tamir byline */}
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">TA</div>
        <span className="text-[11px] text-amber-400 font-medium">Tamir</span>
        <span className="text-[10px] text-slate-600">· {msg.time} · Planning mode</span>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid rgba(56,189,248,0.15)',
          maxWidth: 480,
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(56,189,248,0.04)' }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: '#38bdf8' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Planning Mode</span>
        </div>

        <div className="px-4 py-3.5 space-y-4">
          {/* Intro */}
          <p className="text-[12px] text-slate-300 leading-relaxed">{msg.content}</p>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {questions.map((q, i) => (
                  <QuestionInput
                    key={q.id}
                    q={q}
                    index={i}
                    value={answers[q.id] ?? ''}
                    onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                  />
                ))}

                {/* Submit */}
                <motion.button
                  whileHover={allAnswered ? { scale: 1.02 } : {}}
                  whileTap={allAnswered ? { scale: 0.97 } : {}}
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: allAnswered ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                    color: allAnswered ? '#0f172a' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  Generate Plan <ChevronRight size={14} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Check size={11} className="text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-semibold">Answers locked in · building your plan</span>
                </div>
                <SubmittedSummary questions={questions} answers={answers} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
