'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, ChevronRight } from 'lucide-react';
import type { SkillCategory, SkillLevel } from '@/data/skills-data';
import { CATEGORY_META, LEVEL_META } from '@/data/skills-data';

const CATEGORIES: SkillCategory[] = ['creative', 'analysis', 'execution', 'research', 'communication'];
const LEVELS: SkillLevel[] = [1, 2, 3];

interface NewSkillData {
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  description: string;
}

interface NewSkillModalProps {
  onAdd: (data: NewSkillData) => void;
  onClose: () => void;
}

export default function NewSkillModal({ onAdd, onClose }: NewSkillModalProps) {
  const [name, setName]             = useState('');
  const [category, setCategory]     = useState<SkillCategory>('execution');
  const [level, setLevel]           = useState<SkillLevel>(1);
  const [description, setDescription] = useState('');
  const [step, setStep]             = useState<'form' | 'confirm'>('form');

  const catMeta   = CATEGORY_META[category];
  const levelMeta = LEVEL_META[level];
  const canSubmit = name.trim().length >= 2;

  const handleAdd = () => {
    if (!canSubmit) return;
    onAdd({ name: name.trim(), category, level, description: description.trim() });
    onClose();
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-[480px] rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(8,14,32,0.96)',
            border: `1px solid ${catMeta.color}30`,
            boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 40px ${catMeta.color}12`,
            backdropFilter: 'blur(32px)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{
              background: `linear-gradient(135deg, ${catMeta.color}10 0%, rgba(255,255,255,0.02) 100%)`,
              borderBottom: `1px solid ${catMeta.color}18`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] font-bold"
                style={{ background: `${catMeta.color}18`, color: catMeta.color }}
              >
                ✦
              </div>
              <div>
                <div className="text-[15px] font-bold text-white">Add New Skill</div>
                <div className="text-[10px] text-slate-600">Expand your capability graph</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Skill name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 mb-2">
                Skill Name
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleAdd()}
                placeholder="e.g. Financial Forecasting, Team Communication…"
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white placeholder-slate-700 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: name.length > 0 ? `1px solid ${catMeta.color}35` : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: name.length > 0 ? `0 0 12px ${catMeta.color}10` : 'none',
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 mb-2">
                Category
              </label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => {
                  const cm = CATEGORY_META[cat];
                  const active = category === cat;
                  return (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setCategory(cat)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-all"
                      style={{
                        background: active ? `${cm.color}18` : 'rgba(255,255,255,0.03)',
                        border: active ? `1.5px solid ${cm.color}50` : '1px solid rgba(255,255,255,0.07)',
                        color: active ? cm.color : '#64748b',
                        boxShadow: active ? `0 0 12px ${cm.color}12` : 'none',
                      }}
                    >
                      {cm.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Starting level */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 mb-2">
                Starting Level
              </label>
              <div className="flex gap-2">
                {LEVELS.map((lv) => {
                  const lm = LEVEL_META[lv];
                  const active = level === lv;
                  return (
                    <motion.button
                      key={lv}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setLevel(lv)}
                      className="flex-1 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: active ? `${lm.color}12` : 'rgba(255,255,255,0.03)',
                        border: active ? `1.5px solid ${lm.color}40` : '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <span className="text-[12px] font-bold" style={{ color: active ? lm.color : '#475569' }}>
                        Lv {lv}
                      </span>
                      <span className="text-[9px]" style={{ color: active ? lm.color : '#334155' }}>
                        {lm.name}
                      </span>
                    </motion.button>
                  );
                })}
                <div
                  className="flex-1 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl opacity-30"
                  style={{ border: '1px dashed rgba(255,255,255,0.08)' }}
                >
                  <span className="text-[12px] font-bold text-slate-700">Lv 4–5</span>
                  <span className="text-[9px] text-slate-700">Train to unlock</span>
                </div>
              </div>
            </div>

            {/* Description (optional) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 mb-2">
                Description <span className="text-slate-700 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What does this skill enable? When is it applied?"
                className="w-full px-3.5 py-2.5 rounded-xl text-[12px] text-slate-300 placeholder-slate-700 outline-none resize-none"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              />
            </div>

            {/* Preview pill */}
            {name.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{ background: `${catMeta.color}08`, border: `1px solid ${catMeta.color}18` }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                  style={{ background: `${catMeta.color}18`, color: catMeta.color }}
                >
                  {name.trim().substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-white">{name.trim()}</div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span style={{ color: catMeta.color }}>{catMeta.label}</span>
                    <span className="text-slate-700">·</span>
                    <span style={{ color: levelMeta.color }}>{levelMeta.name}</span>
                  </div>
                </div>
                <div className="ml-auto text-[10px] text-slate-600">Will appear on your nexus</div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[12px] font-medium text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              Cancel
            </button>
            <motion.button
              whileHover={canSubmit ? { scale: 1.02 } : {}}
              whileTap={canSubmit ? { scale: 0.97 } : {}}
              onClick={handleAdd}
              disabled={!canSubmit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: canSubmit
                  ? `linear-gradient(135deg, ${catMeta.color}90 0%, ${catMeta.color}70 100%)`
                  : 'rgba(255,255,255,0.06)',
                color: canSubmit ? '#0a0f1a' : '#334155',
                border: canSubmit ? `1px solid ${catMeta.color}50` : '1px solid rgba(255,255,255,0.07)',
                boxShadow: canSubmit ? `0 4px 20px ${catMeta.color}25` : 'none',
              }}
            >
              <Zap size={13} />
              Add to Nexus
              <ChevronRight size={13} />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
