'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppShell from '@/components/layout/AppShell';
import TopNav from '@/components/layout/TopNav';
import {
  useSettings,
  type LayoutPreset,
  type EscalationThreshold,
  type StatusMetric,
  type NavGroupVisibility,
} from '@/contexts/SettingsContext';
import {
  LayoutGrid, Target, Moon, AlertTriangle, BarChart2,
  GripVertical, Eye, EyeOff, RotateCcw, Check,
  Shield, Users, BookOpen, Settings, Sparkles,
  ChevronRight, Layers,
} from 'lucide-react';

// ── Section shell ─────────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="mb-5">
        <h2 className="text-[15px] font-bold text-white">{title}</h2>
        {description && (
          <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </motion.section>
  );
}

// ── Saved toast ────────────────────────────────────────────────────────────────

function SavedToast({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: 'rgba(52,211,153,0.12)',
            border: '1px solid rgba(52,211,153,0.25)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Check size={13} className="text-emerald-400" />
          <span className="text-[12px] font-medium text-emerald-300">Preferences saved</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── 1. Layout Presets ──────────────────────────────────────────────────────────

const PRESETS: {
  id: LayoutPreset;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  preview: React.ReactNode;
}[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutGrid,
    color: '#38bdf8',
    description: 'Full dashboard. All missions, all metrics, all panels.',
    preview: (
      <div className="flex gap-1 h-12">
        <div className="w-1/5 rounded-md bg-white/10" />
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2 rounded bg-white/10 w-full" />
          <div className="flex-1 flex gap-1">
            <div className="flex-1 rounded bg-white/[0.07]" />
            <div className="flex-1 rounded bg-white/[0.07]" />
            <div className="w-1/3 rounded bg-white/[0.07]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'focus',
    label: 'Focus Mode',
    icon: Target,
    color: '#f59e0b',
    description: 'Top priority mission + Tamir only. Everything else hidden.',
    preview: (
      <div className="flex gap-1 h-12">
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex-1 rounded bg-amber-400/20 border border-amber-400/20" />
        </div>
        <div className="w-2/5 rounded bg-white/[0.07]" />
      </div>
    ),
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    icon: Moon,
    color: '#a78bfa',
    description: 'All silenced. Only L4 escalations will interrupt. Stay in flow.',
    preview: (
      <div className="flex gap-1 h-12">
        <div className="flex-1 rounded-md flex items-center justify-center"
          style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <Moon size={14} style={{ color: '#a78bfa', opacity: 0.6 }} />
        </div>
      </div>
    ),
  },
];

function LayoutPresets() {
  const { layoutPreset, setLayoutPreset } = useSettings();
  return (
    <div className="grid grid-cols-3 gap-3">
      {PRESETS.map((p) => {
        const active = layoutPreset === p.id;
        return (
          <motion.button
            key={p.id}
            onClick={() => setLayoutPreset(p.id)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="text-left rounded-xl p-4 transition-all cursor-pointer relative"
            style={{
              background: active ? `${p.color}10` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${active ? `${p.color}35` : 'rgba(255,255,255,0.07)'}`,
              boxShadow: active ? `0 0 20px ${p.color}10` : 'none',
            }}
          >
            {/* Active check */}
            {active && (
              <motion.div
                layoutId="preset-active"
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: `${p.color}20`, border: `1px solid ${p.color}40` }}
              >
                <Check size={10} style={{ color: p.color }} />
              </motion.div>
            )}

            {/* Mini preview */}
            <div className="mb-3 rounded-lg p-2" style={{ background: 'rgba(0,0,0,0.25)' }}>
              {p.preview}
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <p.icon size={12} style={{ color: p.color }} />
              <span className="text-[13px] font-semibold" style={{ color: active ? p.color : 'white' }}>
                {p.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">{p.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── 2. Escalation Threshold ───────────────────────────────────────────────────

const LEVELS: { id: EscalationThreshold; label: string; color: string; description: string }[] = [
  { id: 'L1', label: 'L1+', color: '#64748b', description: 'All escalations' },
  { id: 'L2', label: 'L2+', color: '#38bdf8', description: 'Notable and above' },
  { id: 'L3', label: 'L3+', color: '#f59e0b', description: 'High priority and above' },
  { id: 'L4', label: 'L4 only', color: '#f43f5e', description: 'Critical only' },
];

function EscalationThresholdPicker() {
  const { escalationThreshold, setEscalationThreshold } = useSettings();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {LEVELS.map((l) => {
          const active = escalationThreshold === l.id;
          return (
            <motion.button
              key={l.id}
              onClick={() => setEscalationThreshold(l.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={{
                background: active ? `${l.color}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? `${l.color}40` : 'rgba(255,255,255,0.07)'}`,
                color: active ? l.color : '#64748b',
              }}
            >
              <AlertTriangle size={12} style={{ color: active ? l.color : '#475569' }} />
              {l.label}
              {active && <Check size={10} />}
            </motion.button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed">
        Currently: <span className="text-white font-medium">{LEVELS.find(l => l.id === escalationThreshold)?.description}</span>.
        {' '}Lower-level escalations are still handled by your team — they just won't surface to your dashboard.
      </p>
    </div>
  );
}

// ── 3. StatusBar metric reorder ───────────────────────────────────────────────

function MetricToggleRow({
  metric,
  onToggle,
  isDragging,
  isOver,
  dragHandleProps,
}: {
  metric: StatusMetric;
  onToggle: () => void;
  isDragging: boolean;
  isOver: boolean;
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <motion.div
      layout
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
      style={{
        background: isOver ? 'rgba(56,189,248,0.06)' : isDragging ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isOver ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)'}`,
        opacity: isDragging ? 0.45 : 1,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="flex items-center text-slate-700 hover:text-slate-500 transition-colors shrink-0"
        style={{ cursor: 'grab', touchAction: 'none' }}
      >
        <GripVertical size={14} />
      </div>

      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white">{metric.label}</p>
        <p className="text-[11px] text-slate-500 truncate">{metric.description}</p>
      </div>

      {/* Visible toggle */}
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
        style={{
          background: metric.visible ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${metric.visible ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)'}`,
          color: metric.visible ? '#34d399' : '#475569',
        }}
      >
        {metric.visible ? <Eye size={11} /> : <EyeOff size={11} />}
        {metric.visible ? 'Visible' : 'Hidden'}
      </button>
    </motion.div>
  );
}

function StatusBarMetricsEditor() {
  const { statusBarMetrics, setStatusBarMetrics } = useSettings();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleToggle = (id: string) => {
    setStatusBarMetrics(
      statusBarMetrics.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m))
    );
  };

  const handleDragStart = (e: React.DragEvent, i: number) => {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIdx !== i) setOverIdx(i);
  };

  const handleDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return;
    const next = [...statusBarMetrics];
    const [item] = next.splice(dragIdx, 1);
    next.splice(i, 0, item);
    setStatusBarMetrics(next);
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-slate-500 mb-3">
        Drag to reorder · toggle visibility. Changes reflect in the StatusBar immediately.
      </p>
      {statusBarMetrics.map((m, i) => (
        <div
          key={m.id}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={() => handleDrop(i)}
          onDragEnd={handleDragEnd}
        >
          <MetricToggleRow
            metric={m}
            onToggle={() => handleToggle(m.id)}
            isDragging={dragIdx === i}
            isOver={overIdx === i && dragIdx !== i}
            dragHandleProps={{
              draggable: true,
              onDragStart: (e: React.DragEvent) => handleDragStart(e, i),
            } as React.HTMLAttributes<HTMLDivElement>}
          />
        </div>
      ))}
    </div>
  );
}

// ── 4. Nav group visibility ───────────────────────────────────────────────────

const NAV_META: Record<string, { label: string; icon: React.ElementType; color: string; description: string }> = {
  desk:         { label: 'CEO Desk',     icon: Sparkles,  color: '#f59e0b', description: 'Personal deep-work space' },
  command:      { label: 'Command',      icon: Shield,    color: '#f43f5e', description: 'Home, Control Center, Escalations' },
  agents:       { label: 'Agents',       icon: Users,     color: '#38bdf8', description: 'People, Workspace, Evaluations' },
  intelligence: { label: 'Intelligence', icon: BookOpen,  color: '#a78bfa', description: 'Vault, Timeline, Missions' },
  system:       { label: 'System',       icon: Settings,  color: '#34d399', description: 'Skills, Terminal, Settings' },
};

function NavVisibilityEditor() {
  const { navGroupVisibility, setNavGroupVisibility } = useSettings();

  const toggle = (id: string) => {
    // CEO Desk and Command cannot be hidden (always relevant)
    if (id === 'desk' || id === 'command') return;
    setNavGroupVisibility(
      navGroupVisibility.map((g) => (g.id === id ? { ...g, visible: !g.visible } : g))
    );
  };

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-slate-500 mb-3">
        CEO Desk and Command are always visible. Others can be hidden to reduce nav clutter.
      </p>
      {navGroupVisibility.map((g) => {
        const meta = NAV_META[g.id];
        if (!meta) return null;
        const locked = g.id === 'desk' || g.id === 'command';
        return (
          <div
            key={g.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              opacity: locked ? 0.7 : 1,
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}20` }}
            >
              <meta.icon size={13} style={{ color: meta.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white">{meta.label}</p>
              <p className="text-[11px] text-slate-500">{meta.description}</p>
            </div>
            <button
              onClick={() => toggle(g.id)}
              disabled={locked}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
              style={{
                background: g.visible ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${g.visible ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)'}`,
                color: locked ? '#475569' : g.visible ? '#34d399' : '#64748b',
                cursor: locked ? 'not-allowed' : 'pointer',
              }}
            >
              {g.visible ? <Eye size={11} /> : <EyeOff size={11} />}
              {locked ? 'Always on' : g.visible ? 'Visible' : 'Hidden'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { resetToDefaults } = useSettings();
  const [showSaved, setShowSaved] = useState(false);

  const handleReset = () => {
    resetToDefaults();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2200);
  };

  // Auto-show saved toast whenever a setting changes
  // We do this via a small wrapper that flashes on interaction
  const flash = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1600);
  };

  return (
    <AppShell>
      <TopNav />
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
        // Capture change events bubbling up from inputs/buttons
        onChange={flash}
        onClick={flash}
      >
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}
              >
                <Settings className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-sm text-slate-500">Your preferences are saved automatically and persist across sessions.</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
            >
              <RotateCcw size={11} />
              Reset to defaults
            </button>
          </motion.div>

          {/* 1 — Layout Presets */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Section
              title="Layout Presets"
              description="Switch your dashboard into a different mode based on what you're doing right now."
            >
              <LayoutPresets />
            </Section>
          </motion.div>

          {/* 2 — Escalation Threshold */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Section
              title="Escalation Threshold"
              description="Only surface escalations above this priority to your dashboard. Your team still handles lower levels."
            >
              <EscalationThresholdPicker />
            </Section>
          </motion.div>

          {/* 3 — StatusBar Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Section
              title="StatusBar Metrics"
              description="Drag to reorder. Toggle visibility for metrics you don't want cluttering your view."
            >
              <StatusBarMetricsEditor />
            </Section>
          </motion.div>

          {/* 4 — Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Section
              title="Navigation Groups"
              description="Show or hide navigation sections to keep your sidebar focused."
            >
              <NavVisibilityEditor />
            </Section>
          </motion.div>

          {/* Bottom spacer */}
          <div className="h-8" />

        </div>
      </div>

      <SavedToast visible={showSaved} />
    </AppShell>
  );
}
