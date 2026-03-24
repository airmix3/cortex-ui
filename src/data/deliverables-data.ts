// ─── TYPES ───────────────────────────────────────────────────────────────────

export type DeliverableType =
  | 'document'
  | 'spreadsheet'
  | 'code'
  | 'pdf'
  | 'presentation'
  | 'image'
  | 'video';

export type DeliverableStatus = 'draft' | 'ready' | 'approved' | 'archived';

export interface DeliverableItem {
  id: string;
  name: string;
  type: DeliverableType;
  status: DeliverableStatus;
  missionId?: string;
  missionTitle?: string;
  agentName: string;
  agentAvatar: string;
  agentColor: string;
  department: string;
  createdAt: string;       // ISO
  size: string;            // display string e.g. "2.4 MB"
  preview: string;         // text excerpt or description
  stats?: string[];        // key facts e.g. ["89 contacts", "5-touch sequence"]
  tags: string[];
  pushedToVault?: boolean;
  revisionNote?: string;
  revisionRequestedAt?: string;  // ISO
}

// ─── FILE TYPE CONFIG ────────────────────────────────────────────────────────

export const FILE_TYPE_CONFIG: Record<DeliverableType, { color: string; bg: string; ext: string; label: string }> = {
  document:     { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',   ext: 'DOCX', label: 'Document'     },
  spreadsheet:  { color: '#34d399', bg: 'rgba(52,211,153,0.1)',   ext: 'XLSX', label: 'Spreadsheet'  },
  code:         { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   ext: 'CODE', label: 'Code'         },
  pdf:          { color: '#f87171', bg: 'rgba(248,113,113,0.1)',  ext: 'PDF',  label: 'PDF'          },
  presentation: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', ext: 'PPTX', label: 'Presentation' },
  image:        { color: '#f472b6', bg: 'rgba(244,114,182,0.1)', ext: 'PNG',  label: 'Image'        },
  video:        { color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  ext: 'MP4',  label: 'Video'        },
};

export const STATUS_CONFIG: Record<DeliverableStatus, { label: string; color: string; bg: string; border: string }> = {
  draft:    { label: 'Draft',     color: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)' },
  ready:    { label: 'Ready',     color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  approved: { label: 'Approved',  color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
  archived: { label: 'Archived',  color: '#334155', bg: 'rgba(51,65,85,0.06)',    border: 'rgba(51,65,85,0.15)'   },
};

// ─── MISSION DATA ─────────────────────────────────────────────────────────────

export const DEPT_COLORS: Record<string, string> = {
  'Marketing':      '#8b5cf6',
  'Tech':           '#0ea5e9',
  'Finance':        '#6366f1',
  'Chief of Staff': '#f59e0b',
  'Research':       '#34d399',
};

export interface DeliverableMission {
  id: string;
  title: string;
  department: string;
  color: string;
  description: string;
}

export const MOCK_MISSIONS: DeliverableMission[] = [
  {
    id: 'm3',
    title: 'Content Strategy Plans',
    department: 'Marketing',
    color: '#8b5cf6',
    description: 'Q2 content strategy, editorial calendar, outreach copy, and campaign results.',
  },
  {
    id: 'm1',
    title: 'AWS Capacity Blocker',
    department: 'Tech',
    color: '#0ea5e9',
    description: 'GPU provisioning analysis and config to unblock ZUNA staging deployment.',
  },
  {
    id: 'm5',
    title: 'EEG Model Optimization',
    department: 'Tech',
    color: '#0ea5e9',
    description: 'Transformer model training, benchmarks, and optimization pipeline for clinical threshold.',
  },
  {
    id: 'm4',
    title: 'ZUNA Deployment',
    department: 'Tech',
    color: '#0ea5e9',
    description: 'Full deployment checklist and phase tracking for ZUNA v2.1 rollout.',
  },
  {
    id: 'm2',
    title: 'Research Analyst Hire',
    department: 'Chief of Staff',
    color: '#f59e0b',
    description: 'Candidate brief and ranking for the Research Analyst role supporting EEG work.',
  },
  {
    id: 'standalone',
    title: 'General / No Mission',
    department: 'Finance',
    color: '#6366f1',
    description: 'Documents produced outside of a specific mission.',
  },
];

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const now = Date.now();
const h  = (n: number) => new Date(now - n * 3600000).toISOString();
const d  = (n: number) => new Date(now - n * 86400000).toISOString();

export const MOCK_DELIVERABLES: DeliverableItem[] = [
  {
    id: 'del-1',
    name: 'campaign_copy.pdf',
    type: 'pdf',
    status: 'ready',
    missionId: 'm3',
    missionTitle: 'Content Strategy Plans',
    agentName: 'Maya',
    agentAvatar: 'MY',
    agentColor: '#8b5cf6',
    department: 'Marketing',
    createdAt: h(2),
    size: '1.2 MB',
    preview: '5-touch email sequence drafted with AI agency positioning. 3 LinkedIn DM templates written for cold outreach. Each message leads with a specific pain point — build time, reliability, or vendor lock-in — before introducing the agency.\n\nSubject line variants A/B tested across urgency-led and proof-led angles. Proof-led outperformed in initial testing with technical decision-makers.',
    stats: ['5-email sequence', '3 LinkedIn templates', 'A/B subject lines', '3 pain-point angles'],
    tags: ['outreach', 'copywriting', 'q2-campaign'],
  },
  {
    id: 'del-2',
    name: 'lead_list_scored.csv',
    type: 'spreadsheet',
    status: 'approved',
    missionId: 'm3',
    missionTitle: 'Content Strategy Plans',
    agentName: 'Jordan',
    agentAvatar: 'JO',
    agentColor: '#10b981',
    department: 'Marketing',
    createdAt: h(3),
    size: '840 KB',
    preview: '247 contacts sourced from LinkedIn Sales Nav and enriched with firmographic data. Scored against ICP criteria: company size, tech stack, AI initiative signals. Top 89 contacts scored ≥80 and are flagged for priority outreach.\n\nFirmographic fields: company name, headcount, industry, funding stage, tech stack (detected), decision-maker title.',
    stats: ['247 contacts total', '89 high-fit (≥80)', 'Series A–B SaaS', 'Enriched + scored'],
    tags: ['leads', 'iq-scoring', 'q2-campaign'],
  },
  {
    id: 'del-3',
    name: 'candidate_brief_priya_k.docx',
    type: 'document',
    status: 'ready',
    missionId: 'm2',
    missionTitle: 'Research Analyst Hire',
    agentName: 'Tamir',
    agentAvatar: 'T',
    agentColor: '#f59e0b',
    department: 'Chief of Staff',
    createdAt: h(5),
    size: '420 KB',
    preview: 'Priya K. — Research Analyst candidate brief. 6 years Python, EEG domain expert, published in 3 peer-reviewed journals. CTO ranking: #1 of 4 candidates reviewed.\n\nCompensation: $145K base, within Research band. Start date availability: 3 weeks notice. Recruiter deadline: tonight 6pm or slot reopens.',
    stats: ['#1 CTO ranking', '$145K base', '6y Python', 'EEG expert'],
    tags: ['hiring', 'research', 'candidate'],
  },
  {
    id: 'del-4',
    name: 'model_accuracy_report.pdf',
    type: 'pdf',
    status: 'ready',
    missionId: 'm5',
    missionTitle: 'EEG Model Optimization',
    agentName: 'Alex',
    agentAvatar: 'AX',
    agentColor: '#0ea5e9',
    department: 'Tech',
    createdAt: h(6),
    size: '3.1 MB',
    preview: 'EEG classification model v2.3 accuracy report. Benchmark across 4 test datasets. Mean accuracy improved from 78.2% to 86.7% after hyperparameter tuning and additional training data.\n\nKey improvement: switching from standard LSTM to transformer architecture. False positive rate reduced from 12.4% to 6.1%. Model now meets the clinical threshold for deployment consideration.',
    stats: ['86.7% accuracy', '+8.5pp improvement', '6.1% FPR', 'Clinical threshold met'],
    tags: ['eeg', 'ml', 'model-performance'],
  },
  {
    id: 'del-5',
    name: 'benchmark_results.xlsx',
    type: 'spreadsheet',
    status: 'approved',
    missionId: 'm5',
    missionTitle: 'EEG Model Optimization',
    agentName: 'Alex',
    agentAvatar: 'AX',
    agentColor: '#0ea5e9',
    department: 'Tech',
    createdAt: h(8),
    size: '1.8 MB',
    preview: 'Full benchmark results across 4 EEG datasets (BCI Competition II-IV, PhysioNet). Each model variant tested with 5-fold cross-validation. Results include accuracy, precision, recall, F1, and inference time per sample.\n\nBaseline LSTM, CNN-LSTM hybrid, and Transformer variants compared. Transformer achieves best accuracy/speed tradeoff at 43ms average inference.',
    stats: ['4 datasets', '3 model variants', '5-fold CV', '43ms inference'],
    tags: ['eeg', 'benchmarks', 'ml'],
  },
  {
    id: 'del-6',
    name: 'optimization_pipeline.py',
    type: 'code',
    status: 'approved',
    missionId: 'm5',
    missionTitle: 'EEG Model Optimization',
    agentName: 'Alex',
    agentAvatar: 'AX',
    agentColor: '#0ea5e9',
    department: 'Tech',
    createdAt: d(1),
    size: '64 KB',
    preview: 'Automated hyperparameter optimization pipeline using Optuna. Runs 200-trial Bayesian search across learning rate, batch size, dropout, and architecture depth. Integrates with WandB for experiment tracking.\n\n# Usage:\n# python optimize.py --model transformer --trials 200 --gpu 0\n\nOutputs: best_params.json, training_curves.png, model_checkpoint.pt',
    stats: ['200-trial Bayesian search', 'Optuna + WandB', 'GPU-accelerated', 'Auto-checkpoint'],
    tags: ['code', 'ml-ops', 'eeg'],
  },
  {
    id: 'del-7',
    name: 'gpu_allocation_request.yaml',
    type: 'code',
    status: 'approved',
    missionId: 'm1',
    missionTitle: 'AWS Capacity Blocker',
    agentName: 'Alex',
    agentAvatar: 'AX',
    agentColor: '#0ea5e9',
    department: 'Tech',
    createdAt: h(12),
    size: '8 KB',
    preview: 'AWS EC2 GPU allocation config for ZUNA deployment. Specifies g4dn.xlarge in us-west-2, spot pricing with on-demand fallback. IAM role: ec2-gpu-inference. Auto-scaling group min:1 max:4.\n\n# CEO approved: +$0.12/hr\n# Provisioned: 2025-03-23 10:27am\n# Status: Running',
    stats: ['g4dn.xlarge', 'us-west-2', '+$0.12/hr', 'CEO approved'],
    tags: ['infra', 'aws', 'gpu'],
  },
  {
    id: 'del-8',
    name: 'q2_content_strategy.pdf',
    type: 'pdf',
    status: 'ready',
    missionId: 'm3',
    missionTitle: 'Content Strategy Plans',
    agentName: 'Maya',
    agentAvatar: 'MY',
    agentColor: '#8b5cf6',
    department: 'Marketing',
    createdAt: d(2),
    size: '2.4 MB',
    preview: 'Q2 content strategy — 3-pillar framework: (1) Thought leadership for technical founders, (2) Case study series on AI agency deployments, (3) Product comparison content targeting mid-market migration.\n\nEditorial calendar: 48 posts mapped across 12 weeks. Publishing cadence: 4 posts/week across LinkedIn, newsletter, and blog. Brand guidelines v3 integration pending final sign-off.',
    stats: ['3 pillars', '48 posts', '12-week calendar', '4 posts/week'],
    tags: ['strategy', 'content', 'q2'],
  },
  {
    id: 'del-9',
    name: 'editorial_calendar_q2.xlsx',
    type: 'spreadsheet',
    status: 'draft',
    missionId: 'm3',
    missionTitle: 'Content Strategy Plans',
    agentName: 'Maya',
    agentAvatar: 'MY',
    agentColor: '#8b5cf6',
    department: 'Marketing',
    createdAt: d(2),
    size: '560 KB',
    preview: 'Q2 editorial calendar draft. 48 content pieces mapped by week, channel, format, and owner. Columns: Week, Title, Pillar, Channel, Format, Owner, Status, Publish Date.\n\nCurrently draft — brand guidelines v3 needed before dates are locked. Weeks 1-4 are confirmed, weeks 5-12 are placeholder pending approval.',
    stats: ['48 pieces', 'Weeks 1-12', '3 channels', 'Brand guidelines pending'],
    tags: ['content', 'planning', 'draft'],
  },
  {
    id: 'del-10',
    name: 'investor_deck_v3.pptx',
    type: 'presentation',
    status: 'draft',
    missionId: 'standalone',
    missionTitle: 'General / No Mission',
    agentName: 'Liam',
    agentAvatar: 'LI',
    agentColor: '#6366f1',
    department: 'Finance',
    createdAt: h(1),
    size: '8.7 MB',
    preview: 'Series A investor deck v3. 18 slides. Revenue projection methodology discrepancy flagged on slide 12: Tech shows $2.1M ARR by Q4, Ops model shows $1.8M. 15% gap needs reconciliation before Liam\'s 11am call.\n\nDesign is finalized. Data accuracy pending CEO alignment on unified projection methodology.',
    stats: ['18 slides', '$2.1M vs $1.8M gap', '11am deadline', 'Design finalized'],
    tags: ['investor', 'fundraising', 'urgent'],
  },
  {
    id: 'del-11',
    name: 'capacity_analysis_report.pdf',
    type: 'pdf',
    status: 'approved',
    missionId: 'm1',
    missionTitle: 'AWS Capacity Blocker',
    agentName: 'Alex',
    agentAvatar: 'AX',
    agentColor: '#0ea5e9',
    department: 'Tech',
    createdAt: h(14),
    size: '1.6 MB',
    preview: 'AWS capacity analysis across 3 regions (us-east-1, us-west-2, eu-west-1). GPU instance availability, pricing, and latency comparison. Recommendation: us-west-2 g4dn.xlarge at $0.526/hr on-demand, $0.158/hr spot.\n\nConclusion: Capacity is available immediately in us-west-2. On-demand recommended for initial deployment to avoid spot interruptions during ZUNA staging.',
    stats: ['3 regions analyzed', 'us-west-2 recommended', '$0.158/hr spot', 'Immediate availability'],
    tags: ['infra', 'aws', 'analysis'],
  },
  {
    id: 'del-12',
    name: 'zuna_deployment_checklist.md',
    type: 'document',
    status: 'ready',
    missionId: 'm4',
    missionTitle: 'ZUNA Deployment',
    agentName: 'Alex',
    agentAvatar: 'AX',
    agentColor: '#0ea5e9',
    department: 'Tech',
    createdAt: h(4),
    size: '28 KB',
    preview: 'ZUNA v2.1 deployment checklist. 47 items across 6 phases: (1) Pre-deployment validation, (2) GPU provisioning, (3) Staging environment, (4) Integration tests, (5) Load testing, (6) Production cut-over.\n\nCurrent status: Phase 1 complete (47/47 unit tests passing). Phase 2 unblocked after GPU approval. Phase 3 ETA: 48 hours.',
    stats: ['47 checklist items', '6 phases', 'Phase 2 unblocked', '48h to staging'],
    tags: ['deployment', 'zuna', 'checklist'],
  },
  {
    id: 'del-13',
    name: 'outreach_sequence_report.pdf',
    type: 'pdf',
    status: 'approved',
    missionId: 'm3',
    missionTitle: 'Content Strategy Plans',
    agentName: 'Maya',
    agentAvatar: 'MY',
    agentColor: '#8b5cf6',
    department: 'Marketing',
    createdAt: d(3),
    size: '1.1 MB',
    preview: 'Week 1 outreach sequence results. 89 contacts reached. Open rate: 41% (vs 35% target). Reply rate: 8.2%. 7 positive replies, 3 meetings booked. A/B test: proof-led subject line outperformed urgency-led by 23%.\n\nTop performing segment: Heads of AI at Series B companies (open rate 52%). Worst: VP Engineering at Series A (29%). Recommendation: narrow ICP to Series B+ in next wave.',
    stats: ['41% open rate', '8.2% reply rate', '3 meetings booked', 'Proof-led won +23%'],
    tags: ['outreach', 'results', 'campaign'],
  },
  {
    id: 'del-14',
    name: 'eeg_study_scope.pdf',
    type: 'pdf',
    status: 'draft',
    missionId: 'm5',
    missionTitle: 'EEG Model Optimization',
    agentName: 'Tamir',
    agentAvatar: 'T',
    agentColor: '#f59e0b',
    department: 'Chief of Staff',
    createdAt: h(10),
    size: '980 KB',
    preview: 'EEG clinical study scope of work — draft. Defines parameters for a 6-month pilot study to validate the optimized model in clinical settings. 3 hospital partners identified (pending NDA).\n\nNote: This is a working draft. The research analyst role (pending hire) would own this document going forward. Do not share externally until finalized.',
    stats: ['6-month pilot', '3 hospital partners', 'NDAs pending', 'Hire-dependent'],
    tags: ['research', 'clinical', 'draft'],
  },
  {
    id: 'del-15',
    name: 'q2_budget_variance.xlsx',
    type: 'spreadsheet',
    status: 'ready',
    missionId: 'standalone',
    missionTitle: 'General / No Mission',
    agentName: 'Liam',
    agentAvatar: 'LI',
    agentColor: '#6366f1',
    department: 'Finance',
    createdAt: d(1),
    size: '710 KB',
    preview: 'Q2 budget vs. actuals through March. Tech: $1.5K of $4K (38% — flagged medium risk, GPU + temp hire overlap). Marketing: $2.2K of $5K (44% — on track). Operations: $0.8K of $3K (27% — ahead of plan).\n\nForecast: Tech likely to hit $3.2K by EOQ if GPU runs through June. Marketing pacing for $4.6K.',
    stats: ['3 depts reviewed', 'Tech: medium risk', 'Marketing: on track', 'Ops: ahead of plan'],
    tags: ['finance', 'budget', 'q2'],
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const DEPARTMENTS = ['All', 'Marketing', 'Tech', 'Finance', 'Chief of Staff', 'Research'];
export const STATUS_FILTERS: (DeliverableStatus | 'all')[] = ['all', 'ready', 'draft', 'approved', 'archived'];
