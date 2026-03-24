'use client';

import { motion } from 'motion/react';
import { HelpCircle, Bell, Settings, Search, Target, LayoutGrid, Moon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSettings, type LayoutPreset } from '@/contexts/SettingsContext';

// ── Derive page title from pathname ──────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  '/':                 'Home',
  '/tamir':            'CEO Desk',
  '/tamir/calendar':   'Calendar',
  '/tamir/inbox':      'Inbox',
  '/tamir/think':        'Think',
  '/tamir/deliverables': 'Deliverables',
  '/tools':            'Tools',
  '/control-center':   'Control Center',
  '/missions':         'Missions',
  '/people':           'People',
  '/vault':            'Vault',
  '/escalations':      'Escalations',
  '/timeline':         'Timeline',
  '/terminal':         'Terminal',
  '/evaluations':      'Evaluations',
  '/skills':           'Skills',
  '/workspace':        'Workspace',
  '/settings':         'Settings',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/agents/')) return 'Agent Profile';
  return 'Myelin';
}

// ── Layout preset quick-toggle ────────────────────────────────────────────────

const PRESET_ICONS: Record<LayoutPreset, React.ElementType> = {
  overview:   LayoutGrid,
  focus:      Target,
  'deep-work': Moon,
};

const PRESET_COLORS: Record<LayoutPreset, string> = {
  overview:   '#38bdf8',
  focus:      '#f59e0b',
  'deep-work': '#a78bfa',
};

const PRESET_CYCLE: LayoutPreset[] = ['overview', 'focus', 'deep-work'];

function PresetToggle() {
  const { layoutPreset, setLayoutPreset } = useSettings();
  const Icon = PRESET_ICONS[layoutPreset];
  const color = PRESET_COLORS[layoutPreset];

  const cycleNext = () => {
    const idx = PRESET_CYCLE.indexOf(layoutPreset);
    const next = PRESET_CYCLE[(idx + 1) % PRESET_CYCLE.length];
    setLayoutPreset(next);
  };

  const labels: Record<LayoutPreset, string> = {
    overview:    'Overview',
    focus:       'Focus',
    'deep-work': 'Deep Work',
  };

  return (
    <motion.button
      onClick={cycleNext}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
      style={{
        color,
        background: `${color}10`,
        border: `1px solid ${color}25`,
      }}
      title="Click to cycle layout preset"
    >
      <Icon size={11} />
      <span>{labels[layoutPreset]}</span>
    </motion.button>
  );
}

// ── TopNav — compact context bar ─────────────────────────────────────────────

interface TopNavProps {
  onOpenPalette?: () => void;
}

export default function TopNav({ onOpenPalette }: TopNavProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  const openPalette = () => {
    if (onOpenPalette) {
      onOpenPalette();
    } else {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between px-5 py-1.5 relative z-20 shrink-0"
      style={{
        height: 44,
        background: 'rgba(6,10,19,0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      }}
    >
      {/* Page title */}
      <div className="flex items-center gap-2">
        <h1 className="text-[14px] font-semibold text-white">{title}</h1>
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-2">
        {/* Layout preset quick-toggle — only show on home */}
        {pathname === '/' && <PresetToggle />}

        {/* ⌘K pill */}
        <button
          onClick={openPalette}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
          style={{
            color: '#64748b',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
          }}
        >
          <Search className="w-3 h-3" />
          <span>Search & act</span>
          <kbd
            className="ml-0.5 px-1 py-0.5 rounded text-[9px] font-mono"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#475569' }}
          >
            ⌘K
          </kbd>
        </button>

        <div className="w-px h-4 bg-white/[0.06]" />

        <button className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-all hover:bg-white/[0.04] cursor-pointer">
          <HelpCircle className="w-4 h-4" />
        </button>
        <button className="relative p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-all hover:bg-white/[0.04] cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>
        <Link href="/settings">
          <button className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-all hover:bg-white/[0.04] cursor-pointer">
            <Settings className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </motion.nav>
  );
}
