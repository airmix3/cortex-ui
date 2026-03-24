'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  type Skill, type SkillCategory,
  LEVEL_META, CATEGORY_META,
} from '@/data/skills-data';
import {
  SVG_W, SVG_H, CX, CY, CORE_RADIUS,
  getSkillPositions, getAllBranches, getBranchPath,
  getCategoryStrength, getNodeRadius,
  type SkillNodePosition,
} from './nexus-layout';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NexusCoreProps {
  skills: Skill[];
  score: number;
  selectedSkillId: string | null;
  hoveredNodeId: string | null;
  trainingSkillId: string | null;
  filterCategory: SkillCategory | null;
  onSelectSkill: (id: string | null) => void;
  onHoverSkill: (id: string | null) => void;
}

const STATUS_DOT: Record<string, string> = {
  active: '#34d399', rusty: '#f59e0b', draft: '#64748b', training: '#38bdf8',
};

// ── Curved branch path (organic feel) ──────────────────────────────────────

function getCurvedBranchPath(category: SkillCategory): string {
  const branches = getAllBranches();
  const branch = branches.find(b => b.category === category)!;
  // Create a slightly curved path using quadratic bezier
  // Control point slightly offset perpendicular to the line
  const dx = branch.x - CX;
  const dy = branch.y - CY;
  const len = Math.sqrt(dx * dx + dy * dy);
  // Perpendicular offset (10px curves)
  const px = -dy / len * 12;
  const py = dx / len * 12;
  const mx = (CX + branch.x) / 2 + px;
  const my = (CY + branch.y) / 2 + py;
  return `M ${CX} ${CY} Q ${mx} ${my} ${branch.x} ${branch.y}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NexusCore({
  skills, score, selectedSkillId, hoveredNodeId, trainingSkillId,
  filterCategory, onSelectSkill, onHoverSkill,
}: NexusCoreProps) {
  const positions = useMemo(() => getSkillPositions(skills), [skills]);
  const branches = useMemo(() => getAllBranches(), []);
  const categoryStrength = useMemo(() => getCategoryStrength(skills), [skills]);

  // Show interaction hint until first click
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 6000);
    return () => clearTimeout(timer);
  }, []);
  const handleNodeClick = (id: string | null) => {
    setHasInteracted(true);
    setHintVisible(false);
    onSelectSkill(id);
  };

  // Animate score from 0 on mount
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const dur = 1400;
    const animate = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * score));
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const posMap = useMemo(() => {
    const m: Record<string, SkillNodePosition> = {};
    positions.forEach((p) => { m[p.id] = p; });
    return m;
  }, [positions]);

  const hoveredSkill = hoveredNodeId ? skills.find((s) => s.id === hoveredNodeId) : null;
  const hoveredPos = hoveredNodeId ? posMap[hoveredNodeId] : null;

  // Score ring progress
  const scoreCircumference = 2 * Math.PI * (CORE_RADIUS - 2);
  const scoreOffset = scoreCircumference * (1 - displayScore / 100);

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-full"
        style={{ maxHeight: '100%' }}
      >
        <defs>
          {/* ── Glow filters per category (stronger) ── */}
          {(Object.entries(CATEGORY_META) as [SkillCategory, { label: string; color: string }][]).map(([cat, meta]) => (
            <filter key={cat} id={`nexus-glow-${cat}`} x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feFlood floodColor={meta.color} floodOpacity="0.4" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          {/* Strong glow for hovered/high-level nodes */}
          {(Object.entries(CATEGORY_META) as [SkillCategory, { label: string; color: string }][]).map(([cat, meta]) => (
            <filter key={`${cat}-strong`} id={`nexus-glow-${cat}-strong`} x="-300%" y="-300%" width="700%" height="700%">
              <feGaussianBlur stdDeviation="16" result="blur" />
              <feFlood floodColor={meta.color} floodOpacity="0.6" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}

          {/* Core glow */}
          <filter id="nexus-core-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feFlood floodColor="#38bdf8" floodOpacity="0.3" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nexus-core-glow-inner" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="#818cf8" floodOpacity="0.4" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Branch gradients */}
          {branches.map(({ category, x, y }) => (
            <linearGradient key={`grad-${category}`} id={`branch-grad-${category}`}
              x1={CX} y1={CY} x2={x} y2={y} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={CATEGORY_META[category].color} stopOpacity="0.5" />
              <stop offset="60%" stopColor={CATEGORY_META[category].color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={CATEGORY_META[category].color} stopOpacity="0.02" />
            </linearGradient>
          ))}

          {/* Nebula radial gradients for atmosphere */}
          <radialGradient id="nebula-center" cx="50%" cy="50%" r="40%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.02" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="radar-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* Node inner gradients by level */}
          {[1,2,3,4,5].map(lv => {
            const color = LEVEL_META[lv as 1|2|3|4|5].color;
            return (
              <radialGradient key={`node-inner-${lv}`} id={`node-inner-${lv}`} cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={color} stopOpacity="0.03" />
              </radialGradient>
            );
          })}
        </defs>

        {/* ── Layer 0: Atmospheric nebula ── */}
        <rect width={SVG_W} height={SVG_H} fill="url(#nebula-center)" />

        {/* Stardust particles (tiny static dots scattered across canvas) */}
        {useMemo(() => {
          const dots = [];
          for (let i = 0; i < 80; i++) {
            const x = 20 + Math.random() * (SVG_W - 40);
            const y = 20 + Math.random() * (SVG_H - 40);
            const r = 0.3 + Math.random() * 0.8;
            const opacity = 0.05 + Math.random() * 0.15;
            dots.push(<circle key={`dust-${i}`} cx={x} cy={y} r={r} fill="white" opacity={opacity} />);
          }
          return dots;
        }, [])}

        {/* ── Layer 1: Radar grid (softer, more rings) ── */}
        {[70, 120, 170, 220].map((r, i) => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none"
            stroke="rgba(255,255,255,0.025)" strokeWidth="0.5"
            strokeDasharray={i % 2 === 0 ? '2 8' : '1 12'} />
        ))}

        {/* ── Layer 2: Branch lines (curved, with secondary energy lines) ── */}
        {branches.map(({ category }) => {
          const strength = categoryStrength[category] || 0;
          const baseOpacity = 0.2 + (strength / 5) * 0.5;
          const isFiltered = filterCategory && filterCategory !== category;
          const opacity = isFiltered ? 0.06 : baseOpacity;
          const curvedPath = getCurvedBranchPath(category);

          return (
            <g key={`branch-${category}`} style={{ transition: 'opacity 0.3s' }}>
              {/* Main branch — thicker, glowing */}
              <path d={curvedPath} fill="none"
                stroke={`url(#branch-grad-${category})`}
                strokeWidth="2.5" strokeLinecap="round" opacity={opacity} />
              {/* Secondary energy line — thinner, pulsing */}
              <path d={curvedPath} fill="none"
                stroke={CATEGORY_META[category].color}
                strokeWidth="0.5" strokeLinecap="round" opacity={opacity * 0.5}
                strokeDasharray="3 6" className="collab-edge" />
            </g>
          );
        })}

        {/* ── Layer 3: Branch particles (3 per branch, different speeds) ── */}
        {branches.map(({ category }) => {
          const curvedPath = getCurvedBranchPath(category);
          const color = CATEGORY_META[category].color;
          return [0, 1, 2].map((i) => (
            <g key={`particle-${category}-${i}`}>
              <circle r={1 + i * 0.3} fill={color} opacity={0.7 - i * 0.15}>
                <animateMotion
                  dur={`${4 + i * 2}s`} repeatCount="indefinite"
                  path={curvedPath} begin={`${i * 1.5}s`} />
              </circle>
              {/* Particle trail glow */}
              {i === 0 && (
                <circle r="3" fill={color} opacity="0.15">
                  <animateMotion
                    dur="4s" repeatCount="indefinite"
                    path={curvedPath} begin="0s" />
                </circle>
              )}
            </g>
          ));
        })}

        {/* ── Layer 4: Skill nodes ── */}
        {positions.map((pos) => {
          const skill = skills.find((s) => s.id === pos.id)!;
          const catMeta = CATEGORY_META[skill.category];
          const levelMeta = LEVEL_META[skill.level];
          const r = getNodeRadius(skill.level);
          const isDraft = skill.status === 'draft';
          const isTraining = trainingSkillId === skill.id;
          const isSelected = selectedSkillId === skill.id;
          const isHovered = hoveredNodeId === skill.id;
          const isCategoryFiltered = !!(filterCategory && filterCategory !== skill.category);
          const isDimmed = isCategoryFiltered || (!!(hoveredNodeId || selectedSkillId) && !isHovered && !isSelected);
          const isHighLevel = skill.level >= 4;

          // XP arc
          const arcR = r + 4;
          const circumference = 2 * Math.PI * arcR;
          const xpOffset = circumference * (1 - skill.xp / 100);

          return (
            <g key={skill.id} className="cursor-pointer"
              onClick={() => handleNodeClick(isSelected ? null : skill.id)}
              onMouseEnter={() => onHoverSkill(skill.id)}
              onMouseLeave={() => onHoverSkill(null)}
              style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
            >
              {/* === Outer atmosphere (big soft glow — bigger for higher levels) === */}
              <motion.circle
                cx={pos.x} cy={pos.y} r={r + 14 + skill.level * 3}
                fill={catMeta.color}
                animate={{
                  opacity: isHovered ? 0.22 : isSelected ? 0.18 : isDimmed ? 0.01 : isDraft ? 0.02 : 0.04 + skill.level * 0.015,
                  scale: isHovered ? 1.2 : isTraining ? 1.5 : 1,
                }}
                transition={{ duration: 0.35 }}
                filter={`url(#nexus-glow-${skill.category}${isHovered || isHighLevel ? '-strong' : ''})`}
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              />

              {/* === Orbit rings (for level 3+) === */}
              {skill.level >= 3 && !isDraft && (
                <motion.circle cx={pos.x} cy={pos.y} r={r + 10}
                  fill="none" stroke={levelMeta.color}
                  strokeWidth="0.5" strokeDasharray="2 4"
                  animate={{ opacity: isDimmed ? 0.05 : [0.1, 0.25, 0.1] }}
                  transition={{ duration: 3 + skill.level, repeat: Infinity }}
                />
              )}
              {/* Double orbit for level 5 */}
              {skill.level >= 5 && !isDraft && (
                <motion.circle cx={pos.x} cy={pos.y} r={r + 16}
                  fill="none" stroke={levelMeta.color}
                  strokeWidth="0.4" strokeDasharray="1 6"
                  animate={{ opacity: isDimmed ? 0.03 : [0.08, 0.18, 0.08] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                />
              )}

              {/* === XP arc ring === */}
              {!isDraft && (
                <>
                  {/* Track */}
                  <circle cx={pos.x} cy={pos.y} r={arcR} fill="none"
                    stroke={levelMeta.color} strokeWidth="2.5"
                    opacity={isDimmed ? 0.04 : 0.1}
                  />
                  {/* Fill */}
                  <circle cx={pos.x} cy={pos.y} r={arcR} fill="none"
                    stroke={levelMeta.color} strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={xpOffset}
                    transform={`rotate(-90 ${pos.x} ${pos.y})`}
                    opacity={isDimmed ? 0.1 : 0.75}
                  />
                </>
              )}

              {/* === Selection ring === */}
              {isSelected && (
                <motion.circle cx={pos.x} cy={pos.y} r={r + 8}
                  fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                />
              )}

              {/* === Training pulse rings === */}
              {isTraining && [0, 0.5].map(delay => (
                <motion.circle key={delay} cx={pos.x} cy={pos.y} r={r + 6}
                  fill="none" stroke={levelMeta.color} strokeWidth="2"
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay }}
                  style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                />
              ))}

              {/* === Main node circle (with inner gradient for depth) === */}
              <motion.circle cx={pos.x} cy={pos.y} r={r}
                fill={isDraft ? 'var(--bg-card)' : `url(#node-inner-${skill.level})`}
                stroke={isSelected ? '#38bdf8' : isDraft ? '#475569' : levelMeta.color}
                strokeWidth={isSelected ? 2.5 : isDraft ? 1 : 2}
                strokeDasharray={isDraft ? '3 3' : undefined}
                animate={{
                  opacity: isDimmed ? 0.3 : 1,
                  scale: isHovered ? 1.15 : isTraining ? 1.2 : 1,
                }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              />

              {/* === Inner highlight (specular) === */}
              {!isDraft && (
                <circle cx={pos.x - r * 0.2} cy={pos.y - r * 0.25} r={r * 0.35}
                  fill="white" opacity={isDimmed ? 0.01 : 0.04}
                />
              )}

              {/* === Avatar text === */}
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
                fill={isDimmed ? '#1e293b' : isHovered || isSelected ? '#ffffff' : '#cbd5e1'}
                fontSize={Math.max(9, r * 0.6)} fontWeight="700" fontFamily="var(--font-sans)"
                style={{ pointerEvents: 'none' }}
              >
                {skill.ownerAvatar}
              </text>

              {/* === Status dot === */}
              <circle cx={pos.x + r * 0.6} cy={pos.y + r * 0.6} r="3.5"
                fill={STATUS_DOT[skill.status] || '#64748b'}
                stroke="rgba(6,10,19,0.8)" strokeWidth="2"
                opacity={isDimmed ? 0.2 : 1}
              />

              {/* === Draft "?" badge === */}
              {isDraft && (
                <g>
                  <circle cx={pos.x - r * 0.55} cy={pos.y - r * 0.55} r="5"
                    fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="0.5" />
                  <text x={pos.x - r * 0.55} y={pos.y - r * 0.55 + 1}
                    textAnchor="middle" dominantBaseline="central"
                    fill="#f59e0b" fontSize="7" fontWeight="800" fontFamily="var(--font-sans)"
                    style={{ pointerEvents: 'none' }}>?</text>
                </g>
              )}

              {/* === Skill name below node === */}
              <text x={pos.x} y={pos.y + r + 15} textAnchor="middle"
                fill={isDimmed ? '#0f172a' : isHovered || isSelected ? '#e2e8f0' : '#64748b'}
                fontSize="8.5" fontWeight="600" fontFamily="var(--font-sans)"
                style={{ pointerEvents: 'none', transition: 'fill 0.3s' }}
              >
                {skill.name.length > 18 ? skill.name.slice(0, 16) + '…' : skill.name}
              </text>

              {/* === Level indicator === */}
              {!isDraft && (
                <text x={pos.x} y={pos.y + r + 25} textAnchor="middle"
                  fill={levelMeta.color} fontSize="7" fontWeight="700" fontFamily="var(--font-sans)"
                  opacity={isDimmed ? 0.1 : 0.65}
                  style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}>
                  {'★'.repeat(skill.level)}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Layer 5: Central core ── */}
        <g>
          {/* Outermost breathing glow — large atmospheric */}
          <motion.circle cx={CX} cy={CY} r={CORE_RADIUS + 25}
            fill="url(#radar-fade)"
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
            filter="url(#nexus-core-glow)"
          />

          {/* Secondary glow ring */}
          <motion.circle cx={CX} cy={CY} r={CORE_RADIUS + 12}
            fill="none" stroke="#818cf8" strokeWidth="0.8"
            strokeDasharray="3 5"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Orbit particles around core */}
          {[0, 1, 2].map(i => {
            const orbitR = CORE_RADIUS + 8 + i * 5;
            const orbitPath = `M ${CX - orbitR} ${CY} A ${orbitR} ${orbitR} 0 1 1 ${CX + orbitR} ${CY} A ${orbitR} ${orbitR} 0 1 1 ${CX - orbitR} ${CY}`;
            return (
              <circle key={`core-orbit-${i}`} r="1.5"
                fill={['#38bdf8', '#818cf8', '#a78bfa'][i]} opacity="0.6">
                <animateMotion dur={`${3 + i * 1.5}s`} repeatCount="indefinite"
                  path={orbitPath} begin={`${i * 0.8}s`} />
              </circle>
            );
          })}

          {/* Score progress ring */}
          <circle cx={CX} cy={CY} r={CORE_RADIUS - 2}
            fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth="3" />
          <motion.circle cx={CX} cy={CY} r={CORE_RADIUS - 2}
            fill="none" stroke="#38bdf8" strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={scoreCircumference}
            initial={{ strokeDashoffset: scoreCircumference }}
            animate={{ strokeDashoffset: scoreOffset }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            transform={`rotate(-90 ${CX} ${CY})`}
            filter="url(#nexus-core-glow-inner)"
          />

          {/* Main circle */}
          <circle cx={CX} cy={CY} r={CORE_RADIUS}
            fill="var(--bg-card)" stroke="rgba(56,189,248,0.25)" strokeWidth="1.5" />
          {/* Inner specular */}
          <circle cx={CX - 8} cy={CY - 10} r={CORE_RADIUS * 0.4}
            fill="white" opacity="0.02" />

          {/* "CAPABILITY" label */}
          <text x={CX} y={CY - 15} textAnchor="middle"
            fill="#64748b" fontSize="6.5" fontWeight="700" letterSpacing="0.15em"
            fontFamily="var(--font-sans)">CAPABILITY</text>

          {/* Score number */}
          <text x={CX} y={CY + 6} textAnchor="middle" dominantBaseline="central"
            fill="#ffffff" fontSize="28" fontWeight="800" fontFamily="var(--font-sans)">
            {displayScore}
          </text>

          {/* "/ 100" */}
          <text x={CX} y={CY + 22} textAnchor="middle"
            fill="#475569" fontSize="8" fontFamily="var(--font-sans)">/100</text>
        </g>

        {/* ── Layer 6: Category labels (with icon dots) ── */}
        {branches.map(({ category, tipX, tipY }) => {
          const strength = categoryStrength[category] || 0;
          const labelOpacity = 0.35 + (strength / 5) * 0.4;
          return (
            <g key={`label-${category}`}>
              {/* Label background dot */}
              <circle cx={tipX} cy={tipY - 1} r="18"
                fill={CATEGORY_META[category].color} opacity="0.04" />
              <text x={tipX} y={tipY} textAnchor="middle" dominantBaseline="central"
                fill={CATEGORY_META[category].color}
                fontSize="8.5" fontWeight="700" fontFamily="var(--font-sans)"
                letterSpacing="0.1em" opacity={labelOpacity}
                style={{ textTransform: 'uppercase' }}
              >
                {CATEGORY_META[category].label}
              </text>
              {/* Strength indicator dots below */}
              <g transform={`translate(${tipX - 8}, ${tipY + 10})`}>
                {[0,1,2,3,4].map(i => (
                  <circle key={i} cx={i * 4} cy={0} r="1.5"
                    fill={CATEGORY_META[category].color}
                    opacity={i < Math.round(strength) ? 0.6 : 0.1} />
                ))}
              </g>
            </g>
          );
        })}
      </svg>

      {/* ── First-interaction hint ── */}
      <AnimatePresence>
        {hintVisible && !hasInteracted && !hoveredNodeId && !selectedSkillId && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full"
              style={{
                background: 'rgba(56,189,248,0.08)',
                border: '1px solid rgba(56,189,248,0.18)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span className="text-[10px] text-sky-400 font-medium">
                👆 Click any node to explore a skill
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating tooltip (HTML over SVG) ── */}
      <AnimatePresence>
        {hoveredSkill && hoveredPos && !selectedSkillId && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute pointer-events-none z-20"
            style={{
              left: `${(hoveredPos.x / SVG_W) * 100}%`,
              top: `${(hoveredPos.y / SVG_H) * 100 - 12}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="px-3.5 py-2.5 rounded-xl" style={{
              background: 'rgba(8,14,32,0.94)',
              border: `1px solid ${CATEGORY_META[hoveredSkill.category].color}35`,
              backdropFilter: 'blur(16px)',
              boxShadow: `0 12px 32px rgba(0,0,0,0.6), 0 0 20px ${CATEGORY_META[hoveredSkill.category].color}15`,
            }}>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className={`w-5 h-5 rounded-md ${hoveredSkill.ownerColor} flex items-center justify-center text-[7px] font-bold text-white`}>
                  {hoveredSkill.ownerAvatar}
                </div>
                <span className="text-[12px] font-bold text-white">{hoveredSkill.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {hoveredSkill.status !== 'draft' && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{
                    background: LEVEL_META[hoveredSkill.level].bg,
                    color: LEVEL_META[hoveredSkill.level].color,
                    border: `1px solid ${LEVEL_META[hoveredSkill.level].color}25`,
                  }}>
                    Lv.{hoveredSkill.level} · {LEVEL_META[hoveredSkill.level].name}
                  </span>
                )}
                {hoveredSkill.status === 'draft' && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{ background: 'rgba(100,116,139,0.12)', color: '#64748b' }}>Draft</span>
                )}
                <span className="text-[9px]" style={{ color: CATEGORY_META[hoveredSkill.category].color }}>
                  {CATEGORY_META[hoveredSkill.category].label}
                </span>
                {hoveredSkill.xp > 0 && <span className="text-[9px] text-slate-600">{hoveredSkill.xp}% XP</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
