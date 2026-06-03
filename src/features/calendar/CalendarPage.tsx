import { useState } from 'react';
import { useFamily } from '../family/FamilyContext';
import { useEventsForRange } from './useEventsForRange';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { EventCard } from './EventCard';
import { EventDetailsModal } from './EventDetailsModal';
import { AddEventModal } from './AddEventModal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  todayKey, addDays, addWeeks,
  startOfIsraeliWeek, endOfIsraeliWeek,
  formatHebrewDate, formatMonthYear,
} from '../../utils/calendarDates';
import { groupByDate, formatEventDate } from '../../utils/eventTime';
import type { EventWithParticipants } from '../../services/eventsService';

type ViewMode = 'day' | 'week' | 'list';

const VIEW_LABELS: Record<ViewMode, string> = { day: 'יום', week: 'שבוע', list: 'רשימה' };

// ---------------------------------------------------------------------------
// Member filter bar (shared across views)
// ---------------------------------------------------------------------------
function MemberFilterBar({
  filterIds,
  onToggle,
  onClear,
}: {
  filterIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  const { members } = useFamily();
  if (members.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-4 bg-white border-b border-gray-100 scrollbar-hide">
      <button
        onClick={onClear}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
          filterIds.length === 0 ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        👨‍👩‍👧‍👦 כולם
      </button>
      {members.map((m) => {
        const active = filterIds.includes(m.id);
        return (
          <button
            key={m.id}
            onClick={() => onToggle(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
              active ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={active ? { backgroundColor: m.color } : {}}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
              style={{ backgroundColor: active ? 'rgba(255,255,255,0.3)' : m.color }}
            >
              {m.display_name.charAt(0)}
            </span>
            {m.display_name}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// List view (unchanged from original, but using the new hook signature)
// ---------------------------------------------------------------------------
function ListView({
  members,
  filterIds,
  onEventClick,
  onAddEvent,
}: {
  members: ReturnType<typeof useFamily>['members'];
  filterIds: string[];
  onEventClick: (e: EventWithParticipants) => void;
  onAddEvent: () => void;
}) {
  // Show next 30 days from today
  const start = todayKey();
  const end   = addDays(start, 29);
  const { events, loading, error } = useEventsForRange(start, end);

  const filtered = filterIds.length === 0
    ? events
    : events.filter((e) => e.participantIds.some((id) => filterIds.includes(id)));

  const grouped     = groupByDate(filtered);
  const sortedDates = Array.from(grouped.keys()).sort();
  const today       = todayKey();

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div className="bg-red-50 text-red-600 text-sm rounded-2xl px-4 py-3 m-4">{error}</div>
  );
  if (filtered.length === 0) return (
    <EmptyState icon="📅" title="אין אירועים בטווח זה"
      description="לחץ על + כדי להוסיף אירוע חדש"
      actionLabel="הוסף אירוע" onAction={onAddEvent} />
  );

  return (
    <div className="px-4 py-4 space-y-5">
      {sortedDates.map((dk) => {
        const dayEvents = grouped.get(dk) ?? [];
        const isToday   = dk === today;
        return (
          <div key={dk}>
            <div className={`flex items-center gap-2 mb-2 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isToday ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <span className="text-sm font-semibold">
                {isToday ? `היום · ${formatEventDate(dayEvents[0].start_time)}` : formatEventDate(dayEvents[0].start_time)}
              </span>
            </div>
            <div className="space-y-2">
              {dayEvents.map((e) => (
                <EventCard key={e.id} event={e} members={members} onClick={() => onEventClick(e)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Navigation bar title
// ---------------------------------------------------------------------------
function navTitle(view: ViewMode, dateKey: string): string {
  if (view === 'day')  return formatHebrewDate(dateKey);
  if (view === 'week') {
    const sun = startOfIsraeliWeek(dateKey);
    const sat = endOfIsraeliWeek(dateKey);
    const s = new Date(`${sun}T00:00:00`).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
    const e = new Date(`${sat}T00:00:00`).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
    return `${s} – ${e}`;
  }
  return formatMonthYear(dateKey);
}

function navigate(view: ViewMode, dateKey: string, dir: -1 | 1): string {
  if (view === 'day')  return addDays(dateKey, dir);
  if (view === 'week') return addWeeks(dateKey, dir);
  return addDays(dateKey, dir * 30);
}

// ---------------------------------------------------------------------------
// CalendarPage
// ---------------------------------------------------------------------------
export function CalendarPage() {
  const { members } = useFamily();

  const [view, setView]           = useState<ViewMode>('week');
  const [dateKey, setDateKey]     = useState(todayKey);
  const [filterIds, setFilterIds] = useState<string[]>([]);
  const [showAdd, setShowAdd]     = useState(false);
  const [addDefaultDate, setAddDefaultDate] = useState<string | undefined>();
  const [selected, setSelected]   = useState<EventWithParticipants | null>(null);

  // Shared refresh token — passed down so sub-views can trigger a refresh
  const [refreshKey, setRefreshKey] = useState(0);
  const doRefresh = () => setRefreshKey((k) => k + 1);

  function toggleFilter(id: string) {
    setFilterIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function openAdd(defaultDate?: string) {
    setAddDefaultDate(defaultDate);
    setShowAdd(true);
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ── Navigation bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-2">
        <div className="flex items-center gap-2">
          {/* Prev */}
          <button
            onClick={() => setDateKey((k) => navigate(view, k, -1))}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 font-bold text-lg transition-colors"
            title="הקודם"
          >
            ›
          </button>

          {/* Today */}
          <button
            onClick={() => setDateKey(todayKey())}
            className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
          >
            היום
          </button>

          {/* Next */}
          <button
            onClick={() => setDateKey((k) => navigate(view, k, 1))}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 font-bold text-lg transition-colors"
            title="הבא"
          >
            ‹
          </button>

          {/* Title */}
          <span className="flex-1 text-center text-sm font-semibold text-gray-700 truncate px-2">
            {navTitle(view, dateKey)}
          </span>

          {/* View switcher */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
            {(['day', 'week', 'list'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === v ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Member filter ── */}
      <MemberFilterBar filterIds={filterIds} onToggle={toggleFilter} onClear={() => setFilterIds([])} />

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'day' && (
          <DayView
            key={`day-${dateKey}-${refreshKey}`}
            dateKey={dateKey}
            members={members}
            filterMemberIds={filterIds}
            onEventClick={setSelected}
            onAddEvent={() => openAdd(dateKey)}
            refresh={doRefresh}
          />
        )}

        {view === 'week' && (
          <WeekView
            key={`week-${dateKey}-${refreshKey}`}
            dateKey={dateKey}
            members={members}
            filterMemberIds={filterIds}
            onEventClick={setSelected}
            onDayClick={(k) => { setDateKey(k); setView('day'); }}
            onAddEvent={(d) => openAdd(d)}
          />
        )}

        {view === 'list' && (
          <div key={`list-${refreshKey}`} className="flex-1 overflow-y-auto">
            <ListView
              members={members}
              filterIds={filterIds}
              onEventClick={setSelected}
              onAddEvent={() => openAdd(dateKey)}
            />
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => openAdd(dateKey)}
        className="fixed bottom-20 left-4 md:bottom-6 md:left-6 w-14 h-14 bg-blue-500 text-white
                   rounded-full shadow-lg text-2xl flex items-center justify-center
                   hover:bg-blue-600 active:scale-95 transition-all
                   focus:outline-none focus:ring-4 focus:ring-blue-300 z-30"
        title="הוסף אירוע"
      >
        +
      </button>

      {/* ── Modals ── */}
      {showAdd && (
        <AddEventModal
          defaultDate={addDefaultDate}
          onClose={() => setShowAdd(false)}
          onRefresh={doRefresh}
        />
      )}
      {selected && (
        <EventDetailsModal
          event={selected}
          onClose={() => setSelected(null)}
          onRefresh={doRefresh}
        />
      )}
    </div>
  );
}
