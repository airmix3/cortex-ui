// ── CEO Desk: Calendar & Inbox data ──────────────────────────────────────────

// ── Calendar ─────────────────────────────────────────────────────────────────

export type EventType = 'meeting' | 'block' | 'call' | 'review' | 'personal';

export interface CalendarAttendee {
  name: string;
  avatar: string;
  color: string;
  role: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  startHour: number;   // 24h, e.g. 9.0 = 9:00am, 9.5 = 9:30am
  durationHours: number;
  location?: string;
  isVideo?: boolean;
  attendees: CalendarAttendee[];
  description: string;
  prepNeeded: boolean;
  tamirBriefing?: string;  // Tamir's pre-meeting summary
  linkedMissionId?: string;
  linkedMissionTitle?: string;
}

export const TODAY_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Morning Brief with Tamir',
    type: 'block',
    startHour: 8.0,
    durationHours: 0.5,
    attendees: [{ name: 'Tamir', avatar: 'T', color: 'bg-amber-600', role: 'CEO' }],
    description: 'Daily AI briefing — escalations, decisions, overnight activity.',
    prepNeeded: false,
    tamirBriefing: '5 items from overnight. 2 decisions needed today. AWS blocker still open — escalated to you at L4.',
  },
  {
    id: 'cal-2',
    title: 'Investor Sync — Series B Update',
    type: 'meeting',
    startHour: 10.0,
    durationHours: 1.0,
    isVideo: true,
    location: 'Zoom',
    attendees: [
      { name: 'Sarah Chen', avatar: 'SC', color: 'bg-blue-600',   role: 'Lead Investor' },
      { name: 'Liam (COO)', avatar: 'L',  color: 'bg-emerald-600', role: 'COO'          },
      { name: 'Maya (CMO)', avatar: 'M',  color: 'bg-purple-600',  role: 'CMO'          },
    ],
    description: 'Q2 performance review and Series B trajectory discussion.',
    prepNeeded: true,
    tamirBriefing: 'Revenue projection has a 15% discrepancy between Tech and Ops models. Liam flagged this as a blocker for the deck. Recommend resolving before this call. I\'ve prepared a reconciliation summary — want me to send it to you?',
    linkedMissionId: 'm5',
    linkedMissionTitle: 'Investor Update Deck',
  },
  {
    id: 'cal-3',
    title: 'ZUNA Deployment Go/No-Go',
    type: 'review',
    startHour: 11.5,
    durationHours: 0.5,
    attendees: [
      { name: 'Alex (CTO)', avatar: 'A', color: 'bg-blue-600', role: 'CTO' },
      { name: 'Dev Agent',  avatar: 'D', color: 'bg-cyan-600', role: 'Dev' },
    ],
    description: 'Final architecture sign-off before staging deployment.',
    prepNeeded: true,
    tamirBriefing: 'Dev Agent completed manifest v2.1 with all CTO comments applied. Infra Agent is still resolving the VPC peering config — this may delay the go/no-go. Alex flagged the g4dn.xlarge GPU cost as pending your approval.',
    linkedMissionId: 'm4',
    linkedMissionTitle: 'ZUNA Deployment',
  },
  {
    id: 'cal-4',
    title: 'Lunch — clear block',
    type: 'personal',
    startHour: 13.0,
    durationHours: 1.0,
    attendees: [],
    description: 'Protected time.',
    prepNeeded: false,
  },
  {
    id: 'cal-5',
    title: '1:1 with Alex (CTO)',
    type: 'meeting',
    startHour: 14.0,
    durationHours: 1.0,
    attendees: [
      { name: 'Alex (CTO)', avatar: 'A', color: 'bg-blue-600', role: 'CTO' },
    ],
    description: 'Weekly CTO sync — tech strategy, team health, blockers.',
    prepNeeded: true,
    tamirBriefing: 'Three open items for Alex: (1) GPU cost approval — he\'s been waiting since yesterday, (2) EEG model benchmark review — Data Scientist submitted results this morning, (3) ZUNA staging timeline. Alex\'s value score this week is 91/100.',
  },
  {
    id: 'cal-6',
    title: 'Q2 Campaign Planning Review',
    type: 'review',
    startHour: 15.5,
    durationHours: 1.0,
    attendees: [
      { name: 'Maya (CMO)', avatar: 'M',  color: 'bg-purple-600', role: 'CMO'           },
      { name: 'Content Agent', avatar: 'C', color: 'bg-pink-600', role: 'Content Agent' },
    ],
    description: 'Review Content Agent output — Q2 editorial calendar and SEO strategy.',
    prepNeeded: false,
    tamirBriefing: 'Content Agent finished the SEO keyword research — 15 high-intent terms. Maya received the content_plans.pdf this morning. Market Intel flagged that Emotiv just launched a competing SDK — recommend discussing how this affects Q2 messaging.',
    linkedMissionId: 'm3',
    linkedMissionTitle: 'Content Strategy Plans',
  },
  {
    id: 'cal-7',
    title: 'EEG Patent Risk Briefing',
    type: 'call',
    startHour: 17.0,
    durationHours: 0.5,
    attendees: [
      { name: 'Research Agent', avatar: 'R', color: 'bg-indigo-600', role: 'Research' },
      { name: 'Legal Agent',    avatar: 'LA', color: 'bg-slate-600', role: 'Legal'    },
    ],
    description: 'Review 3 IP conflicts flagged in the patent risk report.',
    prepNeeded: true,
    tamirBriefing: 'Research Agent found 3 IP conflicts in the EEG model — one involves a Neurosity patent from 2021. Legal Agent has cleared 2 of them. The third needs your decision on whether to license or design around.',
    linkedMissionId: 'm1',
    linkedMissionTitle: 'EEG Model Optimization',
  },
];

export const TOMORROW_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-t1',
    title: 'Board Update Prep',
    type: 'block',
    startHour: 9.0,
    durationHours: 2.0,
    attendees: [{ name: 'Tamir', avatar: 'T', color: 'bg-amber-600', role: 'CEO' }],
    description: 'Prepare board deck with Tamir.',
    prepNeeded: false,
  },
  {
    id: 'cal-t2',
    title: 'Engineering All-Hands',
    type: 'meeting',
    startHour: 11.0,
    durationHours: 1.0,
    attendees: [
      { name: 'Alex (CTO)',  avatar: 'A', color: 'bg-blue-600',   role: 'CTO'        },
      { name: 'Dev Agent',   avatar: 'D', color: 'bg-cyan-600',   role: 'Dev'        },
      { name: 'Infra Agent', avatar: 'I', color: 'bg-teal-600',   role: 'Infra'      },
    ],
    description: 'Engineering sprint review and roadmap alignment.',
    prepNeeded: true,
  },
];

// ── Inbox ─────────────────────────────────────────────────────────────────────

export type InboxSource = 'email' | 'slack' | 'agent';
export type InboxPriority = 'urgent' | 'high' | 'normal' | 'low';
export type InboxStatus = 'unread' | 'read' | 'flagged' | 'actioned';

export interface InboxItem {
  id: string;
  source: InboxSource;
  from: string;
  fromAvatar: string;
  fromColor: string;
  fromRole: string;
  receivedAt: string;       // display string, e.g. "8:14am"
  subject: string;
  preview: string;          // raw preview (first line of message)
  status: InboxStatus;
  priority: InboxPriority;
  tamirSummary: string;     // Tamir's digest of this item
  tamirAction: string;      // Tamir's suggested action
  linkedMissionId?: string;
  linkedMissionTitle?: string;
  linkedEscalationId?: string;
  fullBody?: string;        // expanded content
}

export const INBOX_ITEMS: InboxItem[] = [
  {
    id: 'msg-1',
    source: 'email',
    from: 'Sarah Chen',
    fromAvatar: 'SC',
    fromColor: 'bg-blue-600',
    fromRole: 'Lead Investor',
    receivedAt: '7:52am',
    subject: 'Series B — updated term sheet questions',
    preview: 'Hi, following up on our call next week. A few questions on the revenue model...',
    status: 'unread',
    priority: 'urgent',
    tamirSummary: 'Sarah is asking for clarification on three revenue model items before the 10am call: (1) ARR projection methodology, (2) churn assumptions for Q3–Q4, (3) the enterprise tier pricing change.',
    tamirAction: 'Recommend looping in Liam (COO) to prepare a 1-page response before 10am. I can draft it based on current Ops data.',
    linkedMissionId: 'm5',
    linkedMissionTitle: 'Investor Update Deck',
    fullBody: 'Hi,\n\nFollowing up ahead of our call this morning. A few questions on the revenue model that came up in our internal review:\n\n1. Your ARR projection uses a 22% MoM growth rate — can you walk us through the basis for that?\n2. What churn assumptions are you using for Q3–Q4? The enterprise segment in particular.\n3. The enterprise tier pricing changed between the last deck and this one — what drove that?\n\nWant to make sure we\'re aligned before the call.\n\nBest,\nSarah',
  },
  {
    id: 'msg-2',
    source: 'slack',
    from: 'Alex (CTO)',
    fromAvatar: 'A',
    fromColor: 'bg-blue-600',
    fromRole: 'CTO',
    receivedAt: '8:03am',
    subject: '#engineering-leads — GPU cost approval',
    preview: 'Still waiting on the g4dn.xlarge approval. 3 agents blocked for 18h now. Can we...',
    status: 'unread',
    priority: 'urgent',
    tamirSummary: 'Alex is following up on the GPU cost approval that has been pending since yesterday morning. 3 agents (Infra, Data Scientist, EEG Researcher) are blocked on L4 GPU capacity. Incremental cost is $0.12/hr — estimated delay cost is $5K/day.',
    tamirAction: 'This needs your decision. Approve or reject the g4dn.xlarge provisioning. I\'ve prepared the full cost-benefit analysis.',
    linkedEscalationId: 'e1',
    linkedMissionId: 'm1',
    linkedMissionTitle: 'AWS Capacity Blocker',
    fullBody: 'Still waiting on the g4dn.xlarge approval. 3 agents blocked for 18h now. Can we get a decision today? The EEG batch 5 run is gated on this, and we have a patent review call at 5pm.\n\nTamir has the full breakdown. It\'s $0.12/hr incremental. Happy to jump on a quick call if easier.',
  },
  {
    id: 'msg-3',
    source: 'email',
    from: 'David Park',
    fromAvatar: 'DP',
    fromColor: 'bg-violet-600',
    fromRole: 'Enterprise Prospect',
    receivedAt: '8:31am',
    subject: 'RE: ZUNA pilot — legal team questions',
    preview: 'Our legal team has a few questions about the data residency clause before we can sign...',
    status: 'unread',
    priority: 'high',
    tamirSummary: 'David\'s legal team is blocking the ZUNA pilot contract on two data residency clauses. This is a $280K ARR deal. Legal Agent has reviewed similar clauses — 1 is standard and can be accepted, 1 may need a custom rider.',
    tamirAction: 'Forward to Legal Agent for a draft response. Should take 2–3 hours. I\'d recommend a response SLA of today EOD.',
    linkedMissionId: 'm4',
    linkedMissionTitle: 'ZUNA Deployment',
    fullBody: 'Hi,\n\nOur legal team reviewed the MSA and flagged two items in the data residency section:\n\n1. Section 8.2 (Data Localization) — we need EU data to stay within EU boundaries at all times, including backups. The current clause allows for US replication.\n2. Section 11.4 (Audit Rights) — our legal team requires 30-day notice for audits, not the 10-day in the current draft.\n\nWe\'d like to move quickly on this — can you come back to us by EOD today?\n\nThanks,\nDavid',
  },
  {
    id: 'msg-4',
    source: 'agent',
    from: 'Tamir',
    fromAvatar: 'T',
    fromColor: 'bg-amber-600',
    fromRole: 'AI Chief of Staff',
    receivedAt: '6:00am',
    subject: 'Morning Brief — 3 decisions, 5 FYIs',
    preview: 'Good morning. Here\'s what happened overnight and what needs your attention today...',
    status: 'read',
    priority: 'normal',
    tamirSummary: 'Overnight: EEG batch 4/5 completed (results look strong — 51/49 class balance achieved). ZUNA manifest v2.1 approved by CTO. AWS blocker escalated to L4 at 2:14am. 3 decisions pending for you today.',
    tamirAction: 'Review and action the 3 pending decisions. I\'ve sorted them by urgency.',
    fullBody: 'Good morning.\n\nOvernight summary:\n• EEG batch 4 completed — SMOTE balancing improved class distribution from 60/40 to 51/49. Data Scientist is confident in batch 5.\n• ZUNA manifest v2.1 approved by Alex. Dev Agent applied all review comments. Staging deploy pending your GPU cost decision.\n• AWS capacity blocker escalated to L4 at 2:14am. I\'ve packaged the full cost analysis for your review.\n\n3 decisions for today:\n1. GPU cost approval (g4dn.xlarge) — blocking 3 agents\n2. ZUNA go/no-go — 11:30am review scheduled\n3. Investor deck revenue reconciliation — needed before 10am call\n\n5 FYIs in your inbox.',
  },
  {
    id: 'msg-5',
    source: 'slack',
    from: 'Maya (CMO)',
    fromAvatar: 'M',
    fromColor: 'bg-purple-600',
    fromRole: 'CMO',
    receivedAt: '9:15am',
    subject: '#marketing — Emotiv SDK launch response',
    preview: 'Emotiv just launched a new SDK. Market Intel is already on it but I think we need to...',
    status: 'unread',
    priority: 'high',
    tamirSummary: 'Maya is flagging the Emotiv SDK launch as a potential threat to ZUNA\'s competitive position. Market Intel is running an analysis. Maya wants CEO alignment on whether to accelerate the ZUNA launch timeline.',
    tamirAction: 'This is a strategic call — worth 10 minutes with Maya and Alex together. I can schedule a quick sync or prepare a competitive brief.',
    fullBody: 'Emotiv just launched a new SDK — full BCI developer toolkit, priced at $199/month. Market Intel is already scanning it.\n\nMy instinct: we need to decide if we accelerate the ZUNA launch or hold our timeline. The SDK market is moving faster than we planned.\n\nCan we get 15 mins today — you, me, and Alex? I want to make sure we\'re aligned before the Q2 campaign locks.',
  },
  {
    id: 'msg-6',
    source: 'email',
    from: 'Liam (COO)',
    fromAvatar: 'L',
    fromColor: 'bg-emerald-600',
    fromRole: 'COO',
    receivedAt: '9:44am',
    subject: 'Investor deck blocked — revenue discrepancy',
    preview: 'I\'ve asked Ops Agent to reconcile with the Tech numbers but there\'s still a 15%...',
    status: 'flagged',
    priority: 'urgent',
    tamirSummary: 'Liam is blocked on finalizing the investor deck due to a 15% revenue projection gap between the Ops and Tech models. The methodology differs: Ops uses a conservative churn assumption while Tech includes new enterprise ARR from ZUNA. CTO has identified the gap.',
    tamirAction: 'This needs a CEO call on which methodology to use for the investor presentation. I can set up a 15-min call with Alex and Liam, or you can delegate the decision to Liam.',
    linkedMissionId: 'm5',
    linkedMissionTitle: 'Investor Update Deck',
    linkedEscalationId: 'e2',
    fullBody: 'Hi,\n\nI\'ve asked Ops Agent to reconcile with the Tech numbers but there\'s still a 15% discrepancy. The issue is methodological:\n\n• Our (Ops) model: conservative Q3 churn at 8%, excludes ZUNA ARR until signed contracts\n• Tech model: includes ZUNA pipeline as partial ARR, uses 5% churn assumption\n\nAlex believes Tech\'s model is more accurate. I think it\'s too aggressive for an investor presentation.\n\nWe need a CEO call on this before I can finalize the deck. Sarah\'s call is at 10am.',
  },
  {
    id: 'msg-7',
    source: 'agent',
    from: 'Research Agent',
    fromAvatar: 'R',
    fromColor: 'bg-indigo-600',
    fromRole: 'Research Agent',
    receivedAt: '10:20am',
    subject: 'Patent risk report — 1 conflict needs CEO decision',
    preview: 'Report complete. 3 IP conflicts found. 2 cleared by Legal Agent. The third (Neurosity...',
    status: 'unread',
    priority: 'high',
    tamirSummary: 'The EEG patent risk report is complete. Conflicts 1 and 2 are cleared. Conflict 3 involves Neurosity patent US-2021-0892341 covering "impedance-adaptive electrode calibration" — this overlaps with a core component of the EEG model. Options: license ($40K/yr estimated), design around (6-week delay), or challenge (12-18 month process).',
    tamirAction: 'Decision needed before the 5pm patent review call. Legal Agent recommends the "design around" path. I can brief you in detail.',
    linkedMissionId: 'm1',
    linkedMissionTitle: 'EEG Model Optimization',
    fullBody: 'Patent risk report complete. Full report attached.\n\nSummary:\n• Conflict 1 (Emotiv, US-2019-0441823): CLEARED — different signal processing method\n• Conflict 2 (OpenBCI, US-2020-0334109): CLEARED — prior art established\n• Conflict 3 (Neurosity, US-2021-0892341): ACTION REQUIRED\n\nConflict 3 covers impedance-adaptive electrode calibration. Our EEG model uses a functionally identical approach. Options:\n1. License: ~$40K/yr, fastest path\n2. Design around: 6-week engineering delay, Legal Agent rates feasibility at 75%\n3. Challenge validity: 12-18 months, low certainty\n\nLegal Agent recommends option 2. Tamir has the full brief.',
  },
  {
    id: 'msg-8',
    source: 'slack',
    from: 'Alex (CTO)',
    fromAvatar: 'A',
    fromColor: 'bg-blue-600',
    fromRole: 'CTO',
    receivedAt: '11:10am',
    subject: '#general — EEG benchmark results',
    preview: 'Data Scientist just sent the benchmark results — looks very strong. 94.3% accuracy...',
    status: 'read',
    priority: 'normal',
    tamirSummary: 'EEG model batch 5 benchmark results are in. 94.3% accuracy, latency at 18ms (within the 20ms target). Alex is happy with the results and ready to move to production prep.',
    tamirAction: 'FYI only — no action needed. Good news to acknowledge with Alex.',
    linkedMissionId: 'm1',
    linkedMissionTitle: 'EEG Model Optimization',
    fullBody: 'Data Scientist just sent the benchmark results — looks very strong. 94.3% accuracy on the test set, 18ms latency on the standard 14-channel protocol.\n\nWe hit both targets. Ready to move to production prep once the patent issue is resolved.\n\nGreat work from the whole EEG team.',
  },
];
