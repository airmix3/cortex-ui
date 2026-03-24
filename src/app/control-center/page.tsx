'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppShell from '@/components/layout/AppShell';
import TopNav from '@/components/layout/TopNav';
import LiveActivityFeed from '@/components/orchestration/LiveActivityFeed';
import MissionTheater from '@/components/orchestration/MissionTheater';
import AgentDependencyGraph from '@/components/orchestration/AgentDependencyGraph';
import { employees, departmentDetails } from '@/data/pages-data';
import { agentProfiles } from '@/data/agent-profiles';
import { agentTasks } from '@/data/control-center-data';
import type { AgentTask, TaskStatus, Employee } from '@/types';
import {
  Users, CheckCircle2, FileText, DollarSign, Clock, TrendingUp,
  AlertTriangle, Activity, Radio,
  MessageSquare, GitBranch, Kanban, Network, Theater,
  X, Filter, Search,
} from 'lucide-react';

// ── Color maps ──────────────────────────────────────────────────────────────

const statusColors: Record<string, { dot: string; text: string }> = {
  active:     { dot: 'bg-emerald-400', text: 'text-emerald-400' },
  busy:       { dot: 'bg-amber-400',   text: 'text-amber-400'   },
  idle:       { dot: 'bg-slate-500',   text: 'text-slate-400'   },
  terminated: { dot: 'bg-rose-500',    text: 'text-rose-400'    },
};

const taskStatusConfig: Record<TaskStatus, { label: string; color: string; accent: string; icon: React.ElementType }> = {
  queued:      { label: 'Queued',      color: 'text-slate-400',   accent: 'border-slate-500/30',   icon: Clock       },
  'in-progress':{ label: 'In Progress', color: 'text-sky-400',    accent: 'border-sky-500/30',     icon: Activity    },
  blocked:     { label: 'Blocked',     color: 'text-rose-400',    accent: 'border-rose-500/30',    icon: AlertTriangle },
  completed:   { label: 'Completed',   color: 'text-emerald-400', accent: 'border-emerald-500/30', icon: CheckCircle2 },
};

const typeColors: Record<string, { text: string; bg: string }> = {
  task:          { text: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/20'       },
  deliverable:   { text: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20'},
  escalation:    { text: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20'     },
  communication: { text: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  research:      { text: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
};

const typeIcons: Record<string, React.ElementType> = {
  task:          CheckCircle2,
  deliverable:   FileText,
  escalation:    AlertTriangle,
  communication: MessageSquare,
  research:      Search,
};

const priorityDot: Record<string, string> = {
  critical: 'bg-rose-400',
  high:     'bg-amber-400',
  medium:   'bg-sky-400',
  low:      'bg-slate-500',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getEmployee(id: string): Employee | undefined {
  return employees.find(e => e.id === id);
}

// ── Command Stat Card ────────────────────────────────────────────────────────

function CommandStatCard({ icon: Icon, label, value, sub, accent, delay }: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-lg border px-3 py-2.5"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-slate-500" />
        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-[9px] text-slate-600 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, index }: { task: AgentTask; index: number }) {
  const emp = getEmployee(task.agentId);
  const tc = typeColors[task.type];
  const TIcon = typeIcons[task.type] ?? CheckCircle2;
  const isBlocked = task.status === 'blocked';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 + index * 0.03 }}
      className="rounded-lg border p-2.5 mb-2"
      style={{
        background: isBlocked ? 'rgba(244,63,94,0.04)' : 'var(--bg-elevated)',
        borderColor: isBlocked ? 'rgba(244,63,94,0.2)' : 'var(--border-subtle)',
      }}
    >
      <div className="flex items-start gap-2 mb-1.5">
        {emp && (
          <div className={`w-4 h-4 rounded-full ${emp.color} flex items-center justify-center text-white text-[7px] font-bold shrink-0 mt-0.5`}>
            {emp.avatar}
          </div>
        )}
        <p className="text-[11px] text-slate-300 leading-snug flex-1">{task.title}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-medium border ${tc.text} ${tc.bg}`}>
          <TIcon size={8} />
          {task.type}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[task.priority]}`} title={task.priority} />
        {task.mission && (
          <span className="text-[8px] text-slate-600 truncate max-w-[100px]">{task.mission}</span>
        )}
        {(task.completedAt || task.startedAt) && (
          <span className="text-[8px] font-mono text-slate-600 ml-auto">
            {task.completedAt ?? task.startedAt}
          </span>
        )}
      </div>
      {isBlocked && task.blocker && (
        <div className="flex items-start gap-1 mt-1.5 pt-1.5 border-t" style={{ borderColor: 'rgba(244,63,94,0.15)' }}>
          <AlertTriangle size={9} className="text-rose-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-rose-300 leading-snug">{task.blocker}</p>
        </div>
      )}
    </motion.div>
  );
}

// ── Center tabs ──────────────────────────────────────────────────────────────

type CenterTab = 'theater' | 'graph' | 'board';

const CENTER_TABS: { id: CenterTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'theater', label: 'Mission Theater',     icon: Theater,  description: 'Click a mission to see its full agent flow' },
  { id: 'graph',   label: 'Dependency Graph',    icon: Network,  description: 'Visual web of agent-to-agent dependencies'  },
  { id: 'board',   label: 'Task Board',          icon: Kanban,   description: 'Kanban of all in-flight tasks'               },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ControlCenterPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [centerTab, setCenterTab] = useState<CenterTab>('theater');

  // Computed metrics
  const metrics = useMemo(() => {
    const profiles = Object.values(agentProfiles);
    const activeEmps = employees.filter(e => e.status !== 'terminated');
    const busyCount = activeEmps.filter(e => e.status === 'busy').length;
    const idleCount = activeEmps.filter(e => e.status === 'idle').length;
    const totalTasks = profiles.reduce((s, p) => s + p.tasksCompletedToday, 0);
    const totalDeliverables = profiles.reduce((s, p) => s + p.deliverablesProducedToday, 0);
    const totalCost = profiles.reduce((s, p) => s + parseFloat(p.costToday.replace('$', '')), 0);
    const totalHours = profiles.reduce((s, p) => s + p.estimatedHoursSaved, 0);
    const avgValue = Math.round(profiles.reduce((s, p) => s + p.valueScore, 0) / profiles.length);
    return { activeCount: activeEmps.length, busyCount, idleCount, totalTasks, totalDeliverables, totalCost, totalHours, avgValue };
  }, []);

  // Filtered tasks for board
  const filteredTasks = useMemo(() => {
    if (!selectedAgent) return agentTasks;
    return agentTasks.filter(t => t.agentId === selectedAgent);
  }, [selectedAgent]);

  const columns: TaskStatus[] = ['queued', 'in-progress', 'blocked', 'completed'];
  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, AgentTask[]> = { queued: [], 'in-progress': [], blocked: [], completed: [] };
    filteredTasks.forEach(t => map[t.status].push(t));
    return map;
  }, [filteredTasks]);

  // Group employees by department
  const departments = useMemo(() => {
    const depts: Record<string, Employee[]> = {};
    employees.filter(e => e.status !== 'terminated').forEach(e => {
      const dept = e.department || 'Other';
      if (!depts[dept]) depts[dept] = [];
      depts[dept].push(e);
    });
    return depts;
  }, []);

  const selectedEmp = selectedAgent ? getEmployee(selectedAgent) : null;

  return (
    <AppShell>
      <div className="ambient-bg" />
      <TopNav />

      {/* ── Metrics Command Strip ── */}
      <div className="shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2.5">
          <Radio size={12} className="text-rose-400" />
          <motion.span
            className="w-2 h-2 rounded-full bg-rose-400"
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Live</span>
          <span className="text-[11px] text-slate-500 ml-1">Agent Orchestration Center</span>

          {selectedEmp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 ml-auto px-2.5 py-1 rounded-md border"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-medium)' }}
            >
              <div className={`w-4 h-4 rounded-full ${selectedEmp.color} flex items-center justify-center text-white text-[7px] font-bold`}>
                {selectedEmp.avatar}
              </div>
              <span className="text-[10px] text-slate-300">{selectedEmp.name}</span>
              <button onClick={() => setSelectedAgent(null)} className="p-0.5 text-slate-500 hover:text-slate-300 rounded cursor-pointer">
                <X size={10} />
              </button>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2">
          <CommandStatCard icon={Users}       label="Agents"        value={`${metrics.activeCount}`}      sub={`${metrics.busyCount} busy · ${metrics.idleCount} idle`}   accent="text-sky-400"     delay={0.05} />
          <CommandStatCard icon={CheckCircle2} label="Tasks Today"   value={String(metrics.totalTasks)}    accent="text-emerald-400" delay={0.07} />
          <CommandStatCard icon={FileText}    label="Deliverables"  value={String(metrics.totalDeliverables)} accent="text-violet-400" delay={0.09} />
          <CommandStatCard icon={DollarSign}  label="Total Cost"    value={`$${metrics.totalCost.toFixed(2)}`} accent="text-emerald-400" delay={0.11} />
          <CommandStatCard icon={Clock}       label="Hours Saved"   value={`${metrics.totalHours}`}       sub="human-equivalent"   accent="text-amber-400"   delay={0.13} />
          <CommandStatCard icon={TrendingUp}  label="Avg Value"     value={String(metrics.avgValue)}      accent={metrics.avgValue >= 75 ? 'text-emerald-400' : 'text-amber-400'} delay={0.15} />
          <CommandStatCard icon={AlertTriangle} label="Blocked"     value={String(tasksByStatus.blocked.length)} accent={tasksByStatus.blocked.length > 0 ? 'text-rose-400' : 'text-slate-400'} delay={0.17} />
        </div>
      </div>

      {/* ── 3-Panel Main Area ── */}
      <div className="flex-1 flex gap-3 px-4 pb-3 min-h-0">

        {/* ── Left: Agent Roster ── */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-[220px] shrink-0 rounded-xl border overflow-y-auto flex flex-col"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          {/* Header */}
          <div className="px-3 py-2.5 border-b shrink-0 sticky top-0 z-10"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Roster</span>
              <span className="text-[9px] text-slate-600 ml-auto">
                {employees.filter(e => e.status !== 'terminated').length} agents
              </span>
            </div>
          </div>

          {/* Dept groups */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {Object.entries(departments).map(([dept, emps]) => (
              <div key={dept}>
                <div className="px-3 py-1.5 sticky top-0 z-[5]"
                  style={{ background: 'var(--bg-card)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">{dept}</span>
                </div>
                {emps.map(emp => {
                  const isSelected = selectedAgent === emp.id;
                  const profile = agentProfiles[emp.id];
                  const sc = statusColors[emp.status];
                  return (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedAgent(isSelected ? null : emp.id)}
                      className={`w-full text-left px-3 py-2 transition-all cursor-pointer border-l-2 ${
                        isSelected ? 'border-l-sky-400 bg-sky-500/5' : 'border-l-transparent hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full ${emp.color} flex items-center justify-center text-white text-[8px] font-bold shrink-0`}>
                          {emp.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-slate-300 truncate">{emp.name}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} shrink-0`} />
                          </div>
                          <p className="text-[8px] text-slate-600 truncate">{emp.role}</p>
                        </div>
                        {profile && (
                          <span className="text-[8px] font-mono text-slate-600 shrink-0">{profile.costToday}</span>
                        )}
                      </div>
                      {emp.currentTask && (
                        <p className="text-[8px] text-slate-600 mt-0.5 ml-7 truncate leading-snug">{emp.currentTask}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Dept cost summary */}
          <div className="shrink-0 border-t px-3 py-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-[8px] text-slate-600 uppercase tracking-wider mb-1.5">Budget utilization</p>
            {departmentDetails.slice(0, 3).map(dept => {
              const spendNum = parseFloat(dept.spend.replace('$', '').replace('K', '')) * 1000;
              const budgetNum = parseFloat(dept.budget.replace('$', '').replace('K', '')) * 1000;
              const pct = Math.round((spendNum / budgetNum) * 100);
              const barColor = pct >= 75 ? '#f43f5e' : pct >= 50 ? '#f59e0b' : '#10b981';
              return (
                <div key={dept.name} className="mb-1.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[8px] text-slate-500">{dept.name}</span>
                    <span className="text-[8px] font-mono text-slate-600">{pct}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="h-full rounded-full"
                      style={{ background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.aside>

        {/* ── Center: Tabbed Orchestration View ── */}
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex-1 min-w-0 rounded-xl border flex flex-col overflow-hidden"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          {/* Tab bar */}
          <div className="shrink-0 px-3 pt-2.5 pb-0 border-b flex items-end gap-1"
            style={{ borderColor: 'var(--border-subtle)' }}>
            {CENTER_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = centerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCenterTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-[10px] font-medium transition-all cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-white border-b-sky-400 bg-sky-500/5'
                      : 'text-slate-500 border-b-transparent hover:text-slate-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon size={11} />
                  {tab.label}
                </button>
              );
            })}
            {/* Tab description */}
            <span className="ml-auto text-[9px] text-slate-600 pb-2 pr-1">
              {CENTER_TABS.find(t => t.id === centerTab)?.description}
            </span>
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              {centerTab === 'theater' && (
                <motion.div
                  key="theater"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-y-auto"
                >
                  <MissionTheater />
                </motion.div>
              )}

              {centerTab === 'graph' && (
                <motion.div
                  key="graph"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <AgentDependencyGraph />
                </motion.div>
              )}

              {centerTab === 'board' && (
                <motion.div
                  key="board"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-y-auto p-3"
                >
                  {/* Kanban columns */}
                  <div className="grid grid-cols-4 gap-3 min-h-full">
                    {columns.map(col => {
                      const conf = taskStatusConfig[col];
                      const ColIcon = conf.icon;
                      const tasks = tasksByStatus[col];
                      return (
                        <div key={col} className="flex flex-col">
                          <div className={`flex items-center gap-1.5 px-2.5 py-2 mb-2 rounded-lg border ${conf.accent}`}
                            style={{ background: 'var(--bg-elevated)' }}>
                            <ColIcon size={11} className={conf.color} />
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${conf.color}`}>
                              {conf.label}
                            </span>
                            <span className={`ml-auto text-[10px] font-bold ${conf.color}`}>{tasks.length}</span>
                          </div>
                          <div className="space-y-0 flex-1">
                            {tasks.map((task, i) => (
                              <TaskCard key={task.id} task={task} index={i} />
                            ))}
                            {tasks.length === 0 && (
                              <div className="text-center py-6">
                                <p className="text-[10px] text-slate-700">No tasks</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.main>

        {/* ── Right: Live Activity Feed ── */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-[280px] shrink-0 rounded-xl border overflow-hidden flex flex-col"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <LiveActivityFeed filterAgentId={selectedAgent} />
        </motion.aside>

      </div>
    </AppShell>
  );
}
