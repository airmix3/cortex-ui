import { Deliverable } from '@/types';

// ─── TYPES ───

export type PushUrgency = 'critical' | 'warn' | 'info' | 'update';
export type ChatMode = 'chat' | 'act' | 'brief' | 'investigate';

export type MessageContentType =
  | 'text'
  | 'brief'
  | 'mission-card'
  | 'deliverable'
  | 'department-summary'
  | 'escalation-alert'
  | 'action-confirmation'
  | 'push'
  | 'dispatch-flow'
  | 'agent-deliverable'
  | 'handoff-cta'
  | 'mission-report'
  | 'planning-questions'
  | 'mission-brief-summary';

export type LearningType = 'workflow-memory' | 'new-skill' | 'mcp-tool';
export type LearningStatus = 'proposed' | 'committed' | 'dismissed';

export interface SystemLearning {
  id: string;
  type: LearningType;
  title: string;
  description: string;
  proposedBy: string;
}

export interface MissionEvaluation {
  evaluatorName: string;
  evaluatorAvatar: string;
  evaluatorColor: string;
  evaluatorRole: string;
  grade: number; // 1–10
  summary: string;
  dimensions: { label: string; score: number }[];
}

export interface MissionReportData {
  goal: string;
  evaluations: MissionEvaluation[];
  learnings: SystemLearning[];
}

// ── Planning canvas types ────────────────────────────────────────────────────

export interface PlanningQuestion {
  id: string;
  label: string;
  placeholder?: string;
  hint?: string;
  options?: string[];
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface PlanStep {
  id: string;
  agentName: string;
  agentAvatar: string;
  agentColor: string;
  department: string;
  action: string;
  detail: string;
  confidence: ConfidenceLevel;
  duration: string;
  requiresCEOApproval: boolean;
}

export interface PlanSkill {
  id: string;
  name: string;
  description: string;
  agentName: string;
  enabled: boolean;
}

export interface PlanTool {
  id: string;
  name: string;
  description: string;
  type: 'mcp' | 'api' | 'internal';
  enabled: boolean;
  connected: boolean;
}

export interface MissionPlan {
  goal: string;
  brief: string;
  successCriteria: string[];
  estimatedDuration: string;
  steps: PlanStep[];
  skills: PlanSkill[];
  tools: PlanTool[];
}

export type StepStatus = 'pending' | 'in-progress' | 'awaiting-approval' | 'done' | 'rejected';

export interface DispatchStep {
  id: string;
  agentName: string;
  agentAvatar: string;
  agentColor: string;
  department: string;
  action: string;
  detail?: string;
  status: StepStatus;
  requiresCEOApproval: boolean;
  approvalPrompt?: string;
  deliverable?: string;
  budget?: BudgetLine[];
  tools?: ToolLine[];
  deliverablePreview?: { content: string; stats?: string[] };
}

export interface BudgetLine { item: string; cost: string; note?: string; subscribed?: boolean; }
export interface ToolLine  { name: string; purpose: string; }

export interface DispatchPlan {
  goal: string;
  steps: DispatchStep[];
}

export interface BriefBullet {
  icon: 'alert' | 'pending' | 'ok';
  text: string;
  detail: string;
}

export interface FullChatMessage {
  id: number;
  sender: 'tamir' | 'ceo';
  time: string;
  contentType: MessageContentType;
  content: string;
  urgency?: PushUrgency;
  bullets?: BriefBullet[];
  missionId?: string;
  deliverables?: Deliverable[];
  departmentId?: string;
  escalationId?: string;
  actionResult?: { label: string; detail: string; success: boolean };
  dispatchPlan?: DispatchPlan;
  // agent-deliverable fields
  agentName?: string;
  agentAvatar?: string;
  agentColor?: string;
  agentDepartment?: string;
  deliverableFile?: string;
  deliverableContent?: string;
  deliverableStats?: string[];
  // handoff-cta fields
  handoffAgent?: { name: string; avatar: string; color: string; department: string; role: string };
  handoffStats?: string[];
  // mission-report fields
  missionReport?: MissionReportData;
  planningQuestions?: PlanningQuestion[];
  missionPlan?: MissionPlan;
}

export interface ChatThread {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: FullChatMessage[];
  contextEntity?: { type: 'mission' | 'department' | 'escalation'; id: string };
}

// ─── URGENCY STYLES ───

export const urgencyStyle: Record<PushUrgency, { bg: string; border: string; glow: string; dot: string; label: string; labelColor: string }> = {
  critical: { bg: 'rgba(244,63,94,0.07)', border: 'rgba(244,63,94,0.25)', glow: 'rgba(244,63,94,0.6)', dot: '#f43f5e', label: 'Urgent', labelColor: '#fda4af' },
  warn:     { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.22)', glow: 'rgba(245,158,11,0.5)', dot: '#f59e0b', label: 'Time-sensitive', labelColor: '#fcd34d' },
  info:     { bg: 'rgba(56,189,248,0.06)', border: 'rgba(56,189,248,0.20)', glow: 'rgba(56,189,248,0.4)', dot: '#38bdf8', label: 'Action needed', labelColor: '#7dd3fc' },
  update:   { bg: 'rgba(52,211,153,0.05)', border: 'rgba(52,211,153,0.18)', glow: 'rgba(52,211,153,0.4)', dot: '#34d399', label: 'Update', labelColor: '#6ee7b7' },
};

// ─── MAIN CONVERSATION ───

export const mainThread: ChatThread = {
  id: 'thread-today-1',
  title: 'Morning Briefing & GPU Approval',
  preview: 'Done — g4dn.xlarge approved in us-west-2',
  timestamp: new Date(),
  contextEntity: { type: 'mission', id: 'm1' },
  messages: [
    {
      id: 1, sender: 'tamir', time: '07:15', contentType: 'brief',
      content: "Good morning. Here's your situation:",
      bullets: [
        { icon: 'alert', text: 'AWS GPU blocked 3h — $2,400 idle cost', detail: 'g4dn.xlarge needed in us-west-2, +$0.12/hr' },
        { icon: 'pending', text: 'Research Analyst hire — candidate brief ready', detail: 'Expires tonight, CTO ranked Priya K. #1' },
        { icon: 'ok', text: 'Marketing Q2 plans submitted for review', detail: 'Maya sent content_plans.pdf + editorial calendar' },
      ],
    },
    {
      id: 2, sender: 'ceo', time: '10:25', contentType: 'text',
      content: "What's most urgent?",
    },
    {
      id: 3, sender: 'tamir', time: '10:25', contentType: 'mission-card',
      content: "This one. Dev team has been blocked for 3 hours and every hour costs ~$800 in idle agent time. Alex confirmed us-west-2 has capacity.",
      missionId: 'm1',
    },
    {
      id: 4, sender: 'ceo', time: '10:27', contentType: 'text',
      content: 'Approve the GPU.',
    },
    {
      id: 5, sender: 'tamir', time: '10:27', contentType: 'action-confirmation',
      content: '',
      actionResult: {
        label: 'GPU Approved',
        detail: 'g4dn.xlarge provisioned in us-west-2 at +$0.12/hr. ZUNA deployment resuming. Dev and Infra agents back online.',
        success: true,
      },
    },
    {
      id: 6, sender: 'ceo', time: '10:29', contentType: 'text',
      content: 'Show me the Research hire candidate.',
    },
    {
      id: 7, sender: 'tamir', time: '10:29', contentType: 'deliverable',
      content: "Here's Priya K.'s package. CTO's top pick — EEG domain expert with 6 years of Python. Compensation is within the Research band. Recruiter needs a decision by 6pm or the slot opens back up.",
      deliverables: [
        { name: 'candidate_brief.docx', type: 'document', status: 'ready' },
        { name: 'compensation_model.xlsx', type: 'spreadsheet', status: 'ready' },
        { name: 'eeg_study_scope.pdf', type: 'pdf', status: 'draft' },
      ],
    },
    {
      id: 8, sender: 'ceo', time: '10:31', contentType: 'text',
      content: "How's Tech doing?",
    },
    {
      id: 9, sender: 'tamir', time: '10:31', contentType: 'department-summary',
      content: "GPU approval just cleared their biggest blocker. Here's the snapshot:",
      departmentId: 'Tech Dept',
    },
    {
      id: 10, sender: 'tamir', time: '10:35', contentType: 'push',
      content: "Liam just pinged me. He needs your investor deck feedback before his 11am call — that's in 20 minutes. Should I push his deadline to EOD?",
      urgency: 'warn',
    },
  ],
};

// ─── OLDER THREADS ───

export const olderThreads: ChatThread[] = [
  {
    id: 'thread-yesterday-1',
    title: 'ZUNA Deployment Strategy',
    preview: 'Staging environment ready. Integration tests queued.',
    timestamp: new Date(Date.now() - 86400000),
    messages: [
      { id: 100, sender: 'ceo', time: '14:30', contentType: 'text', content: "What's the ZUNA deployment timeline?" },
      { id: 101, sender: 'tamir', time: '14:30', contentType: 'text', content: '47 unit tests passed. Staging is ready but blocked on GPU capacity — same issue we resolved this morning. Once GPU is live, integration tests run automatically. ETA to full staging: 48 hours.' },
    ],
  },
  {
    id: 'thread-week-1',
    title: 'Q2 Budget Review',
    preview: 'Tech at $1.5K of $4K. Marketing on track.',
    timestamp: new Date(Date.now() - 3 * 86400000),
    messages: [
      { id: 200, sender: 'ceo', time: '09:00', contentType: 'text', content: 'Run me through department budgets.' },
      { id: 201, sender: 'tamir', time: '09:00', contentType: 'text', content: 'Tech is at $1.5K of $4K — flagged medium risk due to GPU + temp hire overlap. Marketing at $2.2K of $5K, well on track. Operations at $0.8K of $3K, lean and ahead of plan.' },
    ],
  },
  {
    id: 'thread-week-2',
    title: 'Marketing Content Approval',
    preview: 'Content strategy approved. Brand guidelines in progress.',
    timestamp: new Date(Date.now() - 5 * 86400000),
    messages: [
      { id: 300, sender: 'ceo', time: '11:00', contentType: 'text', content: 'Status on the content strategy?' },
      { id: 301, sender: 'tamir', time: '11:00', contentType: 'text', content: 'Maya submitted the 3-pillar framework and Q2 editorial calendar. 48 posts mapped across 12 weeks. Brand guidelines v3 still in progress — Maya wants those finalized before publishing.' },
    ],
  },
];

// ─── DISPATCH PLAN FACTORIES ───

function createLeadGenCampaignPlan(goal: string): DispatchPlan {
  return {
    goal,
    steps: [
      {
        id: 'step-tamir-scope',
        agentName: 'Tamir',
        agentAvatar: 'T',
        agentColor: 'bg-amber-500',
        department: 'Chief of Staff',
        action: 'Scoped campaign goal and designed execution plan',
        detail: 'Analyzed your request. Identified 3 channels: LinkedIn DMs, cold email, and content. ICP: CTOs and Heads of AI at 50–500 person companies. Timeline: 2 weeks. Goal: 40–80 qualified leads.',
        status: 'done',
        requiresCEOApproval: false,
        deliverable: 'campaign_scope.md',
        deliverablePreview: {
          content: 'Analyzed your request and scoped a 2-week outbound campaign. Identified 3 channels: LinkedIn DMs, cold email sequence, and content push. ICP: CTOs and Heads of AI at 50–500 person companies. Target: 40–80 qualified leads.',
          stats: ['3 channels', 'ICP: 50–500 person cos', 'Target: 40–80 leads', '2-week runway'],
        },
      },
      {
        id: 'gate-approve-plan',
        agentName: 'You',
        agentAvatar: 'Y',
        agentColor: 'bg-slate-600',
        department: 'CEO',
        action: 'Review and approve plan',
        approvalPrompt: 'Does this approach look right before I dispatch to Marketing?',
        detail: 'LinkedIn DMs · Cold email sequence · Content push · Target: tech founders at 50–500 person companies · 2 weeks · Goal: 40–80 leads',
        status: 'awaiting-approval',
        requiresCEOApproval: true,
        budget: [
          { item: 'Instantly.ai', cost: '$97', note: 'email sequencing', subscribed: false },
          { item: 'Apollo.io', cost: '$49', note: 'lead enrichment', subscribed: false },
          { item: 'LinkedIn Sales Nav', cost: '$99', note: 'prospecting', subscribed: true },
        ],
        tools: [
          { name: 'Apollo.io', purpose: 'Lead scoring & enrichment' },
          { name: 'Instantly.ai', purpose: 'Email sequencing & tracking' },
          { name: 'LinkedIn Sales Nav', purpose: 'Prospecting & DM outreach' },
          { name: 'Notion', purpose: 'Campaign brief & deliverables' },
        ],
      },
      {
        id: 'step-maya-copy',
        agentName: 'Maya',
        agentAvatar: 'MY',
        agentColor: 'bg-violet-500',
        department: 'Marketing',
        action: 'Draft campaign messaging and copy',
        detail: 'Value props, LinkedIn outreach templates, 5-touch email sequence, and CTA structure tailored to AI agency positioning.',
        status: 'pending',
        requiresCEOApproval: false,
        deliverable: 'campaign_copy.pdf',
        deliverablePreview: {
          content: '5-touch email sequence drafted with AI agency positioning. 3 LinkedIn DM templates written for cold outreach. Each message leads with a specific pain point — build time, reliability, or vendor lock-in — before introducing your agency.',
          stats: ['5-email sequence', '3 LinkedIn templates', 'A/B subject lines', '3 pain-point angles'],
        },
      },
      {
        id: 'step-jordan-list',
        agentName: 'Jordan',
        agentAvatar: 'JO',
        agentColor: 'bg-emerald-500',
        department: 'Marketing',
        action: 'Build lead list and ICP scoring model',
        detail: '250 contacts sourced from LinkedIn Sales Nav, scored by ICP fit. Filtered to top 89 high-fit accounts.',
        status: 'pending',
        requiresCEOApproval: false,
        deliverable: 'lead_list.csv',
        deliverablePreview: {
          content: '247 contacts sourced from LinkedIn Sales Nav and enriched with firmographic data. Scored against ICP criteria: company size, tech stack, AI initiative signals. Top 89 contacts scored ≥80 and are flagged for priority outreach.',
          stats: ['247 contacts total', '89 high-fit (score ≥80)', 'Series A–B SaaS', 'Enriched + scored'],
        },
      },
      {
        id: 'gate-approve-launch',
        agentName: 'You',
        agentAvatar: 'Y',
        agentColor: 'bg-slate-600',
        department: 'CEO',
        action: 'Approve campaign before launch',
        approvalPrompt: 'Campaign assets ready. Your sign-off needed before outreach begins.',
        detail: 'Maya: 5-touch email + 3 LinkedIn templates · Jordan: 247 contacts scored, 89 high-fit · Launch window: tomorrow 9am',
        status: 'pending',
        requiresCEOApproval: true,
      },
      {
        id: 'step-maya-execute',
        agentName: 'Maya',
        agentAvatar: 'MY',
        agentColor: 'bg-violet-500',
        department: 'Marketing',
        action: 'Execute LinkedIn + email outreach sequence',
        detail: '5-touch drip over 14 days. A/B testing subject lines. Daily reply monitoring and hand-off of warm leads.',
        status: 'pending',
        requiresCEOApproval: false,
      },
      {
        id: 'step-tamir-monitor',
        agentName: 'Tamir',
        agentAvatar: 'T',
        agentColor: 'bg-amber-500',
        department: 'Chief of Staff',
        action: 'Monitor results and report back daily',
        detail: 'Daily digest: open rates, replies, booked calls, and pipeline value. I\'ll flag anything needing your attention.',
        status: 'pending',
        requiresCEOApproval: false,
      },
    ],
  };
}

// ─── RESPONSE SIMULATOR ───

export function simulateResponse(input: string, mode: ChatMode): FullChatMessage {
  const lower = input.toLowerCase();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ── Dispatch flow: mission-intent detection ──
  const isMissionIntent =
    !lower.includes('what') &&
    !lower.includes('how') &&
    !lower.includes('show') &&
    !lower.includes('tell') &&
    !lower.includes('status') &&
    (lower.includes('campaign') ||
      lower.includes('lead gen') ||
      lower.includes('leads for') ||
      lower.includes('launch') ||
      lower.includes('outreach') ||
      (lower.includes('want to') && (lower.includes('campaign') || lower.includes('lead') || lower.includes('market'))));

  if (isMissionIntent) {
    const goal = input.length < 80 ? input : 'Lead Gen Campaign — AI Agency';
    return {
      id: Date.now(),
      sender: 'tamir',
      time,
      contentType: 'dispatch-flow',
      content: "Got it. I've scoped this out and designed an execution plan. Here's how it flows — review the plan and approve each gate before I dispatch to the team.",
      dispatchPlan: createLeadGenCampaignPlan(goal),
    };
  }

  if (mode === 'act') {
    if (lower.includes('approve') && lower.includes('hire')) {
      return { id: Date.now(), sender: 'tamir', time, contentType: 'action-confirmation', content: '', actionResult: { label: 'Hire Approved', detail: 'Priya K. offer letter queued. Recruiter notified. Onboarding packet will generate automatically.', success: true } };
    }
    if (lower.includes('approve') || lower.includes('unblock')) {
      return { id: Date.now(), sender: 'tamir', time, contentType: 'action-confirmation', content: '', actionResult: { label: 'Action Completed', detail: 'Done. I\'ve notified the relevant team and updated the mission status.', success: true } };
    }
    return { id: Date.now(), sender: 'tamir', time, contentType: 'action-confirmation', content: '', actionResult: { label: 'Processing', detail: 'I\'ve queued this action. The relevant department head will execute and confirm within the hour.', success: true } };
  }

  if (mode === 'brief') {
    return {
      id: Date.now(), sender: 'tamir', time, contentType: 'brief',
      content: "Here's your current situation:",
      bullets: [
        { icon: 'ok', text: 'GPU approved — ZUNA deployment resuming', detail: 'Dev + Infra agents back online' },
        { icon: 'pending', text: 'Research hire decision needed by 6pm', detail: 'Priya K. — CTO\'s top pick' },
        { icon: 'alert', text: 'Investor deck data discrepancy unresolved', detail: '15% gap between Tech and Ops projections' },
      ],
    };
  }

  if (lower.includes('aws') || lower.includes('gpu') || lower.includes('capacity')) {
    return { id: Date.now(), sender: 'tamir', time, contentType: 'mission-card', content: "Here's the current state of the GPU situation:", missionId: 'm1' };
  }
  if (lower.includes('zuna') || lower.includes('deploy')) {
    return { id: Date.now(), sender: 'tamir', time, contentType: 'mission-card', content: "ZUNA deployment status:", missionId: 'm4' };
  }
  if (lower.includes('research') || lower.includes('hire') || lower.includes('analyst')) {
    return { id: Date.now(), sender: 'tamir', time, contentType: 'mission-card', content: "Research Analyst hire details:", missionId: 'm2' };
  }
  if (lower.includes('tech') && (lower.includes('dept') || lower.includes('department') || lower.includes('doing') || lower.includes('how'))) {
    return { id: Date.now(), sender: 'tamir', time, contentType: 'department-summary', content: "Here's where Tech stands right now:", departmentId: 'Tech Dept' };
  }
  if (lower.includes('marketing')) {
    return { id: Date.now(), sender: 'tamir', time, contentType: 'department-summary', content: "Marketing department overview:", departmentId: 'Marketing Dept' };
  }
  if (lower.includes('escalat')) {
    return { id: Date.now(), sender: 'tamir', time, contentType: 'escalation-alert', content: "Here's the active L4 escalation:", escalationId: 'e1' };
  }
  if (lower.includes('investor') || lower.includes('deck')) {
    return { id: Date.now(), sender: 'tamir', time, contentType: 'escalation-alert', content: "The investor deck situation:", escalationId: 'e4' };
  }
  if (lower.includes('urgent') || lower.includes('priority') || lower.includes('important')) {
    return { id: Date.now(), sender: 'tamir', time, contentType: 'text', content: "Two things need you right now: (1) Research Analyst hire expires tonight — recommend approving Priya K. before 6pm. (2) Investor deck has a 15% revenue projection gap between Tech and Ops — Liam needs the unified methodology approved to finalize the deck. Everything else is on track." };
  }

  return { id: Date.now(), sender: 'tamir', time, contentType: 'text', content: "I'll look into that. Based on what I'm tracking: 9 missions active, 2 require your direct action, 1 escalation resolved (GPU). The biggest open item is the Research hire decision — Priya K.'s slot expires at midnight. Want me to pull up the details?" };
}

// ─── CONNECTED AGENT RESPONSE SIMULATOR ───

export interface ConnectedAgent {
  name: string;
  avatar: string;
  color: string;
  department: string;
  role: string;
}

export function simulateAgentResponse(input: string, agent: ConnectedAgent): FullChatMessage {
  const lower = input.toLowerCase();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let content = '';

  if (agent.name === 'Maya') {
    if (lower.includes('open rate') || lower.includes('subject') || lower.includes('email')) {
      content = "Targeting 35%+ on first touch. We're A/B testing two subject lines — one urgency-led (\"3 companies like yours closed 40 leads in 2 weeks\") and one proof-led (\"we built X in 6 days\"). I'll have enough data by day 3 to cut the loser and double down.";
    } else if (lower.includes('lead') || lower.includes('contact') || lower.includes('how many') || lower.includes('pipeline')) {
      content = "89 high-fit contacts in the priority tier — Series A–B SaaS companies actively building internal AI tools, scored ≥80 by Jordan's model. Below that we have 158 in the secondary tier we can activate in week 2 if the first batch converts well.";
    } else if (lower.includes('when') || lower.includes('launch') || lower.includes('start') || lower.includes('9am') || lower.includes('tomorrow')) {
      content = "First email goes out at 9am tomorrow. LinkedIn DMs follow at 10am — staggered so inboxes don't spike simultaneously. I'll monitor open rates through the morning and flag anything that looks off before the second touch.";
    } else if (lower.includes('copy') || lower.includes('message') || lower.includes('template') || lower.includes('tone')) {
      content = "Each touch targets a different pain point — build time on touch 1, reliability on touch 3, vendor lock-in on touch 5. LinkedIn DMs are shorter and more direct, no fluff. Everything's locked in campaign_copy.pdf if you want to read any of it before launch.";
    } else if (lower.includes('change') || lower.includes('adjust') || lower.includes('update') || lower.includes('edit')) {
      content = "Still have time before the 9am send. Tell me what you want changed — copy, targeting, timing — and I'll update it tonight. What specifically?";
    } else if (lower.includes('result') || lower.includes('expect') || lower.includes('goal') || lower.includes('target')) {
      content = "Aiming for 40–80 qualified conversations over 2 weeks. \"Qualified\" means they replied and agreed to a call — not just an open. Jordan's scoring model should filter out most of the noise. If we hit 30 conversations I'd call it a solid campaign.";
    } else {
      content = "We're set. List is scored and sequenced, copy is locked, launch is tomorrow 9am. Is there something specific you want to review before it goes out?";
    }
  } else {
    content = "I'll look into that and get back to you shortly.";
  }

  return {
    id: Date.now() + Math.random(),
    sender: 'tamir',
    time,
    contentType: 'text',
    content,
    agentName: agent.name,
    agentAvatar: agent.avatar,
    agentColor: agent.color,
    agentDepartment: agent.department,
  };
}

// ── Planning questions for campaign intent ───────────────────────────────────

export const CAMPAIGN_PLANNING_QUESTIONS: PlanningQuestion[] = [
  {
    id: 'q_icp',
    label: 'Who are we targeting?',
    placeholder: 'e.g. CTOs at Series A–B SaaS companies building AI tools',
    hint: 'The more specific, the better Jordan can score the list.',
  },
  {
    id: 'q_timeline',
    label: "What's the timeline?",
    hint: 'Affects how aggressively we sequence outreach.',
    options: ['This week', '2 weeks', '1 month', 'No rush'],
  },
  {
    id: 'q_constraint',
    label: 'Any messaging constraints?',
    placeholder: 'e.g. No urgency tactics, keep it founder-to-founder tone',
    hint: 'Channels to avoid, tone requirements, off-limits topics.',
  },
  {
    id: 'q_success',
    label: 'What does success look like?',
    placeholder: 'e.g. 20 booked discovery calls in 2 weeks',
    hint: "This becomes the campaign's north star metric.",
  },
];

export function createPlanningQuestionsMsg(goal: string): FullChatMessage {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    id: Date.now() + Math.random(),
    sender: 'tamir',
    time,
    contentType: 'planning-questions',
    content: "Before I build the plan, I need a few things from you. The more specific you are, the tighter the execution.",
    planningQuestions: CAMPAIGN_PLANNING_QUESTIONS,
  };
}

export function generateMissionPlan(goal: string, answers: Record<string, string>): MissionPlan {
  const icp = answers.q_icp || 'AI-first SaaS companies, Series A–B';
  const timeline = answers.q_timeline || '2 weeks';
  const constraint = answers.q_constraint || 'Founder-to-founder tone';
  const success = answers.q_success || '20 booked discovery calls';

  return {
    goal,
    brief: `Outbound lead gen campaign targeting ${icp}. Tone: ${constraint}. Timeline: ${timeline}.`,
    successCriteria: [
      success,
      '35%+ open rate on first email touch',
      'LinkedIn DM acceptance rate >20%',
    ],
    estimatedDuration: timeline === 'This week' ? '5–7 days' : timeline === '1 month' ? '3–4 weeks' : '10–14 days',
    steps: [
      {
        id: 'ps-0',
        agentName: 'Tamir', agentAvatar: 'TA', agentColor: 'bg-amber-500',
        department: 'Chief of Staff',
        action: 'Scope campaign & finalize ICP criteria',
        detail: `Build targeting criteria based on: ${icp}`,
        confidence: 'high', duration: '~15 min', requiresCEOApproval: false,
      },
      {
        id: 'ps-1',
        agentName: 'Jordan', agentAvatar: 'JO', agentColor: 'bg-emerald-500',
        department: 'Marketing',
        action: 'Build & score lead list from Sales Nav',
        detail: 'Source contacts, enrich with firmographic data, score against ICP model',
        confidence: 'medium', duration: '~45 min', requiresCEOApproval: false,
      },
      {
        id: 'ps-2',
        agentName: 'Maya', agentAvatar: 'MY', agentColor: 'bg-violet-500',
        department: 'Marketing',
        action: 'Draft campaign messaging & copy',
        detail: `Write 5-email sequence + LinkedIn DM templates. Tone: ${constraint}`,
        confidence: 'high', duration: '~30 min', requiresCEOApproval: false,
      },
      {
        id: 'ps-gate',
        agentName: 'You', agentAvatar: 'CE', agentColor: 'bg-amber-500',
        department: 'CEO',
        action: 'Review copy & lead list before launch',
        detail: 'Approve messaging and targeting before any outreach begins',
        confidence: 'high', duration: '~5 min', requiresCEOApproval: true,
      },
      {
        id: 'ps-3',
        agentName: 'Maya', agentAvatar: 'MY', agentColor: 'bg-violet-500',
        department: 'Marketing',
        action: 'Launch outreach sequence',
        detail: 'Queue email sequence in Instantly, schedule LinkedIn DMs via Lemlist',
        confidence: 'medium', duration: '~20 min', requiresCEOApproval: false,
      },
      {
        id: 'ps-4',
        agentName: 'Tamir', agentAvatar: 'TA', agentColor: 'bg-amber-500',
        department: 'Chief of Staff',
        action: 'Monitor campaign & surface replies',
        detail: `Track toward: ${success}. Alert on hot replies and meeting requests.`,
        confidence: 'high', duration: 'Ongoing', requiresCEOApproval: false,
      },
    ],
    skills: [
      { id: 'sk-0', name: 'ICP Scoring',      description: 'Rank contacts against your ideal customer profile', agentName: 'Jordan', enabled: true  },
      { id: 'sk-1', name: 'Copywriting',       description: 'Multi-touch email sequences & LinkedIn DMs',       agentName: 'Maya',   enabled: true  },
      { id: 'sk-2', name: 'Sequence Design',   description: 'Timing, channel mix, and follow-up cadence',       agentName: 'Maya',   enabled: true  },
      { id: 'sk-3', name: 'A/B Testing',       description: 'Subject line and copy angle variants',              agentName: 'Maya',   enabled: false },
    ],
    tools: [
      { id: 'tl-0', name: 'Sales Navigator', description: 'Contact sourcing & export',          type: 'api',      enabled: true,  connected: true  },
      { id: 'tl-1', name: 'Apollo.io',        description: 'Email enrichment & verification',   type: 'api',      enabled: true,  connected: true  },
      { id: 'tl-2', name: 'Instantly',        description: 'Email sequencing & deliverability', type: 'mcp',      enabled: true,  connected: true  },
      { id: 'tl-3', name: 'Lemlist',          description: 'LinkedIn DM automation',            type: 'mcp',      enabled: true,  connected: true  },
      { id: 'tl-4', name: 'Clay',             description: 'Data enrichment orchestration',     type: 'mcp',      enabled: false, connected: false },
      { id: 'tl-5', name: 'Gmail',            description: 'Direct send (fallback)',            type: 'internal', enabled: false, connected: true  },
    ],
  };
}

export function missionPlanToDispatchPlan(plan: MissionPlan): DispatchPlan {
  const steps: DispatchStep[] = plan.steps
    .filter((ps) => ps.id !== 'ps-gate' || ps.requiresCEOApproval) // keep all including gates
    .map((ps, i) => ({
      id: ps.id,
      agentName: ps.agentName,
      agentAvatar: ps.agentAvatar,
      agentColor: ps.agentColor,
      department: ps.department,
      action: ps.action,
      detail: ps.detail,
      requiresCEOApproval: ps.requiresCEOApproval,
      approvalPrompt: ps.requiresCEOApproval ? ps.action : undefined,
      status: i === 0 ? 'in-progress' : 'pending',
    } as DispatchStep));

  return { goal: plan.goal, steps };
}

export function detectsPlanningIntent(input: string): boolean {
  const lower = input.toLowerCase();
  const hasQuestion = /^(what|how|who|when|where|why|is|are|can|do|does|did|will|would|could|should)/.test(lower.trim());
  if (hasQuestion) return false;
  return (
    lower.includes('campaign') ||
    lower.includes('launch') ||
    lower.includes('leads for') ||
    lower.includes('lead gen') ||
    lower.includes('outreach') ||
    lower.includes('run a') ||
    lower.includes('start a') ||
    lower.includes('create a') ||
    lower.includes('build a')
  );
}
