'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, CheckCircle2, Loader2, ExternalLink, ChevronRight } from 'lucide-react';
import {
  type Tool,
  type ToolChatMessage,
  TOOLS,
  SEED_TOOL_MESSAGES,
  TOOL_SUGGESTED_PROMPTS,
  detectToolIntent,
} from '@/data/tools-data';

interface TamirToolsChatProps {
  tools: Tool[];
  onConnectTool: (toolId: string) => void;
  onDisconnectTool: (toolId: string) => void;
}

// ── Auth Card ─────────────────────────────────────────────────────────────────

function AuthCard({
  tool,
  onAuthorize,
  connecting,
  done,
}: {
  tool: Tool;
  onAuthorize: () => void;
  connecting: boolean;
  done: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${tool.color}25`,
      }}
    >
      {/* Tool header */}
      <div
        className="flex items-center gap-3 px-3.5 py-3"
        style={{ borderBottom: `1px solid ${tool.color}15` }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold text-white shrink-0"
          style={{ background: tool.color }}
        >
          {tool.initials}
        </div>
        <div>
          <div className="text-[12.5px] font-semibold text-slate-200">{tool.name}</div>
          <div className="text-[10.5px] text-slate-500">{tool.tagline}</div>
        </div>
        {done && (
          <div className="ml-auto flex items-center gap-1.5 text-emerald-400 text-[10.5px] font-medium">
            <CheckCircle2 size={13} />
            Connected
          </div>
        )}
      </div>

      {/* Permissions */}
      <div className="px-3.5 py-2.5">
        <div className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold mb-2">
          {done ? 'Permissions granted' : 'This will allow Tamir to'}
        </div>
        <div className="space-y-1.5">
          {tool.permissions.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: done ? '#34d399' : tool.color, opacity: 0.7 }}
              />
              <span className="text-[11px] text-slate-400">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!done && (
        <div className="px-3.5 pb-3">
          <button
            onClick={onAuthorize}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11.5px] font-semibold cursor-pointer transition-all"
            style={{
              background: connecting ? 'rgba(255,255,255,0.04)' : `${tool.color}18`,
              color: connecting ? '#475569' : tool.color,
              border: `1px solid ${tool.color}30`,
            }}
          >
            {connecting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <ExternalLink size={13} />
                {tool.authType === 'oauth'
                  ? `Authorize with ${tool.provider ?? tool.name}`
                  : 'Connect'}
                <ChevronRight size={11} className="ml-auto" />
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ── Tool Summary Card ─────────────────────────────────────────────────────────

function ToolSummaryCard({ tools }: { tools: Tool[] }) {
  const connected = tools.filter((t) => t.status === 'connected');
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 rounded-xl p-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold mb-2">
        {connected.length} tools connected
      </div>
      <div className="space-y-1.5">
        {connected.map((t) => (
          <div key={t.id} className="flex items-center gap-2.5">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold text-white shrink-0"
              style={{ background: t.color }}
            >
              {t.initials[0]}
            </div>
            <span className="text-[11.5px] text-slate-300 font-medium">{t.name}</span>
            <span className="ml-auto text-[10px] text-slate-600">{t.usedBy.join(', ') || '—'}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  tools,
  onAuthorize,
  authState,
}: {
  message: ToolChatMessage;
  tools: Tool[];
  onAuthorize: (toolId: string) => void;
  authState: Record<string, 'idle' | 'connecting' | 'done'>;
}) {
  const isCeo = message.sender === 'ceo';
  const tool = message.toolId ? tools.find((t) => t.id === message.toolId) : undefined;
  const state = message.toolId ? (authState[message.toolId] ?? 'idle') : 'idle';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isCeo ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="max-w-[90%] rounded-xl px-3 py-2.5"
        style={{
          background: isCeo ? 'rgba(56,189,248,0.06)' : 'rgba(255,255,255,0.03)',
          border: isCeo ? '1px solid rgba(56,189,248,0.12)' : '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {!isCeo && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="text-[7px] font-bold text-white">T</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-400">Tamir</span>
          </div>
        )}

        {/* Text content with markdown-ish bold */}
        {message.content && (
          <div className="text-[12px] text-slate-300 leading-relaxed whitespace-pre-wrap">
            {message.content.split(/\*\*(.*?)\*\*/g).map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="font-semibold text-slate-200">{part}</strong>
              ) : (
                part
              )
            )}
          </div>
        )}

        {/* Auth card */}
        {message.contentType === 'auth-card' && tool && (
          <AuthCard
            tool={tool}
            onAuthorize={() => onAuthorize(tool.id)}
            connecting={state === 'connecting'}
            done={state === 'done'}
          />
        )}

        {/* Tool summary */}
        {message.contentType === 'tool-summary' && (
          <ToolSummaryCard tools={tools} />
        )}

        <div className={`text-[9px] text-slate-600 mt-1.5 ${isCeo ? 'text-right' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Chat ─────────────────────────────────────────────────────────────────

export default function TamirToolsChat({ tools, onConnectTool, onDisconnectTool }: TamirToolsChatProps) {
  const [messages, setMessages] = useState<ToolChatMessage[]>(SEED_TOOL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [authState, setAuthState] = useState<Record<string, 'idle' | 'connecting' | 'done'>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isTyping]);

  const addMessage = (msg: Omit<ToolChatMessage, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: `msg-${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString() },
    ]);
  };

  const handleAuthorize = (toolId: string) => {
    setAuthState((prev) => ({ ...prev, [toolId]: 'connecting' }));
    setTimeout(() => {
      setAuthState((prev) => ({ ...prev, [toolId]: 'done' }));
      onConnectTool(toolId);
      const tool = tools.find((t) => t.id === toolId);
      setTimeout(() => {
        addMessage({
          sender: 'tamir',
          contentType: 'text',
          content: `✓ **${tool?.name ?? toolId}** is now connected. I can start using it right away — your agents have been notified and will reference it in relevant tasks going forward.${tool?.usedBy && tool.usedBy.length > 0 ? `\n\nAgents with access: ${tool.usedBy.join(', ')}.` : ''}`,
        });
      }, 500);
    }, 2200);
  };

  const handleSend = (text = input.trim()) => {
    if (!text) return;
    setInput('');

    addMessage({ sender: 'ceo', contentType: 'text', content: text });

    const intent = detectToolIntent(text);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      if (!intent) {
        addMessage({
          sender: 'tamir',
          contentType: 'text',
          content: "I can help you connect tools, disconnect ones you don't need, or tell you which agents are using what. Try something like \"Connect Slack\" or \"Which agents use Gmail?\"",
        });
        return;
      }

      if (intent.type === 'list') {
        addMessage({
          sender: 'tamir',
          contentType: 'tool-summary',
          content: "Here's what's currently connected:",
        });
        return;
      }

      if (intent.type === 'usage') {
        const tool = tools.find((t) => t.id === intent.toolId);
        if (!tool) {
          addMessage({ sender: 'tamir', contentType: 'text', content: "I don't recognize that tool. Can you try the full name?" });
          return;
        }
        const users = tool.usedBy;
        if (users.length === 0) {
          addMessage({ sender: 'tamir', contentType: 'text', content: `No agents are currently using **${tool.name}**. It's ${tool.status === 'connected' ? 'connected but not yet assigned to any agent workflows' : 'not connected yet'}.` });
        } else {
          addMessage({ sender: 'tamir', contentType: 'text', content: `**${tool.name}** is used by: **${users.join(', ')}**.\n\n${users.map((u) => `• **${u}** — uses it for ${tool.category} tasks`).join('\n')}` });
        }
        return;
      }

      if (intent.type === 'disconnect') {
        const tool = tools.find((t) => t.id === intent.toolId);
        if (!tool) {
          addMessage({ sender: 'tamir', contentType: 'text', content: "I don't recognize that tool." });
          return;
        }
        if (tool.status !== 'connected') {
          addMessage({ sender: 'tamir', contentType: 'text', content: `**${tool.name}** isn't connected, so there's nothing to disconnect.` });
          return;
        }
        onDisconnectTool(tool.id);
        addMessage({ sender: 'tamir', contentType: 'text', content: `**${tool.name}** has been disconnected. Agents that were using it have been notified and will fall back to manual methods.` });
        return;
      }

      if (intent.type === 'connect') {
        const tool = tools.find((t) => t.id === intent.toolId);
        if (!tool) {
          addMessage({ sender: 'tamir', contentType: 'text', content: "I don't have that tool in the catalog yet. Check the Tools Library on the left to browse what's available." });
          return;
        }
        if (tool.status === 'connected') {
          addMessage({ sender: 'tamir', contentType: 'text', content: `**${tool.name}** is already connected. ${tool.usedBy.length > 0 ? `It's being used by ${tool.usedBy.join(', ')}.` : 'No agents are currently assigned to it.'}` });
          return;
        }
        if (tool.status === 'coming-soon') {
          addMessage({ sender: 'tamir', contentType: 'text', content: `**${tool.name}** integration is coming soon. I'll notify you as soon as it's available.` });
          return;
        }
        addMessage({
          sender: 'tamir',
          contentType: 'auth-card',
          content: `I'll connect **${tool.name}** now. Review the permissions below, then authorize the connection.`,
          toolId: tool.id,
        });
      }
    }, 900 + Math.random() * 600);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
          <Sparkles size={12} className="text-white" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-200">Tamir</div>
          <div className="text-[9.5px] text-slate-600">Tool Manager</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[9.5px] text-emerald-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent' }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              tools={tools}
              onAuthorize={handleAuthorize}
              authState={authState}
            />
          ))}
        </AnimatePresence>

        {/* Typing */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="text-[7px] font-bold text-white">T</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-amber-400/50"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      <div className="shrink-0 px-3 pb-2 flex flex-wrap gap-1.5">
        {TOOL_SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="text-[10px] px-2.5 py-1 rounded-full cursor-pointer transition-all text-slate-500 hover:text-slate-300"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-3 pb-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex items-end gap-2 rounded-xl px-3 py-2 mt-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,158,11,0.12)' }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Connect a tool, ask about usage…"
            rows={1}
            className="flex-1 resize-none text-[12px] text-slate-300 placeholder:text-slate-600 outline-none bg-transparent leading-relaxed"
            style={{ maxHeight: 80 }}
          />
          <button
            onClick={() => handleSend()}
            className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            style={{
              background: input.trim() ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
              color: input.trim() ? '#f59e0b' : '#334155',
            }}
          >
            <Send size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
