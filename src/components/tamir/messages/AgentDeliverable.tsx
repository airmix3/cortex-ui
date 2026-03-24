'use client';

import { motion } from 'motion/react';
import { FileText, FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import type { FullChatMessage } from '../chat-data';

function fileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || ext === 'xlsx') return FileSpreadsheet;
  return FileText;
}

function fileColor(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || ext === 'xlsx') return { icon: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' };
  if (ext === 'pdf') return { icon: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' };
  return { icon: '#94a3b8', bg: 'rgba(148,163,184,0.07)', border: 'rgba(148,163,184,0.15)' };
}

export default function AgentDeliverable({ msg }: { msg: FullChatMessage }) {
  const filename = msg.deliverableFile ?? 'document';
  const Icon = fileIcon(filename);
  const colors = fileColor(filename);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-1.5"
    >
      {/* Agent byline */}
      <div className="flex items-center gap-1.5">
        <div
          className={`w-5 h-5 rounded-full ${msg.agentColor} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}
        >
          {msg.agentAvatar}
        </div>
        <span className="text-[11px] text-amber-400 font-medium">{msg.agentName}</span>
        <span className="text-[10px] text-slate-600">· {msg.agentDepartment} · submitted work product</span>
      </div>

      {/* Document card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: 480,
        }}
      >
        {/* File header */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
          >
            <Icon size={16} style={{ color: colors.icon }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white truncate">{filename}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Work product · ready</p>
          </div>
          <button
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors shrink-0"
          >
            View <ArrowUpRight size={10} />
          </button>
        </div>

        {/* Content preview */}
        <div className="px-4 py-3">
          <p className="text-[12px] text-slate-300 leading-relaxed">{msg.deliverableContent}</p>

          {/* Stats */}
          {msg.deliverableStats && msg.deliverableStats.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {msg.deliverableStats.map((stat) => (
                <span
                  key={stat}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {stat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
