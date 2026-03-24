import { Employee, Escalation, VaultEntry, DepartmentDetail, TimelineEvent, Mission, Person } from '@/types';
import { people, missions } from './mock-data';

// ─── EMPLOYEES (People Page) ───

export const employees: Employee[] = [
  { id: 'tamir', name: 'Tamir', role: 'Chief of Staff', type: 'executive', department: 'Executive', reportsTo: 'CEO', avatar: 'T', color: 'bg-amber-600', status: 'active', currentTask: 'Coordinating cross-department sprint', tasksCompleted: 142, joinedAt: 'Day 1', memoryNamespace: 'myelin:emp:tamir' },
  { id: 'cto', name: 'Alex', role: 'CTO', type: 'executive', department: 'Tech', reportsTo: 'Tamir', avatar: 'A', color: 'bg-blue-600', status: 'busy', currentTask: 'AWS capacity resolution', tasksCompleted: 87, joinedAt: 'Day 1', memoryNamespace: 'myelin:emp:cto', currentMissionId: 'm1', currentMissionTitle: 'AWS Capacity Blocker', linkedEscalationId: 'e2' },
  { id: 'cmo', name: 'Maya', role: 'CMO', type: 'executive', department: 'Marketing', reportsTo: 'Tamir', avatar: 'M', color: 'bg-purple-600', status: 'active', currentTask: 'Content strategy review', tasksCompleted: 63, joinedAt: 'Day 1', memoryNamespace: 'myelin:emp:cmo', currentMissionId: 'm3', currentMissionTitle: 'Content Strategy Plans' },
  { id: 'coo', name: 'Liam', role: 'COO', type: 'executive', department: 'Operations', reportsTo: 'Tamir', avatar: 'L', color: 'bg-emerald-600', status: 'active', currentTask: '300-day timeline update', tasksCompleted: 91, joinedAt: 'Day 1', memoryNamespace: 'myelin:emp:coo', currentMissionId: 'm5', currentMissionTitle: 'Logistics Optimization', linkedEscalationId: 'e4' },
  { id: 'dev1', name: 'Dev Agent', role: 'Engineer', type: 'permanent', department: 'Tech', reportsTo: 'CTO', avatar: 'D', color: 'bg-cyan-600', status: 'busy', currentTask: 'ZUNA deployment manifest', tasksCompleted: 34, joinedAt: 'Day 12', memoryNamespace: 'myelin:emp:dev_001', currentMissionId: 'm4', currentMissionTitle: 'ZUNA Deployment', linkedEscalationId: 'e1' },
  { id: 'dev2', name: 'Infra Agent', role: 'DevOps', type: 'permanent', department: 'Tech', reportsTo: 'CTO', avatar: 'I', color: 'bg-teal-600', status: 'busy', currentTask: 'GPU allocation request', tasksCompleted: 28, joinedAt: 'Day 15', memoryNamespace: 'myelin:emp:infra_001', currentMissionId: 'm1', currentMissionTitle: 'AWS Capacity Blocker', linkedEscalationId: 'e1' },
  { id: 'mkt1', name: 'Content Agent', role: 'Content Director', type: 'permanent', department: 'Marketing', reportsTo: 'CMO', avatar: 'C', color: 'bg-pink-600', status: 'active', currentTask: 'Q2 editorial calendar', tasksCompleted: 45, joinedAt: 'Day 8', memoryNamespace: 'myelin:emp:content_director', currentMissionId: 'm3', currentMissionTitle: 'Content Strategy Plans', linkedEscalationId: 'e3' },
  { id: 'res1', name: 'Research Agent', role: 'Analyst', type: 'permanent', department: 'Tech', reportsTo: 'CTO', avatar: 'R', color: 'bg-indigo-600', status: 'idle', tasksCompleted: 19, joinedAt: 'Day 22', memoryNamespace: 'myelin:emp:research_001' },
  { id: 'ops1', name: 'Ops Agent', role: 'Operations Specialist', type: 'permanent', department: 'Operations', reportsTo: 'COO', avatar: 'O', color: 'bg-lime-600', status: 'active', currentTask: 'Logistics report finalization', tasksCompleted: 37, joinedAt: 'Day 10', memoryNamespace: 'myelin:emp:ops_001', currentMissionId: 'm5', currentMissionTitle: 'Logistics Optimization', linkedEscalationId: 'e4' },
  { id: 'mkt2', name: 'Market Intel', role: 'Market Intelligence', type: 'permanent', department: 'Marketing', reportsTo: 'CMO', avatar: 'MI', color: 'bg-fuchsia-600', status: 'active', currentTask: 'Competitor landscape scan', tasksCompleted: 22, joinedAt: 'Day 18', memoryNamespace: 'myelin:emp:market_intel' },
  { id: 'temp1', name: 'EEG Researcher', role: 'Temp Researcher', type: 'temp', department: 'Tech', reportsTo: 'CTO', avatar: 'ER', color: 'bg-orange-600', status: 'busy', currentTask: 'EEG device comparison study', tasksCompleted: 3, joinedAt: 'Day 45', memoryNamespace: 'myelin:emp:temp_eeg_001', currentMissionId: 'm4', currentMissionTitle: 'ZUNA Deployment', linkedEscalationId: 'e2' },
  { id: 'temp2', name: 'Data Scientist', role: 'Temp Data Scientist', type: 'temp', department: 'Tech', reportsTo: 'CTO', avatar: 'DS', color: 'bg-rose-600', status: 'active', currentTask: 'Model accuracy benchmarks', tasksCompleted: 5, joinedAt: 'Day 40', memoryNamespace: 'myelin:emp:temp_ds_001' },
];

// ─── ESCALATIONS ───

export const escalations: Escalation[] = [
  {
    id: 'e1', level: 'L4', title: 'AWS GPU Capacity Blocker',
    originatedBy: people.devAgent2,
    chain: [people.devAgent2, people.cto, people.tamir],
    situation: 'Deploying ZUNA EEG model on AWS for inference. Required g4dn.xlarge instance in us-east-1 is at capacity.',
    blocker: 'Insufficient GPU capacity in selected AZ. No alternative instance types meet latency requirements.',
    attemptsMade: ['Requested capacity increase via AWS Support (denied — 48hr wait)', 'Tried us-east-2 — same capacity issue', 'Evaluated CPU-only inference — unacceptable 12x latency'],
    needFromFounder: 'Approve g4dn.xlarge in us-west-2 (higher cost region, +$0.12/hr)',
    impactIfIgnored: 'ZUNA deployment blocked indefinitely. Delays EEG analysis pipeline by 5+ days.',
    status: 'active', priority: 'critical', createdAt: '10:24 AM', department: 'Tech', taskId: 'm1',
    linkedMissionId: 'm4',
    linkedMissionTitle: 'ZUNA Deployment',
    linkedMissionPriority: 'high',
    blockedAgentIds: ['dev2', 'dev1'],
    skillGap: 'AWS Infrastructure · Cloud Capacity Management',
    financialImpact: '+$0.12/hr GPU approval · $5K delay cost per day blocked',
  },
  {
    id: 'e2', level: 'L3', title: 'Budget Overrun Risk — Tech Department',
    originatedBy: people.cto,
    chain: [people.cto, people.tamir],
    situation: 'Tech department spend at $1.5K of $4K budget with 2 temp hires active and GPU costs pending.',
    blocker: 'If GPU approval + temp researcher extension both proceed, projected spend exceeds budget by ~$800.',
    attemptsMade: ['Reviewed temp contracts for early termination options', 'Proposed phased GPU allocation'],
    needFromFounder: 'Approve budget increase to $5K or prioritize which initiative to defer.',
    impactIfIgnored: 'Either GPU deployment or EEG research must pause. Both are on critical path.',
    status: 'active', priority: 'high', createdAt: '09:45 AM', department: 'Tech',
    linkedMissionId: 'm1',
    linkedMissionTitle: 'AWS Capacity Blocker',
    linkedMissionPriority: 'critical',
    blockedAgentIds: ['cto', 'temp1'],
    skillGap: 'Budget Forecasting · Infrastructure Cost Modeling',
    financialImpact: '~$800 projected overrun · GPU + temp researcher combined',
  },
  {
    id: 'e3', level: 'L2', title: 'Content Approval Bottleneck',
    originatedBy: people.mktAgent1,
    chain: [people.mktAgent1, people.cmo],
    situation: '3 content pieces awaiting CMO review for 48+ hours. Publication schedule at risk.',
    blocker: 'CMO bandwidth — cross-department content synthesis consuming review time.',
    attemptsMade: ['Flagged priority in daily standup', 'Prepared executive summary for faster review'],
    needFromFounder: 'No immediate action needed — CMO resolving internally. Informational escalation.',
    impactIfIgnored: 'Q2 content launch delays by 3-5 days.',
    status: 'waiting', priority: 'medium', createdAt: '08:30 AM', department: 'Marketing',
    linkedMissionId: 'm3',
    linkedMissionTitle: 'Content Strategy Plans',
    linkedMissionPriority: 'medium',
    blockedAgentIds: ['mkt1'],
    skillGap: 'Content Review Throughput · Async Approval Workflow',
    financialImpact: '3-5 day Q2 schedule slip · estimated $1.2K campaign delay',
  },
  {
    id: 'e4', level: 'L4', title: 'Investor Deck Data Discrepancy',
    originatedBy: people.opsAgent,
    chain: [people.opsAgent, people.coo, people.tamir],
    situation: 'Preparing Q1 investor update. Revenue projections from Tech and Ops differ by 15%.',
    blocker: 'Cannot finalize deck without reconciled numbers. Investor meeting in 3 days.',
    attemptsMade: ['Cross-referenced both department data sources', 'Identified methodology difference in cost allocation', 'Proposed unified methodology — needs CEO sign-off'],
    needFromFounder: 'Approve unified cost allocation methodology for investor reporting.',
    impactIfIgnored: 'Investor meeting postponed or presented with unreconciled data.',
    status: 'active', priority: 'high', createdAt: '09:15 AM', department: 'Operations', taskId: 'm5',
    linkedMissionId: 'm5',
    linkedMissionTitle: 'Logistics Optimization',
    linkedMissionPriority: 'low',
    blockedAgentIds: ['ops1', 'coo'],
    skillGap: 'Financial Data Reconciliation · Investor Reporting',
    financialImpact: 'Investor meeting at risk · potential funding delay',
  },
];

// ─── VAULT ENTRIES ───

export const vaultEntries: VaultEntry[] = [
  { id: 'v1', category: 'mission', title: 'Company Mission Statement', content: 'Build the world\'s first consumer-grade autonomous EEG analysis platform that democratizes brain-computer interfaces for everyday wellness monitoring.', addedBy: 'CEO', approvedBy: 'CEO', createdAt: 'Day 1', tags: ['mission', 'vision', 'core'], department: undefined },
  { id: 'v2', category: 'strategy', title: '300-Day Launch Strategy', content: 'Phase 1 (Days 1-90): Foundation & Research. Phase 2 (Days 91-180): MVP Development. Phase 3 (Days 181-270): Beta Testing. Phase 4 (Days 271-300): Launch Preparation.', addedBy: 'Tamir', approvedBy: 'CEO', createdAt: 'Day 3', tags: ['strategy', 'timeline', 'milestones'] },
  { id: 'v3', category: 'decision', title: 'AWS Bedrock as Primary LLM Provider', content: 'All AI inference runs through AWS Bedrock using Claude 3.5 Sonnet. No local LLM inference due to Raspberry Pi 4 constraints. Single concurrent Bedrock call model.', addedBy: 'CTO', approvedBy: 'CEO', createdAt: 'Day 5', tags: ['tech', 'infrastructure', 'ai'], department: 'Tech' },
  { id: 'v4', category: 'policy', title: 'Chain of Command Enforcement', content: 'Employees never message CEO directly. All communications flow: Employee → Dept Head → Tamir → CEO. Enforced at tool, schema, and prompt levels.', addedBy: 'Tamir', approvedBy: 'CEO', createdAt: 'Day 2', tags: ['governance', 'policy', 'chain-of-command'] },
  { id: 'v5', category: 'preference', title: 'CEO Communication Preferences', content: 'Prefers voice briefings for strategy updates. Written reports for technical details. Quick Telegram messages for time-sensitive approvals. Weekly consolidated review on Sundays.', addedBy: 'Tamir', approvedBy: 'CEO', createdAt: 'Day 7', tags: ['preferences', 'communication'] },
  { id: 'v6', category: 'knowledge', title: 'ZUNA EEG Model Specifications', content: 'ZUNA v2.1: 14-channel dry electrode EEG. Sampling rate: 256Hz. Target latency: <50ms for real-time BCI applications. Requires GPU inference for production throughput.', addedBy: 'CTO', approvedBy: 'CEO', createdAt: 'Day 20', tags: ['product', 'technical', 'eeg'], department: 'Tech' },
  { id: 'v7', category: 'strategy', title: 'Content Strategy Framework', content: 'Three content pillars: (1) Thought leadership in consumer neuroscience, (2) Product education and tutorials, (3) Community building and user stories. All public content must pass CMO brand review.', addedBy: 'CMO', approvedBy: 'CEO', createdAt: 'Day 14', tags: ['marketing', 'content', 'brand'], department: 'Marketing' },
  { id: 'v8', category: 'decision', title: 'Hiring Approval Threshold', content: 'Permanent hires require CEO approval. Temp hires under $500/task can be approved by dept heads. Temp hires over $500/task require Tamir approval. All hires get onboarding packets.', addedBy: 'Tamir', approvedBy: 'CEO', createdAt: 'Day 10', tags: ['governance', 'hiring', 'policy'] },
  { id: 'v9', category: 'knowledge', title: 'Competitor Landscape Q1 2026', content: 'Key competitors: NeuroSky (consumer), Emotiv (prosumer), OpenBCI (maker). Our differentiator: fully autonomous analysis pipeline — no data science skills needed by end user.', addedBy: 'Market Intel', approvedBy: 'CMO', createdAt: 'Day 25', tags: ['competitive', 'market', 'intelligence'], department: 'Marketing' },
  { id: 'v10', category: 'policy', title: 'Deliverable Quality Standards', content: 'Every task must have a clear deliverable spec. Deliverables must be: typed, stored, visible in UI, attributable to creator, and routed through chain of command for review.', addedBy: 'Tamir', approvedBy: 'CEO', createdAt: 'Day 4', tags: ['quality', 'process', 'deliverables'] },
  { id: 'v11', category: 'decision', title: 'Beach Mode Architecture', content: 'The entire system must be operable from a phone via voice memos. This shapes: text+voice input, voice briefings, compact executive summaries, mobile-friendly dashboard.', addedBy: 'CEO', approvedBy: 'CEO', createdAt: 'Day 1', tags: ['architecture', 'mobile', 'voice'] },
  { id: 'v12', category: 'preference', title: 'Risk Tolerance Profile', content: 'Moderate risk tolerance for tech experiments. Conservative for budget overruns. Zero tolerance for data privacy issues. Willing to invest in speed over cost for time-critical milestones.', addedBy: 'Tamir', approvedBy: 'CEO', createdAt: 'Day 8', tags: ['governance', 'risk', 'preferences'] },
];

// ─── DEPARTMENT DETAILS ───

export const departmentDetails: DepartmentDetail[] = [
  {
    name: 'Tech Dept', head: people.cto, healthStatus: 'warning',
    summary: '3 missions on track, 1 blocked on GPU capacity approval',
    description: 'Handles technology research, architecture and infrastructure decisions, model evaluation, technical project management, and hiring/managing technical employees.',
    active: 4, blocked: 1, spend: '$1.5K', budget: '$4K', risk: 'Medium',
    topMission: 'ZUNA Deployment', topDeliverable: { name: 'deployment_manifest.yaml', type: 'code', status: 'in-progress' },
    nextTouchpoint: 'GPU Approval', reportingChain: [people.devAgent1, people.cto, people.tamir],
    employees: employees.filter(e => e.department === 'Tech'),
    recentDeliverables: [
      { name: 'gpu_allocation_request.yaml', type: 'code', status: 'ready', creator: 'Infra Agent', createdAt: '2h ago' },
      { name: 'capacity_analysis.pdf', type: 'pdf', status: 'approved', creator: 'CTO', createdAt: '4h ago' },
      { name: 'eeg_benchmark_results.xlsx', type: 'spreadsheet', status: 'draft', creator: 'Data Scientist', createdAt: '6h ago' },
      { name: 'model_architecture_v2.pdf', type: 'pdf', status: 'ready', creator: 'Research Agent', createdAt: '1d ago' },
      { name: 'deployment_manifest.yaml', type: 'code', status: 'in-progress', creator: 'Dev Agent', createdAt: '3h ago' },
    ],
    memoryNamespace: 'myelin:dept:tech',
    activeMissions: ['AWS Capacity Blocker', 'ZUNA Deployment', 'Research Analyst Hire', 'EEG Model Optimization'],
    weeklyBudgetTrend: [200, 350, 500, 800, 1100, 1350, 1500],
  },
  {
    name: 'Marketing Dept', head: people.cmo, healthStatus: 'good',
    summary: '3 missions active, 0 blocked. Content strategy ready for review',
    description: 'Handles content strategy, brand consistency, external messaging, executive summaries for voice briefings, and marketing-related cross-department synthesis.',
    active: 3, blocked: 0, spend: '$2.2K', budget: '$5K', risk: 'Low',
    topMission: 'Content Strategy', topDeliverable: { name: 'content_plans.pdf', type: 'pdf', status: 'ready' },
    nextTouchpoint: 'Creative Review', reportingChain: [people.mktAgent1, people.cmo, people.tamir],
    employees: employees.filter(e => e.department === 'Marketing'),
    recentDeliverables: [
      { name: 'content_plans.pdf', type: 'pdf', status: 'ready', creator: 'Content Agent', createdAt: '1h ago' },
      { name: 'q2_editorial_calendar.xlsx', type: 'spreadsheet', status: 'draft', creator: 'Content Agent', createdAt: '3h ago' },
      { name: 'brand_guidelines_v3.pdf', type: 'pdf', status: 'in-progress', creator: 'CMO', createdAt: '5h ago' },
      { name: 'competitor_analysis_q1.pdf', type: 'pdf', status: 'approved', creator: 'Market Intel', createdAt: '2d ago' },
    ],
    memoryNamespace: 'myelin:dept:marketing',
    activeMissions: ['Content Strategy Plans', 'Brand Guidelines Update', 'Q2 Campaign Planning'],
    weeklyBudgetTrend: [300, 600, 900, 1200, 1600, 1900, 2200],
  },
  {
    name: 'Operations', head: people.coo, healthStatus: 'good',
    summary: '2 missions complete, 1 in final review. All on schedule',
    description: 'Handles the 300-day timeline, milestones, weekly reviews, investor meeting tracking, and operational context for other departments.',
    active: 2, blocked: 0, spend: '$0.8K', budget: '$3K', risk: 'Low',
    topMission: 'Logistics Optimization', topDeliverable: { name: 'optimization_report.pdf', type: 'pdf', status: 'approved' },
    nextTouchpoint: 'Completion Sign-off', reportingChain: [people.opsAgent, people.coo, people.tamir],
    employees: employees.filter(e => e.department === 'Operations'),
    recentDeliverables: [
      { name: 'optimization_report.pdf', type: 'pdf', status: 'approved', creator: 'Ops Agent', createdAt: '30m ago' },
      { name: 'route_analysis.xlsx', type: 'spreadsheet', status: 'approved', creator: 'Ops Agent', createdAt: '2h ago' },
      { name: 'investor_deck_draft.pdf', type: 'presentation', status: 'draft', creator: 'COO', createdAt: '4h ago' },
    ],
    memoryNamespace: 'myelin:dept:operations',
    activeMissions: ['Logistics Optimization', 'Investor Update Preparation'],
    weeklyBudgetTrend: [100, 200, 300, 400, 500, 650, 800],
  },
];

// ─── EXTENDED TIMELINE ───

export const fullTimeline: TimelineEvent[] = [
  { time: '10:24', actor: 'CTO', action: 'Escalated blocker', object: 'AWS Capacity Blocker', result: 'Waiting for GPU approval', timeAgo: '4m ago', department: 'Tech', category: 'escalation' },
  { time: '10:18', actor: 'Infra Agent', action: 'Submitted deliverable', object: 'gpu_allocation_request.yaml', result: 'Sent to CTO for review', timeAgo: '10m ago', department: 'Tech', category: 'deliverable' },
  { time: '10:05', actor: 'Tamir', action: 'Packaged briefing', object: 'EEG comparison study', result: 'Ready for founder review', timeAgo: '23m ago', department: 'Executive', category: 'review' },
  { time: '09:58', actor: 'CMO', action: 'Submitted deliverable', object: 'content_plans.pdf', result: 'Sent to Tamir', timeAgo: '30m ago', department: 'Marketing', category: 'deliverable' },
  { time: '09:45', actor: 'CTO', action: 'Flagged budget risk', object: 'Tech Department Budget', result: 'Escalated to Tamir', timeAgo: '43m ago', department: 'Tech', category: 'escalation' },
  { time: '09:30', actor: 'CEO', action: 'Sent directive', object: 'Use us-west-2 for deployment', result: 'Routed to CTO via Tamir', timeAgo: '58m ago', department: 'Executive', category: 'directive' },
  { time: '09:15', actor: 'Tamir', action: 'Approved temp hire', object: 'EEG Researcher', result: 'Onboarding initiated', timeAgo: '1h ago', department: 'Tech', category: 'hire' },
  { time: '09:00', actor: 'Content Agent', action: 'Submitted draft', object: 'q2_editorial_calendar.xlsx', result: 'Pending CMO review', timeAgo: '1h ago', department: 'Marketing', category: 'deliverable' },
  { time: '08:45', actor: 'Ops Agent', action: 'Completed task', object: 'Logistics Optimization', result: 'All deliverables approved', timeAgo: '1h ago', department: 'Operations', category: 'review' },
  { time: '08:30', actor: 'Data Scientist', action: 'Started task', object: 'Model accuracy benchmarks', result: 'In progress', timeAgo: '2h ago', department: 'Tech', category: 'routine' },
  { time: '08:15', actor: 'Market Intel', action: 'Submitted deliverable', object: 'competitor_analysis_q1.pdf', result: 'Sent to CMO', timeAgo: '2h ago', department: 'Marketing', category: 'deliverable' },
  { time: '08:00', actor: 'COO', action: 'Published weekly review', object: 'Week 6 Operations Summary', result: 'Added to Vault', timeAgo: '2h ago', department: 'Operations', category: 'routine' },
  { time: '07:45', actor: 'CEO', action: 'Voice memo received', object: 'Priority guidance for Q2', result: 'Classified by Tamir', timeAgo: '3h ago', department: 'Executive', category: 'directive' },
  { time: '07:30', actor: 'Dev Agent', action: 'Pushed code update', object: 'deployment_manifest.yaml', result: 'Build passing', timeAgo: '3h ago', department: 'Tech', category: 'deliverable' },
  { time: '07:15', actor: 'Tamir', action: 'Generated daily briefing', object: 'Morning Briefing - Day 47', result: 'Sent via Telegram', timeAgo: '3h ago', department: 'Executive', category: 'routine' },
  { time: '07:00', actor: 'Research Agent', action: 'Completed analysis', object: 'EEG device pricing matrix', result: 'Submitted to CTO', timeAgo: '3h ago', department: 'Tech', category: 'deliverable' },
];

// ─── EXTENDED MISSIONS for Missions Page ───

export const allMissions: Mission[] = [
  ...missions,
  {
    id: 'm6', title: 'EEG Model Optimization', column: 'review', priority: 'high',
    owner: people.cto, department: 'Tech',
    deliverables: [
      { name: 'model_accuracy_report.pdf', type: 'pdf', status: 'ready' },
      { name: 'benchmark_results.xlsx', type: 'spreadsheet', status: 'ready' },
      { name: 'optimization_code.py', type: 'code', status: 'approved' },
    ],
    touchTrail: [{ name: 'Data Scientist', role: 'Temp', avatar: 'DS', color: 'bg-rose-600' }, people.cto, people.tamir],
    flowStage: 3, ceoAction: 'Review benchmark results and approve model version',
    primaryCTA: 'Approve Model v2',
    escalationPath: 'Research Pipeline | Data Scientist > CTO > Tamir > CEO',
  },
  {
    id: 'm7', title: 'Brand Guidelines Update', column: 'review', priority: 'medium',
    owner: people.cmo, department: 'Marketing',
    deliverables: [
      { name: 'brand_guidelines_v3.pdf', type: 'pdf', status: 'in-progress' },
      { name: 'logo_variants.zip', type: 'image', status: 'ready' },
    ],
    touchTrail: [people.mktAgent1, people.cmo, people.tamir],
    flowStage: 2, ceoAction: 'Review and approve brand direction',
    primaryCTA: 'Approve Brand Direction',
    escalationPath: 'Brand Pipeline | Content Director > CMO > Tamir > CEO',
  },
  {
    id: 'm8', title: 'Investor Update Deck', column: 'act-now', priority: 'high',
    owner: people.coo, department: 'Operations',
    deliverables: [
      { name: 'investor_deck_q1.pptx', type: 'presentation', status: 'draft' },
      { name: 'financial_summary.xlsx', type: 'spreadsheet', status: 'in-progress' },
    ],
    touchTrail: [people.opsAgent, people.coo, people.tamir],
    flowStage: 2, ceoAction: 'Approve unified cost methodology and review deck',
    primaryCTA: 'Approve Methodology',
    escalationPath: 'Ops Pipeline | Ops Agent > COO > Tamir > CEO',
    blocker: 'Revenue projection discrepancy between Tech and Ops',
  },
  {
    id: 'm9', title: 'Q2 Campaign Planning', column: 'approve-decide', priority: 'medium',
    owner: people.cmo, department: 'Marketing',
    deliverables: [
      { name: 'campaign_brief.md', type: 'document', status: 'ready' },
      { name: 'budget_proposal.xlsx', type: 'spreadsheet', status: 'ready' },
      { name: 'channel_strategy.pdf', type: 'pdf', status: 'draft' },
    ],
    touchTrail: [{ name: 'Market Intel', role: 'Intelligence', avatar: 'MI', color: 'bg-fuchsia-600' }, people.cmo, people.tamir],
    flowStage: 3, ceoAction: 'Approve campaign budget and channel strategy',
    primaryCTA: 'Approve Q2 Campaign',
    escalationPath: 'Marketing Pipeline | Market Intel > CMO > Tamir > CEO',
  },
];
