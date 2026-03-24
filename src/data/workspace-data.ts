import { people, missions } from './mock-data';
import type { Person, Deliverable } from '@/types';

// ── Extended mission data for workspace deep-dive ──────────────────────────────

export interface WorkspaceAgent {
  person: Person;
  role: string;
  status: 'working' | 'done' | 'blocked' | 'waiting' | 'idle';
  task: string;
  output?: string;
  timeSpent?: string;
}

export interface AgentStep {
  step: string;
  detail?: string;
  status: 'done' | 'active' | 'pending';
  agent?: Person;
}

export interface ImpactItem {
  label: string;
  value: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface MissionContext {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  department: string;
  owner: Person;
  column: 'act-now' | 'approve-decide' | 'review';
  age: string;
  ceoAction: string;
  primaryCTA: string;
  blocker?: string;
  escalationPath: string;

  // Deep context
  situation: string;
  background: string;
  agents: WorkspaceAgent[];
  thinkingSteps: AgentStep[];
  deliverables: (Deliverable & { size?: string; updatedAt?: string })[];
  impactIfApproved: ImpactItem[];
  impactIfIgnored: ImpactItem[];
  relatedEscalations: string[];
  relatedVault: string[];
  timeline: { time: string; actor: string; action: string }[];
  budget?: { current: string; projected: string; limit: string };
}

// ── Workspace missions (extended from mock data) ───────────────────────────────

export const workspaceMissions: MissionContext[] = [
  {
    id: 'm1',
    title: 'AWS GPU Capacity Blocker',
    priority: 'critical',
    department: 'Tech',
    owner: people.cto,
    column: 'act-now',
    age: '3h',
    ceoAction: 'Approve g4dn.xlarge in us-west-2',
    primaryCTA: 'Approve GPU · $0.12/hr',
    blocker: 'No GPU available in current AZ',
    escalationPath: 'L4 Escalation | Dev > CTO > Tamir > CEO',
    situation: 'ZUNA EEG model deployment requires GPU inference. All g4dn.xlarge instances in us-east-1 and us-east-2 are at full capacity. Infra Agent identified availability in us-west-2 at a slight cost increase.',
    background: 'ZUNA v2.1 is the core product — a 14-channel EEG inference model that needs <50ms latency. CPU-only inference was evaluated and rejected (12x latency increase). This is the critical path for the entire product launch.',
    agents: [
      { person: people.devAgent2, role: 'Infrastructure', status: 'blocked', task: 'GPU allocation request', output: 'gpu_allocation_request.yaml', timeSpent: '2.5h' },
      { person: people.cto, role: 'Dept Review', status: 'done', task: 'Verified cost & availability', output: 'capacity_analysis.pdf', timeSpent: '45m' },
      { person: people.devAgent1, role: 'Deployment', status: 'waiting', task: 'Waiting for GPU to deploy manifest', timeSpent: '0m' },
    ],
    thinkingSteps: [
      { step: 'Scanned AWS capacity across us-east-1, us-east-2, us-west-1', detail: 'All g4dn.xlarge instances at 100% capacity', status: 'done', agent: people.devAgent2 },
      { step: 'Evaluated CPU-only inference path', detail: 'Rejected — 12x latency increase exceeds ZUNA 50ms SLA', status: 'done', agent: people.devAgent2 },
      { step: 'Located g4dn.xlarge availability in us-west-2', detail: 'Cost delta: +$0.12/hr over primary region', status: 'done', agent: people.devAgent2 },
      { step: 'Verified with Finance API — within approved budget', detail: 'Remaining headroom: $620/mo', status: 'done', agent: people.cto },
      { step: 'Awaiting CEO approval for cross-region commitment', status: 'active' },
    ],
    deliverables: [
      { name: 'gpu_allocation_request.yaml', type: 'code', status: 'ready', size: '2.4 KB', updatedAt: '12m ago' },
      { name: 'capacity_analysis.pdf', type: 'pdf', status: 'approved', size: '340 KB', updatedAt: '1h ago' },
    ],
    impactIfApproved: [
      { label: 'ZUNA deployment unblocks', value: 'Immediately', type: 'positive' },
      { label: 'Dev + Infra agents resume', value: '2 agents back online', type: 'positive' },
      { label: 'Cost increase', value: '+$0.12/hr (~$87/mo)', type: 'neutral' },
      { label: 'Staging ETA', value: '~48 hours', type: 'positive' },
    ],
    impactIfIgnored: [
      { label: 'ZUNA blocked', value: 'Indefinitely', type: 'negative' },
      { label: 'Agent idle cost', value: '~$800/hr wasted', type: 'negative' },
      { label: 'Launch delay', value: '5+ days minimum', type: 'negative' },
    ],
    relatedEscalations: ['e1', 'e2'],
    relatedVault: ['v3', 'v6'],
    timeline: [
      { time: '10:24', actor: 'Infra Agent', action: 'Escalated to L4 — all regions exhausted' },
      { time: '10:18', actor: 'CTO Alex', action: 'Verified budget headroom with Finance API' },
      { time: '09:45', actor: 'Infra Agent', action: 'Tried us-east-2 — same capacity issue' },
      { time: '09:12', actor: 'Infra Agent', action: 'Evaluated CPU-only fallback — rejected' },
      { time: '08:30', actor: 'Infra Agent', action: 'Started GPU capacity scan across regions' },
    ],
    budget: { current: '$1.5K', projected: '$1.6K', limit: '$4K' },
  },
  {
    id: 'm2',
    title: 'Research Analyst Hire',
    priority: 'high',
    department: 'Tech',
    owner: people.cto,
    column: 'approve-decide',
    age: '1d',
    ceoAction: 'Approve or reject hire',
    primaryCTA: 'Approve Hire',
    escalationPath: 'Hiring Pipeline | Research > CTO > Tamir > CEO',
    situation: 'EEG research requires specialized analyst. 14 candidates sourced, filtered to 2 finalists. Priya K. is the unanimous #1 pick. Recruiter is holding the slot — brief expires tonight at midnight.',
    background: 'The EEG study is a foundational research effort for ZUNA v3. Without a dedicated analyst, the CTO is splitting time between infrastructure and research, creating bottlenecks across both tracks.',
    agents: [
      { person: people.researchAgent, role: 'Sourcing', status: 'done', task: 'Sourced & filtered 14 candidates', output: 'candidate_brief.docx', timeSpent: '4h' },
      { person: people.cto, role: 'Review', status: 'done', task: 'Ranked candidates, approved compensation', output: 'compensation_model.xlsx', timeSpent: '1.5h' },
    ],
    thinkingSteps: [
      { step: 'Sourced 14 candidates from 3 recruiting pipelines', status: 'done', agent: people.researchAgent },
      { step: 'Filtered to 2 shortlisted based on EEG expertise + Python', status: 'done', agent: people.researchAgent },
      { step: 'Assembled candidate brief with full scoring matrix', detail: 'CTO ranked Priya K. #1 across all dimensions', status: 'done', agent: people.researchAgent },
      { step: 'Drafted compensation at $95K base + equity', detail: 'Within Research band, pre-approved by Tamir', status: 'done', agent: people.cto },
      { step: 'Recruiter holding slot — brief expires tonight', status: 'active' },
    ],
    deliverables: [
      { name: 'candidate_brief.docx', type: 'document', status: 'ready', size: '128 KB', updatedAt: '6h ago' },
      { name: 'eeg_study_scope.pdf', type: 'pdf', status: 'draft', size: '89 KB', updatedAt: '1d ago' },
      { name: 'compensation_model.xlsx', type: 'spreadsheet', status: 'ready', size: '45 KB', updatedAt: '3h ago' },
    ],
    impactIfApproved: [
      { label: 'EEG research accelerates', value: '2-3 weeks faster', type: 'positive' },
      { label: 'CTO bandwidth freed', value: '~15 hrs/week', type: 'positive' },
      { label: 'Annual cost', value: '$95K + equity', type: 'neutral' },
    ],
    impactIfIgnored: [
      { label: 'Candidate slot expires', value: 'Tonight midnight', type: 'negative' },
      { label: 'Restart recruiting', value: '2-3 week delay', type: 'negative' },
      { label: 'CTO remains bottlenecked', value: 'Ongoing', type: 'negative' },
    ],
    relatedEscalations: [],
    relatedVault: ['v8'],
    timeline: [
      { time: '09:00', actor: 'Tamir', action: 'Flagged brief expiration deadline' },
      { time: 'Yesterday', actor: 'CTO Alex', action: 'Approved compensation model' },
      { time: 'Yesterday', actor: 'Research Agent', action: 'Completed candidate scoring matrix' },
      { time: '2d ago', actor: 'Research Agent', action: 'Started candidate sourcing' },
    ],
    budget: { current: '$1.5K', projected: '$2.3K', limit: '$4K' },
  },
  {
    id: 'm3',
    title: 'Content Strategy Plans',
    priority: 'medium',
    department: 'Marketing',
    owner: people.cmo,
    column: 'review',
    age: '4h',
    ceoAction: 'Review deliverables',
    primaryCTA: 'Review Q2 Plans',
    escalationPath: 'Content Pipeline | Marketing > CMO > Tamir > CEO',
    situation: 'Q2 content strategy has been prepared including a 3-pillar framework aligned to the EEG launch arc. 48-post editorial calendar drafted. Brand guidelines refresh in progress.',
    background: 'The content strategy supports the go-to-market plan for ZUNA. Three pillars: thought leadership, product education, and community building. All content must pass CMO brand review before publication.',
    agents: [
      { person: people.mktAgent1, role: 'Content', status: 'done', task: 'Created Q2 editorial calendar', output: 'q2_editorial_calendar.xlsx', timeSpent: '6h' },
      { person: people.cmo, role: 'Review', status: 'done', task: 'Reviewed framework, requested brand refresh', output: 'content_plans.pdf', timeSpent: '2h' },
    ],
    thinkingSteps: [
      { step: 'Ingested 300-day strategy from Vault and brand files', status: 'done', agent: people.mktAgent1 },
      { step: 'Generated 3-pillar content framework for EEG launch', status: 'done', agent: people.mktAgent1 },
      { step: 'Produced Q2 editorial calendar — 48 posts across 12 weeks', detail: 'Coverage: thought leadership, product education, community', status: 'done', agent: people.mktAgent1 },
      { step: 'CMO reviewed — requested brand guidelines refresh first', status: 'done', agent: people.cmo },
      { step: 'brand_guidelines_v3.pdf in progress — ETA 2h', status: 'active', agent: people.mktAgent1 },
    ],
    deliverables: [
      { name: 'content_plans.pdf', type: 'pdf', status: 'ready', size: '1.2 MB', updatedAt: '2h ago' },
      { name: 'q2_editorial_calendar.xlsx', type: 'spreadsheet', status: 'draft', size: '78 KB', updatedAt: '4h ago' },
      { name: 'brand_guidelines_v3.pdf', type: 'pdf', status: 'in-progress', size: '2.1 MB', updatedAt: '30m ago' },
    ],
    impactIfApproved: [
      { label: 'Q2 content launches on schedule', value: 'Next Monday', type: 'positive' },
      { label: 'Brand consistency established', value: 'All channels', type: 'positive' },
    ],
    impactIfIgnored: [
      { label: 'Content launch delayed', value: '3-5 days', type: 'negative' },
      { label: 'Marketing team idle', value: 'Waiting for direction', type: 'negative' },
    ],
    relatedEscalations: ['e3'],
    relatedVault: ['v7'],
    timeline: [
      { time: '10:15', actor: 'Content Agent', action: 'Brand guidelines v3 — 85% complete' },
      { time: '08:00', actor: 'CMO Maya', action: 'Approved content framework' },
      { time: 'Yesterday', actor: 'Content Agent', action: 'Submitted Q2 editorial calendar' },
    ],
  },
  {
    id: 'm4',
    title: 'ZUNA Deployment',
    priority: 'high',
    department: 'Tech',
    owner: people.cto,
    column: 'act-now',
    age: '45m',
    ceoAction: 'Unblock infrastructure dependency',
    primaryCTA: 'Unblock ZUNA',
    blocker: 'Blocked by GPU approval (m1)',
    escalationPath: 'Deploy Pipeline | Dev > DevOps > CTO > Tamir > CEO',
    situation: 'ZUNA v2.1 is packaged and ready for deployment. 47 unit tests passed. Integration tests are gated on GPU instance availability — directly blocked by the GPU capacity decision (m1).',
    background: 'This mission is downstream of the GPU approval. Once m1 is approved, this mission unblocks automatically. The deployment manifest, test suite, and ECS configuration are all ready.',
    agents: [
      { person: people.devAgent1, role: 'Packaging', status: 'done', task: 'Packaged ZUNA v2.1 with 14-channel pipeline', output: 'deployment_manifest.yaml', timeSpent: '3h' },
      { person: people.devAgent2, role: 'Infrastructure', status: 'blocked', task: 'Waiting for GPU allocation', timeSpent: '2.5h' },
      { person: people.cto, role: 'Oversight', status: 'waiting', task: 'Ready to approve staging once infra clears' },
    ],
    thinkingSteps: [
      { step: 'Packaged ZUNA v2.1 with 14-channel EEG inference', status: 'done', agent: people.devAgent1 },
      { step: 'Generated deployment_manifest.yaml for AWS ECS', status: 'done', agent: people.devAgent1 },
      { step: '47 unit tests passed in staging', detail: 'Integration tests gated on GPU availability', status: 'done', agent: people.devAgent1 },
      { step: 'Infra agent attempted 3 alternative GPU configs', detail: 'All blocked by capacity constraint', status: 'done', agent: people.devAgent2 },
      { step: 'Waiting for m1 GPU approval to proceed', status: 'active' },
    ],
    deliverables: [
      { name: 'deployment_manifest.yaml', type: 'code', status: 'in-progress', size: '5.6 KB', updatedAt: '25m ago' },
      { name: 'test_results_summary.pdf', type: 'pdf', status: 'ready', size: '180 KB', updatedAt: '1h ago' },
    ],
    impactIfApproved: [
      { label: 'Auto-unblocks when m1 approved', value: 'No separate action', type: 'positive' },
      { label: 'Full staging in', value: '~48 hours', type: 'positive' },
    ],
    impactIfIgnored: [
      { label: 'Entire deployment frozen', value: 'Indefinitely', type: 'negative' },
      { label: '2 agents idle', value: 'Dev + Infra', type: 'negative' },
    ],
    relatedEscalations: ['e1'],
    relatedVault: ['v3', 'v6'],
    timeline: [
      { time: '10:30', actor: 'Dev Agent', action: 'Updated manifest with latest test results' },
      { time: '10:00', actor: 'Infra Agent', action: 'Confirmed still blocked on GPU' },
      { time: '09:00', actor: 'Dev Agent', action: 'All 47 unit tests passed' },
    ],
  },
  {
    id: 'm8',
    title: 'Investor Deck Preparation',
    priority: 'high',
    department: 'Operations',
    owner: people.coo,
    column: 'approve-decide',
    age: '6h',
    ceoAction: 'Approve unified cost allocation methodology',
    primaryCTA: 'Approve Methodology',
    blocker: '15% revenue projection discrepancy',
    escalationPath: 'Finance Pipeline | Ops > COO > Tamir > CEO',
    situation: 'Q1 investor update being prepared. Revenue projections from Tech and Ops differ by 15% due to different cost allocation methodologies (accrual vs cash basis). Meeting is in 3 days.',
    background: 'The investor meeting is a critical milestone. The data discrepancy isn\'t an error — it\'s a methodology difference. The proposed fix (unified accrual-based approach) is standard practice and already drafted.',
    agents: [
      { person: people.opsAgent, role: 'Data Collection', status: 'done', task: 'Pulled financial data, identified discrepancy', output: 'investor_deck_q1.pptx', timeSpent: '5h' },
      { person: people.coo, role: 'Analysis', status: 'done', task: 'Root cause analysis, proposed unified methodology', timeSpent: '2h' },
    ],
    thinkingSteps: [
      { step: 'Pulled financial data from Tech and Ops systems', detail: 'Found 15% revenue projection discrepancy', status: 'done', agent: people.opsAgent },
      { step: 'Root cause: different cost allocation methodologies', detail: 'Tech uses accrual, Ops uses cash basis', status: 'done', agent: people.coo },
      { step: 'Proposed unified accrual-based methodology', detail: 'With quarterly reconciliation schedule', status: 'done', agent: people.coo },
      { step: 'Deck drafted with placeholder on slide 7', detail: 'Pending methodology approval', status: 'done', agent: people.opsAgent },
      { step: 'CEO approval needed to finalize numbers', detail: 'Investor meeting in 3 days', status: 'active' },
    ],
    deliverables: [
      { name: 'investor_deck_q1.pptx', type: 'presentation', status: 'draft', size: '4.2 MB', updatedAt: '2h ago' },
      { name: 'methodology_proposal.pdf', type: 'pdf', status: 'ready', size: '220 KB', updatedAt: '3h ago' },
    ],
    impactIfApproved: [
      { label: 'Deck finalized', value: 'Within 24 hours', type: 'positive' },
      { label: 'Investor meeting', value: 'Proceeds on schedule', type: 'positive' },
      { label: 'Unified methodology', value: 'Future reports aligned', type: 'positive' },
    ],
    impactIfIgnored: [
      { label: 'Investor meeting', value: 'Postponed or awkward', type: 'negative' },
      { label: 'Credibility risk', value: 'Presenting unreconciled data', type: 'negative' },
      { label: 'Deadline', value: '3 days remaining', type: 'negative' },
    ],
    relatedEscalations: ['e4'],
    relatedVault: [],
    timeline: [
      { time: '09:30', actor: 'COO Liam', action: 'Completed methodology proposal' },
      { time: '09:00', actor: 'Ops Agent', action: 'Drafted investor deck with placeholder' },
      { time: '08:15', actor: 'COO Liam', action: 'Identified methodology difference' },
      { time: '07:30', actor: 'Ops Agent', action: 'Started financial data pull' },
    ],
    budget: { current: '$0.8K', projected: '$0.8K', limit: '$3K' },
  },
];

// ── Chat messages per mission ──────────────────────────────────────────────────

export interface WorkspaceChatMsg {
  id: number;
  sender: 'tamir' | 'ceo';
  time: string;
  content: string;
}

export const missionChats: Record<string, WorkspaceChatMsg[]> = {
  m1: [
    { id: 1, sender: 'tamir', time: '10:24', content: "This is the most critical item today. Approving the GPU in us-west-2 costs an extra $87/month but unblocks ZUNA deployment, 2 idle agents, and the entire EEG pipeline. I've verified the budget — $620/mo headroom remaining." },
    { id: 2, sender: 'tamir', time: '10:25', content: "Worth noting: the ZUNA deployment (m4) auto-unblocks when you approve this. Two missions resolved with one decision." },
  ],
  m2: [
    { id: 1, sender: 'tamir', time: '09:00', content: "Time-sensitive: Priya K. is the clear #1 candidate for EEG research. Compensation is within band. The recruiter slot expires tonight at midnight — if we pass, we restart the 2-3 week sourcing process." },
    { id: 2, sender: 'tamir', time: '09:01', content: "Approving this also frees ~15 hours/week of Alex's time. He's currently splitting between infra and research, which is causing the bottleneck on both tracks." },
  ],
  m3: [
    { id: 1, sender: 'tamir', time: '08:30', content: "The Q2 content strategy is well-structured. Three pillars align with our launch arc. Main deliverable is a 48-post editorial calendar. Maya has already approved the framework — she just needs the brand guidelines refresh completed first." },
  ],
  m4: [
    { id: 1, sender: 'tamir', time: '10:00', content: "This is downstream of the GPU decision (m1). No separate action needed — once you approve the GPU allocation, Dev Agent and Infra Agent can proceed immediately. All 47 unit tests are already passing." },
  ],
  m8: [
    { id: 1, sender: 'tamir', time: '09:30', content: "The 15% discrepancy isn't an error — Tech uses accrual accounting, Ops uses cash basis. The unified methodology Liam proposed is standard practice. One approval here and the deck gets finalized within 24 hours." },
    { id: 2, sender: 'tamir', time: '09:31', content: "Investor meeting is in 3 days. I'd prioritize this today alongside the GPU decision. Both are quick approvals with high unlock value." },
  ],
};
