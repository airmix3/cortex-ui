'use client';

import { motion } from 'motion/react';
import { FullChatMessage } from '../chat-data';

export default function TextBubble({ msg }: { msg: FullChatMessage }) {
  const isCeo = msg.sender === 'ceo';
  const senderName = isCeo ? 'You' : (msg.agentName ?? 'Tamir');
  // Agents other than Tamir get their own avatar bubble
  const showAgentAvatar = !isCeo && msg.agentName && msg.agentName !== 'Tamir';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col gap-1 ${isCeo ? 'items-end' : 'items-start'}`}
    >
      <div className="flex items-center gap-2">
        {showAgentAvatar && (
          <div className={`w-5 h-5 rounded-full ${msg.agentColor} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
            {msg.agentAvatar}
          </div>
        )}
        <span className={`text-[11px] font-medium ${isCeo ? 'text-sky-400' : showAgentAvatar ? 'text-violet-400' : 'text-amber-400'}`}>
          {senderName}
        </span>
        {msg.agentDepartment && !isCeo && showAgentAvatar && (
          <span className="text-[10px] text-slate-600">· {msg.agentDepartment}</span>
        )}
        <span className="text-[10px] text-slate-600">{msg.time}</span>
      </div>
      <div
        className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={isCeo ? {
          background: 'rgba(56,189,248,0.10)',
          border: '1px solid rgba(56,189,248,0.18)',
          color: '#bae6fd',
        } : {
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.09)',
          color: '#e2e8f0',
        }}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}
