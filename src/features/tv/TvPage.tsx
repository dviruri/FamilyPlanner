import { useState, useEffect, useCallback } from 'react';
import { useFamily } from '../family/FamilyContext';
import { useEventsForRange } from '../calendar/useEventsForRange';
import { useTasks } from '../tasks/useTasks';
import { CATEGORY_META } from '../calendar/categoryMeta';
import { PRIORITY_META } from '../tasks/taskMeta';
import { todayKey, addDays, formatWeekday, formatShortDate } from '../../utils/calendarDates';
import type { EventWithParticipants } from '../../services/eventsService';
import type { TaskRow, FamilyMemberRow } from '../../types/database';

const REFRESH_INTERVAL_MS = 60_000; // 1 minute

// ---------------------------------------------------------------------------
// Clock
// ---------------------------------------------------------------------------
function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------
function TvSection({ icon, title, count, children }: {
  icon: string; title: string; count?: number; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="bg-blue-500 text-white text-lg font-bold px-3 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TV Event card
// ---------------------------------------------------------------------------
function TvEventCard({ event, members }: { event: EventWithParticipants; members: FamilyMemberRow[] }) {
  const meta        = CATEGORY_META[event.category ?? 'other'] ?? CATEGORY_META.other;
  const color       = event.color ?? meta.color;
  const participants = members.filter((m) => event.participantIds.includes(m.id));

  const timeLabel = event.all_day
    ? 'כל היום'
    : new Date(event.start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
      + ' – '
      + new Date(event.end_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/20"
      style={{ borderRightWidth: 5, borderRightColor: color }}
    >
      <div className="text-3xl flex-shrink-0">{meta.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xl font-bold text-white truncate">{event.title}</div>
        <div className="text-base text-white/70 mt-0.5">{timeLabel}</div>
        {event.location && (
          <div className="text-base text-white/60 mt-0.5 truncate">📍 {event.location}</div>
        )}
      </div>
      {/* Participants */}
      {participants.length > 0 && (
        <div className="flex gap-2 flex-shrink-0">
          {participants.slice(0, 4).map((m) => (
            <div key={m.id}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold ring-2 ring-white/30"
              style={{ backgroundColor: m.color }}
              title={m.display_name}
            >
              {m.display_name.charAt(0)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TV Task card
// ---------------------------------------------------------------------------
function TvTaskCard({ task, members }: { task: TaskRow; members: FamilyMemberRow[] }) {
  const assignee = members.find((m) => m.id === task.assigned_to);
  const priority = PRIORITY_META[task.priority];
  const isOverdue = task.due_date
    ? new Date(`${task.due_date}T00:00:00`) < new Date(new Date().toLocaleDateString('en-CA') + 'T00:00:00')
    : false;

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border ${
      isOverdue ? 'bg-red-900/30 border-red-500/40' : 'bg-white/10 border-white/20'
    }`}>
      <div className={`w-4 h-4 rounded-full flex-shrink-0 ${priority.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="text-xl font-semibold text-white truncate">{task.title}</div>
        {isOverdue && task.due_date && (
          <div className="text-sm text-red-400 mt-0.5">
            ⚠️ {new Date(`${task.due_date}T00:00:00`).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
          </div>
        )}
      </div>
      {assignee && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold"
            style={{ backgroundColor: assignee.color }}>
            {assignee.display_name.charAt(0)}
          </div>
          <span className="text-base text-white/70">{assignee.display_name}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty TV state
// ---------------------------------------------------------------------------
function TvEmpty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
      <span className="text-2xl opacity-50">{icon}</span>
      <span className="text-lg text-white/50">{text}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TvPage
// ---------------------------------------------------------------------------
export function TvPage() {
  const { activeFamily, members } = useFamily();
  const clock = useClock();
  const today    = todayKey();
  const tomorrow = addDays(today, 1);

  // Data
  const todayEventsHook    = useEventsForRange(today, today);
  const tomorrowEventsHook = useEventsForRange(tomorrow, tomorrow);
  const todayTasksHook     = useTasks({ status: 'active', dueDate: today });
  const overdueTasksHook   = useTasks({ overdue: true });

  // Auto-refresh all data every 60 seconds
  const refreshAll = useCallback(() => {
    void todayEventsHook.refresh();
    void tomorrowEventsHook.refresh();
    void todayTasksHook.refresh();
    void overdueTasksHook.refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(refreshAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refreshAll]);

  // Date display
  const dateLabel = new Date().toLocaleDateString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeLabel = clock.toLocaleTimeString('he-IL', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white"
      style={{ fontFamily: "'Segoe UI', 'Arial Hebrew', Arial, sans-serif" }}
    >
      <div className="max-w-screen-xl mx-auto px-8 py-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="text-5xl font-bold text-white leading-tight">
              {activeFamily?.name ?? 'יומן משפחתי'}
            </div>
            <div className="text-2xl text-white/70 mt-2">{dateLabel}</div>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold text-white tabular-nums">{timeLabel}</div>
            <div className="text-base text-white/40 mt-2 text-left">
              מתרענן אוטומטית כל דקה
            </div>
          </div>
        </div>

        {/* ── 2-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT column */}
          <div className="space-y-8">

            {/* Today events */}
            <TvSection icon="📅" title="אירועי היום" count={todayEventsHook.events.length}>
              {todayEventsHook.events.length === 0 ? (
                <TvEmpty icon="📅" text="אין אירועים היום" />
              ) : (
                <div className="space-y-3">
                  {todayEventsHook.events.map((e) => (
                    <TvEventCard
                      key={(e as EventWithParticipants & { _occurrenceKey?: string })._occurrenceKey ?? e.id}
                      event={e}
                      members={members}
                    />
                  ))}
                </div>
              )}
            </TvSection>

            {/* Tomorrow events */}
            <TvSection icon="🗓️" title={`מחר · ${formatWeekday(tomorrow)} ${formatShortDate(tomorrow)}`}
              count={tomorrowEventsHook.events.length}>
              {tomorrowEventsHook.events.length === 0 ? (
                <TvEmpty icon="🗓️" text="אין אירועים מחר" />
              ) : (
                <div className="space-y-3">
                  {tomorrowEventsHook.events.map((e) => (
                    <TvEventCard
                      key={(e as EventWithParticipants & { _occurrenceKey?: string })._occurrenceKey ?? e.id}
                      event={e}
                      members={members}
                    />
                  ))}
                </div>
              )}
            </TvSection>

          </div>

          {/* RIGHT column */}
          <div className="space-y-8">

            {/* Today tasks */}
            <TvSection icon="✅" title="מטלות להיום" count={todayTasksHook.tasks.length}>
              {todayTasksHook.tasks.length === 0 ? (
                <TvEmpty icon="✅" text="אין מטלות פתוחות להיום" />
              ) : (
                <div className="space-y-3">
                  {todayTasksHook.tasks.map((t) => (
                    <TvTaskCard key={t.id} task={t} members={members} />
                  ))}
                </div>
              )}
            </TvSection>

            {/* Overdue tasks */}
            {(overdueTasksHook.tasks.length > 0) && (
              <TvSection icon="⚠️" title="מטלות באיחור" count={overdueTasksHook.tasks.length}>
                <div className="space-y-3">
                  {overdueTasksHook.tasks.slice(0, 5).map((t) => (
                    <TvTaskCard key={t.id} task={t} members={members} />
                  ))}
                  {overdueTasksHook.tasks.length > 5 && (
                    <div className="text-base text-red-400 pr-2">
                      + עוד {overdueTasksHook.tasks.length - 5} מטלות באיחור
                    </div>
                  )}
                </div>
              </TvSection>
            )}

            {overdueTasksHook.tasks.length === 0 && todayTasksHook.tasks.length === 0 && (
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-green-900/30 border border-green-500/30">
                <span className="text-4xl">🎉</span>
                <div>
                  <div className="text-xl font-bold text-green-400">הכל מעודכן!</div>
                  <div className="text-base text-green-300/70">אין מטלות באיחור או להיום</div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm text-white/30">
            יומן משפחתי · תצוגת טלוויזיה
          </div>
          <a
            href="/"
            className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
          >
            חזור לאפליקציה הרגילה
          </a>
        </div>

      </div>
    </div>
  );
}
