'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Users, FileText, AlertTriangle, CheckCircle, Clock, ChevronRight, Search, Target, ExternalLink } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import TopNav from '@/components/layout/TopNav';
import { employees, departmentDetails } from '@/data/pages-data';
import type { Employee, DepartmentDetail } from '@/types';

// ── Status config ─────────────────────────────────────────────────────────────

const statusConfig = {
  active:     { color: '#34d399', label: 'Active'  },
  busy:       { color: '#f59e0b', label: 'Busy'    },
  idle:       { color: '#64748b', label: 'Idle'    },
  terminated: { color: '#f43f5e', label: 'Offline' },
} as const;

const healthConfig = {
  good:     { color: '#34d399', label: 'Healthy',  bg: 'rgba(52,211,153,0.1)'  },
  warning:  { color: '#f59e0b', label: 'Warning',  bg: 'rgba(245,158,11,0.1)'  },
  critical: { color: '#f43f5e', label: 'Critical', bg: 'rgba(244,63,94,0.1)'   },
} as const;

// ── Agent card ────────────────────────────────────────────────────────────────

function AgentCard({ emp }: { emp: Employee }) {
  const st = statusConfig[emp.status as keyof typeof statusConfig] ?? statusConfig.idle;

  return (
    <Link href={`/agents/${emp.id}`}>
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ duration: 0.15 }}
        className="rounded-xl p-4 flex flex-col gap-3 cursor-pointer h-full"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className={`w-10 h-10 rounded-full ${emp.color} flex items-center justify-center text-[13px] font-bold text-white`}>
              {emp.avatar}
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0f172a]"
              style={{ backgroundColor: st.color }}
              title={st.label}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{emp.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{emp.role}</p>
          </div>
          <ChevronRight size={12} className="text-slate-700 shrink-0" />
        </div>

        {/* Current task */}
        {emp.currentTask ? (
          <div className="flex items-start gap-1.5 min-w-0">
            {emp.status === 'busy' && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full shrink-0 mt-1"
                style={{ background: st.color }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{emp.currentTask}</p>
          </div>
        ) : (
          <p className="text-[11px] text-slate-600 italic">No active task</p>
        )}

        {/* Context pills — linked mission + escalation */}
        {(emp.currentMissionTitle || emp.linkedEscalationId) && (
          <div className="flex flex-wrap gap-1.5">
            {emp.currentMissionTitle && (
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.14)', color: '#7dd3fc' }}
              >
                <Target size={8} />
                <span className="truncate max-w-[120px]">{emp.currentMissionTitle}</span>
              </div>
            )}
            {emp.linkedEscalationId && (
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.18)', color: '#fca5a5' }}
              >
                <AlertTriangle size={8} />
                <span>{emp.linkedEscalationId.toUpperCase()} blocked</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center gap-2 pt-2 mt-auto"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <CheckCircle size={10} className="text-emerald-500" />
          <span className="text-[10px] text-slate-500">{emp.tasksCompleted} tasks done</span>
          <span
            className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md font-medium"
            style={{ background: `${st.color}15`, color: st.color }}
          >
            {st.label}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

// ── Sidebar department item ───────────────────────────────────────────────────

function DeptItem({
  label, count, activeMissions, health, selected, onClick,
}: {
  label: string; count: number; activeMissions?: number;
  health?: keyof typeof healthConfig; selected: boolean; onClick: () => void;
}) {
  const hc = health ? healthConfig[health] : null;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all cursor-pointer"
      style={{
        background: selected ? 'rgba(255,255,255,0.07)' : 'transparent',
        border: `1px solid ${selected ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
      }}
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: hc ? hc.color : 'rgba(255,255,255,0.15)' }}
      />
      <span
        className="flex-1 text-[12px] font-medium truncate"
        style={{ color: selected ? 'white' : 'rgba(255,255,255,0.5)' }}
      >
        {label}
      </span>
      <span className="text-[10px] text-slate-600 shrink-0">{count}</span>
      {activeMissions != null && activeMissions > 0 && (
        <span
          className="text-[9px] font-bold px-1 py-0.5 rounded shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
        >
          {activeMissions}
        </span>
      )}
    </button>
  );
}

// ── Department detail view ────────────────────────────────────────────────────

function DeptDetailView({ dept }: { dept: DepartmentDetail }) {
  const hc = healthConfig[dept.healthStatus as keyof typeof healthConfig] ?? healthConfig.good;
  const deptName = dept.name.replace(' Dept', '').replace(' Department', '');
  const deptEmployees = employees.filter(e => e.department === deptName || e.department === dept.name);

  return (
    <motion.div
      key={dept.name}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
      className="p-7 space-y-7"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-[16px] font-bold text-white shrink-0 ${dept.head.color ?? 'bg-slate-600'}`}
        >
          {(dept.head.avatar ?? dept.head.name?.[0] ?? '?') as string}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[20px] font-bold text-white">{dept.name}</h2>
            <span
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ background: hc.bg, color: hc.color }}
            >
              {hc.label}
            </span>
          </div>
          <p className="text-[12px] text-slate-400">{dept.head.name} · {dept.head.role} · {dept.summary}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Agents',          value: deptEmployees.length,               icon: Users,         color: '#38bdf8' },
          { label: 'Active missions', value: dept.active,                         icon: CheckCircle,   color: '#34d399' },
          { label: 'Blocked',         value: dept.blocked,                        icon: AlertTriangle, color: '#f59e0b' },
          { label: 'Spend / Budget',  value: `${dept.spend} / ${dept.budget}`,    icon: Clock,         color: '#a78bfa' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl p-3.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Icon size={12} style={{ color }} className="mb-2" />
            <p className="text-[16px] font-bold text-white leading-none mb-1">{value}</p>
            <p className="text-[10px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <p className="text-[12px] text-slate-400 leading-relaxed">{dept.description}</p>

      {/* Active missions */}
      {dept.activeMissions.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2.5">Active Missions</p>
          <div className="flex flex-wrap gap-2">
            {dept.activeMissions.map((m) => (
              <span
                key={m}
                className="px-3 py-1 rounded-lg text-[11px] font-medium text-slate-300"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Team grid */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">
          Team · {deptEmployees.length} agents
        </p>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {deptEmployees.map((emp) => <AgentCard key={emp.id} emp={emp} />)}
        </div>
      </div>

      {/* Deliverables */}
      {dept.recentDeliverables.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2.5">Recent Deliverables</p>
          <div className="space-y-1.5">
            {dept.recentDeliverables.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <FileText size={11} className="text-slate-500 shrink-0" />
                <span className="text-[11px] text-slate-300 flex-1 truncate font-mono">{d.name}</span>
                <span className="text-[10px] text-slate-600 shrink-0">{d.createdAt}</span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0"
                  style={{
                    background: d.status === 'approved' ? 'rgba(52,211,153,0.12)' : d.status === 'ready' ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.06)',
                    color:      d.status === 'approved' ? '#34d399'               : d.status === 'ready' ? '#38bdf8'               : '#64748b',
                  }}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── All agents view ───────────────────────────────────────────────────────────

function AllAgentsView({ query }: { query: string }) {
  const deptOrder = ['Executive', 'Tech', 'Marketing', 'Operations'];

  const grouped = useMemo(() => {
    const filtered = query
      ? employees.filter(e =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.role.toLowerCase().includes(query.toLowerCase()) ||
          e.department.toLowerCase().includes(query.toLowerCase())
        )
      : employees;

    const map: Record<string, Employee[]> = {};
    filtered.forEach(e => {
      if (!map[e.department]) map[e.department] = [];
      map[e.department].push(e);
    });
    return map;
  }, [query]);

  const depts = deptOrder.filter(d => grouped[d]?.length);

  return (
    <motion.div
      key="all"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
      className="p-7 space-y-8"
    >
      {depts.length === 0 && (
        <div className="text-center py-20 text-slate-600 text-[13px]">No agents match "{query}"</div>
      )}
      {depts.map(dept => (
        <div key={dept}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[13px] font-bold text-slate-300">{dept}</h3>
            <span className="text-[10px] text-slate-600">{grouped[dept].length} agents</span>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {grouped[dept].map(emp => <AgentCard key={emp.id} emp={emp} />)}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ── Executive detail view (no DepartmentDetail entry) ────────────────────────

function ExecutiveView() {
  const execs = employees.filter(e => e.department === 'Executive');
  return (
    <motion.div
      key="executive"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
      className="p-7 space-y-6"
    >
      <div>
        <h2 className="text-[20px] font-bold text-white mb-1">Executive</h2>
        <p className="text-[12px] text-slate-400">Senior leadership and cross-department coordination</p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {execs.map(emp => <AgentCard key={emp.id} emp={emp} />)}
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PeoplePage() {
  const [selected, setSelected] = useState<string>('all');
  const [query, setQuery] = useState('');

  const selectedDept = useMemo(
    () => departmentDetails.find(d => d.name === selected),
    [selected]
  );

  const totalAgents   = employees.length;
  const activeAgents  = employees.filter(e => e.status === 'active' || e.status === 'busy').length;

  return (
    <AppShell>
      <TopNav />
      <div className="flex flex-1 min-h-0 overflow-hidden">

      {/* ── Left sidebar ── */}
      <div
        className="w-52 shrink-0 flex flex-col h-full overflow-hidden"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3 shrink-0">
          <h1 className="text-[14px] font-bold text-white mb-0.5">People & Teams</h1>
          <p className="text-[11px] text-slate-500">{activeAgents} active · {totalAgents} total</p>
        </div>

        {/* Search */}
        <div className="px-3 pb-3 shrink-0">
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected('all'); }}
              placeholder="Search agents..."
              className="w-full pl-7 pr-3 py-1.5 rounded-lg text-[11px] text-white placeholder-slate-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            />
          </div>
        </div>

        {/* Nav */}
        <div
          className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
        >
          <DeptItem
            label="All Agents"
            count={totalAgents}
            selected={selected === 'all'}
            onClick={() => { setSelected('all'); setQuery(''); }}
          />

          <div className="mx-2 my-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />
          <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-700">Departments</p>

          {departmentDetails.map(dept => (
            <DeptItem
              key={dept.name}
              label={dept.name}
              count={employees.filter(e => {
                const clean = dept.name.replace(' Dept', '').replace(' Department', '');
                return e.department === clean || e.department === dept.name;
              }).length}
              activeMissions={dept.activeMissions.length}
              health={dept.healthStatus as keyof typeof healthConfig}
              selected={selected === dept.name}
              onClick={() => { setSelected(dept.name); setQuery(''); }}
            />
          ))}

          <div className="mx-2 my-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

          <DeptItem
            label="Executive"
            count={employees.filter(e => e.department === 'Executive').length}
            selected={selected === 'Executive'}
            onClick={() => { setSelected('Executive'); setQuery(''); }}
          />
        </div>
      </div>

      {/* ── Right content ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
      >
        <AnimatePresence mode="wait">
          {selectedDept ? (
            <DeptDetailView key={selected} dept={selectedDept} />
          ) : selected === 'Executive' ? (
            <ExecutiveView key="executive" />
          ) : (
            <AllAgentsView key={`all-${query}`} query={query} />
          )}
        </AnimatePresence>
      </div>
      </div>
    </AppShell>
  );
}
