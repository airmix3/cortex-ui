'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Gavel, Sparkles, Telescope, Microscope, Puzzle, Brain } from 'lucide-react';
import type { ThinkMessage } from '@/data/think-data';
import { SUGGESTED_PROMPTS } from '@/data/think-data';

interface ThinkingStreamProps {
  messages: ThinkMessage[];
  isTyping: boolean;
  onSuggestedPrompt: (text: string) => void;
  onBookmark: (messageId: string) => void;
  onCaptureDecision: (messageId: string, decision: { title: string; rationale: string; confidence: 'high' | 'medium' | 'low' }) => void;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: '#34d399',
  medium: '#f59e0b',
  low: '#f43f5e',
};

function DecisionCaptureForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (d: { title: string; rationale: string; confidence: 'high' | 'medium' | 'low' }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [rationale, setRationale] = useState('');
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>('medium');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 rounded-lg p-3 space-y-2"
      style={{
        background: 'rgba(139,92,246,0.06)',
        border: '1px solid rgba(139,92,246,0.15)',
      }}
    >
      <div className="text-[10px] uppercase tracking-wide text-violet-400 font-semibold flex items-center gap-1.5">
        <Gavel size={10} /> Capture Decision
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Decision title..."
        className="w-full px-2 py-1.5 rounded-md text-[11.5px] text-slate-300 placeholder:text-slate-600 outline-none bg-white/[0.03] border border-white/[0.06]"
        autoFocus
      />
      <textarea
        value={rationale}
        onChange={(e) => setRationale(e.target.value)}
        placeholder="Rationale — why this decision?"
        rows={2}
        className="w-full px-2 py-1.5 rounded-md text-[11.5px] text-slate-300 placeholder:text-slate-600 outline-none bg-white/[0.03] border border-white/[0.06] resize-none"
      />
      <div className="flex items-center gap-1.5">
        <span className="text-[9.5px] text-slate-500 mr-1">Confidence:</span>
        {(['high', 'medium', 'low'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setConfidence(c)}
            className="px-2 py-0.5 rounded-full text-[9.5px] font-medium cursor-pointer transition-all"
            style={{
              background: confidence === c ? `${CONFIDENCE_COLORS[c]}20` : 'transparent',
              color: confidence === c ? CONFIDENCE_COLORS[c] : '#475569',
              border: confidence === c ? `1px solid ${CONFIDENCE_COLORS[c]}40` : '1px solid transparent',
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => {
            if (title.trim()) onSubmit({ title: title.trim(), rationale: rationale.trim(), confidence });
          }}
          disabled={!title.trim()}
          className="px-3 py-1 rounded-lg text-[10.5px] font-medium cursor-pointer transition-all"
          style={{
            background: title.trim() ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
            color: title.trim() ? '#c4b5fd' : '#334155',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          Capture
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded-lg text-[10.5px] text-slate-500 hover:text-slate-400 cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

function MessageBubble({
  message,
  onBookmark,
  onCaptureDecision,
}: {
  message: ThinkMessage;
  onBookmark: () => void;
  onCaptureDecision: (d: { title: string; rationale: string; confidence: 'high' | 'medium' | 'low' }) => void;
}) {
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isCeo = message.sender === 'ceo';

  const ModeIcon = message.mode === 'explore' ? Telescope : message.mode === 'analyze' ? Microscope : Puzzle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isCeo ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative max-w-[85%] rounded-xl px-3.5 py-2.5"
        style={{
          background: isCeo
            ? 'rgba(56,189,248,0.06)'
            : message.isBookmarked
            ? 'rgba(245,158,11,0.06)'
            : 'rgba(255,255,255,0.03)',
          border: isCeo
            ? '1px solid rgba(56,189,248,0.12)'
            : message.isBookmarked
            ? '1px solid rgba(245,158,11,0.15)'
            : '1px solid rgba(255,255,255,0.06)',
          borderLeft: !isCeo && message.isBookmarked ? '3px solid rgba(245,158,11,0.5)' : undefined,
        }}
      >
        {/* Sender label */}
        {!isCeo && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="text-[7px] font-bold text-white">T</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-400">Tamir</span>
            {message.mode && (
              <span className="flex items-center gap-0.5 text-[9px] text-slate-600">
                <ModeIcon size={8} />
                {message.mode}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <div className="text-[12.5px] text-slate-300 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Captured decision card */}
        {message.capturedDecision && (
          <div
            className="mt-2 rounded-lg px-3 py-2"
            style={{
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.15)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Gavel size={9} className="text-violet-400" />
              <span className="text-[10px] font-semibold text-violet-400">Decision Captured</span>
              <span
                className="ml-auto w-2 h-2 rounded-full"
                style={{ background: CONFIDENCE_COLORS[message.capturedDecision.confidence] }}
              />
            </div>
            <div className="text-[11.5px] text-slate-300 font-medium">{message.capturedDecision.title}</div>
            {message.capturedDecision.rationale && (
              <div className="text-[10.5px] text-slate-500 mt-0.5">{message.capturedDecision.rationale}</div>
            )}
          </div>
        )}

        {/* Hover actions */}
        <AnimatePresence>
          {hovered && !isCeo && !showDecisionForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute -top-3 right-2 flex items-center gap-1 rounded-lg px-1 py-0.5"
              style={{
                background: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              <button
                onClick={onBookmark}
                className="p-1 rounded cursor-pointer transition-colors hover:bg-white/10"
                title={message.isBookmarked ? 'Remove bookmark' : 'Bookmark insight'}
              >
                <Star
                  size={12}
                  className={message.isBookmarked ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}
                />
              </button>
              {!message.capturedDecision && (
                <button
                  onClick={() => setShowDecisionForm(true)}
                  className="p-1 rounded cursor-pointer transition-colors hover:bg-white/10"
                  title="Capture as decision"
                >
                  <Gavel size={12} className="text-slate-400" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decision capture form */}
        <AnimatePresence>
          {showDecisionForm && (
            <DecisionCaptureForm
              onSubmit={(d) => {
                onCaptureDecision(d);
                setShowDecisionForm(false);
              }}
              onCancel={() => setShowDecisionForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Timestamp */}
        <div className={`text-[9px] text-slate-600 mt-1 ${isCeo ? 'text-right' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

export default function ThinkingStream({
  messages,
  isTyping,
  onSuggestedPrompt,
  onBookmark,
  onCaptureDecision,
}: ThinkingStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <Brain size={22} className="text-amber-400/60" />
          </div>
          <div className="text-[14px] text-slate-400 font-medium mb-1">Start a thinking session</div>
          <div className="text-[11.5px] text-slate-600 max-w-xs mx-auto mb-6">
            Work through a problem with Tamir. Bookmark insights and capture decisions as they emerge.
          </div>

          <div className="grid grid-cols-2 gap-2 max-w-md">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onSuggestedPrompt(prompt)}
                className="text-left px-3 py-2.5 rounded-xl text-[11px] text-slate-400 cursor-pointer transition-all"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245,158,11,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
    >
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onBookmark={() => onBookmark(msg.id)}
            onCaptureDecision={(d) => onCaptureDecision(msg.id, d)}
          />
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-[7px] font-bold text-white">T</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-amber-400/50"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-amber-400/50"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-amber-400/50"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
