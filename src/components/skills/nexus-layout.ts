// ── Pure math for the Skill Nexus constellation ──────────────────────────────

import type { Skill, OrgTool, SkillCategory } from '@/data/skills-data';

export const SVG_W = 900;
export const SVG_H = 550;
export const CX = SVG_W / 2;   // 450
export const CY = SVG_H / 2;   // 275

export const CORE_RADIUS = 38;

// 5 branches at 72° intervals, starting from top (-90°)
const BRANCH_ANGLES: Record<SkillCategory, number> = {
  creative:      -Math.PI / 2,                        // top (12 o'clock)
  analysis:      -Math.PI / 2 + (2 * Math.PI / 5),    // ~54° CW
  execution:     -Math.PI / 2 + 2 * (2 * Math.PI / 5), // ~126° CW
  research:      -Math.PI / 2 + 3 * (2 * Math.PI / 5), // ~198° CW
  communication: -Math.PI / 2 + 4 * (2 * Math.PI / 5), // ~270° CW
};

const BRANCH_MIN_R = 90;   // where novice nodes sit
const BRANCH_MAX_R = 230;  // where master nodes sit
const BRANCH_TIP_R = 260;  // where labels sit

export interface SkillNodePosition {
  id: string;
  x: number;
  y: number;
  angle: number;
}

/** Compute (x, y) for each skill node on its category branch */
export function getSkillPositions(skills: Skill[]): SkillNodePosition[] {
  // Group by category
  const grouped: Record<SkillCategory, Skill[]> = {
    creative: [], analysis: [], execution: [], research: [], communication: [],
  };
  skills.forEach((s) => {
    grouped[s.category].push(s);
  });

  const positions: SkillNodePosition[] = [];

  Object.entries(grouped).forEach(([cat, catSkills]) => {
    const baseAngle = BRANCH_ANGLES[cat as SkillCategory];
    // Sort by level (lower first, closer to center)
    const sorted = [...catSkills].sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));

    sorted.forEach((skill, i) => {
      // Radial distance: spread evenly along the branch based on index
      // This prevents nodes at the same level from stacking
      const t = sorted.length === 1 ? 0.5 : i / (sorted.length - 1);
      const r = BRANCH_MIN_R + t * (BRANCH_MAX_R - BRANCH_MIN_R);

      // Angular spread: fan out from center of branch
      const spreadAngle = 0.18; // wider spread
      const offset = sorted.length > 1
        ? (i - (sorted.length - 1) / 2) * spreadAngle
        : 0;
      const angle = baseAngle + offset;

      positions.push({
        id: skill.id,
        x: CX + Math.cos(angle) * r,
        y: CY + Math.sin(angle) * r,
        angle,
      });
    });
  });

  return positions;
}

/** Get the branch line endpoint for a category */
export function getBranchEndpoint(category: SkillCategory) {
  const angle = BRANCH_ANGLES[category];
  return {
    x: CX + Math.cos(angle) * BRANCH_MAX_R,
    y: CY + Math.sin(angle) * BRANCH_MAX_R,
    tipX: CX + Math.cos(angle) * BRANCH_TIP_R,
    tipY: CY + Math.sin(angle) * BRANCH_TIP_R,
    angle,
  };
}

/** Get all 5 branch endpoints */
export function getAllBranches(): { category: SkillCategory; x: number; y: number; tipX: number; tipY: number; angle: number }[] {
  return (Object.keys(BRANCH_ANGLES) as SkillCategory[]).map((cat) => ({
    category: cat,
    ...getBranchEndpoint(cat),
  }));
}

/** SVG path from center to branch endpoint */
export function getBranchPath(category: SkillCategory): string {
  const { x, y } = getBranchEndpoint(category);
  return `M ${CX} ${CY} L ${x} ${y}`;
}

/** Capability score computation */
export function computeCapabilityScore(skills: Skill[], tools: OrgTool[]): number {
  const skillScore = skills
    .filter((s) => s.status !== 'draft')
    .reduce((sum, s) => sum + s.level * 20 + s.xp * 0.1, 0);
  const toolScore = tools
    .filter((t) => t.status === 'connected')
    .reduce((sum, t) => sum + t.xpOnConnect, 0);
  const raw = skillScore / 10 + toolScore / 20;
  return Math.min(100, Math.round(raw));
}

/** Average skill level per category */
export function getCategoryStrength(skills: Skill[]): Record<SkillCategory, number> {
  const grouped: Record<SkillCategory, number[]> = {
    creative: [], analysis: [], execution: [], research: [], communication: [],
  };
  skills.filter((s) => s.status !== 'draft').forEach((s) => {
    grouped[s.category].push(s.level);
  });
  const result = {} as Record<SkillCategory, number>;
  for (const [cat, levels] of Object.entries(grouped)) {
    result[cat as SkillCategory] = levels.length > 0
      ? levels.reduce((a, b) => a + b, 0) / levels.length
      : 0;
  }
  return result;
}

/** Node radius based on level */
export function getNodeRadius(level: number): number {
  return 12 + level * 2; // 14, 16, 18, 20, 22
}
