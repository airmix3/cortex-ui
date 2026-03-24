'use client';

import { motion } from 'motion/react';
import { Check, Target, FileText, Lock, DollarSign, Wrench } from 'lucide-react';
import type { FullChatMessage, DispatchStep, BudgetLine, ToolLine } from '../chat-data';

// ── Status dot ──────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: DispatchStep['status'] }) {
  const colorMap: Record<DispatchStep['status'], string> = {
    done: '#34d399',
    'in-progress': '#38bdf8',
    'awaiting-approval': '#f59e0b',
    pending: '#1e293b',
    rejected: '#f43f5e',
  };
  const color = colorMap[status];
  const isPulsing = status === 'in-progress' || status === 'awaiting-approval';

  return (
    <div className="relative w-3 h-3 mt-[5px] shrink-0">
      <div
        className="w-3 h-3 rounded-full border-2 flex items-center justify-center"
        style={{
          backgroundColor: status === 'pending' ? 'transparent' : color,
          borderColor: color,
        }}
      >
        {status === 'done' && (
          <Check size={6} style={{ color: '#022c22' }} strokeWidth={3.5} />
        )}
      </div>
      {isPulsing && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}

function Connector({ fromStatus }: { fromStatus: DispatchStep['status'] }) {
  return (
    <div
      className="w-px ml-[5px] my-0.5"
      style={{
        minHeight: 16,
        backgroundColor: fromStatus === 'done'
          ? 'rgba(52,211,153,0.35)'
          : 'rgba(255,255,255,0.07)',
        transition: 'background-color 0.6s ease',
      }}
    />
  );
}

function WorkStep({ step }: { step: DispatchStep }) {
  return (
    <motion.div animate={{ opacity: step.status === 'pending' ? 0.38 : 1 }} transition={{ duration: 0.5 }}>
      <div className="flex items-center gap-2 flex-wrap">
        <div className={`w-5 h-5 rounded-full ${step.agentColor} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
          {step.agentAvatar}
        </div>
        <span className="text-[12px] font-semibold text-white">{step.agentName}</span>
        <span className="text-[10px] text-slate-500">· {step.department}</span>
        {step.status === 'in-progress' && (
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="ml-auto text-[10px] text-sky-400 font-medium"
          >
            working...
          </motion.span>
        )}
        {step.status === 'done' && step.deliverable && (
          <motion.div
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)' }}
          >
            <FileText size={8} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-medium">{step.deliverable}</span>
          </motion.div>
        )}
      </div>
      <p className="text-[12px] text-slate-300 mt-0.5 pl-7 leading-relaxed">{step.action}</p>
      {step.detail && step.status !== 'pending' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-slate-500 pl-7 mt-0.5 leading-relaxed">
          {step.detail}
        </motion.p>
      )}
    </motion.div>
  );
}

function ApprovalGate({
  step,
  onApprove,
}: {
  step: DispatchStep;
  onApprove: () => void;
}) {
  if (step.status === 'done') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 py-0.5">
        <Check size={10} className="text-emerald-400 shrink-0" />
        <span className="text-[11px] text-slate-500">You approved · dispatched to team</span>
      </motion.div>
    );
  }
  if (step.status === 'rejected') {
    return (
      <div className="flex items-center gap-1.5 py-0.5">
        <span className="text-amber-400 text-[11px]">↩</span>
        <span className="text-[11px] text-slate-500">Redirected — Tamir is adjusting</span>
      </div>
    );
  }
  if (step.status === 'pending') {
    return (
      <div className="flex items-center gap-1.5 py-0.5 opacity-35">
        <Lock size={9} className="text-slate-500 shrink-0" />
        <span className="text-[11px] text-slate-500">{step.approvalPrompt || 'Your review required'}</span>
      </div>
    );
  }

  // awaiting-approval WITH budget/tools → full disclosure card (plan approval gate)
  if (step.budget || step.tools) {
    const newSpend = step.budget?.filter((b) => !b.subscribed).reduce((s, b) => s + parseFloat(b.cost.replace('$', '')), 0) ?? 0;
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl p-3 space-y-3"
        style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.18)' }}
      >
        <div className="flex items-center gap-2">
          <motion.div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#f59e0b' }}
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity }} />
          <span className="text-[12px] text-amber-300 font-semibold flex-1">{step.approvalPrompt}</span>
        </div>

        {/* Budget */}
        {step.budget && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <DollarSign size={9} className="text-slate-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Budget</span>
            </div>
            <div className="space-y-1">
              {step.budget.map((b) => (
                <div key={b.item} className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300">{b.item}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {b.subscribed && (
                      <span className="text-[9px] text-emerald-500 font-medium">active</span>
                    )}
                    <span className="text-[11px] font-bold" style={{ color: b.subscribed ? '#64748b' : '#fbbf24' }}>
                      {b.cost}
                    </span>
                    <span className="text-[9px] text-slate-600">/ {b.note}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-1.5 mt-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[10px] text-slate-500">New spend this campaign</span>
                <span className="text-[11px] font-black text-amber-400">${newSpend}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tools */}
        {step.tools && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Wrench size={9} className="text-slate-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Tools being used</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {step.tools.map((t) => (
                <div key={t.name} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  <span className="text-[10px] font-semibold text-slate-300">{t.name}</span>
                  <span className="text-[9px] text-slate-600">· {t.purpose}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onApprove}
          className="w-full py-1.5 rounded-lg text-[12px] font-bold text-slate-900 cursor-pointer"
          style={{ background: '#f59e0b' }}
        >
          Approve & dispatch →
        </motion.button>
      </motion.div>
    );
  }

  // awaiting-approval compact — no budget/tools (second gate, etc.)
  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-2 py-0.5"
    >
      <motion.div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: '#f59e0b' }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      <span className="text-[11px] text-amber-400 truncate flex-1">{step.approvalPrompt}</span>
      <motion.button
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
        onClick={onApprove}
        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-900 cursor-pointer shrink-0"
        style={{ background: '#f59e0b' }}
      >
        Approve →
      </motion.button>
    </motion.div>
  );
}

// ── Main component — fully controlled, no internal step state ────────────────

export default function DispatchFlow({
  msg,
  steps,
  onAdvance,
  onRedirect,
}: {
  msg: FullChatMessage;
  steps: DispatchStep[];
  onAdvance: (index: number) => void;
  onRedirect: (index: number, note: string) => void;
}) {
  const plan = msg.dispatchPlan!;
  const workSteps = steps.filter((s) => !s.requiresCEOApproval);
  const doneWork = workSteps.filter((s) => s.status === 'done').length;
  const allDone = doneWork === workSteps.length && workSteps.length > 0;
  const progress = workSteps.length > 0 ? (doneWork / workSteps.length) * 100 : 0;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: 'var(--bg-card, rgba(15,23,42,0.9))',
        borderColor: allDone ? 'rgba(52,211,153,0.25)' : 'var(--border-subtle, rgba(255,255,255,0.08))',
        maxWidth: 560,
        transition: 'border-color 0.6s ease',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: allDone ? 'rgba(52,211,153,0.12)' : 'rgba(245,158,11,0.12)',
            border: `1px solid ${allDone ? 'rgba(52,211,153,0.25)' : 'rgba(245,158,11,0.22)'}`,
            transition: 'all 0.6s ease',
          }}
        >
          <Target size={14} className={allDone ? 'text-emerald-400' : 'text-amber-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: allDone ? '#34d399' : '#f59e0b', transition: 'color 0.6s ease' }}>
            {allDone ? 'Mission Complete' : 'Mission Dispatched'}
          </p>
          <p className="text-[14px] font-bold text-white truncate">{plan.goal}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-slate-500 mb-1">{doneWork} / {workSteps.length} steps</p>
          <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: allDone ? '#34d399' : '#f59e0b' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {msg.content && (
        <div className="px-4 pt-3 pb-0">
          <p className="text-[12px] text-slate-400 leading-relaxed">{msg.content}</p>
        </div>
      )}

      {/* Steps */}
      <div className="px-4 py-4">
        {steps.map((step, i) => (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StatusDot status={step.status} />
              {i < steps.length - 1 && <Connector fromStatus={step.status} />}
            </div>
            <div className={`flex-1 ${i < steps.length - 1 ? 'pb-4' : ''}`}>
              {step.requiresCEOApproval ? (
                <ApprovalGate
                  step={step}
                  onApprove={() => onAdvance(i)}
                />
              ) : (
                <WorkStep step={step} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
