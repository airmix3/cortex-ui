'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Rocket, Trash2, ChevronUp, ChevronDown, Check, Link, Zap } from 'lucide-react';
import type { MissionPlan, PlanStep, PlanSkill, PlanTool, ConfidenceLevel } from './chat-data';

// ── Confidence dot ────────────────────────────────────────────────────────────

const confidenceColor: Record<ConfidenceLevel, string> = {
  high:   '#34d399',
  medium: '#f59e0b',
  low:    '#f43f5e',
};
const confidenceLabel: Record<ConfidenceLevel, string> = {
  high: 'High confidence', medium: 'Some uncertainty', low: 'Needs clarification',
};

// ── Editable step card ────────────────────────────────────────────────────────

function StepCard({
  step,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  step: PlanStep;
  index: number;
  total: number;
  onUpdate: (updated: PlanStep) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(step.action);
  const inputRef = useRef<HTMLInputElement>(null);

  const save = () => {
    if (draft.trim()) onUpdate({ ...step, action: draft.trim() });
    setEditing(false);
  };

  const dotColor = confidenceColor[step.confidence];

  if (step.requiresCEOApproval) {
    return (
      <div
        className="rounded-xl px-3 py-2.5 flex items-center gap-2"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px dashed rgba(245,158,11,0.25)' }}
      >
        <Zap size={10} style={{ color: '#f59e0b' }} className="shrink-0" />
        <span className="text-[11px] text-amber-400 font-semibold flex-1">Your approval gate</span>
        <span className="text-[9px] text-slate-600">{step.duration}</span>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="group rounded-xl px-3 py-2.5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-2 mb-1">
        {/* Confidence dot */}
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: dotColor }}
          title={confidenceLabel[step.confidence]}
        />
        {/* Agent avatar */}
        <div
          className={`w-4 h-4 rounded-full ${step.agentColor} flex items-center justify-center text-[7px] font-bold text-white shrink-0`}
        >
          {step.agentAvatar}
        </div>
        <span className="text-[11px] font-semibold text-white">{step.agentName}</span>
        <span className="text-[9px] text-slate-600">· {step.department}</span>
        <span className="text-[9px] text-slate-600 ml-auto shrink-0">{step.duration}</span>

        {/* Controls (visible on hover) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-0.5 text-slate-600 hover:text-slate-300 transition-colors disabled:opacity-20 cursor-pointer"
          >
            <ChevronUp size={10} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index >= total - 1}
            className="p-0.5 text-slate-600 hover:text-slate-300 transition-colors disabled:opacity-20 cursor-pointer"
          >
            <ChevronDown size={10} />
          </button>
          <button
            onClick={onDelete}
            className="p-0.5 text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 size={9} />
          </button>
        </div>
      </div>

      {/* Action text — click to edit */}
      {editing ? (
        <div className="pl-6 flex gap-1.5">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
            onBlur={save}
            autoFocus
            className="flex-1 text-[12px] text-white bg-transparent outline-none border-b pb-0.5"
            style={{ borderColor: dotColor }}
          />
          <button onClick={save} className="text-emerald-400 cursor-pointer">
            <Check size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setEditing(true); setDraft(step.action); }}
          className="pl-6 text-left w-full text-[12px] text-slate-300 hover:text-white transition-colors leading-relaxed cursor-text"
          title="Click to edit"
        >
          {step.action}
        </button>
      )}
    </motion.div>
  );
}

// ── Skill chip ────────────────────────────────────────────────────────────────

function SkillChip({ skill, onToggle }: { skill: PlanSkill; onToggle: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
      onClick={onToggle}
      title={skill.description}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer"
      style={{
        background: skill.enabled ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${skill.enabled ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.07)'}`,
        color: skill.enabled ? '#38bdf8' : 'rgba(255,255,255,0.3)',
      }}
    >
      {skill.enabled && <Check size={9} strokeWidth={3} />}
      <span>{skill.name}</span>
      <span className="text-[9px] opacity-60">· {skill.agentName}</span>
    </motion.button>
  );
}

// ── Tool chip ─────────────────────────────────────────────────────────────────

const toolTypeColor: Record<PlanTool['type'], string> = {
  mcp:      '#a78bfa',
  api:      '#38bdf8',
  internal: '#64748b',
};

function ToolChip({ tool, onToggle }: { tool: PlanTool; onToggle: () => void }) {
  const color = toolTypeColor[tool.type];
  const active = tool.enabled && tool.connected;

  return (
    <motion.button
      whileHover={tool.connected ? { scale: 1.03 } : {}}
      whileTap={tool.connected ? { scale: 0.97 } : {}}
      onClick={tool.connected ? onToggle : undefined}
      title={tool.connected ? tool.description : `${tool.description} · Not yet connected`}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all"
      style={{
        cursor: tool.connected ? 'pointer' : 'not-allowed',
        background: active ? `${color}12` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${active ? `${color}35` : 'rgba(255,255,255,0.06)'}`,
        color: active ? color : 'rgba(255,255,255,0.2)',
        opacity: tool.connected ? 1 : 0.45,
      }}
    >
      {active && <Check size={9} strokeWidth={3} />}
      {!tool.connected && <Link size={9} />}
      <span>{tool.name}</span>
      <span className="text-[8px] uppercase tracking-wide opacity-60">{tool.type}</span>
    </motion.button>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-baseline gap-1.5 mb-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      {sub && <span className="text-[9px] text-slate-700">{sub}</span>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PlanningCanvas({
  plan: initialPlan,
  onLaunch,
  onClose,
}: {
  plan: MissionPlan;
  onLaunch: (plan: MissionPlan) => void;
  onClose: () => void;
}) {
  const [plan, setPlan] = useState<MissionPlan>(initialPlan);

  const updateStep = (idx: number, updated: PlanStep) => {
    setPlan((p) => ({ ...p, steps: p.steps.map((s, i) => (i === idx ? updated : s)) }));
  };

  const deleteStep = (idx: number) => {
    setPlan((p) => ({ ...p, steps: p.steps.filter((_, i) => i !== idx) }));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    setPlan((p) => {
      const steps = [...p.steps];
      const target = idx + dir;
      if (target < 0 || target >= steps.length) return p;
      [steps[idx], steps[target]] = [steps[target], steps[idx]];
      return { ...p, steps };
    });
  };

  const toggleSkill = (id: string) => {
    setPlan((p) => ({ ...p, skills: p.skills.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s) }));
  };

  const toggleTool = (id: string) => {
    setPlan((p) => ({ ...p, tools: p.tools.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t) }));
  };

  const workSteps = plan.steps.filter((s) => !s.requiresCEOApproval);
  const enabledSkills = plan.skills.filter((s) => s.enabled).length;
  const enabledTools = plan.tools.filter((t) => t.enabled).length;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="shrink-0 overflow-hidden"
      style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-[320px] h-full flex flex-col" style={{ background: 'rgba(255,255,255,0.015)' }}>

        {/* ── Header ── */}
        <div
          className="shrink-0 px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Mission Plan</span>
              <span
                className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                Draft
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">{plan.goal}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-600 hover:text-slate-300 transition-colors cursor-pointer shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
        >

          {/* Brief */}
          <div>
            <SectionHeader label="Brief" />
            <p className="text-[12px] text-slate-300 leading-relaxed mb-2">{plan.brief}</p>
            <div className="space-y-1">
              {plan.successCriteria.map((c, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Check size={9} className="text-emerald-400 shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="text-[11px] text-slate-400">{c}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[9px] text-slate-600">Estimated duration:</span>
              <span className="text-[9px] font-semibold text-slate-400">{plan.estimatedDuration}</span>
            </div>
          </div>

          {/* Confidence legend */}
          <div className="flex items-center gap-3">
            {(['high', 'medium', 'low'] as ConfidenceLevel[]).map((c) => (
              <div key={c} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: confidenceColor[c] }} />
                <span className="text-[9px] text-slate-600 capitalize">{c}</span>
              </div>
            ))}
            <span className="text-[9px] text-slate-700 ml-auto">confidence</span>
          </div>

          {/* Steps */}
          <div>
            <SectionHeader label="Plan" sub={`${workSteps.length} steps · ~${plan.estimatedDuration}`} />
            <div className="space-y-2">
              <AnimatePresence>
                {plan.steps.map((step, i) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    index={i}
                    total={plan.steps.length}
                    onUpdate={(u) => updateStep(i, u)}
                    onDelete={() => deleteStep(i)}
                    onMoveUp={() => moveStep(i, -1)}
                    onMoveDown={() => moveStep(i, 1)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Skills */}
          <div>
            <SectionHeader label="Skills" sub={`${enabledSkills} active`} />
            <div className="flex flex-wrap gap-1.5">
              {plan.skills.map((skill) => (
                <SkillChip key={skill.id} skill={skill} onToggle={() => toggleSkill(skill.id)} />
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <SectionHeader label="Tools" sub={`${enabledTools} enabled`} />
            <div className="flex flex-wrap gap-1.5">
              {plan.tools.map((tool) => (
                <ToolChip key={tool.id} tool={tool} onToggle={() => toggleTool(tool.id)} />
              ))}
            </div>
            <p className="text-[9px] text-slate-700 mt-1.5">
              Grayed tools are not yet connected. Visit Vault → Integrations to add.
            </p>
          </div>
        </div>

        {/* ── Launch button ── */}
        <div
          className="shrink-0 px-4 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
        >
          <p className="text-[9px] text-slate-600 mb-2 text-center">
            Chat with Tamir to refine, or launch when ready
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onLaunch(plan)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-slate-900 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)' }}
          >
            <Rocket size={14} />
            Launch Mission
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
