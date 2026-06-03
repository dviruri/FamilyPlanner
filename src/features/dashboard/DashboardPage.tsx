import { useState, useCallback } from 'react';
import { useFamily } from '../family/FamilyContext';
import { useAuth } from '../auth/AuthContext';
import { useEventsForRange } from '../calendar/useEventsForRange';
import { useTasks } from '../tasks/useTasks';
import { EventCard } from '../calendar/EventCard';
import { EventDetailsModal } from '../calendar/EventDetailsModal';
import { AddEventModal } from '../calendar/AddEventModal';
import { TaskCard } from '../tasks/TaskCard';
import { TaskDetailsModal } from '../tasks/TaskDetailsModal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { completeTask, reopenTask } from '../../services/tasksService';
import {
  todayKey, addDays, formatWeekday, formatShortDate,
} from '../../utils/calendarDates';
import { toDateInput } from '../../utils/eventTime';
import type { AppPage } from '../../types/index';
import type { EventWithParticipants } from '../../services/eventsService';
import type { TaskRow } from '../../types/database';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function greeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return 'לילה טוב 🌙';
  if (h < 12) return 'בוקר טוב ☀️';
  if (h < 17) return 'צהריים טובים 🌤️';
  if (h < 20) return 'אחר-הצהריים טוב 🌅';
  return 'ערב טוב 🌆';
}

function sectionHeader(
  icon: string,
  title: string,
  count: number,
  onNavigate?: () => void,
  navLabel?: string,
  urgent?: boolean,
) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className={`text-base font-bold flex items-center gap-2 ${urgent ? 'text-red-600' : 'text-gray-800'}`}>
        <span>{icon}</span>
        {title}
        {count > 0 && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            urgent ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {count}
          </span>
        )}
      </h2>
      {onNavigate && (
        <button onClick={onNavigate}
          className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors">
          {navLabel ?? 'הכל ›'}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardPage
// ---------------------------------------------------------------------------
interface DashboardPageProps {
  onNavigate: (page: AppPage) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { members, activeFamily } = useFamily();
  const { user } = useAuth();
  const today = todayKey();
  const weekEnd = addDays(today, 6);

  // ── Data hooks ──
  const eventsHook   = useEventsForRange(today, today);
  const upcomingHook = useEventsForRange(today, weekEnd);
  const tasksToday   = useTasks({ status: 'active', dueDate: today });
  const tasksOverdue = useTasks({ overdue: true });

  // ── Modal state ──
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selEvent, setSelEvent]         = useState<EventWithParticipants | null>(null);
  const [selTask, setSelTask]           = useState<TaskRow | null>(null);
  const [busyIds, setBusyIds]           = useState<Set<string>>(new Set());

  const refreshAll = useCallback(() => {
    void eventsHook.refresh();
    void upcomingHook.refresh();
    void tasksToday.refresh();
    void tasksOverdue.refresh();
  }, [eventsHook, upcomingHook, tasksToday, tasksOverdue]);

  // Quick task toggle
  async function handleToggleTask(task: TaskRow) {
    if (!user) return;
    setBusyIds((p) => new Set(p).add(task.id));
    if (task.status === 'completed') await reopenTask(task.id);
    else await completeTask(task.id, user.id);
    setBusyIds((p) => { const s = new Set(p); s.delete(task.id); return s; });
    refreshAll();
  }

  // ── Upcoming grouped by day ──
  const upcomingByDay = new Map<string, EventWithParticipants[]>();
  for (const e of upcomingHook.events) {
    const k = toDateInput(e.start_time);
    if (!upcomingByDay.has(k)) upcomingByDay.set(k, []);
    upcomingByDay.get(k)!.push(e);
  }
  const upcomingDays = Array.from(upcomingByDay.keys()).sort().slice(0, 6);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">

      {/* ── Hero header ── */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-0.5">{greeting()}</div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {activeFamily?.name ?? 'יומן משפחתי'}
        </h1>
        <div className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('he-IL', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="flex gap-2 mb-7">
        <Button size="md" icon={<span>📅</span>} onClick={() => setShowAddEvent(true)}>
          אירוע חדש
        </Button>
        <Button variant="secondary" size="md" icon={<span>✅</span>}
          onClick={() => onNavigate('tasks')}>
          הוסף מטלה
        </Button>
      </div>

      {/* ── Overdue tasks (shown prominently if exist) ── */}
      {(tasksOverdue.tasks.length > 0 || tasksOverdue.loading) && (
        <section className="mb-6">
          {sectionHeader('⚠️', 'מטלות באיחור', tasksOverdue.tasks.length,
            () => onNavigate('tasks'), 'כל המטלות ›', true)}
          {tasksOverdue.loading ? (
            <Spinner />
          ) : (
            <div className="space-y-2">
              {tasksOverdue.tasks.slice(0, 3).map((t) => (
                <div key={t.id} className="rounded-2xl ring-1 ring-red-200">
                  <TaskCard task={t} members={members}
                    onToggleComplete={() => void handleToggleTask(t)}
                    onClick={() => setSelTask(t)}
                    busy={busyIds.has(t.id)} />
                </div>
              ))}
              {tasksOverdue.tasks.length > 3 && (
                <button onClick={() => onNavigate('tasks')}
                  className="text-sm text-red-500 hover:text-red-700 font-medium pr-1">
                  + עוד {tasksOverdue.tasks.length - 3} מטלות באיחור ›
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Today events ── */}
      <section className="mb-6">
        {sectionHeader('📅', 'אירועי היום', eventsHook.events.length,
          () => onNavigate('calendar'), 'כל היומן ›')}
        {eventsHook.loading ? <Spinner /> :
         eventsHook.events.length === 0 ? (
          <Card>
            <EmptyState icon="📅" title="אין אירועים היום"
              actionLabel="הוסף אירוע" onAction={() => setShowAddEvent(true)} />
          </Card>
        ) : (
          <div className="space-y-2">
            {eventsHook.events.map((e) => (
              <EventCard key={e.id} event={e} members={members} onClick={() => setSelEvent(e)} />
            ))}
          </div>
        )}
      </section>

      {/* ── Today tasks ── */}
      <section className="mb-6">
        {sectionHeader('✅', 'מטלות להיום', tasksToday.tasks.length,
          () => onNavigate('tasks'), 'כל המטלות ›')}
        {tasksToday.loading ? <Spinner /> :
         tasksToday.tasks.length === 0 ? (
          <Card>
            <EmptyState icon="✅" title="אין מטלות להיום"
              description="יפה! כל המטלות לשיום מטופלות" />
          </Card>
        ) : (
          <div className="space-y-2">
            {tasksToday.tasks.map((t) => (
              <TaskCard key={t.id} task={t} members={members}
                onToggleComplete={() => void handleToggleTask(t)}
                onClick={() => setSelTask(t)}
                busy={busyIds.has(t.id)} />
            ))}
          </div>
        )}
      </section>

      {/* ── Upcoming week ── */}
      <section>
        {sectionHeader('🗓️', 'השבוע הקרוב', upcomingHook.events.length,
          () => onNavigate('calendar'), 'תצוגת שבוע ›')}
        {upcomingHook.loading ? <Spinner /> :
         upcomingDays.length === 0 ? (
          <Card>
            <EmptyState icon="🗓️" title="אין אירועים בשבוע הקרוב" />
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingDays.map((dk) => {
              const dayEvts = upcomingByDay.get(dk) ?? [];
              const isToday = dk === today;
              return (
                <div key={dk}>
                  {/* Day label */}
                  <div className={`flex items-center gap-2 mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                    <span className={`text-xs font-semibold ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                      {isToday ? 'היום' : formatWeekday(dk)}
                    </span>
                    <span className={`text-xs ${isToday ? 'text-blue-400' : 'text-gray-400'}`}>
                      {formatShortDate(dk)}
                    </span>
                    <div className={`flex-1 h-px ${isToday ? 'bg-blue-100' : 'bg-gray-100'}`} />
                  </div>
                  <div className="space-y-2">
                    {dayEvts.map((e) => (
                      <EventCard key={e.id} event={e} members={members}
                        onClick={() => setSelEvent(e)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Modals ── */}
      {showAddEvent && (
        <AddEventModal defaultDate={today}
          onClose={() => setShowAddEvent(false)}
          onRefresh={refreshAll} />
      )}
      {selEvent && (
        <EventDetailsModal event={selEvent}
          onClose={() => setSelEvent(null)}
          onRefresh={refreshAll} />
      )}
      {selTask && (
        <TaskDetailsModal task={selTask}
          onClose={() => setSelTask(null)}
          onRefresh={refreshAll} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Spinner helper
// ---------------------------------------------------------------------------
function Spinner() {
  return (
    <div className="flex justify-center py-6">
      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
