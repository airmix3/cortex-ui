'use client';

import { motion } from 'motion/react';
import { Check, Lock, GitBranch } from 'lucide-react';
import type { DispatchStep } from './chat-data';

// ── Layout constants ──────────────────────────────────────────────────────────

const CX = 128;  // center x
const LX = 60;   // left branch center x
const RX = 196;  // right branch center x
const NW = 112;  // node width
const NH = 44;   // node height
const SVG_W = 256;
const SVG_H = 356;

// Step index → [centerX, topY]
const POSITIONS: [number, number][] = [
  [CX, 0],    // 0: Tamir scope
  [CX, 64],   // 1: Gate 1
  [LX, 132],  // 2: Maya copy
  [RX, 132],  // 3: Jordan list
  [CX, 200],  // 4: Gate 2
  [CX, 268],  // 5: Maya execute
  [CX, 336],  // 6: Tamir monitor
];

// Edges: [from-step-idx, to-step-idx]
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5], [5, 6],
];

// ── Status helpers ────────────────────────────────────────────────────────────

function statusColor(status: DispatchStep['status']) {
  switch (status) {
    case 'done':              return '#34d399';
    case 'in-progress':       return '#38bdf8';
    case 'awaiting-approval': return '#f59e0b';
    case 'rejected':          return '#f43f5e';
    default:                  return 'rgba(255,255,255,0.12)';
  }
}

function edgeColor(fromStatus: DispatchStep['status']) {
  if (fromStatus === 'done') return '#34d39966';
  if (fromStatus === 'in-progress') return '#38bdf844';
  if (fromStatus === 'awaiting-approval') return '#f59e0b44';
  return 'rgba(255,255,255,0.06)';
}

// ── SVG edge path between two node centers ────────────────────────────────────

function edgePath(fromIdx: number, toIdx: number): string {
  const [fx, fy] = POSITIONS[fromIdx];
  const [tx, ty] = POSITIONS[toIdx];
  const fromBottom = fy + NH;
  const toTop = ty;
  const midY = (fromBottom + toTop) / 2;

  if (fx === tx) {
    // Straight vertical
    return `M ${fx} ${fromBottom} L ${tx} ${toTop}`;
  }
  // Curve (branching or merging)
  return `M ${fx} ${fromBottom} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${toTop}`;
}

// ── Individual flow node ──────────────────────────────────────────────────────

function FlowNode({
  step,
  stepIndex,
  onApprove,
}: {
  step: DispatchStep;
  stepIndex: number;
  onApprove: () => void;
}) {
  const [cx, ry] = POSITIONS[stepIndex];
  const x = cx - NW / 2;
  const color = statusColor(step.status);
  const isGate = step.requiresCEOApproval;
  const isPending = step.status === 'pending';
  const isDone = step.status === 'done';
  const isActive = step.status === 'in-progress' || step.status === 'awaiting-approval';

  return (
    <motion.div
      animate={{ opacity: isPending ? 0.35 : 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'absolute',
        left: x,
        top: ry,
        width: NW,
        height: NH,
      }}
    >
      {isGate ? (
        /* ── Gate node ── */
        <motion.div
          whileHover={step.status === 'awaiting-approval' ? { scale: 1.03 } : {}}
          onClick={step.status === 'awaiting-approval' ? onApprove : undefined}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 10,
            background: `${color}0c`,
            border: `1.5px solid ${color}${isDone ? '44' : '70'}`,
            cursor: step.status === 'awaiting-approval' ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            flexDirection: 'column',
            padding: '4px 8px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Pulse ring when awaiting */}
          {step.status === 'awaiting-approval' && (
            <motion.div
              style={{
                position: 'absolute', inset: 0, borderRadius: 10,
                border: `1.5px solid ${color}`,
              }}
              animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <div className="flex items-center gap-1">
            {isDone
              ? <Check size={9} style={{ color }} strokeWidth={3} />
              : <Lock size={9} style={{ color }} strokeWidth={2.5} />
            }
            <span style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isDone ? 'Approved' : step.status === 'awaiting-approval' ? 'Tap to approve' : 'Locked'}
            </span>
          </div>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.3 }}>
            {isDone ? 'dispatched to team' : step.approvalPrompt?.split(' ').slice(0, 5).join(' ') + '…'}
          </span>
        </motion.div>
      ) : (
        /* ── Work node ── */
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 10,
            background: isDone
              ? 'rgba(52,211,153,0.05)'
              : isActive
              ? 'rgba(56,189,248,0.05)'
              : 'rgba(255,255,255,0.025)',
            border: `1px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 8px',
            overflow: 'hidden',
          }}
        >
          {/* Status indicator bar */}
          <div style={{ width: 2, height: 24, borderRadius: 2, background: color, flexShrink: 0 }} />

          {/* Agent avatar */}
          <div
            className={step.agentColor}
            style={{
              width: 20, height: 20, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 7, fontWeight: 700, color: 'white', flexShrink: 0,
            }}
          >
            {step.agentAvatar}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'white' }}>{step.agentName}</span>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>· {step.department}</span>
            </div>
            <p style={{
              fontSize: 9, color: 'rgba(255,255,255,0.45)', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1,
            }}>
              {step.action.split(' ').slice(0, 5).join(' ')}
            </p>
          </div>

          {/* Working / done indicator */}
          {step.status === 'in-progress' && (
            <motion.div
              style={{ width: 4, height: 4, borderRadius: '50%', background: '#38bdf8', flexShrink: 0 }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
          {isDone && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{
                width: 14, height: 14, borderRadius: '50%',
                background: 'rgba(52,211,153,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Check size={7} style={{ color: '#34d399' }} strokeWidth={3} />
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Main diagram ──────────────────────────────────────────────────────────────

export default function CampaignFlowDiagram({
  steps,
  onAdvance,
}: {
  steps: DispatchStep[];
  onAdvance: (index: number) => void;
}) {
  return (
    <div style={{ position: 'relative', width: SVG_W, height: SVG_H, margin: '0 auto' }}>

      {/* ── SVG edge layer ── */}
      <svg
        width={SVG_W}
        height={SVG_H}
        style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
      >
        {EDGES.map(([fi, ti]) => {
          const fromStep = steps[fi];
          const color = edgeColor(fromStep?.status ?? 'pending');
          const d = edgePath(fi, ti);
          const isDoneEdge = fromStep?.status === 'done';
          const isActiveEdge = fromStep?.status === 'in-progress';

          return (
            <g key={`${fi}-${ti}`}>
              {/* Base edge */}
              <path d={d} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" />

              {/* Animated particle on active edges */}
              {(isDoneEdge || isActiveEdge) && (
                <motion.circle
                  r={2}
                  fill={isDoneEdge ? '#34d399' : '#38bdf8'}
                  style={{ offsetPath: `path("${d}")` } as React.CSSProperties}
                  animate={{ offsetDistance: ['0%', '100%'] } as Record<string, string[]>}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: Math.random() * 1.5 }}
                />
              )}
            </g>
          );
        })}

        {/* Parallel branch label */}
        <text
          x={CX}
          y={152}
          textAnchor="middle"
          style={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)', fontFamily: 'inherit', letterSpacing: '0.06em' }}
        >
          parallel
        </text>
      </svg>

      {/* ── Node layer ── */}
      {steps.map((step, i) => (
        <FlowNode
          key={step.id}
          step={step}
          stepIndex={i}
          onApprove={() => onAdvance(i)}
        />
      ))}
    </div>
  );
}
