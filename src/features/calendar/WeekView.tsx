import { useEventsForRange } from './useEventsForRange';
import { EventCard } from './EventCard';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  weekDays,
  startOfIsraeliWeek,
  endOfIsraeliWeek,
  todayKey,
  isSameDay,
  formatWeekday,
  formatShortDate,
} from '../../utils/calendarDates';
import { toDateInput } from '../../utils/eventTime';
import type { FamilyMemberRow } from '../../types/database';
import type { EventWithParticipants } from '../../services/eventsService';

interface WeekViewProps {
  dateKey: string;            // any day in the target week
  members: FamilyMemberRow[];
  filterMemberIds: string[];
  onEventClick: (e: EventWithParticipants) => void;
  onDayClick: (key: string) => void;  // navigate to day view
  onAddEvent: (defaultDate: string) => void;
}

export function WeekView({
  dateKey,
  members,
  filterMemberIds,
  onEventClick,
  onDayClick,
  onAddEvent,
}: WeekViewProps) {
  const days    = weekDays(dateKey);
  const weekStart = startOfIsraeliWeek(dateKey);
  const weekEnd   = endOfIsraeliWeek(dateKey);

  const { events, loading, error } = useEventsForRange(weekStart, weekEnd);

  // Apply member filter
  const filtered = filterMemberIds.length === 0
    ? events
    : events.filter((e) => e.participantIds.some((id) => filterMemberIds.includes(id)));

  // Group events by day key
  const byDay = new Map<string, EventWithParticipants[]>();
  for (const day of days) byDay.set(day, []);
  for (const e of filtered) {
    const key = toDateInput(e.start_time);
    if (byDay.has(key)) byDay.get(key)!.push(e);
  }
  // Sort each day's events
  for (const [, arr] of byDay) arr.sort((a, b) => a.start_time.localeCompare(b.start_time));

  const today   = todayKey();
  const hasAny  = filtered.length > 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-600 text-sm rounded-2xl px-4 py-3 m-4">{error}</div>
      )}

      {!loading && !hasAny && (
        <EmptyState
          icon="🗓️"
          title="אין אירועים השבוע"
          description="לחץ על + כדי להוסיף אירוע"
          actionLabel="הוסף אירוע"
          onAction={() => onAddEvent(today)}
        />
      )}

      {!loading && (
        /* Horizontal scroll on mobile, grid on desktop */
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[560px] gap-px bg-gray-200">
            {days.map((day) => {
              const isToday  = isSameDay(day, today);
              const isActive = isSameDay(day, dateKey);
              const dayEvents = byDay.get(day) ?? [];

              return (
                <div
                  key={day}
                  className={`bg-white flex flex-col min-h-[120px] ${isToday ? 'bg-blue-50/60' : ''}`}
                >
                  {/* Day header */}
                  <button
                    onClick={() => onDayClick(day)}
                    className={`w-full py-2 px-1 text-center border-b transition-colors
                      ${isToday ? 'border-blue-200' : 'border-gray-100'}
                      hover:bg-gray-50 focus:outline-none`}
                  >
                    <div className={`text-xs font-semibold ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                      {formatWeekday(day)}
                    </div>
                    <div
                      className={`mx-auto mt-0.5 w-7 h-7 rounded-full flex items-center justify-center
                        text-sm font-bold transition-colors
                        ${isToday
                          ? 'bg-blue-500 text-white'
                          : isActive
                            ? 'bg-gray-200 text-gray-800'
                            : 'text-gray-700'}`}
                    >
                      {formatShortDate(day).split('/')[0]}
                    </div>
                  </button>

                  {/* Events */}
                  <div className="flex-1 p-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 4).map((e) => (
                      <EventCard
                        key={e.id}
                        event={e}
                        members={members}
                        onClick={() => onEventClick(e)}
                        compact
                      />
                    ))}
                    {dayEvents.length > 4 && (
                      <button
                        onClick={() => onDayClick(day)}
                        className="text-xs text-blue-400 hover:text-blue-600 w-full text-center py-0.5"
                      >
                        עוד {dayEvents.length - 4}
                      </button>
                    )}
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => onAddEvent(day)}
                    className="py-1 text-xs text-gray-300 hover:text-blue-400 hover:bg-gray-50 transition-colors w-full"
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
