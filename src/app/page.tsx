'use client';

import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import TopNav from '@/components/layout/TopNav';
import StatusBar from '@/components/layout/StatusBar';
import MissionBoard from '@/components/center-board/MissionBoard';
import TamirPanel from '@/components/right-rail/TamirPanel';
import { useSettings } from '@/contexts/SettingsContext';
import { Moon, Target, LayoutGrid, Settings } from 'lucide-react';

// ── Ambient blobs ─────────────────────────────────────────────────────────────

function AmbientBg() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div style={{ position: 'absolute', width: '500px', height: '500px', top: '30%', left: '38%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'ambientFloat 18s ease-in-out infinite', animationDelay: '4s' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', top: '20%', right: '0%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'ambientFloat 22s ease-in-out infinite reverse', animationDelay: '2s' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', bottom: '10%', right: '5%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'ambientFloat 16s ease-in-out infinite', animationDelay: '1s' }} />
    </div>
  );
}

// ── Deep Work Screen ──────────────────────────────────────────────────────────

function DeepWorkScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(167,139,250,0.04) 0%, transparent 65%)' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4 text-center max-w-sm"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}
        >
          <Moon size={28} style={{ color: '#a78bfa' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Deep Work Mode</h2>
          <p className="text-[13px] text-slate-500 leading-relaxed">
            All notifications muted. Only L4 escalations will reach you.
            <br />Stay in flow — your team has everything else covered.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-medium"
            style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.15)', color: '#c4b5fd' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            L4 escalations will still interrupt
          </div>
        </div>
        <Link href="/settings">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium text-slate-500 hover:text-slate-300 transition-colors mt-2 cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            <Settings size={11} />
            Change layout in Settings
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

// ── Focus Mode Banner ─────────────────────────────────────────────────────────

function FocusBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mt-1 mb-0 flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl shrink-0"
      style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}
    >
      <div className="flex items-center gap-2">
        <Target size={12} className="text-amber-400 shrink-0" />
        <span className="text-[12px] text-amber-300/90">
          <strong>Focus Mode</strong> — showing your top priority mission + Tamir only.
        </span>
      </div>
      <Link href="/settings">
        <span className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors shrink-0 cursor-pointer">
          Change →
        </span>
      </Link>
    </motion.div>
  );
}

// ── Home ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { layoutPreset } = useSettings();

  return (
    <AppShell>
      <div className="ambient-bg" />
      <AmbientBg />

      <TopNav />
      <StatusBar />

      <AnimatePresence mode="wait">
        {layoutPreset === 'deep-work' ? (
          <motion.div
            key="deep-work"
            className="flex-1 flex flex-col min-h-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <DeepWorkScreen />
          </motion.div>
        ) : layoutPreset === 'focus' ? (
          <motion.div
            key="focus"
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <FocusBanner />
            <div className="flex-1 grid grid-cols-[1fr_360px] gap-3 px-4 pb-3 pt-2 min-h-0" style={{ overflow: 'hidden' }}>
              {/* Only the top critical mission — MissionBoard filters internally via prop */}
              <div className="min-h-0 h-full">
                <MissionBoard focusMode />
              </div>
              <div className="min-h-0 h-full py-1">
                <TamirPanel />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="overview"
            className="flex-1 grid grid-cols-[1fr_340px] gap-3 px-4 pb-3 pt-1 min-h-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="min-h-0 h-full">
              <MissionBoard />
            </div>
            <div className="min-h-0 h-full py-1">
              <TamirPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
