import { useEventsForRange } from './useEventsForRange';
import { EventCard } from './EventCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatHebrewDate, todayKey, isSameDay } from '../../utils/calendarDates';
import type { FamilyMemberRow } from '../../types/database';
import type { EventWithParticipants } from '../../services/eventsService';

interface DayViewProps {
  dateKey: string;            // YYYY-MM-DD
  members: FamilyMemberRow[];
  filterMemberIds: string[];
  onEventClick: (e: EventWithParticipants) => void;
  onAddEvent: () => void;
  refresh: () => void;
}

export function DayView({
  dateKey,
  members,
  filterMemberIds,
  onEventClick,
  onAddEvent,
}: DayViewProps) {
  const { events, loading, error } = useEventsForRange(dateKey, dateKey);

  // Apply member filter
  const filtered = filterMemberIds.length === 0
    ? events
    : events.filter((e) => e.participantIds.some((id) => filterMemberIds.includes(id)));

  const allDayEvents = filtered.filter((e) => e.all_day);
  const timedEvents  = filtered.filter((e) => !e.all_day)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const isToday = isSameDay(dateKey, todayKey());

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* Date title */}
      <div className={`mb-4 pb-3 border-b border-gray-100 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
        <h2 className="text-lg font-bold">
          {isToday && <span className="text-sm font-normal ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">היום</span>}
          {formatHebrewDate(dateKey)}
        </h2>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-600 text-sm rounded-2xl px-4 py-3">{error}</div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon="📅"
          title="אין אירועים ביום הזה"
          description="לחץ על + כדי להוסיף אירוע"
          actionLabel="הוסף אירוע"
          onAction={onAddEvent}
        />
      )}

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">כל היום</div>
          <div className="space-y-2">
            {allDayEvents.map((e) => (
              <EventCard key={e.id} event={e} members={members} onClick={() => onEventClick(e)} />
            ))}
          </div>
        </div>
      )}

      {/* Timed events */}
      {timedEvents.length > 0 && (
        <div className="space-y-2">
          {timedEvents.map((e) => (
            <EventCard key={e.id} event={e} members={members} onClick={() => onEventClick(e)} />
          ))}
        </div>
      )}
    </div>
  );
}
