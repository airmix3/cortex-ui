'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import ChatSidebar from './ChatSidebar';
import ChatThread from './ChatThread';
import ChatInput from './ChatInput';
import ContextPanel from './ContextPanel';
import LiveExecutionPanel from './LiveExecutionPanel';
import PlanningCanvas from './PlanningCanvas';
import {
  ChatMode,
  ChatThread as ChatThreadType,
  FullChatMessage,
  DispatchStep,
  ConnectedAgent,
  MissionReportData,
  MissionPlan,
  mainThread,
  olderThreads,
  simulateResponse,
  simulateAgentResponse,
  createPlanningQuestionsMsg,
  generateMissionPlan,
  missionPlanToDispatchPlan,
  detectsPlanningIntent,
} from './chat-data';

function makeMissionReportMsg(goal: string): FullChatMessage {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const report: MissionReportData = {
    goal,
    evaluations: [
      {
        evaluatorName: 'Maya',
        evaluatorAvatar: 'MY',
        evaluatorColor: 'bg-violet-500',
        evaluatorRole: 'CMO · Outcome evaluation',
        grade: 8,
        summary: "Campaign is well-positioned and copy quality is solid. My main concern: we only A/B tested email subject lines, not LinkedIn DM angles. At 89 contacts it's fine, but at scale we'd want both tested. ICP targeting was tight — Jordan's scoring model was accurate.",
        dimensions: [
          { label: 'Copy quality', score: 9 },
          { label: 'Lead targeting', score: 8 },
          { label: 'Process speed', score: 7 },
          { label: 'Execution', score: 8 },
        ],
      },
      {
        evaluatorName: 'Jordan',
        evaluatorAvatar: 'JO',
        evaluatorColor: 'bg-emerald-500',
        evaluatorRole: 'Marketing · Self-evaluation',
        grade: 7,
        summary: "Scoring model worked well but enrichment was fully manual — I exported and cleaned from LinkedIn Sales Nav by hand. A proper enrichment integration would've let me cover 3x the contacts in the same time with higher confidence in firmographic accuracy.",
        dimensions: [
          { label: 'Data quality', score: 8 },
          { label: 'Coverage', score: 7 },
          { label: 'Speed', score: 5 },
          { label: 'Confidence', score: 7 },
        ],
      },
    ],
    learnings: [
      {
        id: 'l1',
        type: 'workflow-memory',
        title: 'AI agency outreach: CTOs prefer proof-led copy',
        description: "Proof-led messaging (specific results, timelines) outperformed urgency-led in this ICP. Load this into Maya's context automatically for similar outbound campaigns targeting technical decision-makers.",
        proposedBy: 'Maya',
      },
      {
        id: 'l2',
        type: 'new-skill',
        title: 'Pre-score leads before copy draft',
        description: 'Lead scoring should complete before copy is written — not in parallel. Knowing the ICP breakdown early lets messaging be more precise. Add as a required step before any copy work begins.',
        proposedBy: 'Jordan',
      },
      {
        id: 'l3',
        type: 'mcp-tool',
        title: 'LinkedIn enrichment API integration',
        description: 'Jordan enriched 247 contacts manually from Sales Nav. An automated enrichment tool would reduce this to a single batch call, allow 3× coverage, and improve firmographic confidence scores.',
        proposedBy: 'Jordan',
      },
    ],
  };
  return {
    id: Date.now() + Math.random(),
    sender: 'tamir',
    time,
    contentType: 'mission-report',
    content: '',
    missionReport: report,
  };
}

function makeDeliverableMsg(step: DispatchStep): FullChatMessage {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    id: Date.now() + Math.random(),
    sender: 'tamir',
    time,
    contentType: 'agent-deliverable',
    content: '',
    agentName: step.agentName,
    agentAvatar: step.agentAvatar,
    agentColor: step.agentColor,
    agentDepartment: step.department,
    deliverableFile: step.deliverable,
    deliverableContent: step.deliverablePreview?.content,
    deliverableStats: step.deliverablePreview?.stats,
  };
}

type EntityRef = { type: 'mission' | 'department' | 'escalation'; id: string };

function detectEntity(msg: FullChatMessage): EntityRef | null {
  if (msg.missionId) return { type: 'mission', id: msg.missionId };
  if (msg.departmentId) return { type: 'department', id: msg.departmentId };
  if (msg.escalationId) return { type: 'escalation', id: msg.escalationId };
  return null;
}

export default function TamirChatPage() {
  const [threads, setThreads] = useState<ChatThreadType[]>([mainThread, ...olderThreads]);
  const [activeThreadId, setActiveThreadId] = useState(mainThread.id);
  const [mode, setMode] = useState<ChatMode>('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextEntity, setContextEntity] = useState<EntityRef | null>(mainThread.contextEntity ?? null);

  // ── Dispatch step state (lifted here so both inline card + right panel share it)
  const [dispatchStates, setDispatchStates] = useState<Record<number, DispatchStep[]>>({});

  // Connected C-level agent (null = chatting with Tamir)
  const [connectedAgent, setConnectedAgent] = useState<ConnectedAgent | null>(null);

  // ── Planning canvas state ──────────────────────────────────────────────────
  type PlanningState = {
    phase: 'questions' | 'canvas';
    messageId: number;
    goal: string;
    plan: MissionPlan | null;
  };
  const [planningState, setPlanningState] = useState<PlanningState | null>(null);

  // Ref so auto-advance effect can inject messages without adding activeThreadId to deps
  const activeThreadIdRef = useRef(activeThreadId);
  activeThreadIdRef.current = activeThreadId;

  // Prevent injecting the handoff CTA / report more than once per dispatch message
  const handoffInjectedRef = useRef<number | null>(null);
  const reportInjectedRef = useRef<number | null>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = activeThread?.messages ?? [];

  // ── Find the most recent dispatch-flow message in the current thread ──
  const latestDispatchMsg = useMemo(
    () => [...messages].reverse().find((m) => m.contentType === 'dispatch-flow'),
    [messages]
  );

  const liveDispatch = useMemo(() => {
    if (!latestDispatchMsg?.dispatchPlan) return null;
    const steps = dispatchStates[latestDispatchMsg.id] ?? latestDispatchMsg.dispatchPlan.steps;
    return { messageId: latestDispatchMsg.id, goal: latestDispatchMsg.dispatchPlan.goal, steps };
  }, [latestDispatchMsg, dispatchStates]);

  // ── Auto-advance in-progress steps ──────────────────────────────────────
  useEffect(() => {
    if (!liveDispatch) return;
    const idx = liveDispatch.steps.findIndex((s) => s.status === 'in-progress');
    if (idx === -1) return;

    const completingStep = liveDispatch.steps[idx];
    const delay = 2600 + Math.random() * 2000;
    const timer = setTimeout(() => {
      setDispatchStates((prev) => {
        const current = prev[liveDispatch.messageId] ?? liveDispatch.steps;
        const next = [...current];
        next[idx] = { ...next[idx], status: 'done' };
        const nextIdx = idx + 1;
        if (nextIdx < next.length) {
          next[nextIdx] = {
            ...next[nextIdx],
            status: next[nextIdx].requiresCEOApproval ? 'awaiting-approval' : 'in-progress',
          };
        }
        return { ...prev, [liveDispatch.messageId]: next };
      });

      // Surface completed work product in chat
      if (completingStep.deliverablePreview) {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadIdRef.current
              ? { ...t, messages: [...t.messages, makeDeliverableMsg(completingStep)] }
              : t
          )
        );
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [liveDispatch]);

  // ── Inject handoff CTA when all work steps complete ──────────────────────
  useEffect(() => {
    if (!liveDispatch) return;
    const workSteps = liveDispatch.steps.filter((s) => !s.requiresCEOApproval);
    const allDone = workSteps.length > 0 && workSteps.every((s) => s.status === 'done');
    if (!allDone) return;
    if (handoffInjectedRef.current === liveDispatch.messageId) return;
    handoffInjectedRef.current = liveDispatch.messageId;

    const timer = setTimeout(() => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const handoffMsg: FullChatMessage = {
        id: Date.now() + Math.random(),
        sender: 'tamir',
        time,
        contentType: 'handoff-cta',
        content: "Campaign is live and running. Maya has full context on the copy, lead list, and launch schedule. I'd recommend a quick sync before the first touch goes out tomorrow at 9am.",
        handoffAgent: { name: 'Maya', avatar: 'MY', color: 'bg-violet-500', department: 'Marketing', role: 'CMO' },
        handoffStats: ['89 contacts queued', '5-touch sequence', '3 LinkedIn templates', 'Launch: tomorrow 9am'],
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadIdRef.current
            ? { ...t, messages: [...t.messages, handoffMsg] }
            : t
        )
      );
    }, 1200);

    return () => clearTimeout(timer);
  }, [liveDispatch]);

  // ── Inject mission report after all steps complete (delayed) ─────────────
  useEffect(() => {
    if (!liveDispatch) return;
    const workSteps = liveDispatch.steps.filter((s) => !s.requiresCEOApproval);
    const allDone = workSteps.length > 0 && workSteps.every((s) => s.status === 'done');
    if (!allDone) return;
    if (reportInjectedRef.current === liveDispatch.messageId) return;
    reportInjectedRef.current = liveDispatch.messageId;

    const timer = setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadIdRef.current
            ? { ...t, messages: [...t.messages, makeMissionReportMsg(liveDispatch.goal)] }
            : t
        )
      );
    }, 5000); // 5s after completion — gives time to notice handoff CTA before report appears

    return () => clearTimeout(timer);
  }, [liveDispatch]);

  // ── Step controls (shared by inline card + right panel) ─────────────────
  const handleAdvance = useCallback((messageId: number, stepIndex: number) => {
    setDispatchStates((prev) => {
      const current = [...(prev[messageId] ?? [])];
      current[stepIndex] = { ...current[stepIndex], status: 'done' };
      const nextIdx = stepIndex + 1;
      if (nextIdx < current.length) {
        current[nextIdx] = {
          ...current[nextIdx],
          status: current[nextIdx].requiresCEOApproval ? 'awaiting-approval' : 'in-progress',
        };
      }
      return { ...prev, [messageId]: current };
    });
  }, []);

  const handleRedirect = useCallback((messageId: number, stepIndex: number, note: string) => {
    setDispatchStates((prev) => {
      const current = [...(prev[messageId] ?? [])];
      current[stepIndex] = { ...current[stepIndex], status: 'rejected', detail: note };
      return { ...prev, [messageId]: current };
    });
  }, []);

  // ── Connect to C-level agent ──────────────────────────────────────────────
  const handleConnectAgent = useCallback((agent: ConnectedAgent) => {
    setConnectedAgent(agent);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const briefMsg: FullChatMessage = {
      id: Date.now() + Math.random(),
      sender: 'tamir',
      time,
      contentType: 'text',
      content: `Hey — Maya here. Happy to walk you through it.\n\nWe've got 89 contacts queued in the priority tier, first email goes out tomorrow at 9am. Two subject line variants running A/B — I'll cut the loser by day 3. LinkedIn DMs follow at 10am, staggered.\n\nCopy is locked and sequenced. What do you want to dig into first?`,
      agentName: agent.name,
      agentAvatar: agent.avatar,
      agentColor: agent.color,
      agentDepartment: agent.department,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadIdRef.current
          ? { ...t, messages: [...t.messages, briefMsg] }
          : t
      )
    );
  }, []);

  // ── Planning: answers submitted → generate plan, show canvas + inline brief card ─
  const handlePlanReady = useCallback((messageId: number, answers: Record<string, string>) => {
    const goal = planningState?.goal ?? '';
    const plan = generateMissionPlan(goal, answers);
    setPlanningState({ phase: 'canvas', messageId, goal, plan });

    // Inject inline Mission Brief Summary card in the chat thread
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const briefCardMsg: FullChatMessage = {
      id: Date.now() + Math.random(),
      sender: 'tamir',
      time,
      contentType: 'mission-brief-summary',
      content: '',
      missionPlan: plan,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadIdRef.current
          ? { ...t, messages: [...t.messages, briefCardMsg] }
          : t
      )
    );
  }, [planningState?.goal]);

  // ── Launch: convert plan → dispatch flow + persist to localStorage for Workspace ─
  const handleLaunchMission = useCallback((plan: MissionPlan) => {
    // Save to localStorage so Workspace page can show it as a new mission
    if (typeof window !== 'undefined') {
      const workSteps = plan.steps.filter((s) => !s.requiresCEOApproval && s.agentName !== 'Tamir');
      const launchEntry = {
        id: `tamir-${Date.now()}`,
        title: plan.goal,
        brief: plan.brief,
        department: workSteps[0]?.department ?? 'Marketing',
        estimatedDuration: plan.estimatedDuration,
        successCriteria: plan.successCriteria,
        agents: workSteps.map((s) => ({ name: s.agentName, avatar: s.agentAvatar, color: s.agentColor })),
        launchedAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('tamir-launched-missions') ?? '[]');
      localStorage.setItem('tamir-launched-missions', JSON.stringify([launchEntry, ...existing]));
    }

    const dispatchPlan = missionPlanToDispatchPlan(plan);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const response: FullChatMessage = {
      id: Date.now() + Math.random(),
      sender: 'tamir',
      time,
      contentType: 'dispatch-flow',
      content: '',
      dispatchPlan,
    };

    // Initialize dispatch state — first non-approval step is in-progress, already done for Tamir scope
    const initialSteps = dispatchPlan.steps.map((s, i) => ({
      ...s,
      status: i === 0 ? ('in-progress' as const) : ('pending' as const),
    }));

    setDispatchStates((prev) => ({ ...prev, [response.id]: initialSteps }));
    setPlanningState(null);
    setContextEntity(null);

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadIdRef.current
          ? { ...t, messages: [...t.messages, response] }
          : t
      )
    );
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = useCallback((text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const ceoMsg: FullChatMessage = { id: Date.now(), sender: 'ceo', time, contentType: 'text', content: text };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId ? { ...t, messages: [...t.messages, ceoMsg], preview: text } : t
      )
    );

    // ── Planning intent → go to questions phase ──
    if (!connectedAgent && planningState === null && detectsPlanningIntent(text)) {
      setIsTyping(true);
      setTimeout(() => {
        const questionsMsg = createPlanningQuestionsMsg(text);
        setPlanningState({ phase: 'questions', messageId: questionsMsg.id, goal: text, plan: null });
        setIsTyping(false);
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadId
              ? { ...t, messages: [...t.messages, questionsMsg] }
              : t
          )
        );
      }, 1000 + Math.random() * 600);
      return;
    }

    setIsTyping(true);

    const delay = 1200 + Math.random() * 1300;
    const agentSnapshot = connectedAgent; // capture for closure
    setTimeout(() => {
      const response = agentSnapshot
        ? simulateAgentResponse(text, agentSnapshot)
        : simulateResponse(text, mode);
      setIsTyping(false);

      if (response.contentType === 'dispatch-flow' && response.dispatchPlan) {
        setDispatchStates((prev) => ({ ...prev, [response.id]: response.dispatchPlan!.steps }));
        setContextEntity(null);

        // Surface any pre-completed step deliverables (step 0 — Tamir's scope)
        const immediateDeliverables = response.dispatchPlan.steps
          .filter((s) => s.status === 'done' && s.deliverablePreview)
          .map(makeDeliverableMsg);

        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadId
              ? { ...t, messages: [...t.messages, response, ...immediateDeliverables], preview: response.content || t.preview }
              : t
          )
        );
      } else {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadId
              ? { ...t, messages: [...t.messages, response], preview: response.content || t.preview }
              : t
          )
        );
        const entity = detectEntity(response);
        if (entity) setContextEntity(entity);
      }
    }, delay);
  }, [activeThreadId, mode, connectedAgent]);

  const handleNewThread = useCallback(() => {
    const newThread: ChatThreadType = {
      id: `thread-${Date.now()}`,
      title: 'New Conversation',
      preview: 'Start a new conversation with Tamir',
      timestamp: new Date(),
      messages: [],
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    setContextEntity(null);
    setConnectedAgent(null);
    setPlanningState(null);
  }, []);

  const handleSelectThread = useCallback((id: string) => {
    setActiveThreadId(id);
    const thread = threads.find((t) => t.id === id);
    setContextEntity(thread?.contextEntity ?? null);
    setPlanningState(null);
    setConnectedAgent(null);
  }, [threads]);

  const showPlanningCanvas = planningState?.phase === 'canvas' && !!planningState.plan;
  const showLivePanel = !!liveDispatch && !showPlanningCanvas;
  const showContextPanel = !!contextEntity && !showLivePanel && !showPlanningCanvas;

  return (
    <div className="flex h-full min-h-0">
      {/* Left sidebar */}
      <ChatSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Center chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatThread
          messages={messages}
          isTyping={isTyping}
          onSuggestedPrompt={handleSend}
          dispatchControls={{
            states: dispatchStates,
            onAdvance: handleAdvance,
            onRedirect: handleRedirect,
          }}
          planningControls={{
            onPlanReady: handlePlanReady,
            onLaunch: handleLaunchMission,
          }}
          onConnectAgent={handleConnectAgent}
          connectedAgent={connectedAgent}
        />
        {connectedAgent && (
          <div
            className="flex items-center gap-2 px-4 py-2 shrink-0"
            style={{ borderTop: '1px solid rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.04)' }}
          >
            <div className={`w-4 h-4 rounded-full ${connectedAgent.color} flex items-center justify-center text-[8px] font-bold text-white`}>
              {connectedAgent.avatar}
            </div>
            <span className="text-[11px] text-violet-400 font-medium">Chatting with {connectedAgent.name}</span>
            <span className="text-[10px] text-slate-600">· {connectedAgent.role}</span>
            <button
              onClick={() => setConnectedAgent(null)}
              className="ml-auto text-[10px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
            >
              Back to Tamir
            </button>
          </div>
        )}
        <ChatInput onSend={handleSend} mode={mode} onModeChange={setMode} />
      </div>

      {/* Right panel — planning canvas / live execution / entity context */}
      <AnimatePresence>
        {showPlanningCanvas && (
          <PlanningCanvas
            key="planning"
            plan={planningState!.plan!}
            onLaunch={handleLaunchMission}
            onClose={() => setPlanningState(null)}
          />
        )}
        {showLivePanel && (
          <LiveExecutionPanel
            key="live"
            goal={liveDispatch.goal}
            steps={liveDispatch.steps}
            onAdvance={(i) => handleAdvance(liveDispatch.messageId, i)}
            onRedirect={(i, note) => handleRedirect(liveDispatch.messageId, i, note)}
            onClose={() => {
              // Remove dispatch state so the panel hides; card in chat still works
              setDispatchStates((prev) => {
                const next = { ...prev };
                delete next[liveDispatch.messageId];
                return next;
              });
            }}
          />
        )}
        {showContextPanel && (
          <ContextPanel
            key="context"
            entity={contextEntity}
            onClose={() => setContextEntity(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
