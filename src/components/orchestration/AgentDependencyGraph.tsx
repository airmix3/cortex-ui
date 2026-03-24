'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Zap, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  label: string;
  avatar: string;
  color: string;         // Tailwind bg class
  hexColor: string;      // hex for SVG
  status: 'active' | 'busy' | 'idle' | 'blocked';
  role: string;
  department: string;
  x: number;            // 0–1 normalized
  y: number;            // 0–1 normalized
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;         // short description of the output
  type: 'blocking' | 'active' | 'waiting' | 'complete';
}

// ── Graph data ────────────────────────────────────────────────────────────────

const NODES: GraphNode[] = [
  // Row 0 — CEO
  { id: 'tamir',  label: 'Tamir (CEO)',    avatar: 'T',  color: 'bg-amber-600',   hexColor: '#d97706', status: 'active', role: 'CEO',              department: 'Leadership', x: 0.5,  y: 0.03 },
  // Row 1 — C-Suite
  { id: 'cto',    label: 'Alex (CTO)',     avatar: 'A',  color: 'bg-blue-600',    hexColor: '#2563eb', status: 'busy',   role: 'CTO',              department: 'Tech',       x: 0.2,  y: 0.20 },
  { id: 'cmo',    label: 'Maya (CMO)',     avatar: 'M',  color: 'bg-purple-600',  hexColor: '#7c3aed', status: 'active', role: 'CMO',              department: 'Marketing',  x: 0.5,  y: 0.20 },
  { id: 'coo',    label: 'Liam (COO)',     avatar: 'L',  color: 'bg-emerald-600', hexColor: '#059669', status: 'busy',   role: 'COO',              department: 'Operations', x: 0.8,  y: 0.20 },
  // Row 2 — Mid-level
  { id: 'dev1',   label: 'Dev Agent',      avatar: 'D',  color: 'bg-cyan-600',    hexColor: '#0891b2', status: 'busy',   role: 'Dev Agent',        department: 'Tech',       x: 0.1,  y: 0.46 },
  { id: 'dev2',   label: 'Infra Agent',    avatar: 'I',  color: 'bg-teal-600',    hexColor: '#0d9488', status: 'busy',   role: 'Infra Agent',      department: 'Tech',       x: 0.28, y: 0.46 },
  { id: 'mkt1',   label: 'Content Agent',  avatar: 'C',  color: 'bg-pink-600',    hexColor: '#db2777', status: 'busy',   role: 'Content Agent',    department: 'Marketing',  x: 0.46, y: 0.46 },
  { id: 'mkt2',   label: 'Market Intel',   avatar: 'MI', color: 'bg-fuchsia-600', hexColor: '#c026d3', status: 'active', role: 'Market Intel',     department: 'Marketing',  x: 0.63, y: 0.46 },
  { id: 'ops1',   label: 'Ops Agent',      avatar: 'O',  color: 'bg-lime-600',    hexColor: '#65a30d', status: 'busy',   role: 'Ops Agent',        department: 'Operations', x: 0.82, y: 0.46 },
  // Row 3 — Specialists
  { id: 'res1',   label: 'Research Agent', avatar: 'R',  color: 'bg-indigo-600',  hexColor: '#4f46e5', status: 'active', role: 'Research Agent',   department: 'Tech',       x: 0.18, y: 0.72 },
  { id: 'temp1',  label: 'EEG Researcher', avatar: 'ER', color: 'bg-orange-600',  hexColor: '#ea580c', status: 'busy',   role: 'EEG Researcher',   department: 'Tech',       x: 0.37, y: 0.72 },
  { id: 'temp2',  label: 'Data Scientist', avatar: 'DS', color: 'bg-rose-600',    hexColor: '#e11d48', status: 'active', role: 'Data Scientist',   department: 'Tech',       x: 0.55, y: 0.72 },
  { id: 'fin1',   label: 'Finance Agent',  avatar: 'F',  color: 'bg-green-700',   hexColor: '#15803d', status: 'idle',   role: 'Finance Agent',    department: 'Operations', x: 0.76, y: 0.72 },
  // Row 4 — Support
  { id: 'sup1',   label: 'Legal Agent',    avatar: 'LA', color: 'bg-slate-600',   hexColor: '#475569', status: 'idle',   role: 'Legal Agent',      department: 'Operations', x: 0.30, y: 0.92 },
  { id: 'sup2',   label: 'QA Agent',       avatar: 'QA', color: 'bg-yellow-600',  hexColor: '#ca8a04', status: 'idle',   role: 'QA Agent',         department: 'Tech',       x: 0.55, y: 0.92 },
  { id: 'sup3',   label: 'HR Agent',       avatar: 'HR', color: 'bg-violet-600',  hexColor: '#7c3aed', status: 'idle',   role: 'HR Agent',         department: 'Operations', x: 0.78, y: 0.92 },
];

const EDGES: GraphEdge[] = [
  // CEO → C-Suite directives
  { from: 'tamir', to: 'cto',   label: 'Q2 tech priorities',      type: 'complete' },
  { from: 'tamir', to: 'cmo',   label: 'Q2 campaign directive',   type: 'complete' },
  { from: 'tamir', to: 'coo',   label: 'Investor deck approval',  type: 'active' },

  // CTO → Tech agents
  { from: 'cto', to: 'dev1',    label: 'Deploy manifest review',  type: 'active' },
  { from: 'cto', to: 'dev2',    label: 'Capacity analysis',       type: 'blocking' },
  { from: 'cto', to: 'res1',    label: 'EEG latency benchmark',   type: 'active' },
  { from: 'cto', to: 'temp1',   label: 'Batch 5 review',          type: 'waiting' },

  // CMO → Marketing agents
  { from: 'cmo', to: 'mkt1',    label: 'Brand guidelines task',   type: 'active' },
  { from: 'cmo', to: 'mkt2',    label: 'Competitive analysis',    type: 'complete' },

  // COO → Ops agents
  { from: 'coo', to: 'ops1',    label: 'Cost reconciliation',     type: 'blocking' },
  { from: 'coo', to: 'fin1',    label: 'Revenue projection gap',  type: 'active' },

  // Cross-department dependencies
  { from: 'dev2', to: 'dev1',   label: 'VPC config output',       type: 'active' },
  { from: 'res1', to: 'temp1',  label: 'IP conflict report',      type: 'complete' },
  { from: 'temp1', to: 'temp2', label: 'Batch 4 test results',    type: 'complete' },
  { from: 'temp2', to: 'cto',   label: 'benchmark_results.xlsx',  type: 'active' },
  { from: 'mkt1', to: 'cmo',    label: 'content_plans.pdf',       type: 'complete' },
  { from: 'mkt2', to: 'cmo',    label: 'Competitor pulse report', type: 'complete' },
  { from: 'ops1', to: 'coo',    label: 'Reconciliation model',    type: 'waiting' },
  { from: 'fin1', to: 'coo',    label: 'Revenue methodology',     type: 'waiting' },

  // Bottom-row contributions
  { from: 'sup1', to: 'res1',   label: 'IP legal clearance',      type: 'complete' },
  { from: 'sup2', to: 'dev1',   label: 'Staging QA sign-off',     type: 'waiting' },
  { from: 'sup3', to: 'ops1',   label: 'Headcount data',          type: 'complete' },
];

// ── Edge type config ──────────────────────────────────────────────────────────

const EDGE_CONFIG: Record<GraphEdge['type'], { color: string; dash: string; opacity: number; particle: boolean }> = {
  blocking: { color: '#f43f5e', dash: '4 2',   opacity: 0.9, particle: false },
  active:   { color: '#38bdf8', dash: '0',      opacity: 0.8, particle: true  },
  waiting:  { color: '#64748b', dash: '3 3',   opacity: 0.5, particle: false },
  complete: { color: '#34d399', dash: '0',      opacity: 0.35, particle: false },
};

const STATUS_CONFIG: Record<GraphNode['status'], { ring: string; dot: string }> = {
  active:  { ring: '#34d399', dot: '#34d399' },
  busy:    { ring: '#f59e0b', dot: '#f59e0b' },
  idle:    { ring: '#475569', dot: '#475569' },
  blocked: { ring: '#f43f5e', dot: '#f43f5e' },
};

// ── Particle animation ────────────────────────────────────────────────────────

function EdgeParticle({ x1, y1, x2, y2, color, delay }: {
  x1: number; y1: number; x2: number; y2: number; color: string; delay: number;
}) {
  return (
    <motion.circle
      r={2.5}
      fill={color}
      opacity={0.9}
      initial={{ offsetDistance: '0%' }}
      animate={{ offsetDistance: '100%' }}
      transition={{ duration: 1.8 + delay * 0.4, repeat: Infinity, ease: 'linear', delay }}
      style={{
        offsetPath: `path("M ${x1} ${y1} L ${x2} ${y2}")`,
        filter: `drop-shadow(0 0 3px ${color})`,
      }}
    />
  );
}

// ── Node component ────────────────────────────────────────────────────────────

function GraphNodeEl({
  node, isHovered, isConnected, isSelected, svgW, svgH, onHover, onLeave, onClick,
}: {
  node: GraphNode;
  isHovered: boolean;
  isConnected: boolean;
  isSelected: boolean;
  svgW: number;
  svgH: number;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const cx = node.x * svgW;
  const cy = node.y * svgH;
  const r = 22;
  const sc = STATUS_CONFIG[node.status];
  const dimmed = !isHovered && !isConnected && !isSelected;

  return (
    <g
      transform={`translate(${cx},${cy})`}
      style={{ cursor: 'pointer' }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Glow ring (hover) */}
      {(isHovered || isSelected) && (
        <circle
          r={r + 6}
          fill="none"
          stroke={node.hexColor}
          strokeWidth={1}
          opacity={0.3}
        />
      )}

      {/* Status outer ring */}
      <circle
        r={r + 3}
        fill="none"
        stroke={sc.ring}
        strokeWidth={1.5}
        opacity={dimmed ? 0.15 : 0.6}
      />

      {/* Avatar circle */}
      <circle
        r={r}
        fill={node.hexColor}
        opacity={dimmed ? 0.2 : 0.9}
      />
      <circle
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />

      {/* Avatar text */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={node.avatar.length > 1 ? 8 : 11}
        fontWeight="bold"
        fill="white"
        opacity={dimmed ? 0.3 : 1}
      >
        {node.avatar}
      </text>

      {/* Status dot */}
      {node.status !== 'idle' && (
        <circle
          cx={r * 0.7}
          cy={-r * 0.7}
          r={4}
          fill={sc.dot}
          stroke="rgba(6,10,19,0.9)"
          strokeWidth={1.5}
          opacity={dimmed ? 0.2 : 1}
        />
      )}

      {/* Label */}
      <text
        y={r + 12}
        textAnchor="middle"
        fontSize={9}
        fill={dimmed ? '#1e293b' : '#94a3b8'}
        fontWeight="500"
      >
        {node.label}
      </text>
    </g>
  );
}

// ── Edge component ────────────────────────────────────────────────────────────

function EdgeEl({
  edge, fromNode, toNode, svgW, svgH, isHighlighted, isDimmed,
}: {
  edge: GraphEdge;
  fromNode: GraphNode;
  toNode: GraphNode;
  svgW: number;
  svgH: number;
  isHighlighted: boolean;
  isDimmed: boolean;
}) {
  const cfg = EDGE_CONFIG[edge.type];
  const x1 = fromNode.x * svgW;
  const y1 = fromNode.y * svgH;
  const x2 = toNode.x * svgW;
  const y2 = toNode.y * svgH;

  // Offset endpoints to the edge of the node circles
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const r1 = 25, r2 = 25;
  const sx = x1 + (dx / dist) * r1;
  const sy = y1 + (dy / dist) * r1;
  const ex = x2 - (dx / dist) * r2;
  const ey = y2 - (dy / dist) * r2;

  const opacity = isDimmed ? 0.04 : isHighlighted ? 1 : cfg.opacity;

  return (
    <g>
      <line
        x1={sx} y1={sy} x2={ex} y2={ey}
        stroke={cfg.color}
        strokeWidth={isHighlighted ? 2 : 1.2}
        strokeDasharray={cfg.dash}
        opacity={opacity}
        markerEnd={`url(#arrow-${edge.type})`}
        style={{ transition: 'opacity 0.25s' }}
      />
      {cfg.particle && !isDimmed && (
        <EdgeParticle x1={sx} y1={sy} x2={ex} y2={ey} color={cfg.color} delay={Math.random() * 1.5} />
      )}
    </g>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function NodeTooltip({ node, edges, allNodes }: { node: GraphNode; edges: GraphEdge[]; allNodes: GraphNode[] }) {
  const incoming = edges.filter(e => e.to === node.id);
  const outgoing = edges.filter(e => e.from === node.id);

  const getNode = (id: string) => allNodes.find(n => n.id === id);

  const statusLabel: Record<GraphNode['status'], string> = {
    active: 'Active',
    busy: 'Working',
    idle: 'Idle',
    blocked: 'Blocked',
  };
  const statusColor: Record<GraphNode['status'], string> = {
    active: '#34d399',
    busy: '#f59e0b',
    idle: '#64748b',
    blocked: '#f43f5e',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ duration: 0.15 }}
      className="absolute z-50 pointer-events-none rounded-xl p-3 w-[220px]"
      style={{
        background: 'rgba(10,16,36,0.97)',
        border: `1px solid ${node.hexColor}30`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 24px ${node.hexColor}10`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
          style={{ background: node.hexColor }}>
          {node.avatar}
        </div>
        <div>
          <p className="text-[11px] font-semibold text-white leading-tight">{node.label}</p>
          <p className="text-[9px] text-slate-500">{node.role} · {node.department}</p>
        </div>
        <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded"
          style={{ background: `${statusColor[node.status]}18`, color: statusColor[node.status] }}>
          {statusLabel[node.status]}
        </span>
      </div>

      {/* Outgoing */}
      {outgoing.length > 0 && (
        <div className="mb-2">
          <p className="text-[8px] text-slate-600 uppercase tracking-wider mb-1">Outputs to</p>
          {outgoing.slice(0, 3).map((e, i) => {
            const to = getNode(e.to);
            const c = EDGE_CONFIG[e.type];
            return (
              <div key={i} className="flex items-center gap-1.5 mb-0.5">
                <ArrowRight size={8} style={{ color: c.color }} className="shrink-0" />
                <span className="text-[9px] text-slate-400 truncate">{to?.label}</span>
                <span className="text-[8px] text-slate-600 ml-auto truncate max-w-[80px]">{e.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Incoming */}
      {incoming.length > 0 && (
        <div>
          <p className="text-[8px] text-slate-600 uppercase tracking-wider mb-1">Waiting on</p>
          {incoming.slice(0, 3).map((e, i) => {
            const from = getNode(e.from);
            const c = EDGE_CONFIG[e.type];
            return (
              <div key={i} className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="text-[9px] text-slate-400 truncate">{from?.label}</span>
                <span className="text-[8px] text-slate-600 ml-auto truncate max-w-[80px]">{e.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
  const items: { label: string; color: string; dash?: string }[] = [
    { label: 'Active transfer',  color: '#38bdf8' },
    { label: 'Blocking',         color: '#f43f5e', dash: '4 2' },
    { label: 'Waiting',          color: '#64748b', dash: '3 3' },
    { label: 'Completed',        color: '#34d399' },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <svg width={20} height={6}>
            <line
              x1={0} y1={3} x2={20} y2={3}
              stroke={item.color}
              strokeWidth={1.5}
              strokeDasharray={item.dash ?? '0'}
              opacity={0.8}
            />
          </svg>
          <span className="text-[9px] text-slate-500">{item.label}</span>
        </div>
      ))}

      <div className="w-px h-4 bg-white/10 self-center" />

      {(['active', 'busy', 'idle', 'blocked'] as GraphNode['status'][]).map(s => {
        const c = STATUS_CONFIG[s];
        return (
          <div key={s} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
            <span className="text-[9px] text-slate-500 capitalize">{s}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AgentDependencyGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 700, h: 420 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: Math.max(width, 400), h: Math.max(height, 300) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Connected nodes for hover highlight
  const focusId = hoveredNode ?? selectedNode;
  const connectedIds = focusId
    ? new Set(EDGES.filter(e => e.from === focusId || e.to === focusId).flatMap(e => [e.from, e.to]))
    : null;

  // Tooltip placement (offset from center of node)
  const activeTooltipNode = hoveredNode ?? selectedNode;
  const tooltipNode = activeTooltipNode ? NODES.find(n => n.id === activeTooltipNode) : null;

  function handleNodeHover(nodeId: string, event: React.MouseEvent) {
    setHoveredNode(nodeId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    }
  }

  function handleNodeLeave() {
    setHoveredNode(null);
    setTooltipPos(null);
  }

  function handleNodeClick(nodeId: string) {
    setSelectedNode(prev => (prev === nodeId ? null : nodeId));
  }

  const svgW = dims.w;
  const svgH = dims.h - 36; // leave 36px for legend at bottom

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Graph area */}
      <div className="flex-1 relative min-h-0" style={{ overflow: 'hidden' }}>
        <svg
          width={svgW}
          height={svgH}
          style={{ display: 'block' }}
        >
          {/* Defs: arrowheads */}
          <defs>
            {(['blocking', 'active', 'waiting', 'complete'] as GraphEdge['type'][]).map(t => (
              <marker
                key={t}
                id={`arrow-${t}`}
                viewBox="0 0 10 10"
                refX={8}
                refY={5}
                markerWidth={6}
                markerHeight={6}
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_CONFIG[t].color} opacity={0.85} />
              </marker>
            ))}
          </defs>

          {/* Edges (drawn first, behind nodes) */}
          {EDGES.map((edge, i) => {
            const fromNode = NODES.find(n => n.id === edge.from);
            const toNode = NODES.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const isHighlighted = focusId
              ? (edge.from === focusId || edge.to === focusId)
              : false;
            const isDimmed = focusId ? !isHighlighted : false;

            return (
              <EdgeEl
                key={i}
                edge={edge}
                fromNode={fromNode}
                toNode={toNode}
                svgW={svgW}
                svgH={svgH}
                isHighlighted={isHighlighted}
                isDimmed={isDimmed}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map(node => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;
            const isConnected = connectedIds ? connectedIds.has(node.id) : true;

            return (
              <GraphNodeEl
                key={node.id}
                node={node}
                isHovered={isHovered}
                isConnected={isConnected}
                isSelected={isSelected}
                svgW={svgW}
                svgH={svgH}
                onHover={() => setHoveredNode(node.id)}
                onLeave={handleNodeLeave}
                onClick={() => handleNodeClick(node.id)}
              />
            );
          })}
        </svg>

        {/* Floating tooltip */}
        <AnimatePresence>
          {tooltipNode && tooltipPos && (
            <div
              style={{
                position: 'absolute',
                left: tooltipPos.x + 16,
                top: Math.max(4, tooltipPos.y - 60),
                pointerEvents: 'none',
              }}
            >
              <NodeTooltip node={tooltipNode} edges={EDGES} allNodes={NODES} />
            </div>
          )}
        </AnimatePresence>

        {/* Dismiss selected node hint */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-2 right-3 text-[9px] text-slate-600"
          >
            Click node again to deselect
          </motion.div>
        )}
      </div>

      {/* Legend strip */}
      <div
        className="shrink-0 px-4 py-2 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <Legend />
      </div>
    </div>
  );
}
