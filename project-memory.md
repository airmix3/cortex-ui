# Cortex UI — Project Memory

> This file gives any AI agent full context to work effectively on this project.
> Last updated: 2026-03-21

---

## What Is This Project?

**Cortex UI** (branded **Myelin**) is a CEO command center dashboard for managing an AI-powered company. A single founder/CEO manages the entire company through AI agents organized into departments. The UI gives the CEO a real-time view of missions, blockers, escalations, and agent activity — all in one screen.

The core interaction model: the CEO doesn't manage tasks directly. Instead, **Tamir** (the AI Chief of Staff) coordinates all agents and departments, surfaces what needs attention, and the CEO makes decisions through a chat interface + kanban board.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript (strict) | 5 |
| UI | React | 19.2.3 |
| Styling | Tailwind CSS | 4 |
| Animations | Motion (Framer Motion) | 12.36.0 |
| Icons | Lucide React | 0.577.0 |
| Deployment | Vercel | — |

**Path alias:** `@/*` maps to `./src/*`

---

## Design Language

The UI uses a **dark navy glassmorphism** aesthetic inspired by Apple's Liquid Glass:

- **Background:** Near-black navy (`#060a13`) with floating ambient light orbs (radial gradients)
- **Panels:** `backdrop-filter: blur() saturate() brightness()` with rgba borders and inset highlights
- **Two visual tiers:**
  - **Attention Center** (left/main): Dark navy glass with sky-blue border glow — feels like a command console
  - **Tamir Panel** (right): White-tinted frosted glass (`rgba(255,255,255,0.05)`) with high brightness — feels softer and brighter
- **Color coding:** Amber = action/CEO, Sky-blue = system/info, Emerald = success, Rose = blocker/critical
- **Animations:** Smooth spring easing `[0.22, 1, 0.36, 1]`, staggered children, ambient floating orbs

### Critical Styling Lesson

**Never use `liquid-glass-react` as a block-level wrapper.** It renders SVG `<feDisplacementMap>` elements that cause massive layout gaps. All glass effects are achieved with inline CSS (`backdrop-filter`, rgba `background`, `border`, `boxShadow`). The `liquid-glass-react` package is installed but should NOT be used.

### Glass CSS Classes (globals.css)

- `.glass-panel` — Main panel (blur: 18px)
- `.glass-card` — Cards (blur: 12px)
- `.glass-deep` — Nav layer (blur: 28px)
- `.glass-pill` — Status bar metric pills
- `.glass-shimmer` — Animated shimmer overlay

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (Geist fonts, metadata)
│   ├── page.tsx                 # HOME: MissionBoard + TamirPanel
│   ├── globals.css              # All custom styles, animations, color tokens
│   ├── agents/[id]/page.tsx     # Agent profile detail
│   ├── collaboration/page.tsx   # Agent interaction network
│   ├── control-center/page.tsx  # Task management
│   ├── departments/page.tsx     # Department health
│   ├── escalations/page.tsx     # Escalation tracking
│   ├── evaluations/page.tsx     # Agent performance
│   ├── missions/page.tsx        # Mission detail view
│   ├── people/page.tsx          # Employee directory
│   ├── terminal/page.tsx        # CLI interface
│   ├── timeline/page.tsx        # Activity log
│   └── vault/page.tsx           # Knowledge base
│
├── components/
│   ├── layout/
│   │   ├── TopNav.tsx           # Nav bar with 11+ links
│   │   ├── StatusBar.tsx        # KPI pills (Active Missions, Blocked, etc.)
│   │   └── ChatBar.tsx          # Alternative chat interface
│   ├── center-board/
│   │   ├── MissionBoard.tsx     # "Attention Center" — framed kanban board
│   │   ├── MissionColumn.tsx    # Column: Act Now / Approve / Review
│   │   ├── MissionCard.tsx      # Collapsed/expanded mission card
│   │   ├── DeliverableChip.tsx  # File type chip (pdf, code, etc.)
│   │   └── InterventionBar.tsx  # (Legacy — no longer imported)
│   ├── right-rail/
│   │   ├── TamirPanel.tsx       # Chief of Staff chat + morning brief
│   │   ├── ActionQueue.tsx      # Action items list
│   │   └── ActionCard.tsx       # Individual action item
│   ├── left-rail/
│   │   ├── DepartmentRail.tsx   # Department sidebar
│   │   └── DepartmentCard.tsx   # Department summary card
│   ├── lower-section/
│   │   ├── BottomSection.tsx    # (Legacy — removed from homepage)
│   │   ├── MiniTimeline.tsx     # Activity timeline
│   │   └── SupportStrip.tsx     # Quick actions
│   ├── collaboration/           # Network visualization components
│   ├── departments/             # Department detail components
│   └── shared/
│       └── PageShell.tsx        # Reusable page wrapper
│
├── data/                         # All mock data (no backend yet)
│   ├── mock-data.ts             # People, missions, departments, timeline
│   ├── pages-data.ts            # Employees, escalations, vault entries
│   ├── agent-profiles.ts        # Agent bios, skills, daily activity
│   ├── collaboration-data.ts    # Interaction events + metrics
│   ├── control-center-data.ts   # Agent task queue (36+ tasks)
│   └── evaluations-data.ts      # Daily summaries + evaluations
│
├── lib/
│   └── glass-config.ts          # Glass presets (NOT actively used)
│
└── types/
    └── index.ts                 # All TypeScript interfaces
```

---

## Homepage Layout (page.tsx)

The homepage is the CEO's primary view. Layout:

```
┌─────────────────────────────────────────────────────┐
│ TopNav (Myelin logo + 11 page links + action icons) │
├─────────────────────────────────────────────────────┤
│ StatusBar (KPI pills: missions, decisions, blocked) │
├──────────────────────────────────┬──────────────────┤
│                                  │                  │
│   Attention Center               │   Tamir Panel    │
│   ┌────────────────────────┐     │   (Chat UI)      │
│   │ Header: icon, title,   │     │                  │
│   │ count pills, directive │     │   Morning brief  │
│   ├────────────────────────┤     │   Conversation   │
│   │ Act Now │ Decide │ Rev │     │   Quick actions   │
│   │  cards  │ cards  │cards│     │   Input bar      │
│   └────────────────────────┘     │                  │
│                                  │                  │
├──────────────────────────────────┴──────────────────┤
│ (no bottom section — removed for cleaner layout)    │
└─────────────────────────────────────────────────────┘
```

Grid: `grid-cols-[1fr_340px]` with 3px gap.

---

## Key Components — How They Work

### MissionCard (Collapsed/Expanded)

Cards use a 3-zone collapsed design to reduce cognitive load:

**Collapsed (default ~110px):**
1. **WHAT:** Title + priority badge (critical badge pulses via `.priority-pulse`)
2. **WHY:** Blocker text (red dot) OR ceoAction text (amber zap icon) + age timestamp
3. **ACTION:** Primary button (column-aware label) + "Details" toggle

**Expanded (click Details):**
- Escalation path
- Full blocker alert
- CEO action banner
- Deliverables list (DeliverableChip components)
- Flow stage progress dots
- Touch trail avatars + owner
- Secondary buttons (Send Directive, Reject, Request Changes)

Uses `useState` + `AnimatePresence` for smooth accordion expand/collapse.

### Attention Center (MissionBoard)

Framed container with:
- Sky-blue border glow (`1.5px solid rgba(56,189,248,0.40)`)
- Top gradient accent line (sky → amber → sky)
- Single-row header: ScanEye icon → gradient title → count pills → "Send Directive" button
- 3-column grid: Act Now (amber) | Approve/Decide (sky) | Review (emerald)
- Internal scrolling

### Tamir Panel

White-tinted frosted glass panel with:
- Header: avatar, name, online status
- Morning brief card (amber-bordered, bullet points with alert/pending/ok icons)
- Chat messages (Tamir = left-aligned glass card, CEO = right-aligned sky-tinted)
- Quick action chips (Brief, Blockers, Approvals, Costs)
- Input bar with mic + send buttons

---

## Data Model (Key Types)

```typescript
Mission {
  id, title, column ('act-now' | 'approve-decide' | 'review'),
  priority ('critical' | 'high' | 'medium' | 'low'),
  owner: Person, department, deliverables: Deliverable[],
  touchTrail: Person[], flowStage (0-4),
  ceoAction, escalationPath, attempts?, blocker?, age?
}

Person { name, role, avatar (initials), color (tailwind bg) }
Deliverable { name, type (7 types), status (4 states) }
Employee { id, name, role, type, department, reportsTo, status, currentTask }
Escalation { level (L1-L4), chain: Person[], blocker, needFromFounder, impactIfIgnored }
AgentProfile { skills, valueScore, costToday, costEfficiency, todayActivity }
```

---

## People in the System

| Key | Name | Role | Department |
|-----|------|------|-----------|
| tamir | Tamir | Chief of Staff | — |
| cto | Alex | CTO | Tech |
| cmo | Maya | CMO | Marketing |
| coo | Liam | COO | Operations |
| devAgent1 | Dev Agent | Engineer | Tech |
| devAgent2 | Infra Agent | DevOps | Tech |
| mktAgent1 | Content Agent | Marketing | Marketing |
| researchAgent | Research Agent | Analyst | Tech |
| opsAgent | Ops Agent | Operations | Operations |

---

## Current Missions (Mock Data)

| ID | Title | Column | Priority | Blocker |
|----|-------|--------|----------|---------|
| m1 | AWS Capacity Blocker | act-now | critical | No GPU in current AZ |
| m2 | Research Analyst Hire | approve-decide | high | — |
| m3 | Content Strategy Plans | review | medium | — |
| m4 | ZUNA Deployment | act-now | high | — |
| m5 | Logistics Optimization | review | low | — |

---

## CSS Color Tokens (globals.css)

```css
--bg-base: #060a13      /* Darkest background */
--bg-panel: #0a1020     /* Panel background */
--bg-card: #0e1525      /* Card background */
--bg-elevated: #141f35  /* Elevated surface */
--glass-border: 1px solid rgba(255,255,255,0.08)
```

---

## Key Animations

| Class/Keyframe | Purpose | Duration |
|---------------|---------|----------|
| `livePulse` | Pulsing indicator (live dot, critical badge) | 2s |
| `ambientFloat` | Background orb floating | 16-22s |
| `liquidShimmer` | Glass surface shimmer | 6s |
| `barPulse` | Status bar activity indicator | 2s |
| `commandAccent` | Command card border pulse | 4s |

---

## Known Gotchas

1. **`liquid-glass-react`** — Installed but must NOT wrap block elements. Causes SVG displacement maps that break layout. All glass is pure CSS.
2. **Next.js Fast Refresh caching** — After removing imports, old references can persist. Fix: stop server, `rm -rf .next`, restart.
3. **backdrop-filter on dark backgrounds** — `brightness()` has minimal effect on near-black. Use white-tinted rgba backgrounds (`rgba(255,255,255,0.05)`) to give it something to brighten.
4. **Ambient orbs** — Fixed-position radial gradients in `page.tsx` give glass surfaces light to refract. Without them, glass looks flat.
5. **InterventionBar.tsx** — File exists but is no longer imported anywhere. Legacy component replaced by the Attention Center header.
6. **BottomSection** — Removed from homepage for cleaner layout. Component files still exist in `/lower-section/`.

---

## Development

```bash
npm run dev     # Start dev server (port 3000 or 3001)
npm run build   # Production build
npm run lint    # ESLint check
```

Preview server typically runs on port 3001 during development sessions.

---

## Architecture Decisions

1. **No backend** — All data is mock. Files in `src/data/` simulate what would come from an API.
2. **All glass via CSS** — No third-party glass library wrappers. Pure `backdrop-filter` + rgba.
3. **Homepage = CEO's single screen** — Everything the CEO needs is on one page. Sub-pages exist for deep dives.
4. **Tamir as interface** — The CEO interacts with the company primarily through Tamir (chat panel). The kanban board is for at-a-glance status.
5. **Collapsed cards by default** — Mission cards show only 3 signals (what, why, action). Details are one click away.
6. **Column-aware buttons** — Primary action button label changes based on mission column (Approve for act-now, Review for review, etc.).
