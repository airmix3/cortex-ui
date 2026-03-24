'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import type { FullChatMessage } from '../chat-data';

export default function HandoffCTA({
  msg,
  onConnect,
}: {
  msg: FullChatMessage;
  onConnect: () => void;
}) {
  const agent = msg.handoffAgent!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-1.5"
    >
      {/* Tamir byline */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-amber-400 font-medium">Tamir</span>
        <span className="text-[10px] text-slate-600">· {msg.time}</span>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(52,211,153,0.2)',
          maxWidth: 480,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(52,211,153,0.1)' }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}
          >
            <Check size={12} className="text-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Mission Complete</span>
        </div>

        {/* Body */}
        <div className="px-4 py-3.5">
          <p className="text-[13px] text-slate-200 leading-relaxed mb-3">{msg.content}</p>

          {/* Stats */}
          {msg.handoffStats && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {msg.handoffStats.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onConnect}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-slate-900 cursor-pointer"
              style={{ background: '#f59e0b' }}
            >
              <div className={`w-5 h-5 rounded-full ${agent.color} flex items-center justify-center text-[9px] font-bold text-white`}>
                {agent.avatar}
              </div>
              Connect with {agent.name} →
            </motion.button>
            <span className="text-[11px] text-slate-600">{agent.role}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
