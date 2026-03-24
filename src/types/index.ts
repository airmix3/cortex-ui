export interface Person {
  name: string;
  role: string;
  avatar: string; // initials
  color: string; // tailwind bg color
}

export interface Deliverable {
  name: string;
  type: 'document' | 'spreadsheet' | 'code' | 'image' | 'video' | 'pdf' | 'presentation';
  status: 'draft' | 'ready' | 'approved' | 'in-progress';
}

export interface Mission {
  id: string;
  title: string;
  column: 'act-now' | 'approve-decide' | 'review';
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: Person;
  department: string;
  deliverables: Deliverable[];
  touchTrail: Person[];
  flowStage: number; // 0-4: Created, Agent Work, Dept Review, CEO Review, Done
  ceoAction: string;
  primaryCTA: string; // short, specific button label — e.g. "Approve GPU · $0.12/hr"
  escalationPath: string;
  attempts?: number;
  blocker?: string;
  age?: string; // e.g. "3h", "45m", "1d"
  linkedEscalationId?: string;   // cross-reference to active escalation
  linkedEscalationLevel?: 'L1' | 'L2' | 'L3' | 'L4';
}

export interface Department {
  name: string;
  head: Person;
  healthStatus: 'good' | 'warning' | 'critical';
  summary: string;
  active: number;
  blocked: number;
  spend: string;
  budget: string;
  risk: 'Low' | 'Medium' | 'High';
  topMission: string;
  topDeliverable: Deliverable;
  nextTouchpoint: string;
  reportingChain: Person[];
}

export interface ActionItem {
  id: string;
  category: 'escalation' | 'hire-request' | 'consulting' | 'ceo-mention';
  title: string;
  subtitle: string;
  urgency: 'urgent' | 'pending' | 'scheduled';
  timeAgo?: string;
}

export interface TimelineEvent {
  time: string;
  actor: string;
  action: string;
  timeAgo: string;
  department?: string;
  category?: 'escalation' | 'deliverable' | 'directive' | 'routine' | 'hire' | 'review';
  object?: string;
  result?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  type: 'executive' | 'permanent' | 'temp';
  department: string;
  reportsTo: string;
  avatar: string;
  color: string;
  status: 'active' | 'idle' | 'busy' | 'terminated';
  currentTask?: string;
  tasksCompleted: number;
  joinedAt: string;
  memoryNamespace: string;
  // ── Cross-reference fields ──
  currentMissionId?: string;
  currentMissionTitle?: string;
  linkedEscalationId?: string;
}

export interface Escalation {
  id: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  title: string;
  originatedBy: Person;
  chain: Person[];
  situation: string;
  blocker: string;
  attemptsMade: string[];
  needFromFounder: string;
  impactIfIgnored: string;
  status: 'active' | 'resolved' | 'waiting';
  priority: 'critical' | 'high' | 'medium';
  createdAt: string;
  department: string;
  taskId?: string;
  // ── Cross-reference fields ──
  linkedMissionId?: string;
  linkedMissionTitle?: string;
  linkedMissionPriority?: 'critical' | 'high' | 'medium' | 'low';
  blockedAgentIds?: string[];   // Employee.id refs
  skillGap?: string;            // e.g. "AWS Infrastructure · Cloud Ops"
  financialImpact?: string;     // e.g. "$5K delay + $0.12/hr GPU cost"
}

export interface VaultEntry {
  id: string;
  category: 'mission' | 'strategy' | 'decision' | 'policy' | 'preference' | 'knowledge';
  title: string;
  content: string;
  addedBy: string;
  approvedBy: string;
  createdAt: string;
  tags: string[];
  department?: string;
}

export interface ActivityEntry {
  time: string;
  action: string;
  type: 'task' | 'deliverable' | 'escalation' | 'communication' | 'research';
  impact: 'high' | 'medium' | 'low';
  relatedMission?: string;
}

export type SkillCategory = 'technical' | 'ai-ml' | 'analysis' | 'communication' | 'domain';
export type SkillProficiency = 'expert' | 'intermediate' | 'learning';

export interface AgentSkill {
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
  usedToday: boolean;
  isNew?: boolean; // added via corrective action
}

export interface AgentProfile {
  id: string;
  bio: string;
  skills: AgentSkill[];
  suggestedSkills?: { name: string; reason: string; category: SkillCategory }[];
  valueScore: number;
  tasksCompletedToday: number;
  deliverablesProducedToday: number;
  escalationsHandledToday: number;
  estimatedHoursSaved: number;
  costToday: string;
  costEfficiency: number;
  weeklyActivity: number[];
  weeklyValue: number[];
  todayActivity: ActivityEntry[];
}

export type InteractionType = 'send' | 'receive' | 'route' | 'escalate' | 'handoff' | 'feedback';

export interface InteractionEvent {
  id: string;
  time: string;
  from: string;
  to: string;
  type: InteractionType;
  message: string;
  artifact?: string;
  mission?: string;
  weight: number;
}

export interface CollaborationEdge {
  from: string;
  to: string;
  count: number;
  types: Record<InteractionType, number>;
  missions: string[];
}

export interface CollaborationMetrics {
  totalInteractions: number;
  busiestChannel: { from: string; to: string; count: number };
  mostConnectedAgent: { id: string; connections: number };
  bottleneck: { id: string; waitCount: number } | null;
  interactionsByType: Record<InteractionType, number>;
}

// ─── EVALUATION & DAILY SUMMARY TYPES ───

export interface AgentDailySummary {
  agentId: string;
  date: string;
  accomplishments: string[];
  metricsSnapshot: {
    valueScore: number;
    tasksCompleted: number;
    deliverables: number;
    hoursSaved: number;
    cost: string;
    costEfficiency: number;
  };
  efficiency: {
    tokensUsed: number;
    avgResponseTime: string;
    outputQuality: 'excellent' | 'good' | 'acceptable' | 'poor';
  };
  blockers: { description: string; severity: 'low' | 'medium' | 'high'; resolved: boolean }[];
  selfAssessment: { score: number; rationale: string };
  tomorrowFocus: string[];
}

export type IssueCategory = 'high-token-usage' | 'low-output-quality' | 'slow-execution' | 'cost-overrun' | 'missed-deadline';
export type CorrectiveActionType = 'add-skill' | 'add-context' | 'modify-workflow' | 'adjust-priority';

export interface CorrectiveAction {
  id: string;
  type: CorrectiveActionType;
  description: string;
  detail: string;
  appliedAt: string;
  appliedBy: string;
  agentId: string;
}

export interface AgentEvaluation {
  id: string;
  agentId: string;
  evaluatorId: string;
  date: string;
  rating: { efficiency: number; outputQuality: number; initiative: number };
  flaggedIssues: { category: IssueCategory; description: string; severity: 'minor' | 'moderate' | 'serious' }[];
  correctiveActions: CorrectiveAction[];
  disposition: 'autonomous' | 'escalated';
  escalationNote?: string;
  managerNotes: string;
}

// ─── CONTROL CENTER TYPES ───

export type TaskStatus = 'queued' | 'in-progress' | 'blocked' | 'completed';

export interface AgentTask {
  id: string;
  agentId: string;
  title: string;
  status: TaskStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'task' | 'deliverable' | 'escalation' | 'communication' | 'research';
  mission?: string;
  blocker?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface DepartmentDetail extends Department {
  description: string;
  employees: Employee[];
  recentDeliverables: (Deliverable & { creator: string; createdAt: string })[];
  memoryNamespace: string;
  activeMissions: string[];
  weeklyBudgetTrend: number[];
}
