'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type LayoutPreset = 'overview' | 'focus' | 'deep-work';
export type EscalationThreshold = 'L1' | 'L2' | 'L3' | 'L4';

export interface StatusMetric {
  id: string;
  label: string;
  description: string;
  visible: boolean;
}

export interface NavGroupVisibility {
  id: string;
  visible: boolean;
}

export interface Settings {
  layoutPreset: LayoutPreset;
  escalationThreshold: EscalationThreshold;
  statusBarMetrics: StatusMetric[];
  navGroupVisibility: NavGroupVisibility[];
}

interface SettingsCtx extends Settings {
  setLayoutPreset: (p: LayoutPreset) => void;
  setEscalationThreshold: (t: EscalationThreshold) => void;
  setStatusBarMetrics: (m: StatusMetric[]) => void;
  setNavGroupVisibility: (v: NavGroupVisibility[]) => void;
  resetToDefaults: () => void;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_STATUS_METRICS: StatusMetric[] = [
  { id: 'agents',       label: 'Active Agents',     description: 'How many agents are online and working', visible: true  },
  { id: 'burn',         label: 'Daily Burn Rate',    description: 'Total AI spend so far today',            visible: true  },
  { id: 'tasks',        label: 'Tasks Completed',    description: 'Tasks finished across all agents today', visible: true  },
  { id: 'deliverables', label: 'Deliverables',       description: 'Artifacts produced today',               visible: true  },
  { id: 'uptime',       label: 'System Uptime',      description: 'Overall system availability',            visible: true  },
  { id: 'sync',         label: 'Last Synced',        description: 'Time since last data refresh',           visible: true  },
];

export const DEFAULT_NAV_VISIBILITY: NavGroupVisibility[] = [
  { id: 'desk',         visible: true },
  { id: 'command',      visible: true },
  { id: 'agents',       visible: true },
  { id: 'intelligence', visible: true },
  { id: 'system',       visible: true },
];

const DEFAULTS: Settings = {
  layoutPreset: 'overview',
  escalationThreshold: 'L1',
  statusBarMetrics: DEFAULT_STATUS_METRICS,
  navGroupVisibility: DEFAULT_NAV_VISIBILITY,
};

const STORAGE_KEY = 'myelin:settings:v1';

// ── Context ───────────────────────────────────────────────────────────────────

const SettingsContext = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Settings>;
        setSettings((prev) => ({
          ...prev,
          ...saved,
          // Merge metrics carefully — preserve order from saved, fill in missing with defaults
          statusBarMetrics: saved.statusBarMetrics?.length
            ? saved.statusBarMetrics
            : prev.statusBarMetrics,
          navGroupVisibility: saved.navGroupVisibility?.length
            ? saved.navGroupVisibility
            : prev.navGroupVisibility,
        }));
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever settings change
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  const setLayoutPreset = useCallback((layoutPreset: LayoutPreset) => {
    setSettings((s) => ({ ...s, layoutPreset }));
  }, []);

  const setEscalationThreshold = useCallback((escalationThreshold: EscalationThreshold) => {
    setSettings((s) => ({ ...s, escalationThreshold }));
  }, []);

  const setStatusBarMetrics = useCallback((statusBarMetrics: StatusMetric[]) => {
    setSettings((s) => ({ ...s, statusBarMetrics }));
  }, []);

  const setNavGroupVisibility = useCallback((navGroupVisibility: NavGroupVisibility[]) => {
    setSettings((s) => ({ ...s, navGroupVisibility }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULTS);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setLayoutPreset,
        setEscalationThreshold,
        setStatusBarMetrics,
        setNavGroupVisibility,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsCtx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}

// ── Helper: does an escalation level satisfy the threshold? ───────────────────
// e.g. threshold = L3 → show L3 and L4

const levelOrder: Record<EscalationThreshold, number> = { L1: 1, L2: 2, L3: 3, L4: 4 };

export function escalationPassesThreshold(
  level: EscalationThreshold,
  threshold: EscalationThreshold
): boolean {
  return levelOrder[level] >= levelOrder[threshold];
}
