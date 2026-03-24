'use client';

import { useState, useCallback, useRef } from 'react';
import SessionList from './SessionList';
import ThinkingStream from './ThinkingStream';
import ThinkingInput from './ThinkingInput';
import InsightsPanel from './InsightsPanel';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  type ThinkingMode,
  type ThinkMessage,
  type ThinkSession,
  MOCK_SESSIONS,
  TOPIC_TAGS,
  simulateThinkResponse,
} from '@/data/think-data';

export default function ThinkPage() {
  const [sessions, setSessions] = useLocalStorage<ThinkSession[]>('myelin:think:sessions:v1', MOCK_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessions[0]?.id ?? null);
  const [mode, setMode] = useState<ThinkingMode>('explore');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [insightsCollapsed, setInsightsCollapsed] = useState(false);

  const activeSessionIdRef = useRef(activeSessionId);
  activeSessionIdRef.current = activeSessionId;

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages ?? [];

  // ── Update session messages helper ──────────────────────────────────────────
  const updateSessionMessages = useCallback(
    (sessionId: string, updater: (msgs: ThinkMessage[]) => ThinkMessage[]) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, messages: updater(s.messages), updatedAt: new Date().toISOString() }
            : s
        )
      );
    },
    [setSessions]
  );

  // ── Create new session ──────────────────────────────────────────────────────
  const handleNewSession = useCallback(() => {
    const newSession: ThinkSession = {
      id: `think-${Date.now()}`,
      title: 'New Thinking Session',
      topicTag: 'General',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, [setSessions]);

  // ── Select session ──────────────────────────────────────────────────────────
  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = useCallback(
    (text: string) => {
      if (!activeSessionId) return;

      const ceoMsg: ThinkMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ceo',
        content: text,
        timestamp: new Date().toISOString(),
        mode,
        isBookmarked: false,
      };

      // Update title if it's the first message in the session
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const isFirst = s.messages.length === 0;
          return {
            ...s,
            messages: [...s.messages, ceoMsg],
            updatedAt: new Date().toISOString(),
            title: isFirst ? text.slice(0, 60) + (text.length > 60 ? '...' : '') : s.title,
            topicTag: isFirst ? inferTopicTag(text) : s.topicTag,
          };
        })
      );

      // Simulate Tamir response
      setIsTyping(true);
      const delay = 1200 + Math.random() * 1500;
      const currentMode = mode;
      const currentSessionId = activeSessionId;

      setTimeout(() => {
        const responseContent = simulateThinkResponse(text, currentMode);
        const tamirMsg: ThinkMessage = {
          id: `msg-${Date.now()}-t`,
          sender: 'tamir',
          content: responseContent,
          timestamp: new Date().toISOString(),
          mode: currentMode,
          isBookmarked: false,
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? { ...s, messages: [...s.messages, tamirMsg], updatedAt: new Date().toISOString() }
              : s
          )
        );
        setIsTyping(false);
      }, delay);
    },
    [activeSessionId, mode, setSessions]
  );

  // ── Bookmark toggle ─────────────────────────────────────────────────────────
  const handleBookmark = useCallback(
    (messageId: string) => {
      if (!activeSessionId) return;
      updateSessionMessages(activeSessionId, (msgs) =>
        msgs.map((m) => (m.id === messageId ? { ...m, isBookmarked: !m.isBookmarked } : m))
      );
    },
    [activeSessionId, updateSessionMessages]
  );

  // ── Capture decision ────────────────────────────────────────────────────────
  const handleCaptureDecision = useCallback(
    (messageId: string, decision: { title: string; rationale: string; confidence: 'high' | 'medium' | 'low' }) => {
      if (!activeSessionId) return;
      updateSessionMessages(activeSessionId, (msgs) =>
        msgs.map((m) => (m.id === messageId ? { ...m, capturedDecision: decision } : m))
      );
    },
    [activeSessionId, updateSessionMessages]
  );

  // ── Remove bookmark (from insights panel) ──────────────────────────────────
  const handleRemoveBookmark = useCallback(
    (messageId: string) => {
      if (!activeSessionId) return;
      updateSessionMessages(activeSessionId, (msgs) =>
        msgs.map((m) => (m.id === messageId ? { ...m, isBookmarked: false } : m))
      );
    },
    [activeSessionId, updateSessionMessages]
  );

  // ── Export decisions to Vault ───────────────────────────────────────────────
  const handleExportToVault = useCallback(() => {
    if (!activeSession) return;
    const decisions = activeSession.messages.filter((m) => m.capturedDecision);
    if (decisions.length === 0) return;

    const vaultEntries = decisions.map((m) => ({
      id: `vault-${m.id}`,
      category: 'decision' as const,
      title: m.capturedDecision!.title,
      content: `${m.capturedDecision!.rationale}\n\nConfidence: ${m.capturedDecision!.confidence}\n\nFrom thinking session: "${activeSession.title}"`,
      addedBy: 'Tamir',
      approvedBy: 'CEO',
      createdAt: new Date().toISOString(),
      tags: [activeSession.topicTag, 'think-mode'],
      department: undefined,
    }));

    // Write to localStorage for Vault page
    try {
      const existing = JSON.parse(localStorage.getItem('myelin:vault:pushed:v1') ?? '[]');
      localStorage.setItem('myelin:vault:pushed:v1', JSON.stringify([...vaultEntries, ...existing]));
    } catch {
      // ignore
    }
  }, [activeSession]);

  return (
    <div className="flex h-full min-h-0">
      {/* Left sidebar — session list */}
      <SessionList
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Center — thinking stream + input */}
      <div className="flex-1 flex flex-col min-w-0">
        <ThinkingStream
          messages={messages}
          isTyping={isTyping}
          onSuggestedPrompt={handleSend}
          onBookmark={handleBookmark}
          onCaptureDecision={handleCaptureDecision}
        />
        <ThinkingInput
          onSend={handleSend}
          mode={mode}
          onModeChange={setMode}
        />
      </div>

      {/* Right panel — insights */}
      <InsightsPanel
        messages={messages}
        onRemoveBookmark={handleRemoveBookmark}
        onExportToVault={handleExportToVault}
        collapsed={insightsCollapsed}
        onToggleCollapse={() => setInsightsCollapsed(!insightsCollapsed)}
      />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function inferTopicTag(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('hire') || lower.includes('hiring') || lower.includes('team') || lower.includes('recruit')) return 'Hiring';
  if (lower.includes('fund') || lower.includes('raise') || lower.includes('investor') || lower.includes('series')) return 'Fundraising';
  if (lower.includes('product') || lower.includes('feature') || lower.includes('roadmap') || lower.includes('ship')) return 'Product';
  if (lower.includes('revenue') || lower.includes('growth') || lower.includes('sales') || lower.includes('pipeline')) return 'Strategy';
  if (lower.includes('marketing') || lower.includes('content') || lower.includes('brand')) return 'Marketing';
  if (lower.includes('tech') || lower.includes('engineer') || lower.includes('infra') || lower.includes('deploy')) return 'Tech';
  if (lower.includes('partner') || lower.includes('deal') || lower.includes('alliance')) return 'Partnership';
  if (lower.includes('culture') || lower.includes('values') || lower.includes('morale')) return 'Culture';
  if (lower.includes('ops') || lower.includes('process') || lower.includes('workflow')) return 'Operations';
  return 'General';
}
