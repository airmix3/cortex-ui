'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Telescope, Microscope, Puzzle } from 'lucide-react';
import type { ThinkingMode } from '@/data/think-data';

interface ThinkingInputProps {
  onSend: (text: string) => void;
  mode: ThinkingMode;
  onModeChange: (mode: ThinkingMode) => void;
}

const MODE_CONFIG: Record<ThinkingMode, { icon: React.ElementType; label: string; placeholder: string; color: string }> = {
  explore: {
    icon: Telescope,
    label: 'Explore',
    placeholder: 'What if we... / I\'ve been thinking about...',
    color: '#a78bfa',
  },
  analyze: {
    icon: Microscope,
    label: 'Analyze',
    placeholder: 'Break down... / Compare... / What are the risks of...',
    color: '#38bdf8',
  },
  synthesize: {
    icon: Puzzle,
    label: 'Synthesize',
    placeholder: 'So the key insight is... / Pulling it together...',
    color: '#34d399',
  },
};

const MODES: ThinkingMode[] = ['explore', 'analyze', 'synthesize'];

export default function ThinkingInput({ onSend, mode, onModeChange }: ThinkingInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        onSend(text.trim());
        setText('');
      }
    }
  };

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const currentConfig = MODE_CONFIG[mode];

  return (
    <div
      className="shrink-0 px-4 pb-3 pt-2"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Mode toggle */}
      <div className="flex items-center gap-1 mb-2">
        {MODES.map((m) => {
          const cfg = MODE_CONFIG[m];
          const Icon = cfg.icon;
          const isActive = m === mode;

          return (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer"
              style={{
                background: isActive ? `${cfg.color}15` : 'transparent',
                color: isActive ? cfg.color : '#475569',
                border: isActive ? `1px solid ${cfg.color}30` : '1px solid transparent',
              }}
            >
              <Icon size={11} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Input area */}
      <div
        className="flex items-end gap-2 rounded-xl px-3 py-2"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${currentConfig.color}20`,
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentConfig.placeholder}
          rows={1}
          className="flex-1 resize-none text-[13px] text-slate-300 placeholder:text-slate-600 outline-none bg-transparent leading-relaxed"
          style={{ maxHeight: 120 }}
        />
        <motion.button
          onClick={handleSend}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          style={{
            background: text.trim() ? `${currentConfig.color}20` : 'rgba(255,255,255,0.04)',
            color: text.trim() ? currentConfig.color : '#334155',
          }}
          whileTap={{ scale: 0.92 }}
        >
          <Send size={13} />
        </motion.button>
      </div>

      {/* Context line */}
      <div className="flex items-center gap-2 mt-1.5 px-1">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: currentConfig.color, opacity: 0.5 }}
        />
        <span className="text-[9.5px] text-slate-600">
          {mode === 'explore' && 'Divergent thinking — Tamir will surface adjacent ideas and challenge assumptions'}
          {mode === 'analyze' && 'Convergent thinking — Tamir will break things down structurally with data'}
          {mode === 'synthesize' && 'Synthesis — Tamir will connect threads and propose conclusions'}
        </span>
      </div>
    </div>
  );
}
