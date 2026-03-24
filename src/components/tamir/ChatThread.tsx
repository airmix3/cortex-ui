'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { FullChatMessage, DispatchStep } from './chat-data';
import TextBubble from './messages/TextBubble';
import MorningBrief from './messages/MorningBrief';
import InlineMissionCard from './messages/InlineMissionCard';
import DeliverableAttachment from './messages/DeliverableAttachment';
import DepartmentSummary from './messages/DepartmentSummary';
import EscalationAlert from './messages/EscalationAlert';
import ActionConfirmation from './messages/ActionConfirmation';
import PushNotification from './messages/PushNotification';
import DispatchFlow from './messages/DispatchFlow';
import AgentDeliverable from './messages/AgentDeliverable';
import HandoffCTA from './messages/HandoffCTA';
import MissionReport from './messages/MissionReport';
import PlanningQuestions from './messages/PlanningQuestions';
import MissionBriefSummary from './messages/MissionBriefSummary';
import type { ConnectedAgent, MissionPlan } from './chat-data';

export interface DispatchControls {
  states: Record<number, DispatchStep[]>;
  onAdvance: (messageId: number, stepIndex: number) => void;
  onRedirect: (messageId: number, stepIndex: number, note: string) => void;
}

const suggestedPrompts = [
  "What's most urgent right now?",
  'Give me the morning brief',
  "How's the Tech department doing?",
  'Show me active escalations',
];

export default function ChatThread({
  messages,
  isTyping,
  onSuggestedPrompt,
  dispatchControls,
  planningControls,
  onConnectAgent,
  connectedAgent,
}: {
  messages: FullChatMessage[];
  isTyping: boolean;
  onSuggestedPrompt: (text: string) => void;
  dispatchControls?: DispatchControls;
  planningControls?: {
    onPlanReady: (messageId: number, answers: Record<string, string>) => void;
    onLaunch?: (plan: MissionPlan) => void;
  };
  onConnectAgent?: (agent: ConnectedAgent) => void;
  connectedAgent?: ConnectedAgent | null;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function renderMessage(msg: FullChatMessage) {
    if (msg.contentType === 'dispatch-flow') {
      const steps = dispatchControls?.states[msg.id] ?? msg.dispatchPlan?.steps ?? [];
      return (
        <DispatchFlow
          msg={msg}
          steps={steps}
          onAdvance={(i) => dispatchControls?.onAdvance(msg.id, i)}
          onRedirect={(i, note) => dispatchControls?.onRedirect(msg.id, i, note)}
        />
      );
    }
    switch (msg.contentType) {
      case 'brief': return <MorningBrief msg={msg} />;
      case 'mission-card': return <InlineMissionCard msg={msg} />;
      case 'deliverable': return <DeliverableAttachment msg={msg} />;
      case 'department-summary': return <DepartmentSummary msg={msg} />;
      case 'escalation-alert': return <EscalationAlert msg={msg} />;
      case 'action-confirmation': return <ActionConfirmation msg={msg} />;
      case 'push': return <PushNotification msg={msg} />;
      case 'agent-deliverable': return <AgentDeliverable msg={msg} />;
      case 'handoff-cta': return <HandoffCTA msg={msg} onConnect={() => msg.handoffAgent && onConnectAgent?.(msg.handoffAgent)} />;
      case 'mission-report': return <MissionReport msg={msg} />;
      case 'planning-questions':
        return (
          <PlanningQuestions
            msg={msg}
            onSubmit={(answers) => planningControls?.onPlanReady(msg.id, answers)}
          />
        );
      case 'mission-brief-summary':
        return (
          <MissionBriefSummary
            msg={msg}
            onLaunch={(plan) => planningControls?.onLaunch?.(plan)}
          />
        );
      default: return <TextBubble msg={msg} />;
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(56,189,248,0.15))', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <Sparkles className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">What can I help you with?</h2>
          <p className="text-sm text-slate-400 text-center max-w-sm">
            I have full context on your missions, teams, escalations, and vault. Ask me anything.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 gap-2 max-w-md w-full">
          {suggestedPrompts.map((prompt, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
              onClick={() => onSuggestedPrompt(prompt)}
              className="px-3 py-2.5 rounded-xl text-[13px] text-slate-300 text-left transition-all hover:brightness-125"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
      <div className="max-w-3xl mx-auto space-y-5">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={msg.sender === 'ceo' ? 'flex justify-end' : ''}
            >
              {renderMessage(msg)}
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex flex-col gap-1 items-start"
            >
              <div className="flex items-center gap-1.5">
                {connectedAgent && (
                  <div className={`w-4 h-4 rounded-full ${connectedAgent.color} flex items-center justify-center text-[8px] font-bold text-white`}>
                    {connectedAgent.avatar}
                  </div>
                )}
                <span className={`text-[11px] ${connectedAgent ? 'text-violet-400' : 'text-amber-400'}`}>
                  {connectedAgent ? connectedAgent.name : 'Tamir'}
                </span>
              </div>
              <div
                className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-amber-400/60"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
