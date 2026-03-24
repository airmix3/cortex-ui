'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, CheckCircle2, Circle, Clock, Loader2, Sparkles,
  Wrench, ChevronDown,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  type Tool,
  type ToolCategory,
  TOOLS,
  CATEGORY_META,
} from '@/data/tools-data';
import TamirToolsChat from './TamirToolsChat';

// ─── Tool Card ────────────────────────────────────────────────────────────────

function ToolCard({
  tool,
  onConnect,
  onDisconnect,
  connecting,
}: {
  tool: Tool;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  connecting: boolean;
}) {
  const catMeta = CATEGORY_META[tool.category];
  const isConnected = tool.status === 'connected';
  const isComingSoon = tool.status === 'coming-soon';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-4 flex flex-col gap-3 relative"
      style={{
        background: isConnected ? `${tool.color}06` : 'rgba(255,255,255,0.02)',
        border: isConnected
          ? `1px solid ${tool.color}20`
          : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Status badge */}
      <div className="absolute top-3.5 right-3.5">
        {isConnected && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <CheckCircle2 size={9} className="text-emerald-400" />
            <span className="text-[9.5px] font-semibold text-emerald-400">Connected</span>
          </div>
        )}
        {isComingSoon && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)' }}>
            <Clock size={9} className="text-slate-500" />
            <span className="text-[9.5px] font-semibold text-slate-500">Soon</span>
          </div>
        )}
      </div>

      {/* Icon + name */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold text-white shrink-0"
          style={{ background: tool.color }}
        >
          {tool.initials}
        </div>
        <div className="min-w-0 pt-0.5">
          <div className="text-[13px] font-semibold text-slate-200 truncate">{tool.name}</div>
          <div className="text-[10.5px] text-slate-500 mt-0.5 truncate">{tool.tagline}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{tool.description}</p>

      {/* Category + agents */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-[9.5px] font-medium px-2 py-0.5 rounded-full"
          style={{
            background: `${catMeta.color}10`,
            color: catMeta.color,
            border: `1px solid ${catMeta.color}20`,
          }}
        >
          {catMeta.label}
        </span>
        {isConnected && tool.usedBy.length > 0 && (
          <span className="text-[9.5px] text-slate-600">
            Used by {tool.usedBy.join(', ')}
          </span>
        )}
        {isConnected && tool.connectedAt && (
          <span className="text-[9.5px] text-slate-700 ml-auto">
            {new Date(tool.connectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* CTA */}
      {!isComingSoon && (
        <button
          onClick={() => isConnected ? onDisconnect(tool.id) : onConnect(tool.id)}
          disabled={connecting}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11.5px] font-semibold cursor-pointer transition-all"
          style={{
            background: isConnected
              ? 'rgba(244,63,94,0.06)'
              : `${tool.color}12`,
            color: isConnected ? '#f43f5e' : tool.color,
            border: isConnected
              ? '1px solid rgba(244,63,94,0.15)'
              : `1px solid ${tool.color}25`,
            opacity: connecting ? 0.6 : 1,
          }}
        >
          {connecting ? (
            <><Loader2 size={12} className="animate-spin" /> Connecting…</>
          ) : isConnected ? (
            'Disconnect'
          ) : (
            'Connect'
          )}
        </button>
      )}
    </motion.div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ tools }: { tools: Tool[] }) {
  const connected = tools.filter((t) => t.status === 'connected').length;
  const available = tools.filter((t) => t.status === 'available').length;
  const totalAgentUses = tools.reduce((s, t) => s + t.usedBy.length, 0);

  const stats = [
    { label: 'Connected', value: connected, color: '#34d399' },
    { label: 'Available', value: available, color: '#64748b' },
    { label: 'Agent integrations', value: totalAgentUses, color: '#a78bfa' },
  ];

  return (
    <div className="flex items-center gap-6">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <span className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</span>
          <span className="text-[11px] text-slate-600">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ALL_CATEGORIES: (ToolCategory | 'all' | 'connected')[] = [
  'all', 'connected', 'communication', 'productivity', 'browser',
  'development', 'crm', 'finance', 'outreach',
];

const FILTER_LABELS: Record<string, string> = {
  all: 'All Tools',
  connected: 'Connected',
  ...Object.fromEntries(
    Object.entries(CATEGORY_META).map(([k, v]) => [k, v.label])
  ),
};

export default function ToolsPage() {
  const [tools, setTools] = useLocalStorage<Tool[]>('myelin:tools:v1', TOOLS);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [connecting, setConnecting] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    let list = tools;
    if (activeFilter === 'connected') list = list.filter((t) => t.status === 'connected');
    else if (activeFilter !== 'all') list = list.filter((t) => t.category === activeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tools, activeFilter, search]);

  const handleConnect = (toolId: string) => {
    setConnecting((prev) => ({ ...prev, [toolId]: true }));
    setTimeout(() => {
      setTools((prev) =>
        prev.map((t) =>
          t.id === toolId
            ? { ...t, status: 'connected', connectedAt: new Date().toISOString() }
            : t
        )
      );
      setConnecting((prev) => ({ ...prev, [toolId]: false }));
    }, 2000);
  };

  const handleDisconnect = (toolId: string) => {
    setTools((prev) =>
      prev.map((t) =>
        t.id === toolId ? { ...t, status: 'available', connectedAt: undefined } : t
      )
    );
  };

  return (
    <div className="flex h-full min-h-0">
      {/* ── Left: tool library ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div
          className="shrink-0 px-6 py-4 flex items-center gap-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <Wrench size={15} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-slate-200">Tool Library</div>
              <div className="text-[10px] text-slate-600">Connect integrations your agents can use</div>
            </div>
          </div>
          <StatsBar tools={tools} />
        </div>

        {/* Search + filters */}
        <div
          className="shrink-0 px-6 py-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools…"
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-[12px] text-slate-300 placeholder:text-slate-600 outline-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {ALL_CATEGORIES.map((cat) => {
              const isActive = activeFilter === cat;
              const color = cat === 'connected' ? '#34d399' : cat === 'all' ? '#94a3b8' : CATEGORY_META[cat as ToolCategory]?.color ?? '#94a3b8';
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className="px-2.5 py-1 rounded-lg text-[10.5px] font-medium cursor-pointer transition-all"
                  style={{
                    background: isActive ? `${color}15` : 'transparent',
                    color: isActive ? color : '#64748b',
                    border: isActive ? `1px solid ${color}30` : '1px solid transparent',
                  }}
                >
                  {FILTER_LABELS[cat]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool grid */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
        >
          {filtered.length === 0 ? (
            <div className="text-center text-slate-600 text-[12px] mt-16">
              No tools match your search.
            </div>
          ) : (
            <motion.div
              layout
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    connecting={!!connecting[tool.id]}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Right: Tamir chat ── */}
      <div className="shrink-0 w-[320px] flex flex-col">
        <TamirToolsChat
          tools={tools}
          onConnectTool={handleConnect}
          onDisconnectTool={handleDisconnect}
        />
      </div>
    </div>
  );
}
