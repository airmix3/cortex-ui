'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, CheckCircle2, AlertCircle, Link, X, Hash, Clock, Zap, Plus } from 'lucide-react';
import { type OrgTool, TOOL_TYPE_META } from '@/data/skills-data';

// ── Tool slot ─────────────────────────────────────────────────────────────────

function ToolSlot({
  tool,
  isSelected,
  onSelect,
  onConnect,
}: {
  tool: OrgTool;
  isSelected: boolean;
  onSelect: () => void;
  onConnect: (id: string) => void;
}) {
  const tm = TOOL_TYPE_META[tool.type];
  const connected = tool.status === 'connected';
  const requested = tool.status === 'requested';
  const disconnected = tool.status === 'disconnected';

  const icon = tool.type === 'mcp' ? 'M' : tool.type === 'cli' ? '$' : tool.type === 'api' ? 'A' : 'I';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSelect}
        className="relative w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all"
        style={{
          background: connected
            ? `${tm.color}10`
            : 'rgba(255,255,255,0.02)',
          border: connected
            ? `2px solid ${tm.color}40`
            : requested
            ? `2px dashed rgba(245,158,11,0.3)`
            : `2px dashed rgba(255,255,255,0.08)`,
          boxShadow: connected
            ? `0 0 16px ${tm.color}12, inset 0 1px 0 rgba(255,255,255,0.06)`
            : isSelected
            ? '0 0 16px rgba(56,189,248,0.1)'
            : 'none',
        }}
      >
        {/* Type letter */}
        <span
          className="text-[16px] font-bold"
          style={{ color: connected ? tm.color : requested ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}
        >
          {connected ? icon : disconnected ? <Lock size={14} className="text-slate-700" /> : <AlertCircle size={14} className="text-amber-600" />}
        </span>

        {/* Status dot */}
        {connected && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2" style={{ borderColor: 'var(--bg-base)' }} />
        )}

        {/* Selection ring */}
        {isSelected && (
          <motion.div
            layoutId="tool-selection"
            className="absolute inset-[-3px] rounded-xl"
            style={{ border: '2px solid rgba(56,189,248,0.5)' }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>

      <span
        className="text-[8px] font-medium text-center max-w-14 leading-tight truncate"
        style={{ color: connected ? '#94a3b8' : '#475569' }}
      >
        {tool.name}
      </span>
    </div>
  );
}

// ── Tool detail popup ─────────────────────────────────────────────────────────

function ToolDetail({
  tool,
  onConnect,
  onClose,
}: {
  tool: OrgTool;
  onConnect: (id: string) => void;
  onClose: () => void;
}) {
  const tm = TOOL_TYPE_META[tool.type];
  const connected = tool.status === 'connected';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 rounded-xl z-40 overflow-hidden"
      style={{
        background: 'rgba(10,18,40,0.92)',
        border: `1px solid ${connected ? tm.color + '25' : 'rgba(255,255,255,0.08)'}`,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div className="p-3.5 space-y-2.5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold"
              style={{ background: tm.bg, color: tm.color }}
            >
              {tool.type === 'mcp' ? 'M' : tool.type === 'cli' ? '$' : tool.type === 'api' ? 'A' : 'I'}
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-white">{tool.name}</h4>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: tm.bg, color: tm.color }}>
                  {tm.label}
                </span>
                <span className="text-[10px] text-slate-600 capitalize">{tool.category}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-600 hover:text-slate-400 cursor-pointer">
            <X size={12} />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">{tool.description}</p>

        {/* Stats */}
        {connected && (
          <div className="flex items-center gap-3 text-[10px] text-slate-600">
            <span className="flex items-center gap-1"><Hash size={9} /> {tool.missionsUsed} missions</span>
            {tool.lastUsed && <span className="flex items-center gap-1"><Clock size={9} /> {tool.lastUsed}</span>}
          </div>
        )}
        {connected && tool.usedBy.length > 0 && (
          <div className="text-[10px] text-slate-600">Used by: {tool.usedBy.join(', ')}</div>
        )}

        {/* Action */}
        {!connected && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onConnect(tool.id)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-semibold cursor-pointer"
            style={tool.status === 'requested'
              ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }
              : { background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8' }
            }
          >
            <Link size={10} />
            {tool.status === 'requested' ? 'Request Access' : 'Connect'}
            <span className="flex items-center gap-0.5 text-[9px] opacity-60">
              <Zap size={8} /> +{tool.xpOnConnect} SP
            </span>
          </motion.button>
        )}
        {connected && (
          <div className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-emerald-400">
            <CheckCircle2 size={11} /> Connected
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Arsenal ──────────────────────────────────────────────────────────────

export default function Arsenal({
  tools,
  onConnect,
}: {
  tools: OrgTool[];
  onConnect: (id: string) => void;
}) {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const selectedTool = selectedToolId ? tools.find((t) => t.id === selectedToolId) : null;

  const connected   = tools.filter((t) => t.status === 'connected');
  const unconnected = tools.filter((t) => t.status !== 'connected');

  return (
    <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">The Arsenal</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
        {unconnected.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer"
            style={{
              background: 'rgba(56,189,248,0.08)',
              border: '1px solid rgba(56,189,248,0.2)',
              color: '#38bdf8',
            }}
            title={`${unconnected.length} tools available to connect`}
          >
            <Plus size={9} />
            Connect Tool
            <span className="opacity-60 text-[9px]">({unconnected.length})</span>
          </motion.button>
        )}
        <span className="text-[10px] text-emerald-500 font-medium">{connected.length} active</span>
      </div>

      {/* Tool slots */}
      <div className="relative flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {/* Connected group */}
        {connected.map((tool) => (
          <div key={tool.id} className="relative shrink-0">
            <ToolSlot
              tool={tool}
              isSelected={selectedToolId === tool.id}
              onSelect={() => setSelectedToolId(selectedToolId === tool.id ? null : tool.id)}
              onConnect={onConnect}
            />
            <AnimatePresence>
              {selectedToolId === tool.id && selectedTool?.id === tool.id && (
                <ToolDetail
                  tool={selectedTool}
                  onConnect={(id) => { onConnect(id); setSelectedToolId(null); }}
                  onClose={() => setSelectedToolId(null)}
                />
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Divider if both groups exist */}
        {connected.length > 0 && unconnected.length > 0 && (
          <div className="shrink-0 flex flex-col items-center gap-0.5 px-1">
            <div className="w-px h-8 opacity-30" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <span className="text-[7px] text-slate-700 font-medium whitespace-nowrap">AVAILABLE</span>
            <div className="w-px h-8 opacity-30" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>
        )}

        {/* Unconnected group */}
        {unconnected.map((tool) => (
          <div key={tool.id} className="relative shrink-0">
            <ToolSlot
              tool={tool}
              isSelected={selectedToolId === tool.id}
              onSelect={() => setSelectedToolId(selectedToolId === tool.id ? null : tool.id)}
              onConnect={onConnect}
            />
            <AnimatePresence>
              {selectedToolId === tool.id && selectedTool?.id === tool.id && (
                <ToolDetail
                  tool={selectedTool}
                  onConnect={(id) => { onConnect(id); setSelectedToolId(null); }}
                  onClose={() => setSelectedToolId(null)}
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
