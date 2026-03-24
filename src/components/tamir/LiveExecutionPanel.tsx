'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, FileText, Lock, Zap, List, GitBranch } from 'lucide-react';
import type { DispatchStep } from './chat-data';
import CampaignFlowDiagram from './CampaignFlowDiagram';

// ── Compact step row ─────────────────────────────────────────────────────────

function StepRow({
  step,
  onApprove,
  onRedirect,
}: {
  step: DispatchStep;
  onApprove: () => void;
  onRedirect: (note: string) => void;
}) {
  const [showRedirect, setShowRedirect] = useState(false);
  const [redirectNote, setRedirectNote] = useState('');

  if (step.requiresCEOApproval) {
    if (step.status === 'done') {
      return (
        <div className="flex items-center gap-1.5 py-1 opacity-50">
          <Check size={9} className="text-emerald-400 shrink-0" />
          <span className="text-[10px] text-slate-400">You approved</span>
        </div>
      );
    }
    if (step.status === 'rejected') {
      return (
        <div className="flex items-center gap-1.5 py-1 opacity-50">
          <span className="text-[10px] text-amber-400">↩</span>
          <span className="text-[10px] text-slate-400 truncate">Redirected</span>
        </div>
      );
    }
    if (step.status === 'pending') {
      return (
        <div className="flex items-center gap-1.5 py-1 opacity-30">
          <Lock size={8} className="text-slate-500 shrink-0" />
          <span className="text-[10px] text-slate-500 truncate">{step.approvalPrompt}</span>
        </div>
      );
    }

    // awaiting-approval — full inline gate
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-2 rounded-lg border p-2.5"
        style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.3)' }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: '#f59e0b' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Approval Needed</span>
        </div>
        <p className="text-[11px] font-semibold text-white mb-1 leading-snug">{step.approvalPrompt}</p>
        {step.detail && !showRedirect && (
          <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">{step.detail}</p>
        )}

        <AnimatePresence mode="wait">
          {!showRedirect ? (
            <motion.div key="btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-1.5">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={onApprove}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-slate-900 cursor-pointer"
                style={{ background: '#f59e0b' }}
              >
                Approve →
              </motion.button>
              <button
                onClick={() => setShowRedirect(true)}
                className="px-2 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 transition-colors border cursor-pointer shrink-0"
                style={{ borderColor: 'rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)' }}
              >
                Change
              </button>
            </motion.div>
          ) : (
            <motion.div key="redirect" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5">
              <textarea
                value={redirectNote}
                onChange={(e) => setRedirectNote(e.target.value)}
                placeholder="What should change?"
                className="w-full px-2 py-1.5 rounded-lg text-[11px] text-slate-200 placeholder-slate-600 resize-none outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', height: 56 }}
                autoFocus
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => { onRedirect(redirectNote); setShowRedirect(false); setRedirectNote(''); }}
                  className="flex-1 py-1 rounded-lg text-[10px] font-semibold text-amber-300 cursor-pointer"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
                >
                  Send
                </button>
                <button
                  onClick={() => { setShowRedirect(false); setRedirectNote(''); }}
                  className="px-2 py-1 rounded-lg text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Regular work step
  const dotColor = step.status === 'done' ? '#34d399' : step.status === 'in-progress' ? '#38bdf8' : '#1e293b';

  return (
    <motion.div
      animate={{ opacity: step.status === 'pending' ? 0.3 : 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-2 py-1"
    >
      <div className="relative mt-[3px] shrink-0">
        <div
          className="w-2 h-2 rounded-full border"
          style={{
            backgroundColor: step.status === 'pending' ? 'transparent' : dotColor,
            borderColor: dotColor,
          }}
        />
        {step.status === 'in-progress' && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: dotColor }}
            animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
        {step.status === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Check size={6} style={{ color: '#022c22' }} strokeWidth={3.5} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <div className={`w-3.5 h-3.5 rounded-full ${step.agentColor} flex items-center justify-center text-[7px] font-bold text-white shrink-0`}>
            {step.agentAvatar}
          </div>
          <span className="text-[11px] font-medium text-white truncate">{step.agentName}</span>
          <span className="text-[9px] text-slate-600 shrink-0">· {step.department}</span>
          {step.status === 'in-progress' && (
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="ml-auto text-[9px] text-sky-400 font-medium shrink-0"
            >
              working
            </motion.span>
          )}
          {step.status === 'done' && step.deliverable && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-auto flex items-center gap-0.5 shrink-0"
            >
              <FileText size={7} className="text-emerald-400" />
              <span className="text-[9px] text-emerald-400">{step.deliverable}</span>
            </motion.div>
          )}
        </div>
        {step.status === 'in-progress' && (
          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed truncate">{step.action}</p>
        )}
      </div>
    </motion.div>
  );
}

// ── Main panel ───────────────────────────────────────────────────────────────

export default function LiveExecutionPanel({
  goal,
  steps,
  onAdvance,
  onRedirect,
  onClose,
}: {
  goal: string;
  steps: DispatchStep[];
  onAdvance: (index: number) => void;
  onRedirect: (index: number, note: string) => void;
  onClose: () => void;
}) {
  const [view, setView] = useState<'list' | 'flow'>('list');

  const workSteps = steps.filter((s) => !s.requiresCEOApproval);
  const doneWork = workSteps.filter((s) => s.status === 'done').length;
  const progress = workSteps.length > 0 ? (doneWork / workSteps.length) * 100 : 0;
  const allDone = doneWork === workSteps.length && workSteps.length > 0;
  const hasActiveStep = steps.some((s) => s.status === 'in-progress');
  const needsApproval = steps.some((s) => s.status === 'awaiting-approval');

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 280, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="shrink-0 overflow-hidden"
      style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-[280px] h-full flex flex-col" style={{ background: 'rgba(255,255,255,0.015)' }}>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Zap size={13} className={needsApproval ? 'text-amber-400' : allDone ? 'text-emerald-400' : 'text-sky-400'} />
              {(hasActiveStep || needsApproval) && !allDone && (
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: needsApproval ? '#f59e0b' : '#38bdf8' }}
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <span className="text-[12px] font-semibold text-slate-300">
              {allDone ? 'Execution Complete' : needsApproval ? 'Awaiting Approval' : 'Live Execution'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Goal + progress */}
        <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[12px] font-semibold text-white mb-2 leading-snug">{goal}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: allDone ? '#34d399' : needsApproval ? '#f59e0b' : '#38bdf8' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] text-slate-500 shrink-0">{doneWork}/{workSteps.length}</span>
          </div>
        </div>

        {/* View tabs */}
        <div className="px-4 pt-2.5 pb-1 shrink-0 flex gap-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {([
            { key: 'list', icon: List,       label: 'Steps' },
            { key: 'flow', icon: GitBranch,  label: 'Flow'  },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
              style={{
                background: view === key ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: view === key ? 'white' : 'rgba(255,255,255,0.35)',
                border: view === key ? '1px solid rgba(255,255,255,0.10)' : '1px solid transparent',
              }}
            >
              <Icon size={10} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
        >
          <AnimatePresence mode="wait">
            {view === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="px-4 py-3"
              >
                {steps.map((step, i) => (
                  <StepRow
                    key={step.id}
                    step={step}
                    onApprove={() => onAdvance(i)}
                    onRedirect={(note) => onRedirect(i, note)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="flow"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
                className="px-3 py-4"
              >
                <CampaignFlowDiagram
                  steps={steps}
                  onAdvance={onAdvance}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
