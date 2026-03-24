'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Scroll, TrendingUp, Plus, Link, Zap, Send, Sparkles } from 'lucide-react';
import type { Skill, OrgTool } from '@/data/skills-data';
import { LEVEL_META } from '@/data/skills-data';

interface Quest {
  id: string;
  label: string;
  reward: string;
  icon: typeof TrendingUp;
  color: string;
  targetId: string;
  type: 'skill' | 'tool';
}

function generateQuests(skills: Skill[], tools: OrgTool[], skillPoints: number): Quest[] {
  const quests: Quest[] = [];

  // Rusty skills
  skills.filter((s) => s.status === 'rusty').forEach((s) => {
    quests.push({
      id: `q-rusty-${s.id}`,
      label: `Shake off the rust on ${s.name}`,
      reward: 'Restore to Active',
      icon: Sparkles,
      color: '#f59e0b',
      targetId: s.id,
      type: 'skill',
    });
  });

  // Draft skills
  skills.filter((s) => s.status === 'draft').forEach((s) => {
    quests.push({
      id: `q-draft-${s.id}`,
      label: `Commit ${s.name} to your system`,
      reward: 'New skill unlocked',
      icon: Plus,
      color: '#f59e0b',
      targetId: s.id,
      type: 'skill',
    });
  });

  // Trainable skills (affordable)
  skills
    .filter((s) => s.status === 'active' && s.level < 5 && skillPoints >= s.trainCost)
    .sort((a, b) => b.xp - a.xp) // closest to level up
    .slice(0, 2)
    .forEach((s) => {
      const next = LEVEL_META[Math.min(s.level + 1, 5) as 1 | 2 | 3 | 4 | 5];
      quests.push({
        id: `q-train-${s.id}`,
        label: `Train ${s.name} to ${next.name}`,
        reward: `${s.trainCost} SP`,
        icon: TrendingUp,
        color: next.color,
        targetId: s.id,
        type: 'skill',
      });
    });

  // Disconnected tools
  tools.filter((t) => t.status === 'disconnected' || t.status === 'requested').forEach((t) => {
    quests.push({
      id: `q-tool-${t.id}`,
      label: `Connect ${t.name}`,
      reward: `+${t.xpOnConnect} SP`,
      icon: Link,
      color: '#38bdf8',
      targetId: t.id,
      type: 'tool',
    });
  });

  return quests.slice(0, 4);
}

export default function QuestBoard({
  skills,
  tools,
  skillPoints,
  onSelectSkill,
  onSelectTool,
}: {
  skills: Skill[];
  tools: OrgTool[];
  skillPoints: number;
  onSelectSkill: (id: string) => void;
  onSelectTool: (id: string) => void;
}) {
  const [input, setInput] = useState('');
  const [sent, setSent] = useState(false);
  const quests = useMemo(() => generateQuests(skills, tools, skillPoints), [skills, tools, skillPoints]);

  const handleSend = () => {
    if (!input.trim()) return;
    setSent(true);
    setInput('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="px-6 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-6">
        {/* Tamir avatar + label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-bold text-white">
            T
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Scroll size={10} className="text-sky-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">Quest Board</span>
            </div>
          </div>
        </div>

        {/* Quest cards */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {quests.map((q) => (
            <motion.button
              key={q.id}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => q.type === 'skill' ? onSelectSkill(q.targetId) : onSelectTool(q.targetId)}
              className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-left cursor-pointer"
              style={{
                background: `${q.color}08`,
                border: `1px solid ${q.color}18`,
              }}
            >
              <q.icon size={11} style={{ color: q.color }} className="shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-medium text-slate-300 truncate max-w-36">{q.label}</div>
                <div className="flex items-center gap-1 text-[8px]" style={{ color: q.color }}>
                  <Zap size={7} /> {q.reward}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Quick input */}
        <div
          className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {sent ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-sky-400"
            >
              Tamir will draft it ✓
            </motion.span>
          ) : (
            <>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="New skill idea..."
                className="bg-transparent text-[11px] text-white placeholder-slate-700 outline-none w-32"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-1 rounded cursor-pointer disabled:opacity-20"
              >
                <Send size={10} className="text-sky-400" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
