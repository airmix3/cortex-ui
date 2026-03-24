'use client';

import { motion } from 'motion/react';
import { X, TrendingUp, Star, Plus, Clock, Hash, Sparkles, Zap } from 'lucide-react';
import { type Skill, LEVEL_META, CATEGORY_META } from '@/data/skills-data';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: 'Active',   color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  rusty:    { label: 'Rusty',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  draft:    { label: 'Draft',    color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  training: { label: 'Training', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
};

export default function SkillDetailPanel({
  skill,
  skillPoints,
  onTrain,
  onClose,
}: {
  skill: Skill;
  skillPoints: number;
  onTrain: (id: string) => void;
  onClose: () => void;
}) {
  const lm = LEVEL_META[skill.level];
  const cm = CATEGORY_META[skill.category];
  const sm = STATUS_CFG[skill.status];
  const isDraft = skill.status === 'draft';
  const isTraining = skill.status === 'training';
  const isMaxLevel = skill.level === 5;
  const canTrain = !isDraft && !isMaxLevel && !isTraining && skillPoints >= skill.trainCost;
  const nextLevel = Math.min(skill.level + 1, 5) as 1 | 2 | 3 | 4 | 5;
  const nextLm = LEVEL_META[nextLevel];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-4 top-4 bottom-4 w-[340px] z-30 rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(10,18,40,0.85)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(24px) saturate(150%)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 24px rgba(56,189,248,0.05)',
      }}
    >
      {/* Specular top edge */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)' }} />

      {/* Header */}
      <div className="shrink-0 p-5 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${skill.ownerColor} flex items-center justify-center text-[12px] font-bold text-white`}
            >
              {skill.ownerAvatar}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white leading-tight">{skill.name}</h3>
              <span className="text-[11px] text-slate-500">{skill.ownerName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-300 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {/* Level badge */}
          <div
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
            style={{ background: lm.bg, color: lm.color, border: `1px solid ${lm.color}25` }}
          >
            {isDraft ? 'Draft' : `Lv.${skill.level} · ${lm.name}`}
          </div>
          {/* Category badge */}
          <div
            className="px-2 py-1 rounded-lg text-[10px] font-medium"
            style={{ background: `${cm.color}12`, color: cm.color }}
          >
            {cm.label}
          </div>
          {/* Status badge */}
          <div
            className="px-2 py-1 rounded-lg text-[10px] font-semibold"
            style={{ background: sm.bg, color: sm.color }}
          >
            {sm.label}
          </div>
          {/* Source badge */}
          {skill.source === 'mission-report' && (
            <div
              className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide"
              style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}
            >
              From Mission
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
        {/* XP Progress */}
        {!isDraft && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Experience</span>
              {isMaxLevel ? (
                <span className="text-[10px] font-bold text-amber-400">MAX LEVEL</span>
              ) : (
                <span className="text-[10px] text-slate-500">{skill.xp}% → Lv.{nextLevel}</span>
              )}
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: isMaxLevel ? '100%' : `${skill.xp}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: isMaxLevel ? `linear-gradient(90deg, ${lm.color}, #f59e0b)` : lm.color }}
              />
            </div>
            {!isMaxLevel && (
              <div className="flex justify-between mt-1">
                <span className="text-[8px] text-slate-700">{lm.name}</span>
                <span className="text-[8px]" style={{ color: nextLm.color }}>{nextLm.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <p className="text-[12px] text-slate-400 leading-relaxed">{skill.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Hash, label: 'Missions', value: skill.missionsUsed.toString(), color: '#38bdf8' },
            { icon: Clock, label: 'Last used', value: skill.lastUsed || 'Never', color: '#64748b' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon size={10} style={{ color }} />
                <span className="text-[9px] text-slate-600 uppercase tracking-wider">{label}</span>
              </div>
              <span className="text-[13px] font-semibold text-white">{value}</span>
            </div>
          ))}
        </div>

        {/* Train cost preview */}
        {!isDraft && !isMaxLevel && (
          <div
            className="rounded-xl p-3"
            style={{ background: `${nextLm.color}08`, border: `1px solid ${nextLm.color}15` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={11} style={{ color: nextLm.color }} />
              <span className="text-[10px] font-semibold" style={{ color: nextLm.color }}>
                Next: {nextLm.name} (Lv.{nextLevel})
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Zap size={9} className="text-violet-400" />
              <span>Cost: {skill.trainCost} SP</span>
              <span className="text-slate-700 mx-1">·</span>
              <span>You have: {skillPoints} SP</span>
              {skillPoints < skill.trainCost && (
                <span className="text-rose-400 ml-1">(need {skill.trainCost - skillPoints} more)</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      <div
        className="shrink-0 p-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {isTraining ? (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl" style={{ background: 'rgba(56,189,248,0.08)' }}>
            {[0, 0.2, 0.4].map((d) => (
              <motion.div
                key={d}
                className="w-2 h-2 rounded-full bg-sky-400"
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: d }}
              />
            ))}
            <span className="text-[12px] font-medium text-sky-400 ml-1">Training in progress…</span>
          </div>
        ) : isMaxLevel ? (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <Star size={14} className="text-amber-400" />
            <span className="text-[13px] font-bold text-amber-400">MASTERED</span>
          </div>
        ) : isDraft ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onTrain(skill.id)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#f59e0b',
            }}
          >
            <Plus size={14} />
            Commit to System
          </motion.button>
        ) : (
          <motion.button
            whileHover={canTrain ? { scale: 1.02 } : {}}
            whileTap={canTrain ? { scale: 0.97 } : {}}
            onClick={() => canTrain && onTrain(skill.id)}
            disabled={!canTrain}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            style={canTrain ? {
              background: `linear-gradient(135deg, ${nextLm.color}30, ${nextLm.color}15)`,
              border: `1px solid ${nextLm.color}40`,
              color: nextLm.color,
              boxShadow: `0 0 20px ${nextLm.color}10`,
            } : {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            <TrendingUp size={14} />
            Train to {nextLm.name} · {skill.trainCost} SP
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
