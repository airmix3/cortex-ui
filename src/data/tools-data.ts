// ─── TYPES ───────────────────────────────────────────────────────────────────

export type ToolCategory =
  | 'communication'
  | 'productivity'
  | 'browser'
  | 'analytics'
  | 'storage'
  | 'development'
  | 'crm'
  | 'finance'
  | 'outreach';

export type ToolStatus = 'connected' | 'available' | 'coming-soon';
export type AuthType = 'oauth' | 'api-key' | 'webhook';

export interface Tool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  color: string;
  initials: string;
  status: ToolStatus;
  permissions: string[];
  connectedAt?: string;
  usedBy: string[];          // agent names
  authType: AuthType;
  provider?: string;         // e.g. "Google", "Atlassian"
}

export type ToolChatMessageType =
  | 'text'
  | 'auth-card'
  | 'connecting'
  | 'connected-confirm'
  | 'tool-summary';

export interface ToolChatMessage {
  id: string;
  sender: 'tamir' | 'ceo';
  content: string;
  timestamp: string;
  contentType: ToolChatMessageType;
  toolId?: string;           // for auth-card / connected-confirm
  authConnecting?: boolean;  // true while simulating OAuth
}

// ─── TOOL CATALOG ────────────────────────────────────────────────────────────

export const TOOLS: Tool[] = [
  // ── Pre-connected (demo) ──────────────────────────────────────────────────
  {
    id: 'gmail',
    name: 'Gmail',
    tagline: 'Read, send, and manage email',
    description: 'Tamir and your agents can read your inbox, draft replies, send emails, search message history, and manage labels on your behalf.',
    category: 'communication',
    color: '#ea4335',
    initials: 'Gm',
    status: 'connected',
    connectedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    permissions: [
      'Read all emails',
      'Send emails on your behalf',
      'Search and label messages',
      'Access attachment metadata',
    ],
    usedBy: ['Tamir', 'Maya', 'Jordan'],
    authType: 'oauth',
    provider: 'Google',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    tagline: 'Read and manage your schedule',
    description: 'Agents can read upcoming events, schedule meetings, block time for deep work, and surface prep notes before important calls.',
    category: 'productivity',
    color: '#1a73e8',
    initials: 'GC',
    status: 'connected',
    connectedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    permissions: [
      'Read all calendar events',
      'Create and edit events',
      'Manage attendees',
      'Access meeting links',
    ],
    usedBy: ['Tamir'],
    authType: 'oauth',
    provider: 'Google',
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    tagline: 'Browser automation and web access',
    description: 'Gives agents the ability to browse the web, extract information from pages, fill forms, and run research tasks directly in your browser.',
    category: 'browser',
    color: '#fbbc04',
    initials: 'Ch',
    status: 'connected',
    connectedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    permissions: [
      'Open and navigate URLs',
      'Read page content',
      'Fill and submit forms',
      'Take screenshots',
    ],
    usedBy: ['Tamir', 'Jordan'],
    authType: 'webhook',
    provider: 'Google',
  },

  // ── Available ─────────────────────────────────────────────────────────────
  {
    id: 'slack',
    name: 'Slack',
    tagline: 'Read and send Slack messages',
    description: 'Tamir can monitor channels, surface key messages, reply on your behalf, and send notifications to specific people or channels.',
    category: 'communication',
    color: '#4a154b',
    initials: 'Sl',
    status: 'available',
    permissions: [
      'Read messages in channels you\'re in',
      'Send messages as you',
      'Read DMs',
      'Post to channels',
    ],
    usedBy: [],
    authType: 'oauth',
    provider: 'Slack',
  },
  {
    id: 'notion',
    name: 'Notion',
    tagline: 'Read and write to your workspace',
    description: 'Agents can read pages, create documents, update databases, and push deliverables directly into your Notion workspace.',
    category: 'productivity',
    color: '#000000',
    initials: 'No',
    status: 'available',
    permissions: [
      'Read all pages and databases',
      'Create and edit pages',
      'Update database entries',
      'Search workspace content',
    ],
    usedBy: [],
    authType: 'oauth',
    provider: 'Notion',
  },
  {
    id: 'linear',
    name: 'Linear',
    tagline: 'Issue tracking and project management',
    description: 'Agents can create issues, update status, assign work, and track engineering progress without leaving the command center.',
    category: 'development',
    color: '#5e6ad2',
    initials: 'Li',
    status: 'available',
    permissions: [
      'Read all issues and projects',
      'Create and update issues',
      'Manage cycles and roadmaps',
    ],
    usedBy: [],
    authType: 'api-key',
    provider: 'Linear',
  },
  {
    id: 'github',
    name: 'GitHub',
    tagline: 'Code and repository management',
    description: 'Review PRs, check CI status, read code, create issues, and track engineering progress across all repositories.',
    category: 'development',
    color: '#24292e',
    initials: 'Gh',
    status: 'available',
    permissions: [
      'Read repositories and commits',
      'Create and comment on issues/PRs',
      'Read CI/CD status',
      'Access org metadata',
    ],
    usedBy: [],
    authType: 'oauth',
    provider: 'GitHub',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    tagline: 'Revenue and payment insights',
    description: 'Tamir can surface revenue metrics, MRR, churn, and recent payment events so you always have financial context.',
    category: 'finance',
    color: '#635bff',
    initials: 'St',
    status: 'available',
    permissions: [
      'Read payments and subscriptions',
      'View revenue analytics',
      'Read customer data (no charges)',
    ],
    usedBy: [],
    authType: 'api-key',
    provider: 'Stripe',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    tagline: 'CRM and pipeline visibility',
    description: 'Agents can track deals, update contact records, pull pipeline reports, and surface sales context in any conversation.',
    category: 'crm',
    color: '#ff7a59',
    initials: 'Hs',
    status: 'available',
    permissions: [
      'Read contacts and companies',
      'Read and update deals',
      'Log activities',
      'Pull reports',
    ],
    usedBy: [],
    authType: 'oauth',
    provider: 'HubSpot',
  },
  {
    id: 'apollo',
    name: 'Apollo.io',
    tagline: 'Lead sourcing and enrichment',
    description: 'Jordan can source leads, enrich contact data with firmographics, and score them against your ICP — no manual export needed.',
    category: 'outreach',
    color: '#FF5733',
    initials: 'Ap',
    status: 'available',
    permissions: [
      'Search and export contacts',
      'Enrich company and person data',
      'Create sequences',
    ],
    usedBy: [],
    authType: 'api-key',
    provider: 'Apollo',
  },
  {
    id: 'instantly',
    name: 'Instantly.ai',
    tagline: 'Email sequence and outreach automation',
    description: 'Maya can launch outbound email sequences, monitor open and reply rates, and A/B test subject lines without leaving the command center.',
    category: 'outreach',
    color: '#6c47ff',
    initials: 'In',
    status: 'available',
    permissions: [
      'Create and launch sequences',
      'Read campaign analytics',
      'Manage leads in campaigns',
    ],
    usedBy: [],
    authType: 'api-key',
    provider: 'Instantly',
  },
  {
    id: 'figma',
    name: 'Figma',
    tagline: 'Design file access and inspection',
    description: 'Agents can read design files, extract assets, inspect component specs, and surface design context during product discussions.',
    category: 'productivity',
    color: '#f24e1e',
    initials: 'Fi',
    status: 'available',
    permissions: [
      'Read design files and components',
      'Export assets',
      'Read comments',
    ],
    usedBy: [],
    authType: 'oauth',
    provider: 'Figma',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    tagline: 'Meeting scheduling and recording access',
    description: 'Create meeting links, schedule calls, and let Tamir surface transcripts from past Zoom meetings for context.',
    category: 'communication',
    color: '#2d8cff',
    initials: 'Zo',
    status: 'available',
    permissions: [
      'Create and manage meetings',
      'Read meeting transcripts',
      'Access recordings',
    ],
    usedBy: [],
    authType: 'oauth',
    provider: 'Zoom',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    tagline: 'Read and update bases and tables',
    description: 'Agents can read, filter, and write records in any Airtable base — useful for tracking campaigns, hires, and structured datasets.',
    category: 'productivity',
    color: '#18bfff',
    initials: 'At',
    status: 'available',
    permissions: [
      'Read all bases and tables',
      'Create and update records',
      'Run automations',
    ],
    usedBy: [],
    authType: 'api-key',
    provider: 'Airtable',
  },
  {
    id: 'aws',
    name: 'AWS',
    tagline: 'Cloud infrastructure visibility',
    description: 'Alex can monitor EC2, manage S3 buckets, track GPU usage and costs, and provision resources without leaving the platform.',
    category: 'development',
    color: '#ff9900',
    initials: 'AW',
    status: 'coming-soon',
    permissions: [
      'Read EC2 and resource status',
      'View cost and usage reports',
      'Manage IAM (limited)',
    ],
    usedBy: [],
    authType: 'api-key',
    provider: 'Amazon',
  },
];

// ─── CATEGORY METADATA ───────────────────────────────────────────────────────

export const CATEGORY_META: Record<ToolCategory, { label: string; color: string }> = {
  communication: { label: 'Communication', color: '#38bdf8' },
  productivity:  { label: 'Productivity',  color: '#a78bfa' },
  browser:       { label: 'Browser',       color: '#fbbf24' },
  analytics:     { label: 'Analytics',     color: '#34d399' },
  storage:       { label: 'Storage',       color: '#94a3b8' },
  development:   { label: 'Development',   color: '#f59e0b' },
  crm:           { label: 'CRM',           color: '#fb923c' },
  finance:       { label: 'Finance',       color: '#4ade80' },
  outreach:      { label: 'Outreach',      color: '#c084fc' },
};

// ─── TAMIR CHAT SIMULATOR ────────────────────────────────────────────────────

export function detectToolIntent(input: string): { type: 'connect'; toolId: string } | { type: 'disconnect'; toolId: string } | { type: 'list' } | { type: 'usage'; toolId: string } | null {
  const lower = input.toLowerCase();

  const toolMatcher: Record<string, string> = {
    'gmail': 'gmail', 'google mail': 'gmail', 'email': 'gmail',
    'google calendar': 'google-calendar', 'calendar': 'google-calendar', 'gcal': 'google-calendar',
    'chrome': 'chrome', 'browser': 'chrome', 'google chrome': 'chrome',
    'slack': 'slack',
    'notion': 'notion',
    'linear': 'linear',
    'github': 'github', 'git hub': 'github',
    'stripe': 'stripe',
    'hubspot': 'hubspot', 'hub spot': 'hubspot',
    'apollo': 'apollo', 'apollo.io': 'apollo',
    'instantly': 'instantly', 'instantly.ai': 'instantly',
    'figma': 'figma',
    'zoom': 'zoom',
    'airtable': 'airtable', 'air table': 'airtable',
    'aws': 'aws', 'amazon': 'aws',
  };

  const isConnect = lower.includes('connect') || lower.includes('add') || lower.includes('install') || lower.includes('integrate') || lower.includes('set up') || lower.includes('setup') || lower.includes('enable');
  const isDisconnect = lower.includes('disconnect') || lower.includes('remove') || lower.includes('uninstall') || lower.includes('disable');
  const isList = lower.includes('what tools') || lower.includes('which tools') || lower.includes('list tools') || lower.includes('show tools') || lower.includes('connected tools') || lower.includes('what\'s connected');

  if (isList) return { type: 'list' };

  for (const [keyword, toolId] of Object.entries(toolMatcher)) {
    if (lower.includes(keyword)) {
      if (isDisconnect) return { type: 'disconnect', toolId };
      if (isConnect) return { type: 'connect', toolId };
      if (lower.includes('who') || lower.includes('which agent') || lower.includes('using')) return { type: 'usage', toolId };
    }
  }

  return null;
}

export const SEED_TOOL_MESSAGES: ToolChatMessage[] = [
  {
    id: 'init-1',
    sender: 'tamir',
    content: "I manage all your tool connections. You can ask me to connect new tools, disconnect ones you don\'t need, or tell me which agents should have access to what.\n\nRight now you have **3 tools connected**: Gmail, Google Calendar, and Chrome.",
    timestamp: new Date().toISOString(),
    contentType: 'text',
  },
];

export const TOOL_SUGGESTED_PROMPTS = [
  'Connect my Gmail',
  'What tools are currently connected?',
  'Connect Slack to the workspace',
  'Which agents use Gmail?',
];
