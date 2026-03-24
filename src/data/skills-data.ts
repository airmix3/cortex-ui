// ── Types ────────────────────────────────────────────────────────────────────

export type SkillLevel = 1 | 2 | 3 | 4 | 5;
export type SkillCategory = 'creative' | 'analysis' | 'execution' | 'research' | 'communication';
export type SkillStatus = 'active' | 'rusty' | 'draft' | 'training';
export type ToolType = 'mcp' | 'cli' | 'api' | 'internal';
export type ToolStatus = 'connected' | 'disconnected' | 'requested' | 'building';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  ownerName: string;
  ownerAvatar: string;
  ownerColor: string;
  level: SkillLevel;
  xp: number;        // 0–100, progress toward next level
  missionsUsed: number;
  lastUsed?: string;
  status: SkillStatus;
  source?: 'mission-report' | 'manual' | 'tamir';
  trainCost: number; // skill points to train to next level
}

export interface OrgTool {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  category: string;
  status: ToolStatus;
  usedBy: string[];
  missionsUsed: number;
  lastUsed?: string;
  xpOnConnect: number;
  source?: 'mission-report' | 'manual';
}

// ── Level metadata ────────────────────────────────────────────────────────────

export const LEVEL_META: Record<SkillLevel, { name: string; color: string; bg: string }> = {
  1: { name: 'Novice',     color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  2: { name: 'Apprentice', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
  3: { name: 'Skilled',    color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  4: { name: 'Expert',     color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  5: { name: 'Master',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
};

export const CATEGORY_META: Record<SkillCategory, { label: string; color: string }> = {
  creative:      { label: 'Creative',      color: '#f472b6' },
  analysis:      { label: 'Analysis',      color: '#38bdf8' },
  execution:     { label: 'Execution',     color: '#34d399' },
  research:      { label: 'Research',      color: '#f59e0b' },
  communication: { label: 'Communication', color: '#a78bfa' },
};

export const TOOL_TYPE_META: Record<ToolType, { label: string; color: string; bg: string }> = {
  mcp:      { label: 'MCP',      color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  cli:      { label: 'CLI',      color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  api:      { label: 'API',      color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
  internal: { label: 'Internal', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
};

// ── Skills data ───────────────────────────────────────────────────────────────

export const initialSkills: Skill[] = [
  {
    id: 'sk-copywriting',
    name: 'Campaign Copywriting',
    description: 'Multi-touch email sequences, LinkedIn DMs, and campaign messaging tailored to ICP.',
    category: 'creative',
    ownerName: 'Maya', ownerAvatar: 'MY', ownerColor: 'bg-violet-500',
    level: 3, xp: 72, missionsUsed: 14, lastUsed: '2h ago',
    status: 'active', trainCost: 200,
  },
  {
    id: 'sk-icp-scoring',
    name: 'ICP Lead Scoring',
    description: 'Score and rank prospects against the ideal customer profile using firmographic signals.',
    category: 'analysis',
    ownerName: 'Jordan', ownerAvatar: 'JO', ownerColor: 'bg-emerald-500',
    level: 2, xp: 78, missionsUsed: 9, lastUsed: '4h ago',
    status: 'active', trainCost: 100,
  },
  {
    id: 'sk-content-strategy',
    name: 'Content Strategy',
    description: 'Build editorial calendars, pillar frameworks, and distribution plans aligned to brand voice.',
    category: 'creative',
    ownerName: 'Maya', ownerAvatar: 'MY', ownerColor: 'bg-violet-500',
    level: 3, xp: 91, missionsUsed: 18, lastUsed: '1h ago',
    status: 'active', trainCost: 200,
  },
  {
    id: 'sk-linkedin-outreach',
    name: 'LinkedIn Outreach',
    description: 'Personalized connection requests and DM sequences optimized for acceptance rate.',
    category: 'communication',
    ownerName: 'Maya', ownerAvatar: 'MY', ownerColor: 'bg-violet-500',
    level: 2, xp: 34, missionsUsed: 6, lastUsed: '3d ago',
    status: 'rusty', trainCost: 100,
  },
  {
    id: 'sk-infra-deployment',
    name: 'Infrastructure Deployment',
    description: 'Containerized deployment pipelines, GPU provisioning, and cloud resource management.',
    category: 'execution',
    ownerName: 'Infra Agent', ownerAvatar: 'I', ownerColor: 'bg-teal-500',
    level: 2, xp: 55, missionsUsed: 7, lastUsed: '1d ago',
    status: 'active', trainCost: 100,
  },
  {
    id: 'sk-budget-analysis',
    name: 'Budget Analysis',
    description: 'Track departmental spend, forecast overruns, and model cost-efficiency scenarios.',
    category: 'analysis',
    ownerName: 'Liam', ownerAvatar: 'L', ownerColor: 'bg-emerald-600',
    level: 3, xp: 40, missionsUsed: 11, lastUsed: '6h ago',
    status: 'active', trainCost: 200,
  },
  {
    id: 'sk-eeg-research',
    name: 'EEG Signal Research',
    description: 'Comparative analysis of EEG hardware specs, latency benchmarks, and clinical applicability.',
    category: 'research',
    ownerName: 'Research Agent', ownerAvatar: 'R', ownerColor: 'bg-indigo-500',
    level: 2, xp: 20, missionsUsed: 3, lastUsed: '12d ago',
    status: 'rusty', trainCost: 100,
  },
  {
    id: 'sk-competitor-intel',
    name: 'Competitor Intelligence',
    description: 'Monitor competitor positioning, pricing changes, product launches, and market signals.',
    category: 'research',
    ownerName: 'Market Intel', ownerAvatar: 'MI', ownerColor: 'bg-fuchsia-500',
    level: 2, xp: 48, missionsUsed: 5, lastUsed: '2d ago',
    status: 'active', trainCost: 100,
  },
  {
    id: 'sk-technical-docs',
    name: 'Technical Documentation',
    description: 'System architecture docs, API references, deployment guides, and engineering runbooks.',
    category: 'research',
    ownerName: 'Dev Agent', ownerAvatar: 'D', ownerColor: 'bg-cyan-500',
    level: 3, xp: 60, missionsUsed: 12, lastUsed: '5h ago',
    status: 'active', trainCost: 200,
  },
  {
    id: 'sk-ab-testing',
    name: 'A/B Testing',
    description: 'Design and analyze split tests for copy, timing, and channel variants. Read statistical significance.',
    category: 'analysis',
    ownerName: 'Maya', ownerAvatar: 'MY', ownerColor: 'bg-violet-500',
    level: 1, xp: 0, missionsUsed: 0,
    status: 'draft', source: 'mission-report', trainCost: 50,
  },
  {
    id: 'sk-pre-score-leads',
    name: 'Pre-Score Before Copy',
    description: 'Complete lead scoring before any copy is drafted — ensures messaging precision from the start.',
    category: 'execution',
    ownerName: 'Jordan', ownerAvatar: 'JO', ownerColor: 'bg-emerald-500',
    level: 1, xp: 0, missionsUsed: 0,
    status: 'draft', source: 'mission-report', trainCost: 50,
  },
];

// ── Tools data ────────────────────────────────────────────────────────────────

export const initialTools: OrgTool[] = [
  {
    id: 'tl-sales-nav',
    name: 'LinkedIn Sales Nav',
    description: 'Advanced prospect search, account mapping, and lead export from LinkedIn.',
    type: 'api', category: 'outreach',
    status: 'connected', usedBy: ['Maya', 'Jordan'],
    missionsUsed: 9, lastUsed: '4h ago', xpOnConnect: 50,
  },
  {
    id: 'tl-apollo',
    name: 'Apollo.io',
    description: 'Email address enrichment, phone lookup, and firmographic data for lead lists.',
    type: 'api', category: 'enrichment',
    status: 'connected', usedBy: ['Jordan'],
    missionsUsed: 7, lastUsed: '4h ago', xpOnConnect: 50,
  },
  {
    id: 'tl-instantly',
    name: 'Instantly',
    description: 'High-deliverability email sequencing, inbox rotation, and open rate tracking.',
    type: 'mcp', category: 'outreach',
    status: 'connected', usedBy: ['Maya'],
    missionsUsed: 6, lastUsed: '1d ago', xpOnConnect: 75,
  },
  {
    id: 'tl-lemlist',
    name: 'Lemlist',
    description: 'LinkedIn DM automation with personalized image/video sequences.',
    type: 'mcp', category: 'outreach',
    status: 'connected', usedBy: ['Maya'],
    missionsUsed: 4, lastUsed: '1d ago', xpOnConnect: 75,
  },
  {
    id: 'tl-github',
    name: 'GitHub CLI',
    description: 'Repo management, PR creation, branch operations, and CI/CD triggers from terminal.',
    type: 'cli', category: 'infrastructure',
    status: 'connected', usedBy: ['Dev Agent', 'Infra Agent'],
    missionsUsed: 14, lastUsed: '2h ago', xpOnConnect: 60,
  },
  {
    id: 'tl-aws-bedrock',
    name: 'AWS Bedrock',
    description: 'Primary LLM inference via Claude 3.5 Sonnet. All AI reasoning routes through Bedrock.',
    type: 'api', category: 'ai',
    status: 'connected', usedBy: ['Dev Agent'],
    missionsUsed: 22, lastUsed: '30m ago', xpOnConnect: 100,
  },
  {
    id: 'tl-clay',
    name: 'Clay',
    description: 'Orchestrate enrichment waterfalls — combine 50+ data sources in one automated pipeline.',
    type: 'mcp', category: 'enrichment',
    status: 'requested', usedBy: [],
    missionsUsed: 0, xpOnConnect: 100,
    source: 'mission-report',
  },
  {
    id: 'tl-slack',
    name: 'Slack',
    description: 'Team messaging, channel notifications, and async coordination across departments.',
    type: 'api', category: 'communication',
    status: 'disconnected', usedBy: [],
    missionsUsed: 0, xpOnConnect: 40,
  },
  {
    id: 'tl-notion',
    name: 'Notion',
    description: 'Persistent knowledge base, SOPs, and cross-department wiki management.',
    type: 'api', category: 'communication',
    status: 'disconnected', usedBy: [],
    missionsUsed: 0, xpOnConnect: 40,
  },
  {
    id: 'tl-gmail',
    name: 'Gmail',
    description: 'Direct email send for personal outreach. Fallback channel when sequences are not appropriate.',
    type: 'internal', category: 'communication',
    status: 'connected', usedBy: ['Maya'],
    missionsUsed: 3, lastUsed: '3d ago', xpOnConnect: 20,
  },
];
