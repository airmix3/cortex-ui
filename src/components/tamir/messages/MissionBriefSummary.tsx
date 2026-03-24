'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, Target, Check, ChevronRight, Clock, Users, Zap, Sparkles, ArrowRight } from 'lucide-react';
import type { FullChatMessage, MissionPlan } from '../chat-data';

export default function MissionBriefSummary({
  msg,
  onLaunch,
}: {
  msg: FullChatMessage;
  onLaunch?: (plan: MissionPlan) => void;
}) {
  const plan = msg.missionPlan;
  if (!plan) return null;

  const [launched, setLaunched] = useState(false);

  const workSteps = plan.steps.filter((s) => !s.requiresCEOApproval);
  const uniqueAgents = Array.from(new Map(workSteps.map((s) => [s.agentName, s])).values());
  const enabledTools = plan.tools.filter((t) => t.enabled && t.connected);
  const dept = workSteps.find((s) => s.department !== 'Chief of Staff')?.department ?? 'Marketing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-1.5"
    >
      {/* Tamir byline */}
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          TA
        </div>
        <span className="text-[11px] text-amber-400 font-medium">Tamir</span>
        <span className="text-[10px] text-slate-600">· {msg.time} · Mission Brief</span>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10, 16, 36, 0.97)',
          border: launched ? '1px solid rgba(52,211,153,0.35)' : '1px solid rgba(56,189,248,0.22)',
          maxWidth: 480,
          boxShadow: launched
            ? '0 0 24px rgba(52,211,153,0.10), inset 0 1px 0 rgba(52,211,153,0.06)'
            : '0 0 24px rgba(56,189,248,0.08), inset 0 1px 0 rgba(56,189,248,0.06)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: launched ? 'rgba(52,211,153,0.05)' : 'rgba(56,189,248,0.04)',
          }}
        >
          <Target size={12} className={launched ? 'text-emerald-400' : 'text-sky-400'} />
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${launched ? 'text-emerald-400' : 'text-sky-400'}`}
          >
            {launched ? 'Mission Active' : 'Mission Brief · Ready'}
          </span>
          <span
            className="ml-auto px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
            style={{
              background: launched ? 'rgba(52,211,153,0.12)' : 'rgba(245,158,11,0.12)',
              color: launched ? '#34d399' : '#f59e0b',
              border: `1px solid ${launched ? 'rgba(52,211,153,0.25)' : 'rgba(245,158,11,0.25)'}`,
            }}
          >
            {launched ? 'Live' : 'Draft'}
          </span>
        </div>

        <div className="px-4 pt-3.5 pb-1 space-y-3.5">
          {/* Goal + brief */}
          <div>
            <p className="text-[15px] font-bold text-white leading-tight mb-1">{plan.goal}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">{plan.brief}</p>
          </div>

          {/* Meta pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium"
              style={{ background: 'rgba(139,92,246,0.10)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.18)' }}
            >
              {dept}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Clock size={9} />
              {plan.estimatedDuration}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Users size={9} />
              {uniqueAgents.length} agents
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Zap size={9} />
              {enabledTools.length} tools
            </span>
          </div>

          {/* Agents */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-2">Agents Assigned</p>
            <div className="space-y-1.5">
              {workSteps.slice(0, 4).map((step, i) => (
                <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div
                    className={`w-5 h-5 rounded-full ${step.agentColor} flex items-center justify-center text-[7px] font-bold text-white shrink-0`}
                  >
                    {step.agentAvatar}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-300">{step.agentName}</span>
                  <span className="text-[9px] text-slate-600">·</span>
                  <span className="text-[10px] text-slate-500 truncate flex-1">{step.action}</span>
                  <span className="text-[9px] text-slate-600 shrink-0">{step.duration}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success criteria */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">Success Criteria</p>
            <div className="space-y-1">
              {plan.successCriteria.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-3 h-3 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-all"
                    style={{
                      borderColor: launched ? '#34d399' : 'rgba(255,255,255,0.12)',
                      background: launched ? 'rgba(52,211,153,0.12)' : 'transparent',
                    }}
                  >
                    {launched && <Check size={8} className="text-emerald-400" strokeWidth={3} />}
                  </div>
                  <span className="text-[11px] text-slate-400 leading-relaxed">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas hint (only before launch) */}
          {!launched && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <Sparkles size={9} />
              <span>Full editable plan is open in the panel on the right</span>
              <ArrowRight size={9} />
            </div>
          )}
        </div>

        {/* Action row */}
        <div className="px-4 py-3.5">
          {!launched ? (
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setLaunched(true);
                if (plan) onLaunch?.(plan);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                color: '#0f172a',
                boxShadow: '0 4px 16px rgba(56,189,248,0.25)',
              }}
            >
              <Rocket size={14} />
              Launch Mission
            </motion.button>
          ) : (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)' }}
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-emerald-400">Agents dispatched</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Track live progress in Workspace</p>
              </div>
              <ChevronRight size={13} className="text-slate-600 shrink-0" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
