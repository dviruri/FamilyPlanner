import { useState } from 'react';
import { useFamily } from '../family/FamilyContext';
import { useEvents } from './useEvents';
import { EventCard } from './EventCard';
import { EventDetailsModal } from './EventDetailsModal';
import { AddEventModal } from './AddEventModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { groupByDate, formatEventDate } from '../../utils/eventTime';
import type { EventWithParticipants } from '../../services/eventsService';

const RANGE_OPTIONS = [
  { label: 'היום',     daysBack: 0, daysAhead: 0  },
  { label: 'השבוע',   daysBack: 0, daysAhead: 6  },
  { label: '30 יום',  daysBack: 0, daysAhead: 29 },
  { label: 'החודש שעבר', daysBack: 31, daysAhead: 0 },
] as const;

export function CalendarPage() {
  const { members } = useFamily();
  const [rangeIdx, setRangeIdx]         = useState(1); // default: this week
  const [showAdd, setShowAdd]           = useState(false);
  const [selected, setSelected]         = useState<EventWithParticipants | null>(null);
  const [filterMemberIds, setFilterMemberIds] = useState<string[]>([]);

  const range = RANGE_OPTIONS[rangeIdx];
  const { events, loading, error, refresh } = useEvents(range.daysBack, range.daysAhead);

  // Filter by selected members
  const filtered = filterMemberIds.length === 0
    ? events
    : events.filter((e) => e.participantIds.some((id) => filterMemberIds.includes(id)));

  const grouped = groupByDate(filtered);
  const sortedDates = Array.from(grouped.keys()).sort();

  function toggleFilter(id: string) {
    setFilterMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-0 shadow-sm">
        {/* Range tabs */}
        <div className="flex gap-1 mb-3">
          {RANGE_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => setRangeIdx(i)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                rangeIdx === i
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Member filter chips */}
        {members.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            <button
              onClick={() => setFilterMemberIds([])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
                filterMemberIds.length === 0
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👨‍👩‍👧‍👦 כולם
            </button>
            {members.map((m) => {
              const active = filterMemberIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleFilter(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
                    active ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={active ? { backgroundColor: m.color } : {}}
                >
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-[10px]"
                    style={{ backgroundColor: active ? 'rgba(255,255,255,0.3)' : m.color }}
                  >
                    {m.display_name.charAt(0)}
                  </span>
                  {m.display_name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 text-red-600 text-sm rounded-2xl px-4 py-3 mb-4">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon="📅"
            title="אין אירועים בטווח זה"
            description="לחץ על + כדי להוסיף אירוע חדש"
            actionLabel="הוסף אירוע"
            onAction={() => setShowAdd(true)}
          />
        )}

        {!loading && sortedDates.map((dateKey) => {
          const dayEvents = grouped.get(dateKey) ?? [];
          const isToday = dateKey === new Date().toLocaleDateString('en-CA');
          return (
            <div key={dateKey} className="mb-5">
              {/* Day header */}
              <div className={`flex items-center gap-2 mb-2 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isToday ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <span className="text-sm font-semibold">
                  {isToday ? `היום · ${formatEventDate(dayEvents[0].start_time)}` : formatEventDate(dayEvents[0].start_time)}
                </span>
              </div>
              <div className="space-y-2">
                {dayEvents.map((e) => (
                  <EventCard
                    key={e.id}
                    event={e}
                    members={members}
                    onClick={() => setSelected(e)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 left-4 md:bottom-6 md:left-6 w-14 h-14 bg-blue-500 text-white rounded-full
                   shadow-lg text-2xl flex items-center justify-center hover:bg-blue-600 active:scale-95
                   transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 z-30"
        title="הוסף אירוע"
      >
        +
      </button>

      {/* ── Modals ── */}
      {showAdd && (
        <AddEventModal
          onClose={() => setShowAdd(false)}
          onRefresh={() => void refresh()}
        />
      )}

      {selected && (
        <EventDetailsModal
          event={selected}
          onClose={() => setSelected(null)}
          onRefresh={() => void refresh()}
        />
      )}
    </div>
  );
}
