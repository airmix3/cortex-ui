'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X,
  Archive, CheckCircle2, ExternalLink,
  FileText, Table2, Code2, FileImage, Presentation, Film,
  Star, Package, Vault, Users, RotateCcw, Send, Sparkles,
  ArrowRight, ChevronRight,
} from 'lucide-react';
import {
  MOCK_DELIVERABLES,
  MOCK_MISSIONS,
  FILE_TYPE_CONFIG,
  STATUS_CONFIG,
  DEPT_COLORS,
  relativeTime,
  type DeliverableItem,
  type DeliverableType,
  type DeliverableStatus,
  type DeliverableMission,
} from '@/data/deliverables-data';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// ── File type icon map ────────────────────────────────────────────────────────

const TYPE_ICONS: Record<DeliverableType, React.ElementType> = {
  document:     FileText,
  spreadsheet:  Table2,
  code:         Code2,
  pdf:          FileText,
  presentation: Presentation,
  image:        FileImage,
  video:        Film,
};

// ── Shared atoms ─────────────────────────────────────────────────────────────

function TypeBadge({ type, size = 'md' }: { type: DeliverableType; size?: 'sm' | 'md' | 'lg' }) {
  const cfg = FILE_TYPE_CONFIG[type];
  const Icon = TYPE_ICONS[type];
  const dims = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;
  const fontSize = size === 'sm' ? '8px' : size === 'lg' ? '10px' : '9px';
  return (
    <div
      className="rounded-lg flex flex-col items-center justify-center gap-0.5 shrink-0"
      style={{ width: dims, height: dims, background: cfg.bg, border: `1px solid ${cfg.color}25` }}
    >
      <Icon size={iconSize} style={{ color: cfg.color }} />
      <span className="font-bold" style={{ fontSize, color: cfg.color, letterSpacing: '0.04em' }}>
        {cfg.ext}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: DeliverableStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

function AgentAvatar({ name, avatar, color, size = 20 }: {
  name: string; avatar: string; color: string; size?: number;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-bold"
      style={{
        width: size, height: size,
        background: `${color}20`,
        border: `1px solid ${color}40`,
        color,
        fontSize: size <= 20 ? '8px' : size <= 28 ? '9px' : '11px',
      }}
      title={name}
    >
      {avatar}
    </div>
  );
}

// ── MissionProgressBar ────────────────────────────────────────────────────────

function MissionProgressBar({ items, height = 4 }: { items: DeliverableItem[]; height?: number }) {
  const total    = items.length;
  const approved = items.filter((d) => d.status === 'approved').length;
  const ready    = items.filter((d) => d.status === 'ready').length;
  const draft    = items.filter((d) => d.status === 'draft').length;
  if (total === 0) return null;
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <div className="w-full rounded-full overflow-hidden flex" style={{ height, background: 'rgba(255,255,255,0.05)' }}>
      {approved > 0 && <div style={{ width: pct(approved), background: '#34d399', transition: 'width 0.4s ease' }} />}
      {ready    > 0 && <div style={{ width: pct(ready),    background: '#f59e0b', transition: 'width 0.4s ease' }} />}
      {draft    > 0 && <div style={{ width: pct(draft),    background: 'rgba(100,116,139,0.4)', transition: 'width 0.4s ease' }} />}
    </div>
  );
}

// ── Dept helpers ──────────────────────────────────────────────────────────────

function getDepts(missions: DeliverableMission[]) {
  const seen = new Set<string>();
  const depts: { name: string; color: string }[] = [];
  missions.forEach((m) => {
    if (!seen.has(m.department)) {
      seen.add(m.department);
      depts.push({ name: m.department, color: DEPT_COLORS[m.department] ?? '#64748b' });
    }
  });
  return depts;
}

// ── DeptRail — horizontal department tab bar ──────────────────────────────────

function DeptRail({
  missions,
  deliverables,
  selectedDeptId,
  onSelect,
}: {
  missions: DeliverableMission[];
  deliverables: DeliverableItem[];
  selectedDeptId: string | null;
  onSelect: (dept: string | null) => void;
}) {
  const depts = useMemo(() => getDepts(missions), [missions]);

  return (
    <div
      className="shrink-0 flex items-center gap-1 px-4 overflow-x-auto"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', scrollbarWidth: 'none', minHeight: 44 }}
    >
      {/* All tab */}
      <button
        onClick={() => onSelect(null)}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
        style={{
          color: selectedDeptId === null ? 'white' : '#64748b',
          background: selectedDeptId === null ? 'rgba(255,255,255,0.07)' : 'transparent',
          border: selectedDeptId === null ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
        }}
      >
        <Package size={11} style={{ color: selectedDeptId === null ? '#94a3b8' : '#475569' }} />
        All
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
          style={{
            color: selectedDeptId === null ? '#94a3b8' : '#475569',
            background: selectedDeptId === null ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
          }}
        >
          {deliverables.length}
        </span>
      </button>

      {/* Separator */}
      <div className="w-px h-4 shrink-0 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Dept tabs */}
      {depts.map((dept) => {
        const deptFiles   = deliverables.filter((d) => d.department === dept.name);
        const readyCount  = deptFiles.filter((d) => d.status === 'ready').length;
        const isActive    = selectedDeptId === dept.name;

        return (
          <button
            key={dept.name}
            onClick={() => onSelect(dept.name)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
            style={{
              color: isActive ? 'white' : '#64748b',
              background: isActive ? `${dept.color}12` : 'transparent',
              border: isActive ? `1px solid ${dept.color}30` : '1px solid transparent',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: isActive ? dept.color : '#334155' }}
            />
            {dept.name}
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
              style={{
                color: isActive ? dept.color : '#475569',
                background: isActive ? `${dept.color}18` : 'rgba(255,255,255,0.04)',
              }}
            >
              {deptFiles.length}
            </span>
            {readyCount > 0 && (
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: '#f59e0b', boxShadow: '0 0 4px rgba(245,158,11,0.6)' }}
                title={`${readyCount} ready for review`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── DeptLandingGrid — all-department overview ─────────────────────────────────

function DeptLandingGrid({
  missions,
  deliverables,
  onSelectDept,
}: {
  missions: DeliverableMission[];
  deliverables: DeliverableItem[];
  onSelectDept: (dept: string) => void;
}) {
  const depts = useMemo(() => getDepts(missions), [missions]);
  const totalApproved = deliverables.filter((d) => d.status === 'approved').length;
  const totalReady    = deliverables.filter((d) => d.status === 'ready').length;
  const totalPending  = deliverables.filter((d) => d.revisionRequestedAt).length;

  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-6"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
    >
      {/* Summary strip */}
      <div className="flex items-center gap-6 mb-6">
        <div>
          <p className="text-[22px] font-bold text-white leading-none">{deliverables.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Total files</p>
        </div>
        {[
          { label: 'Approved',          value: totalApproved, color: '#34d399' },
          { label: 'Ready for review',  value: totalReady,    color: '#f59e0b' },
          { label: 'Revisions pending', value: totalPending,  color: '#f87171' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-[3px] h-8 rounded-full shrink-0" style={{ background: s.color }} />
            <div>
              <p className="text-[16px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
        <p className="ml-auto text-[11px] text-slate-600">Select a department to browse missions</p>
      </div>

      {/* Dept cards grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {depts.map((dept, i) => {
          const deptMissions = missions.filter((m) => m.department === dept.name);
          const deptFiles    = deliverables.filter((d) => d.department === dept.name);
          const approved     = deptFiles.filter((d) => d.status === 'approved').length;
          const ready        = deptFiles.filter((d) => d.status === 'ready').length;
          const draft        = deptFiles.filter((d) => d.status === 'draft').length;

          // Unique agents across dept
          const agents: DeliverableItem[] = [];
          const seen = new Set<string>();
          deptFiles.forEach((d) => { if (!seen.has(d.agentName)) { seen.add(d.agentName); agents.push(d); } });

          return (
            <motion.button
              key={dept.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: i * 0.05 }}
              onClick={() => onSelectDept(dept.name)}
              className="group relative text-left rounded-xl overflow-hidden cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Left accent stripe */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-xl"
                style={{ background: dept.color, opacity: 0.4 }}
              />

              {/* Hover: border brighten only */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)' }}
              />

              <div className="py-4 px-5 pl-5">
                {/* Header: dept name + meta */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[16px] font-bold leading-tight mb-1" style={{ color: '#e2e8f0' }}>
                      {dept.name}
                    </h3>
                    <p className="text-[11px]" style={{ color: '#475569' }}>
                      {deptMissions.length} mission{deptMissions.length !== 1 ? 's' : ''} · {deptFiles.length} files
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0"
                    style={{ color: '#475569' }}
                  />
                </div>

                {/* Mission list */}
                <div className="space-y-1.5 mb-4">
                  {deptMissions.slice(0, 3).map((m) => {
                    const mFiles  = deliverables.filter((d) => d.missionId === m.id);
                    const mReady  = mFiles.filter((d) => d.status === 'ready').length;
                    return (
                      <div key={m.id} className="flex items-center justify-between gap-3">
                        <span className="text-[11px] truncate" style={{ color: '#64748b' }}>{m.title}</span>
                        {mReady > 0 && (
                          <span className="text-[10px] font-semibold shrink-0" style={{ color: '#f59e0b99' }}>
                            {mReady} ready
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {deptMissions.length > 3 && (
                    <p className="text-[10px]" style={{ color: '#334155' }}>+{deptMissions.length - 3} more</p>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />

                {/* Footer: status summary + agents */}
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px]" style={{ color: '#475569' }}>
                    {[
                      approved > 0 ? `${approved} approved` : null,
                      ready    > 0 ? `${ready} ready`       : null,
                      draft    > 0 ? `${draft} draft`       : null,
                    ].filter(Boolean).join('  ·  ')}
                  </p>
                  <div className="flex items-center">
                    {agents.slice(0, 3).map((a, idx) => (
                      <div key={a.agentName} style={{ marginLeft: idx > 0 ? -5 : 0, zIndex: 10 - idx }}
                        className="ring-1 ring-[rgba(6,10,19,0.9)] rounded-full">
                        <AgentAvatar name={a.agentName} avatar={a.agentAvatar} color={a.agentColor} size={18} />
                      </div>
                    ))}
                    {agents.length > 3 && (
                      <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[7px] font-bold ml-[-5px] ring-1 ring-[rgba(6,10,19,0.9)]"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#475569' }}>
                        +{agents.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── MissionSubGrid — missions within a selected department ────────────────────

function MissionSubGrid({
  dept,
  missions,
  deliverables,
  onSelectMission,
}: {
  dept: { name: string; color: string };
  missions: DeliverableMission[];
  deliverables: DeliverableItem[];
  onSelectMission: (id: string) => void;
}) {
  const deptMissions = missions.filter((m) => m.department === dept.name);
  const deptFiles    = deliverables.filter((d) => d.department === dept.name);

  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-5"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
    >
      {/* Dept header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-8 rounded-full" style={{ background: dept.color }} />
        <div>
          <h2 className="text-[16px] font-bold" style={{ color: dept.color }}>{dept.name}</h2>
          <p className="text-[11px] text-slate-500">
            {deptMissions.length} mission{deptMissions.length !== 1 ? 's' : ''} · {deptFiles.length} files
          </p>
        </div>
      </div>

      {/* Mission cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {deptMissions.map((mission, i) => {
          const items    = deliverables.filter((d) => d.missionId === mission.id);
          const approved = items.filter((d) => d.status === 'approved').length;
          const ready    = items.filter((d) => d.status === 'ready').length;
          const draft    = items.filter((d) => d.status === 'draft').length;
          const pending  = items.filter((d) => d.revisionRequestedAt).length;

          const agents: DeliverableItem[] = [];
          const seen = new Set<string>();
          items.forEach((d) => { if (!seen.has(d.agentName)) { seen.add(d.agentName); agents.push(d); } });

          const healthColor = approved === items.length && items.length > 0
            ? '#34d399'
            : ready > 0 ? '#f59e0b'
            : '#64748b';

          return (
            <motion.button
              key={mission.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              onClick={() => onSelectMission(mission.id)}
              className="group relative text-left rounded-2xl overflow-hidden transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
            >
              <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${mission.color}, ${mission.color}50)` }} />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at top, ${mission.color}08, transparent 60%)` }}
              />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: healthColor, background: `${healthColor}12`, border: `1px solid ${healthColor}25` }}
                  >
                    {items.length} files
                  </span>
                  <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-all" style={{ color: mission.color }} />
                </div>

                <h3 className="text-[14px] font-bold text-white leading-snug mb-1.5">{mission.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4 line-clamp-2">{mission.description}</p>

                <div className="mb-3">
                  <MissionProgressBar items={items} height={5} />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  {[
                    { n: approved, label: 'approved', color: '#34d399' },
                    { n: ready,    label: 'ready',    color: '#f59e0b' },
                    { n: draft,    label: 'draft',    color: '#64748b' },
                    { n: pending,  label: 'revision', color: '#f87171' },
                  ].filter((s) => s.n > 0).map((s) => (
                    <div key={s.label} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-[10px] font-semibold" style={{ color: s.color }}>{s.n}</span>
                      <span className="text-[10px] text-slate-600">{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {agents.slice(0, 3).map((a, idx) => (
                      <div key={a.agentName} style={{ marginLeft: idx > 0 ? -6 : 0, zIndex: 10 - idx }}
                        className="ring-1 ring-[rgba(6,10,19,0.9)] rounded-full">
                        <AgentAvatar name={a.agentName} avatar={a.agentAvatar} color={a.agentColor} size={22} />
                      </div>
                    ))}
                    {agents.length > 3 && (
                      <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-bold ml-[-6px] ring-1 ring-[rgba(6,10,19,0.9)]"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}>
                        +{agents.length - 3}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                    style={{ color: mission.color }}
                  >
                    View files <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── MissionContextBar — pipeline header inside a mission ──────────────────────

function PipelineStep({ label, count, color, isLit }: {
  label: string; count: number; color: string; isLit: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
      style={{
        background: isLit ? `${color}10` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isLit ? `${color}25` : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      <span className="text-[18px] font-bold leading-none" style={{ color: isLit ? color : '#334155' }}>{count}</span>
      <span className="text-[9.5px] font-semibold" style={{ color: isLit ? color : '#475569' }}>{label}</span>
    </div>
  );
}

function MissionContextBar({
  mission,
  deptName,
  items,
  onBackToDept,
}: {
  mission: DeliverableMission;
  deptName: string;
  items: DeliverableItem[];
  onBackToDept: () => void;
}) {
  const approved = items.filter((d) => d.status === 'approved').length;
  const ready    = items.filter((d) => d.status === 'ready').length;
  const draft    = items.filter((d) => d.status === 'draft').length;

  const agents: DeliverableItem[] = [];
  const seen = new Set<string>();
  items.forEach((d) => { if (!seen.has(d.agentName)) { seen.add(d.agentName); agents.push(d); } });

  return (
    <motion.div
      key={mission.id}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="shrink-0 flex items-center gap-4 px-5 py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: `${mission.color}04` }}
    >
      {/* Left: breadcrumb + title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-[3px] h-9 rounded-full shrink-0" style={{ background: mission.color, boxShadow: `0 0 8px ${mission.color}60` }} />
        <div className="min-w-0">
          {/* Breadcrumb */}
          <button
            onClick={onBackToDept}
            className="flex items-center gap-1 mb-0.5 cursor-pointer group/bc"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest transition-colors group-hover/bc:text-white" style={{ color: `${mission.color}90` }}>
              {deptName}
            </span>
            <ChevronRight size={8} style={{ color: `${mission.color}60` }} />
          </button>
          <h2 className="text-[14px] font-bold text-white leading-tight truncate">{mission.title}</h2>
        </div>
      </div>

      {/* Center: pipeline */}
      <div className="flex items-center gap-2 shrink-0">
        <PipelineStep label="Draft"    count={draft}    color="#64748b" isLit={draft > 0} />
        <ArrowRight size={11} className="text-slate-700 shrink-0" />
        <PipelineStep label="Ready"    count={ready}    color="#f59e0b" isLit={ready > 0} />
        <ArrowRight size={11} className="text-slate-700 shrink-0" />
        <PipelineStep label="Approved" count={approved} color="#34d399" isLit={approved > 0} />
      </div>

      {/* Right: agents */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center">
          {agents.slice(0, 4).map((a, i) => (
            <div key={a.agentName} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 10 - i }}
              className="ring-1 ring-[rgba(6,10,19,0.9)] rounded-full">
              <AgentAvatar name={a.agentName} avatar={a.agentAvatar} color={a.agentColor} size={22} />
            </div>
          ))}
          {agents.length > 4 && (
            <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-bold ml-[-6px] ring-1 ring-[rgba(6,10,19,0.9)]"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}>
              +{agents.length - 4}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Users size={10} className="text-slate-600" />
          <span className="text-[10px] text-slate-600">{agents.length} agent{agents.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── RevisionForm ──────────────────────────────────────────────────────────────

type RevisionState = 'idle' | 'composing' | 'sent';

function RevisionForm({ item, onRevise }: { item: DeliverableItem; onRevise: (id: string, note: string) => void }) {
  const [state, setState] = useState<RevisionState>(item.revisionRequestedAt ? 'sent' : 'idle');
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state === 'composing') setTimeout(() => textareaRef.current?.focus(), 50);
  }, [state]);

  const handleSend = () => {
    if (!text.trim()) return;
    onRevise(item.id, text.trim());
    setState('sent');
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
    if (e.key === 'Escape') { setState('idle'); setText(''); }
  };

  if (state === 'sent' && item.revisionNote) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden"
        style={{ borderLeft: '3px solid rgba(245,158,11,0.6)', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)', borderLeftWidth: 3 }}>
        <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(245,158,11,0.08)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>T</div>
            <span className="text-[10px] font-semibold text-amber-400/80">Revision requested</span>
            <span className="text-[9px] text-slate-600">· {item.revisionRequestedAt ? relativeTime(item.revisionRequestedAt) : 'just now'}</span>
          </div>
          <button onClick={() => { setState('composing'); setText(item.revisionNote ?? ''); }} className="text-[9px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer">Edit</button>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[11px] text-slate-400 leading-relaxed italic">&ldquo;{item.revisionNote}&rdquo;</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderTop: '1px solid rgba(245,158,11,0.08)' }}>
          <Sparkles size={9} className="text-amber-500/60" />
          <span className="text-[9.5px] text-slate-600">Tamir → <span className="text-slate-400">{item.agentName}</span></span>
        </div>
      </motion.div>
    );
  }

  if (state === 'composing') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden"
        style={{ background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.18)' }}>
        <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: '1px solid rgba(245,158,11,0.08)' }}>
          <RotateCcw size={9} className="text-amber-500/60 shrink-0" />
          <span className="text-[9.5px] text-slate-500 truncate">Revising <span className="text-slate-400 font-medium">{item.name}</span></span>
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={'What needs to change? Be specific.\n\nExample: "The subject lines are too generic — rewrite targeting compliance leads at Series B companies."'}
          rows={4}
          className="w-full px-3 py-2.5 text-[11.5px] text-slate-300 placeholder-slate-600 resize-none outline-none bg-transparent leading-relaxed"
          style={{ minHeight: 96 }}
        />
        <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: '1px solid rgba(245,158,11,0.08)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>T</div>
            <span className="text-[9.5px] text-slate-600">Tamir → <span className="text-slate-500">{item.agentName}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setState('idle'); setText(''); }} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer">Cancel</button>
            <button onClick={handleSend} disabled={!text.trim()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Send size={10} />Send<span className="text-[8px] opacity-60 font-normal">⌘↵</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <button onClick={() => setState('composing')}
      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-medium transition-all cursor-pointer"
      style={{
        color: item.revisionRequestedAt ? '#64748b' : '#f59e0b',
        background: item.revisionRequestedAt ? 'rgba(255,255,255,0.02)' : 'rgba(245,158,11,0.06)',
        border: item.revisionRequestedAt ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(245,158,11,0.15)',
      }}>
      <RotateCcw size={12} />
      {item.revisionRequestedAt ? 'Revise again' : 'Request Revision'}
    </button>
  );
}

// ── DeliverableCard ───────────────────────────────────────────────────────────

function DeliverableCard({
  item, isSelected, onSelect, onApprove, onVault,
}: {
  item: DeliverableItem; isSelected: boolean;
  onSelect: () => void; onApprove: (id: string) => void; onVault: (id: string) => void;
}) {
  const typeCfg   = FILE_TYPE_CONFIG[item.type];
  const statusCfg = STATUS_CONFIG[item.status];
  const Icon      = TYPE_ICONS[item.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      onClick={onSelect}
      className="group relative rounded-xl cursor-pointer overflow-hidden"
      style={{
        background: isSelected ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${isSelected ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {/* Status accent bar — left edge, always present, muted */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-xl"
        style={{ background: statusCfg.color, opacity: isSelected ? 0.8 : 0.35 }}
      />

      {/* Hover: brighten border only */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)' }}
      />

      <div className="px-4 pt-3.5 pb-3 pl-5">
        {/* Row 1: icon + filename + status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <Icon
              size={13}
              className="shrink-0 mt-[3px]"
              style={{ color: typeCfg.color + '70' }}
            />
            <p
              className="text-[12.5px] font-semibold leading-snug truncate"
              style={{ color: '#e2e8f0' }}
              title={item.name}
            >
              {item.name}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-[1px]">
            {item.revisionRequestedAt && (
              <RotateCcw size={10} style={{ color: '#f59e0b70' }} title="Revision requested" />
            )}
            {item.pushedToVault && (
              <Archive size={10} style={{ color: '#34d39960' }} title="Saved to vault" />
            )}
            <span
              className="text-[9.5px] font-semibold tracking-wide"
              style={{ color: statusCfg.color + 'bb' }}
            >
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Row 2: preview */}
        <p
          className="text-[11px] leading-relaxed line-clamp-2 mb-2.5 ml-[21px]"
          style={{ color: '#475569' }}
        >
          {item.preview}
        </p>

        {/* Row 3: key stats — plain text, no pills */}
        {item.stats && item.stats.length > 0 && (
          <p
            className="text-[10.5px] leading-snug mb-3 ml-[21px] truncate"
            style={{ color: '#64748b' }}
          >
            {item.stats.slice(0, 3).join('  ·  ')}
          </p>
        )}

        {/* Row 4: footer */}
        <div className="flex items-center justify-between ml-[21px]">
          <div className="flex items-center gap-1.5">
            <AgentAvatar name={item.agentName} avatar={item.agentAvatar} color={item.agentColor} size={16} />
            <span className="text-[10px]" style={{ color: '#475569' }}>{item.agentName}</span>
            <span style={{ color: '#2d3748' }}>·</span>
            <span className="text-[10px]" style={{ color: '#374151' }}>{relativeTime(item.createdAt)}</span>
          </div>
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {item.status === 'ready' && (
              <button
                onClick={() => onApprove(item.id)}
                className="text-[9.5px] font-semibold px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                style={{ color: '#34d399', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)' }}
              >
                Approve
              </button>
            )}
            {!item.pushedToVault && (item.status === 'approved' || item.status === 'ready') && (
              <button
                onClick={() => onVault(item.id)}
                className="text-[9.5px] font-semibold px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.18)' }}
              >
                Vault
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── DetailPanel ───────────────────────────────────────────────────────────────

function DetailPanel({
  item, onClose, onApprove, onVault, onRevise,
}: {
  item: DeliverableItem; onClose: () => void;
  onApprove: (id: string) => void; onVault: (id: string) => void;
  onRevise: (id: string, note: string) => void;
}) {
  const typeCfg = FILE_TYPE_CONFIG[item.type];

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-full overflow-hidden shrink-0"
      style={{ width: 300, borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,10,19,0.9)' }}
    >
      <div className="shrink-0 px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-start justify-between mb-3">
          <TypeBadge type={item.type} size="lg" />
          <button onClick={onClose} className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10">
            <X size={12} className="text-slate-500" />
          </button>
        </div>
        <p className="text-[13px] font-semibold text-white leading-snug mb-2 break-all">{item.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={item.status} />
          {item.revisionRequestedAt && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-semibold"
              style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <RotateCcw size={8} />Revision pending
            </span>
          )}
          <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-md"
            style={{ color: '#64748b', background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.12)' }}>
            {item.size}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
        <div className="flex items-center gap-2.5">
          <AgentAvatar name={item.agentName} avatar={item.agentAvatar} color={item.agentColor} size={28} />
          <div>
            <p className="text-[11.5px] font-semibold text-slate-300">{item.agentName}</p>
            <p className="text-[10px] text-slate-600">{item.department} · {relativeTime(item.createdAt)}</p>
          </div>
        </div>

        {item.missionTitle && item.missionId !== 'standalone' && (
          <div>
            <div className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold mb-1.5">Mission</div>
            <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
              <Star size={10} className="text-amber-400/70 shrink-0" />
              <span className="text-[11px] text-amber-300/80">{item.missionTitle}</span>
              <ExternalLink size={9} className="ml-auto text-slate-600 shrink-0" />
            </div>
          </div>
        )}

        {item.stats && item.stats.length > 0 && (
          <div>
            <div className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold mb-1.5">Key Figures</div>
            <div className="grid grid-cols-2 gap-1.5">
              {item.stats.map((s) => (
                <div key={s} className="px-2.5 py-2 rounded-lg text-center"
                  style={{ background: typeCfg.bg, border: `1px solid ${typeCfg.color}20` }}>
                  <p className="text-[10.5px] font-semibold leading-tight" style={{ color: typeCfg.color }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold mb-1.5">Preview</div>
          <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">{item.preview}</p>
        </div>

        {item.tags.length > 0 && (
          <div>
            <div className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold mb-1.5">Tags</div>
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md text-[9.5px] font-medium"
                  style={{ color: '#64748b', background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.12)' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.pushedToVault && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <Archive size={12} className="text-emerald-400 shrink-0" />
            <p className="text-[10.5px] text-emerald-400/80">Saved to Vault</p>
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 py-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {item.status === 'ready' && (
          <button onClick={() => onApprove(item.id)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer"
            style={{ color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <CheckCircle2 size={13} />Approve Deliverable
          </button>
        )}
        {!item.pushedToVault && (item.status === 'approved' || item.status === 'ready') && (
          <button onClick={() => onVault(item.id)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer"
            style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <Vault size={13} />Push to Vault
          </button>
        )}
        <RevisionForm key={item.id} item={item} onRevise={onRevise} />
        <button
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-medium transition-all cursor-pointer"
          style={{ color: '#64748b', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <ExternalLink size={12} />Open File
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useLocalStorage<DeliverableItem[]>('myelin:deliverables:v1', MOCK_DELIVERABLES);
  const [selectedDeptId,    setSelectedDeptId]    = useLocalStorage<string | null>('myelin:deliverables:dept',    null);
  const [selectedMissionId, setSelectedMissionId] = useLocalStorage<string | null>('myelin:deliverables:mission', null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliverableStatus | 'all'>('all');
  const [selectedId,   setSelectedId]   = useState<string | null>(null);

  const selectedMission = selectedMissionId
    ? MOCK_MISSIONS.find((m) => m.id === selectedMissionId) ?? null
    : null;

  const selectedDept = selectedDeptId
    ? { name: selectedDeptId, color: DEPT_COLORS[selectedDeptId] ?? '#64748b' }
    : null;

  const missionItems = useMemo(() =>
    selectedMissionId ? deliverables.filter((d) => d.missionId === selectedMissionId) : deliverables,
    [deliverables, selectedMissionId]
  );

  const filtered = useMemo(() => {
    let list = missionItems;
    if (statusFilter !== 'all') list = list.filter((d) => d.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.preview.toLowerCase().includes(q) ||
        d.agentName.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [missionItems, statusFilter, searchQuery]);

  const selectedItem = selectedId ? deliverables.find((d) => d.id === selectedId) ?? null : null;

  const handleApprove = (id: string) =>
    setDeliverables((prev) => prev.map((d) => d.id === id ? { ...d, status: 'approved' as const } : d));

  const handleVault = (id: string) =>
    setDeliverables((prev) => prev.map((d) => d.id === id ? { ...d, pushedToVault: true } : d));

  const handleRevise = (id: string, note: string) =>
    setDeliverables((prev) => prev.map((d) =>
      d.id === id ? { ...d, revisionNote: note, revisionRequestedAt: new Date().toISOString() } : d
    ));

  // Dept tab selected → show dept's missions
  const handleDeptSelect = (dept: string | null) => {
    setSelectedDeptId(dept);
    setSelectedMissionId(null);
    setSelectedId(null);
    setStatusFilter('all');
    setSearchQuery('');
  };

  // Mission card tapped → show its files
  const handleMissionSelect = (id: string) => {
    const mission = MOCK_MISSIONS.find((m) => m.id === id);
    if (mission) setSelectedDeptId(mission.department);
    setSelectedMissionId(id);
    setSelectedId(null);
    setStatusFilter('all');
    setSearchQuery('');
  };

  // Back from mission → dept mission grid
  const handleBackToDept = () => {
    setSelectedMissionId(null);
    setSelectedId(null);
    setStatusFilter('all');
    setSearchQuery('');
  };

  const STATUS_PILLS: { value: DeliverableStatus | 'all'; label: string; color?: string }[] = [
    { value: 'all',      label: 'All' },
    { value: 'ready',    label: 'Ready',    color: '#f59e0b' },
    { value: 'draft',    label: 'Draft',    color: '#64748b' },
    { value: 'approved', label: 'Approved', color: '#34d399' },
  ];

  // View routing
  const view =
    selectedMissionId !== null ? 'files'
    : selectedDeptId  !== null ? 'dept-missions'
    : 'all-depts';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Dept Rail */}
      <DeptRail
        missions={MOCK_MISSIONS}
        deliverables={deliverables}
        selectedDeptId={selectedDeptId}
        onSelect={handleDeptSelect}
      />

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">

          {view === 'all-depts' && (
            <motion.div key="all-depts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col overflow-hidden">
              <DeptLandingGrid
                missions={MOCK_MISSIONS}
                deliverables={deliverables}
                onSelectDept={(dept) => handleDeptSelect(dept)}
              />
            </motion.div>
          )}

          {view === 'dept-missions' && selectedDept && (
            <motion.div key={`dept-${selectedDeptId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col overflow-hidden">
              <MissionSubGrid
                dept={selectedDept}
                missions={MOCK_MISSIONS}
                deliverables={deliverables}
                onSelectMission={handleMissionSelect}
              />
            </motion.div>
          )}

          {view === 'files' && selectedMission && selectedDept && (
            <motion.div key={`mission-${selectedMissionId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col overflow-hidden">
              <MissionContextBar
                mission={selectedMission}
                deptName={selectedDept.name}
                items={missionItems}
                onBackToDept={handleBackToDept}
              />

              {/* Toolbar */}
              <div className="shrink-0 flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="relative flex-1 max-w-xs">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files…"
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg text-[11.5px] text-slate-300 placeholder-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer">
                      <X size={10} className="text-slate-600 hover:text-slate-400" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {STATUS_PILLS.map((pill) => {
                    const count = pill.value === 'all' ? missionItems.length : missionItems.filter((d) => d.status === pill.value).length;
                    const isActive = statusFilter === pill.value;
                    return (
                      <button key={pill.value} onClick={() => setStatusFilter(pill.value)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer"
                        style={{
                          color: isActive ? (pill.color ?? 'white') : '#64748b',
                          background: isActive ? (pill.color ? `${pill.color}10` : 'rgba(255,255,255,0.06)') : 'transparent',
                          border: isActive ? `1px solid ${pill.color ? `${pill.color}25` : 'rgba(255,255,255,0.1)'}` : '1px solid transparent',
                        }}>
                        {pill.label}
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                          style={{ color: isActive ? (pill.color ?? 'white') : '#475569', background: isActive ? (pill.color ? `${pill.color}15` : 'rgba(255,255,255,0.06)') : 'transparent' }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <span className="ml-auto text-[10.5px] text-slate-600">
                  <span className="text-slate-400 font-semibold">{filtered.length}</span> files
                </span>
              </div>

              {/* Cards + detail panel */}
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <Package size={20} className="text-amber-400/60" />
                      </div>
                      <p className="text-[13px] font-semibold text-slate-400 mb-1">No files found</p>
                      <p className="text-[11px] text-slate-600">Try a different status filter</p>
                    </div>
                  ) : (
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                      <AnimatePresence mode="popLayout">
                        {filtered.map((item) => (
                          <DeliverableCard
                            key={item.id}
                            item={item}
                            isSelected={selectedId === item.id}
                            onSelect={() => setSelectedId(selectedId === item.id ? null : item.id)}
                            onApprove={handleApprove}
                            onVault={handleVault}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {selectedItem && (
                    <DetailPanel
                      key={selectedItem.id}
                      item={selectedItem}
                      onClose={() => setSelectedId(null)}
                      onApprove={handleApprove}
                      onVault={handleVault}
                      onRevise={handleRevise}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
