'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Star, Brain, Wrench, Plus } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import NexusCore from '@/components/skills/NexusCore';
import SkillDetailPanel from '@/components/skills/SkillDetailPanel';
import Arsenal from '@/components/skills/Arsenal';
import QuestBoard from '@/components/skills/QuestBoard';
import SkillsTamirPanel from '@/components/skills/SkillsTamirPanel';
import NewSkillModal from '@/components/skills/NewSkillModal';
import { initialSkills, initialTools, CATEGORY_META } from '@/data/skills-data';
import { computeCapabilityScore } from '@/components/skills/nexus-layout';
import type { SkillCategory, SkillLevel } from '@/data/skills-data';

// ── Training particle ─────────────────────────────────────────────────────────

interface TrainingParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// ── Rank logic ────────────────────────────────────────────────────────────────

function getRank(score: number) {
  if (score >= 80) return { name: 'Legendary', color: '#f59e0b' };
  if (score >= 65) return { name: 'Elite', color: '#a78bfa' };
  if (score >= 50) return { name: 'Veteran', color: '#34d399' };
  if (score >= 35) return { name: 'Adept', color: '#38bdf8' };
  return { name: 'Initiate', color: '#64748b' };
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const [skills, setSkills] = useState(initialSkills);
  const [tools, setTools] = useState(initialTools);
  const [skillPoints, setSkillPoints] = useState(420);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [trainingSkillId, setTrainingSkillId] = useState<string | null>(null);
  const [particles, setParticles] = useState<TrainingParticle[]>([]);
  const [spFlash, setSpFlash] = useState(false);
  const [filterCategory, setFilterCategory] = useState<SkillCategory | null>(null);
  const [showNewSkillModal, setShowNewSkillModal] = useState(false);

  const spRef        = useRef<HTMLDivElement>(null);
  const nexusRef     = useRef<HTMLDivElement>(null);

  const score = useMemo(() => computeCapabilityScore(skills, tools), [skills, tools]);
  const rank = getRank(score);
  const selectedSkill = selectedSkillId ? skills.find((s) => s.id === selectedSkillId) : null;

  const activeSkills   = skills.filter((s) => s.status === 'active').length;
  const connectedTools = tools.filter((t) => t.status === 'connected').length;
  const mastered       = skills.filter((s) => s.level === 5).length;

  // ── Train handler ────────────────────────────────────────────────────────────

  const handleTrain = useCallback((id: string) => {
    const skill = skills.find((s) => s.id === id);
    if (!skill) return;

    if (skill.status === 'draft') {
      setSkills((prev) => prev.map((s) => s.id === id ? { ...s, status: 'active' as const, xp: 5 } : s));
      setTrainingSkillId(id);
      setTimeout(() => setTrainingSkillId(null), 1500);
      return;
    }
    if (skill.level >= 5 || skillPoints < skill.trainCost) return;

    setSpFlash(true);
    setTimeout(() => setSpFlash(false), 600);
    setSkillPoints((p) => p - skill.trainCost);
    setTrainingSkillId(id);
    setSkills((prev) => prev.map((s) => s.id !== id ? s : { ...s, status: 'training' as const }));

    // Spawn particles from SP counter → nexus center
    if (spRef.current && nexusRef.current) {
      const spRect      = spRef.current.getBoundingClientRect();
      const nexusRect   = nexusRef.current.getBoundingClientRect();
      const startX = spRect.left + spRect.width / 2 - nexusRect.left;
      const startY = spRect.top + spRect.height / 2 - nexusRect.top;
      const endX   = nexusRect.width * 0.5;
      const endY   = nexusRect.height * 0.4;

      const newParticles: TrainingParticle[] = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        startX: startX + (Math.random() - 0.5) * 20,
        startY: startY + (Math.random() - 0.5) * 10,
        endX:   endX   + (Math.random() - 0.5) * 60,
        endY:   endY   + (Math.random() - 0.5) * 40,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 1200);
    }

    setTimeout(() => {
      setSkills((prev) => prev.map((s) => {
        if (s.id !== id) return s;
        const newLevel = Math.min(s.level + 1, 5) as typeof s.level;
        return { ...s, level: newLevel, xp: 0, status: 'active' as const };
      }));
      setTrainingSkillId(null);
    }, 2500);
  }, [skills, skillPoints]);

  // ── Connect tool handler ─────────────────────────────────────────────────────

  const handleConnect = useCallback((id: string) => {
    const tool = tools.find((t) => t.id === id);
    if (!tool) return;
    setTools((prev) => prev.map((t) => t.id === id ? { ...t, status: 'connected' as const } : t));
    setSkillPoints((p) => p + tool.xpOnConnect);
    setSpFlash(true);
    setTimeout(() => setSpFlash(false), 600);
  }, [tools]);

  // ── Add new skill handler ────────────────────────────────────────────────────

  const handleAddSkill = useCallback((data: { name: string; category: SkillCategory; level: SkillLevel; description: string }) => {
    const newSkill = {
      id: `skill-${Date.now()}`,
      name: data.name,
      category: data.category,
      level: data.level,
      xp: 0,
      status: 'active' as const,
      description: data.description || `${data.name} capability.`,
      ownerName: 'CEO',
      ownerAvatar: data.name.substring(0, 2).toUpperCase(),
      ownerColor: 'bg-violet-500',
      trainCost: data.level * 50,
      missionsUsed: 0,
      lastUsed: 'Just now',
      source: 'manual' as const,
    };
    setSkills((prev) => [...prev, newSkill]);
    setSpFlash(true);
    setTimeout(() => setSpFlash(false), 600);
  }, []);

  // ── Quest handlers ───────────────────────────────────────────────────────────

  const handleQuestSelectSkill = useCallback((id: string) => { setSelectedSkillId(id); }, []);
  const handleQuestSelectTool  = useCallback((_id: string) => { setSelectedSkillId(null); }, []);

  return (
    <AppShell>

      {/* Ambient nebula background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', width: '500px', height: '500px', top: '-5%', left: '45%', background: 'radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'ambientFloat 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '450px', height: '450px', top: '15%', right: '-5%', background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'ambientFloat 22s ease-in-out infinite reverse', animationDelay: '2s' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', bottom: '5%', right: '10%', background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'ambientFloat 20s ease-in-out infinite', animationDelay: '4s' }} />
        <div style={{ position: 'absolute', width: '420px', height: '420px', bottom: '0%', left: '25%', background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'ambientFloat 24s ease-in-out infinite reverse', animationDelay: '1s' }} />
        <div style={{ position: 'absolute', width: '350px', height: '350px', top: '30%', left: '25%', background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'ambientFloat 19s ease-in-out infinite', animationDelay: '3s' }} />
      </div>

      {/* Top bar removed — sidebar handles nav */}

      {/* ── Top bar: title + rank + SP ── */}
      <div className="shrink-0 flex items-center justify-between px-6 py-2 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-violet-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">Skill Nexus</span>
          </div>
          <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="flex items-center gap-4">
            {[
              { icon: Brain,  label: 'Skills',   value: activeSkills,   color: '#38bdf8' },
              { icon: Wrench, label: 'Tools',    value: connectedTools, color: '#34d399' },
              { icon: Star,   label: 'Mastered', value: mastered,       color: '#f59e0b' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon size={11} style={{ color }} />
                <span className="text-[12px] font-bold text-white">{value}</span>
                <span className="text-[10px] text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Rank badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: `${rank.color}10`, border: `1px solid ${rank.color}25` }}
          >
            <Shield size={11} style={{ color: rank.color }} />
            <span className="text-[10px] font-bold" style={{ color: rank.color }}>{rank.name}</span>
          </div>

          {/* SP counter */}
          <motion.div
            ref={spRef}
            animate={spFlash ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl"
            style={{
              background: spFlash ? 'rgba(167,139,250,0.15)' : 'rgba(167,139,250,0.08)',
              border: '1px solid rgba(167,139,250,0.2)',
              transition: 'background 0.3s',
            }}
          >
            <Zap size={12} className="text-violet-400" />
            <motion.span
              key={skillPoints}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-[14px] font-bold text-white"
            >
              {skillPoints}
            </motion.span>
            <span className="text-[10px] text-slate-500">SP</span>
          </motion.div>
        </div>
      </div>

      {/* ── Main content: 30/70 split ── */}
      <div className="flex-1 min-h-0 flex relative z-10">

        {/* ── Left: Tamir Chat (30%) ── */}
        <div
          className="shrink-0 flex flex-col"
          style={{ width: '30%', minWidth: '260px', maxWidth: '380px' }}
        >
          <SkillsTamirPanel skills={skills} tools={tools} onAddSkill={() => setShowNewSkillModal(true)} />
        </div>

        {/* ── Right: Nexus + Arsenal + Quest Board (70%) ── */}
        <div ref={nexusRef} className="flex-1 min-w-0 flex flex-col relative">

          {/* Category filter bar + New Skill CTA */}
          <div
            className="shrink-0 flex items-center gap-1.5 px-3 py-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* New Skill CTA — leftmost so always visible */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowNewSkillModal(true)}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(139,92,246,0.12) 100%)',
                border: '1px solid rgba(167,139,250,0.35)',
                color: '#c4b5fd',
                boxShadow: '0 0 14px rgba(167,139,250,0.12)',
              }}
            >
              <Plus size={10} />
              New Skill
            </motion.button>

            {/* Divider */}
            <div className="shrink-0 w-px h-4 mx-0.5" style={{ background: 'rgba(255,255,255,0.08)' }} />

            {/* Filter pills — scrollable if needed */}
            <div className="flex items-center gap-1 overflow-x-auto min-w-0" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setFilterCategory(null)}
                className="shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition-all"
                style={{
                  background: filterCategory === null ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                  border: filterCategory === null ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.06)',
                  color: filterCategory === null ? 'white' : '#475569',
                }}
              >
                All
              </button>
              {(Object.entries(CATEGORY_META) as [SkillCategory, { label: string; color: string }][]).map(([cat, meta]) => {
                const active = filterCategory === cat;
                const count = skills.filter((s) => s.category === cat).length;
                return (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFilterCategory(active ? null : cat)}
                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition-all"
                    style={{
                      background: active ? `${meta.color}15` : 'rgba(255,255,255,0.03)',
                      border: active ? `1px solid ${meta.color}40` : '1px solid rgba(255,255,255,0.06)',
                      color: active ? meta.color : '#475569',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: active ? meta.color : '#475569' }} />
                    {meta.label}
                    <span className="opacity-50 text-[8px]">{count}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Constellation */}
          <motion.div
            className="flex-1 min-h-0 relative"
            style={{ minHeight: '280px' }}
            animate={{ x: selectedSkillId ? -50 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <NexusCore
              skills={skills}
              score={score}
              selectedSkillId={selectedSkillId}
              hoveredNodeId={hoveredNodeId}
              trainingSkillId={trainingSkillId}
              filterCategory={filterCategory}
              onSelectSkill={setSelectedSkillId}
              onHoverSkill={setHoveredNodeId}
            />
          </motion.div>

          {/* Skill detail panel — overlays the right column */}
          <AnimatePresence>
            {selectedSkill && (
              <SkillDetailPanel
                skill={selectedSkill}
                skillPoints={skillPoints}
                onTrain={handleTrain}
                onClose={() => setSelectedSkillId(null)}
              />
            )}
          </AnimatePresence>

          {/* Training particles — scoped to nexus column */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-2 h-2 rounded-full z-50 pointer-events-none"
                style={{ background: '#a78bfa', boxShadow: '0 0 8px rgba(167,139,250,0.6)' }}
                initial={{ left: p.startX, top: p.startY, opacity: 1, scale: 1 }}
                animate={{ left: p.endX,   top: p.endY,   opacity: 0, scale: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.7 + Math.random() * 0.3,
                  ease: 'easeIn',
                  delay: Math.random() * 0.15,
                }}
              />
            ))}
          </AnimatePresence>

          {/* Arsenal */}
          <div className="shrink-0">
            <Arsenal tools={tools} onConnect={handleConnect} />
          </div>

          {/* Quest Board */}
          <div className="shrink-0">
            <QuestBoard
              skills={skills}
              tools={tools}
              skillPoints={skillPoints}
              onSelectSkill={handleQuestSelectSkill}
              onSelectTool={handleQuestSelectTool}
            />
          </div>
        </div>
      </div>

      {/* ── New Skill Modal ── */}
      <AnimatePresence>
        {showNewSkillModal && (
          <NewSkillModal
            onAdd={handleAddSkill}
            onClose={() => setShowNewSkillModal(false)}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
