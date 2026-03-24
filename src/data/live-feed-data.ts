// ── Live Activity Feed types & seed data ──────────────────────────────────────

export type ActivityType = 'start' | 'complete' | 'handoff' | 'escalate' | 'think' | 'block' | 'receive' | 'directive';

export interface LiveActivity {
  id: string;
  secsAgo: number;        // seconds since this event — used for relative time display
  agentId: string;
  agentName: string;
  agentAvatar: string;
  agentColor: string;
  type: ActivityType;
  message: string;
  missionTitle?: string;
  toAgentName?: string;   // for handoffs
  toAgentColor?: string;
  isNew?: boolean;        // true for freshly generated entries
}

// ── Config per activity type ──────────────────────────────────────────────────

export const activityTypeConfig: Record<ActivityType, { label: string; color: string; bg: string; dot: string }> = {
  start:     { label: 'Started',     color: '#38bdf8', bg: 'rgba(56,189,248,0.08)',   dot: '#38bdf8' },
  complete:  { label: 'Completed',   color: '#34d399', bg: 'rgba(52,211,153,0.08)',   dot: '#34d399' },
  handoff:   { label: 'Handed off',  color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', dot: '#a78bfa' },
  escalate:  { label: 'Escalated',   color: '#f43f5e', bg: 'rgba(244,63,94,0.08)',    dot: '#f43f5e' },
  think:     { label: 'Thinking',    color: '#6366f1', bg: 'rgba(99,102,241,0.08)',   dot: '#6366f1' },
  block:     { label: 'Blocked',     color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',   dot: '#f59e0b' },
  receive:   { label: 'Received',    color: '#64748b', bg: 'rgba(100,116,139,0.08)', dot: '#64748b' },
  directive: { label: 'Directive',   color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',   dot: '#fbbf24' },
};

// ── Seed data (most recent first) ─────────────────────────────────────────────

export const SEED_ACTIVITIES: LiveActivity[] = [
  {
    id: 'a1', secsAgo: 18, agentId: 'dev2', agentName: 'Infra Agent', agentAvatar: 'I', agentColor: 'bg-teal-600',
    type: 'think', message: 'Evaluating VPC peering config for us-west-2 failover route', missionTitle: 'AWS Capacity Blocker',
  },
  {
    id: 'a2', secsAgo: 47, agentId: 'cto', agentName: 'Alex (CTO)', agentAvatar: 'A', agentColor: 'bg-blue-600',
    type: 'block', message: 'Provisioning g4dn.xlarge blocked — awaiting CEO cost approval (+$0.12/hr)', missionTitle: 'AWS Capacity Blocker',
  },
  {
    id: 'a3', secsAgo: 78, agentId: 'temp2', agentName: 'Data Scientist', agentAvatar: 'DS', agentColor: 'bg-rose-600',
    type: 'start', message: 'Running SMOTE class balancing on EEG training dataset (batch 5/5)', missionTitle: 'EEG Model Optimization',
  },
  {
    id: 'a4', secsAgo: 105, agentId: 'dev1', agentName: 'Dev Agent', agentAvatar: 'D', agentColor: 'bg-cyan-600',
    type: 'complete', message: 'ZUNA deployment manifest v2.1 generated — all CTO review comments applied', missionTitle: 'ZUNA Deployment',
  },
  {
    id: 'a5', secsAgo: 142, agentId: 'dev1', agentName: 'Dev Agent', agentAvatar: 'D', agentColor: 'bg-cyan-600',
    type: 'handoff', message: 'Passed manifest v2.1 to CTO for final architecture sign-off',
    missionTitle: 'ZUNA Deployment', toAgentName: 'Alex (CTO)', toAgentColor: 'bg-blue-600',
  },
  {
    id: 'a6', secsAgo: 190, agentId: 'tamir', agentName: 'Tamir', agentAvatar: 'T', agentColor: 'bg-amber-600',
    type: 'escalate', message: 'Packaged L4 GPU escalation for CEO — 3 agents blocked for 3h+', missionTitle: 'AWS Capacity Blocker',
  },
  {
    id: 'a7', secsAgo: 240, agentId: 'mkt1', agentName: 'Content Agent', agentAvatar: 'C', agentColor: 'bg-pink-600',
    type: 'complete', message: 'SEO keyword research complete — 15 high-intent terms identified', missionTitle: 'Content Strategy Plans',
  },
  {
    id: 'a8', secsAgo: 318, agentId: 'cmo', agentName: 'Maya (CMO)', agentAvatar: 'M', agentColor: 'bg-purple-600',
    type: 'receive', message: 'Received content_plans.pdf + Q2 editorial calendar from Content Agent',
    missionTitle: 'Content Strategy Plans', toAgentName: 'Content Agent', toAgentColor: 'bg-pink-600',
  },
  {
    id: 'a9', secsAgo: 380, agentId: 'res1', agentName: 'Research Agent', agentAvatar: 'R', agentColor: 'bg-indigo-600',
    type: 'complete', message: 'Patent risk report finalized — 3 IP conflicts flagged with mitigation paths', missionTitle: 'EEG Model Optimization',
  },
  {
    id: 'a10', secsAgo: 420, agentId: 'temp1', agentName: 'EEG Researcher', agentAvatar: 'ER', agentColor: 'bg-orange-600',
    type: 'handoff', message: 'Submitted interim test results (batch 4/5) to CTO for review',
    missionTitle: 'EEG Model Optimization', toAgentName: 'Alex (CTO)', toAgentColor: 'bg-blue-600',
  },
  {
    id: 'a11', secsAgo: 512, agentId: 'ops1', agentName: 'Ops Agent', agentAvatar: 'O', agentColor: 'bg-lime-600',
    type: 'start', message: 'Starting cost allocation reconciliation for investor deck methodology', missionTitle: 'Investor Update Deck',
  },
  {
    id: 'a12', secsAgo: 580, agentId: 'coo', agentName: 'Liam (COO)', agentAvatar: 'L', agentColor: 'bg-emerald-600',
    type: 'block', message: 'Investor deck finalization blocked — 15% revenue projection discrepancy with Tech', missionTitle: 'Investor Update Deck',
  },
  {
    id: 'a13', secsAgo: 650, agentId: 'mkt2', agentName: 'Market Intel', agentAvatar: 'MI', agentColor: 'bg-fuchsia-600',
    type: 'complete', message: 'Weekly competitive pulse report — Emotiv launched new SDK, OpenBCI price drop', missionTitle: 'Q2 Campaign Planning',
  },
  {
    id: 'a14', secsAgo: 720, agentId: 'tamir', agentName: 'Tamir', agentAvatar: 'T', agentColor: 'bg-amber-600',
    type: 'directive', message: 'Routed CEO Q2 priority memo to CTO and CMO — immediate alignment required',
  },
  {
    id: 'a15', secsAgo: 810, agentId: 'dev2', agentName: 'Infra Agent', agentAvatar: 'I', agentColor: 'bg-teal-600',
    type: 'complete', message: 'capacity_analysis.pdf complete — us-east-1 fully saturated, us-west-2 viable', missionTitle: 'AWS Capacity Blocker',
  },
  {
    id: 'a16', secsAgo: 900, agentId: 'cto', agentName: 'Alex (CTO)', agentAvatar: 'A', agentColor: 'bg-blue-600',
    type: 'think', message: 'Cross-referencing Tech and Ops revenue projections — methodology gap identified',
  },
  {
    id: 'a17', secsAgo: 1020, agentId: 'cmo', agentName: 'Maya (CMO)', agentAvatar: 'M', agentColor: 'bg-purple-600',
    type: 'complete', message: 'Executive voice briefing summary generated — 3 min audio ready for CEO', missionTitle: 'Content Strategy Plans',
  },
  {
    id: 'a18', secsAgo: 1140, agentId: 'tamir', agentName: 'Tamir', agentAvatar: 'T', agentColor: 'bg-amber-600',
    type: 'complete', message: 'Morning CEO briefing delivered — 5 action items, 2 decisions required',
  },
];

// ── Generator for new live entries ────────────────────────────────────────────

const GENERATION_TEMPLATES: Omit<LiveActivity, 'id' | 'secsAgo' | 'isNew'>[] = [
  {
    agentId: 'dev1', agentName: 'Dev Agent', agentAvatar: 'D', agentColor: 'bg-cyan-600',
    type: 'think', message: 'Analyzing ZUNA Docker container memory footprint before staging deploy', missionTitle: 'ZUNA Deployment',
  },
  {
    agentId: 'dev2', agentName: 'Infra Agent', agentAvatar: 'I', agentColor: 'bg-teal-600',
    type: 'complete', message: 'VPC peering config for us-west-2 validated — latency 18ms within spec', missionTitle: 'AWS Capacity Blocker',
  },
  {
    agentId: 'temp2', agentName: 'Data Scientist', agentAvatar: 'DS', agentColor: 'bg-rose-600',
    type: 'complete', message: 'SMOTE balancing complete — class distribution improved from 60/40 to 51/49', missionTitle: 'EEG Model Optimization',
  },
  {
    agentId: 'temp2', agentName: 'Data Scientist', agentAvatar: 'DS', agentColor: 'bg-rose-600',
    type: 'handoff', message: 'Passing benchmark_results.xlsx to CTO — includes updated confusion matrix',
    missionTitle: 'EEG Model Optimization', toAgentName: 'Alex (CTO)', toAgentColor: 'bg-blue-600',
  },
  {
    agentId: 'mkt1', agentName: 'Content Agent', agentAvatar: 'C', agentColor: 'bg-pink-600',
    type: 'start', message: 'Drafting brand guidelines alignment checklist for Q2 content pieces', missionTitle: 'Brand Guidelines Update',
  },
  {
    agentId: 'ops1', agentName: 'Ops Agent', agentAvatar: 'O', agentColor: 'bg-lime-600',
    type: 'complete', message: 'Cost reconciliation model drafted — pending COO review for sign-off', missionTitle: 'Investor Update Deck',
  },
  {
    agentId: 'res1', agentName: 'Research Agent', agentAvatar: 'R', agentColor: 'bg-indigo-600',
    type: 'receive', message: 'New research directive from CTO — scope EEG latency benchmarking standards',
    missionTitle: 'EEG Model Optimization',
  },
  {
    agentId: 'tamir', agentName: 'Tamir', agentAvatar: 'T', agentColor: 'bg-amber-600',
    type: 'think', message: 'Synthesizing budget overrun + GPU approval into consolidated risk summary for CEO',
    missionTitle: 'AWS Capacity Blocker',
  },
  {
    agentId: 'cto', agentName: 'Alex (CTO)', agentAvatar: 'A', agentColor: 'bg-blue-600',
    type: 'start', message: 'Reviewing EEG benchmark results from Data Scientist — checking latency vs target', missionTitle: 'EEG Model Optimization',
  },
  {
    agentId: 'mkt2', agentName: 'Market Intel', agentAvatar: 'MI', agentColor: 'bg-fuchsia-600',
    type: 'think', message: 'Scanning Emotiv SDK launch — assessing impact on ZUNA competitive positioning',
  },
  {
    agentId: 'temp1', agentName: 'EEG Researcher', agentAvatar: 'ER', agentColor: 'bg-orange-600',
    type: 'start', message: 'Starting batch 5/5 — 14-channel dry electrode protocol with impedance analysis', missionTitle: 'EEG Model Optimization',
  },
  {
    agentId: 'dev1', agentName: 'Dev Agent', agentAvatar: 'D', agentColor: 'bg-cyan-600',
    type: 'start', message: 'Staging deployment dry-run initiated — smoke tests running', missionTitle: 'ZUNA Deployment',
  },
];

let genCounter = 1000;

export function generateActivity(): LiveActivity {
  const template = GENERATION_TEMPLATES[genCounter % GENERATION_TEMPLATES.length];
  genCounter++;
  return {
    ...template,
    id: `gen-${genCounter}`,
    secsAgo: 0,
    isNew: true,
  };
}
