// ─── TYPES ───────────────────────────────────────────────────────────────────

export type ThinkingMode = 'explore' | 'analyze' | 'synthesize';

export interface ThinkMessage {
  id: string;
  sender: 'tamir' | 'ceo';
  content: string;
  timestamp: string;
  mode?: ThinkingMode;
  isBookmarked: boolean;
  capturedDecision?: {
    title: string;
    rationale: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

export interface ThinkSession {
  id: string;
  title: string;
  topicTag: string;
  createdAt: string;
  updatedAt: string;
  messages: ThinkMessage[];
}

// ─── TOPIC TAG OPTIONS ───────────────────────────────────────────────────────

export const TOPIC_TAGS = [
  'Strategy', 'Hiring', 'Product', 'Fundraising', 'Operations',
  'Culture', 'Marketing', 'Tech', 'Partnership', 'General',
] as const;

// ─── MOCK SESSIONS ───────────────────────────────────────────────────────────

const now = new Date();
const yesterday = new Date(now.getTime() - 86400000);

export const MOCK_SESSIONS: ThinkSession[] = [
  {
    id: 'think-1',
    title: 'Should we raise a Series A?',
    topicTag: 'Fundraising',
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
    messages: [
      {
        id: 't1-m1', sender: 'ceo', content: "I've been thinking about whether now is the right time to raise a Series A. We have 14 months of runway left and revenue is growing 18% MoM.",
        timestamp: new Date(yesterday.getTime()).toISOString(), mode: 'explore', isBookmarked: false,
      },
      {
        id: 't1-m2', sender: 'tamir', content: "Good question to work through. Let me surface a few angles.\n\nAt 18% MoM growth with 14 months runway, you're in a strong negotiating position — not desperate, but with clear momentum. The question isn't whether you *can* raise, it's whether you *should* right now.\n\nThree things worth exploring:\n1. What milestones would a Series A unlock that organic growth can't?\n2. Is the market window closing — are competitors raising?\n3. Would the dilution at current valuation be worth the acceleration?",
        timestamp: new Date(yesterday.getTime() + 60000).toISOString(), mode: 'explore', isBookmarked: true,
      },
      {
        id: 't1-m3', sender: 'ceo', content: "The main thing is hiring speed. We need 3 senior engineers and a Head of Sales, and at current burn we can only afford 1-2 of those. A raise would let us hire all four in Q2.",
        timestamp: new Date(yesterday.getTime() + 120000).toISOString(), mode: 'explore', isBookmarked: false,
      },
      {
        id: 't1-m4', sender: 'tamir', content: "That's a concrete unlock — the constraint is talent velocity, not survival. Let me break that down.\n\nCurrent state: $45K/mo burn, $630K runway remaining. Adding 4 hires at ~$180K avg loaded cost increases burn to ~$105K/mo. Without a raise, runway drops to ~6 months — dangerous.\n\nWith a $3-4M Series A at your current metrics, you'd extend to 24+ months and fill all four roles. The math checks out.\n\nBut here's the counterpoint: could you hire 2 now, prove the model scales with a slightly larger team, and raise at a higher valuation in 6 months?",
        timestamp: new Date(yesterday.getTime() + 180000).toISOString(), mode: 'analyze', isBookmarked: true,
      },
      {
        id: 't1-m5', sender: 'ceo', content: "That's a real option. The risk is that the Head of Sales role is urgent — without them, nobody is closing the enterprise deals that are piling up.",
        timestamp: new Date(yesterday.getTime() + 240000).toISOString(), mode: 'analyze', isBookmarked: false,
      },
      {
        id: 't1-m6', sender: 'tamir', content: "So the bottleneck is revenue capture, not product development. That changes the calculus — a Head of Sales has direct ROI within 90 days if your pipeline is real.\n\nHere's what I'd synthesize from this session: the Series A decision hinges on whether the enterprise pipeline is large enough that *not* hiring a sales leader costs you more than the dilution. If there's $500K+ in pipeline waiting to be closed, the answer is clear.",
        timestamp: new Date(yesterday.getTime() + 300000).toISOString(), mode: 'synthesize', isBookmarked: false,
        capturedDecision: {
          title: 'Raise Series A if enterprise pipeline exceeds $500K',
          rationale: 'The bottleneck is revenue capture, not runway. A Head of Sales has direct ROI within 90 days. Dilution is worth it if pipeline justifies the hire urgency.',
          confidence: 'medium',
        },
      },
    ],
  },
  {
    id: 'think-2',
    title: 'Hiring plan for Q3',
    topicTag: 'Hiring',
    createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    messages: [
      {
        id: 't2-m1', sender: 'ceo', content: "I need to figure out Q3 hiring priorities. We have budget for 2-3 roles but I'm not sure where the biggest gaps are.",
        timestamp: new Date(now.getTime() - 3 * 86400000).toISOString(), mode: 'analyze', isBookmarked: false,
      },
      {
        id: 't2-m2', sender: 'tamir', content: "Based on what I'm tracking across the org:\n\n**Biggest gaps by impact:**\n1. **Senior Backend Engineer** — Alex's team is at capacity, ZUNA deployment is blocked, and the EEG model work needs infra support. This is the single highest-leverage hire.\n2. **Research Analyst** — Priya K. is the top candidate (CTO's pick). EEG domain expert. Slot expires soon.\n3. **Content Strategist** — Maya is doing strategy + execution. Splitting these roles would double marketing output.\n\n**Lower priority but on the radar:**\n- DevOps/SRE (currently covered by Alex, but that's unsustainable)\n- Junior data analyst (nice-to-have for Jordan's team)",
        timestamp: new Date(now.getTime() - 3 * 86400000 + 60000).toISOString(), mode: 'analyze', isBookmarked: true,
      },
      {
        id: 't2-m3', sender: 'ceo', content: "The backend engineer and research analyst feel like no-brainers. The third slot is the hard choice — content strategist vs. DevOps.",
        timestamp: new Date(now.getTime() - 3 * 86400000 + 120000).toISOString(), mode: 'analyze', isBookmarked: false,
      },
      {
        id: 't2-m4', sender: 'tamir', content: "It depends on your 6-month bet. If you're betting on growth (more customers, more content, more pipeline), the content strategist multiplies Maya's impact immediately. If you're betting on reliability (uptime, deployment speed, infra stability), DevOps de-risks everything Alex is juggling.\n\nMy read: you're in growth mode. Content strategist unlocks revenue faster. DevOps can wait one more quarter if Alex doesn't hit a wall.",
        timestamp: new Date(now.getTime() - 3 * 86400000 + 180000).toISOString(), mode: 'synthesize', isBookmarked: false,
      },
    ],
  },
];

// ─── RESPONSE SIMULATOR ──────────────────────────────────────────────────────

const EXPLORE_RESPONSES = [
  "Interesting angle. Let me push on this a bit.\n\nWhat if the opposite were true? If we assume {topic} isn't the right move, what would we do instead? Sometimes the best way to validate an idea is to seriously consider the alternative.\n\nA few adjacent questions worth sitting with:\n- What's the cost of *not* doing this?\n- Who else has tried this and what happened?\n- Is this urgent, or does it just feel urgent?",

  "That opens up several directions. Let me map them out.\n\nI see three possible paths from here:\n1. **Go big** — commit fully, allocate real resources, make it a company priority\n2. **Test small** — run a 2-week experiment with minimal investment to validate the core assumption\n3. **Wait and watch** — table it for now, set a trigger condition that would make the decision obvious\n\nWhich feels closest to your instinct? Your gut often knows before the data does.",

  "Good instinct. Let me surface something adjacent that might be relevant.\n\nI've been tracking a pattern across the org — {related_pattern}. It might connect to what you're thinking about here. Sometimes the real insight isn't in the question you're asking, but in the one you haven't asked yet.\n\nWhat if we zoom out: what's the *real* problem you're trying to solve? Sometimes we anchor on a solution before we've fully understood the problem.",

  "That's worth exploring deeper. Let me think alongside you.\n\nThe way I see it, there's a tension here between speed and certainty. You want to move fast, but you also don't want to commit to something that turns out to be wrong.\n\nWhat would it take to get to 80% confidence? Not 100% — that's a trap. What's the minimum amount of information that would make you comfortable making this call?",

  "Let me challenge that assumption for a second — not because I think you're wrong, but because stress-testing ideas makes them stronger.\n\nWhat if {contrarian_view}? I know it sounds counterintuitive, but there's a version of this where the constraint you're seeing is actually an advantage.\n\nAlso worth considering: who on the team has the closest view of this? Sometimes the best thinking happens when you bring in a perspective you haven't considered.",
];

const ANALYZE_RESPONSES = [
  "Let me break this down structurally.\n\n**Current state:**\n- Resources: limited, need to be allocated carefully\n- Timeline: probably tighter than it feels\n- Dependencies: at least 2-3 things need to go right simultaneously\n\n**Key risks:**\n1. Execution risk — do we have the people to actually do this well?\n2. Timing risk — is the window open or closing?\n3. Opportunity cost — what are we *not* doing by choosing this?\n\n**Data points that matter:**\nThe decision should hinge on 2-3 measurable things. What are they?",

  "Here's the analytical frame I'd use.\n\n**Inputs:**\n- Cost: what does this require in time, money, and attention?\n- Probability: what are the realistic odds of success?\n- Payoff: if it works, how much does it matter?\n\n**The math:**\nExpected value = (probability of success × payoff) - cost. If that number is clearly positive, the decision is easy. If it's close to zero, that's a sign the decision needs more data, not more analysis.\n\n**What's missing from the analysis:**\nWe haven't talked about reversibility. Is this a one-way door or a two-way door? Two-way doors should be walked through quickly.",

  "Let me give you the structured breakdown.\n\n**Strengths of this approach:**\n- Aligns with current trajectory\n- Leverages existing capabilities\n- Timeline is realistic\n\n**Weaknesses:**\n- Requires coordination across multiple teams\n- Success depends on assumptions that haven't been validated\n- No clear fallback if it doesn't work\n\n**Comparison to alternatives:**\nThe main alternative is doing nothing — and doing nothing has its own cost. The question is whether the cost of action is lower than the cost of inaction.",

  "Three lenses to look at this through:\n\n**Financial lens:** What's the ROI? What's the payback period? Can we afford to be wrong?\n\n**Strategic lens:** Does this move us toward our 12-month vision or is it a detour? Does it create optionality or close it off?\n\n**People lens:** Who owns this? Do they have the capacity and capability? Will this energize the team or drain them?\n\nThe strongest decisions score well on all three. Decisions that only score on one lens tend to cause problems downstream.",
];

const SYNTHESIZE_RESPONSES = [
  "Let me pull the threads together.\n\nFrom everything we've discussed, the core insight is this: the decision isn't as complex as it feels. When you strip away the noise, it comes down to one question — and you probably already know the answer.\n\nHere's what I'd capture from this session:\n- The real constraint is {key_constraint}, not what we initially thought\n- The best path forward is {recommended_path}\n- The first concrete step is {next_action}\n\nDoes that match your read?",

  "Synthesizing what we've covered:\n\n**The pattern I see:** You keep coming back to {recurring_theme}. That's not random — it's your instinct telling you something. The data supports it too.\n\n**The decision framework:**\n1. If {condition_a} → do {action_a}\n2. If {condition_b} → do {action_b}\n3. If neither → wait for {trigger_event}\n\n**Confidence level:** I'd put this at medium-high. We have enough signal to act, but we should set a check-in point in 2-3 weeks to validate.",

  "Here's what I think we've landed on.\n\nThe key insight from this thinking session is that the problem we started with isn't actually the real problem. The real problem is {deeper_problem}. Once you see it that way, the path forward is clearer.\n\n**What to do next:**\n1. {immediate_step} — this week\n2. {follow_up} — by end of month\n3. {validation} — check-in to see if the thesis holds\n\nShould I capture this as a decision, or do you want to sit with it longer?",

  "Connecting the dots from this session:\n\nWe started by exploring {starting_question} and ended up in a different place than expected. The conversation revealed that the real leverage point isn't where we thought it was.\n\n**Key takeaway:** {main_insight}\n\n**Why this matters:** If this is right, it changes how we prioritize the next quarter. It means {implication_a} and {implication_b}.\n\n**Open question:** The one thing we didn't resolve is {unresolved}. Worth a follow-up session or a quick conversation with the team.",
];

let responseIndex = { explore: 0, analyze: 0, synthesize: 0 };

export function simulateThinkResponse(input: string, mode: ThinkingMode): string {
  const pools: Record<ThinkingMode, string[]> = {
    explore: EXPLORE_RESPONSES,
    analyze: ANALYZE_RESPONSES,
    synthesize: SYNTHESIZE_RESPONSES,
  };

  const pool = pools[mode];
  const idx = responseIndex[mode] % pool.length;
  responseIndex[mode]++;

  let response = pool[idx];

  // Simple keyword substitution to make responses feel contextual
  const lower = input.toLowerCase();
  if (lower.includes('hire') || lower.includes('hiring') || lower.includes('team')) {
    response = response
      .replace('{topic}', 'expanding the team right now')
      .replace('{related_pattern}', 'agent workload has been increasing 20% week-over-week, which suggests the current team is near capacity')
      .replace('{contrarian_view}', 'instead of hiring, we restructure existing agents to handle more')
      .replace('{key_constraint}', 'not headcount, but role clarity')
      .replace('{recommended_path}', 'hire for the highest-leverage role first, then reassess')
      .replace('{next_action}', 'define the exact output expected from the first hire in their first 30 days')
      .replace('{recurring_theme}', 'the need for senior-level ownership')
      .replace('{condition_a}', 'pipeline exceeds capacity')
      .replace('{action_a}', 'hire the sales lead immediately')
      .replace('{condition_b}', 'product gaps are blocking deals')
      .replace('{action_b}', 'prioritize the engineering hire')
      .replace('{trigger_event}', 'the next lost deal post-mortem')
      .replace('{deeper_problem}', 'accountability gaps, not headcount')
      .replace('{immediate_step}', 'map each critical function to a single owner')
      .replace('{follow_up}', 'post the top-priority role')
      .replace('{validation}', 'did the new hire close the gap we identified?')
      .replace('{starting_question}', 'hiring priorities')
      .replace('{main_insight}', 'the bottleneck is ownership, not capacity')
      .replace('{implication_a}', 'some roles are more urgent than we thought')
      .replace('{implication_b}', 'others can wait a quarter')
      .replace('{unresolved}', 'whether to promote internally or hire externally for the leadership gap');
  } else if (lower.includes('revenue') || lower.includes('growth') || lower.includes('sales') || lower.includes('money')) {
    response = response
      .replace('{topic}', 'accelerating revenue growth')
      .replace('{related_pattern}', 'deal velocity has slowed in the last 3 weeks despite pipeline growth')
      .replace('{contrarian_view}', 'slowing down to close fewer, larger deals might actually grow revenue faster')
      .replace('{key_constraint}', 'conversion rate, not lead volume')
      .replace('{recommended_path}', 'fix the close rate before scaling the top of funnel')
      .replace('{next_action}', 'audit the last 5 lost deals to find the pattern')
      .replace('{recurring_theme}', 'the gap between pipeline and closed revenue')
      .replace('{condition_a}', 'close rate is above 20%')
      .replace('{action_a}', 'scale outbound immediately')
      .replace('{condition_b}', 'close rate is below 15%')
      .replace('{action_b}', 'fix the sales process before scaling')
      .replace('{trigger_event}', 'next month revenue numbers')
      .replace('{deeper_problem}', 'positioning, not distribution')
      .replace('{immediate_step}', 'review the last 5 lost deal post-mortems')
      .replace('{follow_up}', 'adjust positioning based on patterns')
      .replace('{validation}', 'close rate improvement in 30 days')
      .replace('{starting_question}', 'revenue acceleration')
      .replace('{main_insight}', 'we have a conversion problem disguised as a volume problem')
      .replace('{implication_a}', 'more leads won\'t fix it')
      .replace('{implication_b}', 'the sales narrative needs work')
      .replace('{unresolved}', 'whether pricing is part of the conversion issue');
  } else {
    response = response
      .replace('{topic}', 'this direction')
      .replace('{related_pattern}', 'similar decisions in the past have taken longer than expected to pay off')
      .replace('{contrarian_view}', 'the thing holding us back is actually our biggest advantage in disguise')
      .replace('{key_constraint}', 'focus, not resources')
      .replace('{recommended_path}', 'pick the one thing that matters most and go all in')
      .replace('{next_action}', 'define the single metric that tells us if this is working')
      .replace('{recurring_theme}', 'the tension between doing more and doing fewer things well')
      .replace('{condition_a}', 'we have clear signal')
      .replace('{action_a}', 'commit and move fast')
      .replace('{condition_b}', 'the signal is ambiguous')
      .replace('{action_b}', 'run a 2-week test before committing')
      .replace('{trigger_event}', 'clear data from the next sprint')
      .replace('{deeper_problem}', 'a lack of clarity about what matters most right now')
      .replace('{immediate_step}', 'write down the one thing that would make this quarter a success')
      .replace('{follow_up}', 'align the team around that single priority')
      .replace('{validation}', 'weekly check-in on the north star metric')
      .replace('{starting_question}', 'strategic priorities')
      .replace('{main_insight}', 'doing fewer things with more conviction beats spreading thin')
      .replace('{implication_a}', 'some projects need to be paused')
      .replace('{implication_b}', 'the team needs clarity on what\'s #1')
      .replace('{unresolved}', 'which of the current initiatives should be paused');
  }

  return response;
}

// ─── SUGGESTED PROMPTS ───────────────────────────────────────────────────────

export const SUGGESTED_PROMPTS = [
  "Should we raise funding this quarter, or can we grow organically?",
  "What's the biggest risk to the company right now that I'm not seeing?",
  "How should we think about hiring vs. building with AI agents?",
  "I need to work through our pricing strategy for enterprise.",
];
