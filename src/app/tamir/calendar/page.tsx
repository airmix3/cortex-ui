'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import AppShell from '@/components/layout/AppShell';
import TopNav from '@/components/layout/TopNav';
import {
  TODAY_EVENTS, TOMORROW_EVENTS,
  type CalendarEvent, type EventType,
} from '@/data/tamir-data';
import {
  Calendar, Clock, Video, MapPin, Users, ChevronRight,
  Sparkles, AlertTriangle, CheckCircle2, Zap, Star, ChevronLeft,
} from 'lucide-react';

// ── Event type config ────────────────────────────────────────────────────────

const EVENT_TYPE_CONFIG: Record<EventType, { color: string; bg: string; border: string; label: string }> = {
  meeting:  { color: '#38bdf8', bg: 'rgba(56,189,248,0.07)',  border: 'rgba(56,189,248,0.2)',  label: 'Meeting'       },
  block:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.2)',  label: 'Focus Block'   },
  call:     { color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.2)', label: 'Call'          },
  review:   { color: '#34d399', bg: 'rgba(52,211,153,0.07)',  border: 'rgba(52,211,153,0.2)',  label: 'Review'        },
  personal: { color: '#64748b', bg: 'rgba(100,116,139,0.05)', border: 'rgba(100,116,139,0.15)',label: 'Personal'      },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatHour(h: number): string {
  const hrs = Math.floor(h);
  const mins = (h % 1) * 60;
  const ampm = hrs < 12 ? 'am' : 'pm';
  const displayHr = hrs > 12 ? hrs - 12 : hrs === 0 ? 12 : hrs;
  return mins === 0 ? `${displayHr}${ampm}` : `${displayHr}:${String(mins).padStart(2, '0')}${ampm}`;
}

function formatRange(startHour: number, durationHours: number): string {
  return `${formatHour(startHour)} – ${formatHour(startHour + durationHours)}`;
}

// ── Attendee chips ────────────────────────────────────────────────────────────

function AttendeeChips({ attendees, max = 4 }: { attendees: CalendarEvent['attendees']; max?: number }) {
  const shown = attendees.slice(0, max);
  const extra = attendees.length - max;
  return (
    <div className="flex items-center gap-1">
      {shown.map((a, i) => (
        <div
          key={i}
          title={`${a.name} · ${a.role}`}
          className={`w-5 h-5 rounded-full ${a.color} flex items-center justify-center text-white text-[7px] font-bold shrink-0 ring-1 ring-black`}
        >
          {a.avatar.length > 1 ? a.avatar[0] : a.avatar}
        </div>
      ))}
      {extra > 0 && (
        <span className="text-[9px] text-slate-500">+{extra}</span>
      )}
    </div>
  );
}

// ── Event Card (full) ─────────────────────────────────────────────────────────

function EventCard({ event, isSelected, onClick }: {
  event: CalendarEvent;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cfg = EVENT_TYPE_CONFIG[event.type];

  return (
    <motion.div
      layout
      onClick={onClick}
      whileHover={{ x: 2 }}
      className="rounded-xl border cursor-pointer transition-all"
      style={{
        background: isSelected ? `${cfg.color}0f` : cfg.bg,
        borderColor: isSelected ? cfg.border : 'rgba(255,255,255,0.06)',
        boxShadow: isSelected ? `0 0 0 1px ${cfg.border}` : 'none',
      }}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Time column */}
        <div className="w-16 shrink-0 pt-0.5">
          <p className="text-[11px] font-mono font-semibold" style={{ color: cfg.color }}>
            {formatHour(event.startHour)}
          </p>
          <p className="text-[9px] text-slate-600">
            {event.durationHours < 1
              ? `${event.durationHours * 60}min`
              : `${event.durationHours}hr`}
          </p>
        </div>

        {/* Left accent bar */}
        <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: cfg.color, opacity: 0.5 }} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[13px] font-semibold text-white leading-tight">{event.title}</h3>
                {event.prepNeeded && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                    <AlertTriangle size={7} /> Prep needed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-[10px]" style={{ color: cfg.color }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.color }} />
                  {cfg.label}
                </span>
                {event.isVideo && (
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
                    <Video size={9} /> {event.location}
                  </span>
                )}
                {event.location && !event.isVideo && (
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
                    <MapPin size={9} /> {event.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {event.attendees.length > 0 && <AttendeeChips attendees={event.attendees} />}
              <ChevronRight size={12} className="text-slate-600" style={{ transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded: Tamir briefing */}
      <AnimatePresence>
        {isSelected && event.tamirBriefing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="px-4 py-3 ml-[72px]">
              {/* Tamir brief */}
              <div className="flex items-start gap-2.5 mb-3">
                <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5">
                  T
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-semibold text-amber-400 mb-1 uppercase tracking-wider">Tamir's briefing</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{event.tamirBriefing}</p>
                </div>
              </div>

              {/* Mission link */}
              {event.linkedMissionTitle && (
                <div className="flex items-center gap-1.5 mb-3">
                  <Zap size={9} className="text-slate-600" />
                  <span className="text-[9px] text-slate-600">Linked mission:</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(56,189,248,0.08)', color: '#7dd3fc' }}>
                    {event.linkedMissionTitle}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/tamir?brief=${event.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <Sparkles size={10} />
                  Ask Tamir to prep me
                </Link>
                <span className="text-[9px] text-slate-600">
                  {formatRange(event.startHour, event.durationHours)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expanded: no briefing */}
        {isSelected && !event.tamirBriefing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="px-4 py-3 ml-[72px]">
              <p className="text-[11px] text-slate-500 italic">{event.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Timeline ruler ────────────────────────────────────────────────────────────

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

function getNowHour(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

// ── Tomorrow mini card ────────────────────────────────────────────────────────

function TomorrowMiniCard({ event }: { event: CalendarEvent }) {
  const cfg = EVENT_TYPE_CONFIG[event.type];
  return (
    <div className="flex items-center gap-2.5 py-2 border-b last:border-b-0"
      style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
      <div className="w-0.5 h-8 rounded-full shrink-0" style={{ background: cfg.color, opacity: 0.5 }} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-slate-300 truncate">{event.title}</p>
        <p className="text-[9px] font-mono" style={{ color: cfg.color }}>{formatHour(event.startHour)}</p>
      </div>
      {event.attendees.length > 0 && <AttendeeChips attendees={event.attendees} max={2} />}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const nowHour = getNowHour();

  // Sort events by start time
  const sortedEvents = [...TODAY_EVENTS].sort((a, b) => a.startHour - b.startHour);

  const pastEvents = sortedEvents.filter(e => e.startHour + e.durationHours < nowHour);
  const upcomingEvents = sortedEvents.filter(e => e.startHour + e.durationHours >= nowHour);
  const nextEvent = upcomingEvents[0];

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <AppShell>
      {/* Amber ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          top: '30%', left: '40%', transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </div>

      <TopNav />

      <div className="flex-1 min-h-0 flex gap-4 px-5 py-4 relative z-10 overflow-hidden">

        {/* ── Left: Day stats + tomorrow ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="w-[240px] shrink-0 flex flex-col gap-3"
        >
          {/* Date card */}
          <div className="rounded-xl border px-4 py-3"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Today</p>
            <p className="text-[22px] font-bold text-white leading-tight">{dayNames[today.getDay()]}</p>
            <p className="text-[13px] text-slate-400">{monthNames[today.getMonth()]} {today.getDate()}, {today.getFullYear()}</p>

            <div className="mt-3 pt-3 border-t flex items-center gap-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div>
                <p className="text-[18px] font-bold text-white">{sortedEvents.length}</p>
                <p className="text-[9px] text-slate-500">events</p>
              </div>
              <div>
                <p className="text-[18px] font-bold" style={{ color: '#f59e0b' }}>
                  {sortedEvents.filter(e => e.prepNeeded).length}
                </p>
                <p className="text-[9px] text-slate-500">need prep</p>
              </div>
              <div>
                <p className="text-[18px] font-bold text-emerald-400">{upcomingEvents.length}</p>
                <p className="text-[9px] text-slate-500">upcoming</p>
              </div>
            </div>
          </div>

          {/* Next up */}
          {nextEvent && (
            <div className="rounded-xl border px-4 py-3"
              style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Next up</span>
              </div>
              <p className="text-[12px] font-semibold text-white mb-0.5">{nextEvent.title}</p>
              <p className="text-[10px] font-mono" style={{ color: EVENT_TYPE_CONFIG[nextEvent.type].color }}>
                {formatHour(nextEvent.startHour)}
              </p>
              {nextEvent.prepNeeded && nextEvent.tamirBriefing && (
                <Link
                  href={`/tamir?brief=${nextEvent.id}`}
                  className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold px-2 py-1 rounded-lg cursor-pointer transition-all w-full justify-center"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <Sparkles size={9} /> Get Tamir briefing
                </Link>
              )}
            </div>
          )}

          {/* Tomorrow preview */}
          <div className="rounded-xl border px-4 py-3 flex-1 overflow-y-auto"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', scrollbarWidth: 'none' }}>
            <div className="flex items-center gap-1.5 mb-3">
              <Calendar size={11} className="text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tomorrow</span>
              <span className="text-[9px] text-slate-600 ml-auto">{dayNames[tomorrow.getDay()]}</span>
            </div>
            {TOMORROW_EVENTS.map(e => (
              <TomorrowMiniCard key={e.id} event={e} />
            ))}
          </div>
        </motion.div>

        {/* ── Right: Day timeline ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1 min-w-0 overflow-y-auto flex flex-col gap-2 pr-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Past events */}
          {pastEvents.length > 0 && (
            <div>
              <p className="text-[9px] text-slate-600 uppercase tracking-wider mb-2 px-1">Earlier today</p>
              <div className="space-y-1.5 opacity-50">
                {pastEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isSelected={selectedEvent === event.id}
                    onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Divider: now */}
          {pastEvents.length > 0 && upcomingEvents.length > 0 && (
            <div className="flex items-center gap-2 py-1">
              <motion.span
                className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[10px] text-emerald-400 font-semibold">Now — {formatHour(nowHour)}</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(52,211,153,0.2)' }} />
            </div>
          )}

          {/* Upcoming events */}
          {upcomingEvents.length > 0 && (
            <div>
              {pastEvents.length > 0 && (
                <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-2 px-1">Upcoming</p>
              )}
              <div className="space-y-1.5">
                {upcomingEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                  >
                    <EventCard
                      event={event}
                      isSelected={selectedEvent === event.id}
                      onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Ask Tamir CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-2 rounded-xl border px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.12)' }}
          >
            <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              T
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-slate-300">Need a briefing for a specific meeting, or want Tamir to prep materials?</p>
            </div>
            <Link
              href="/tamir"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold shrink-0 transition-all"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <Sparkles size={10} /> Ask Tamir
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  );
}
