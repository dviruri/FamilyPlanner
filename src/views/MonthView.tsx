import { useState } from 'react';
import { useAppStore } from '../store';
import { getEventsForDate } from '../utils/eventHelpers';
import { getMonthDays, isToday } from '../utils/dateHelpers';
import { EventCard } from '../components/EventCard';
import { AddEventModal } from '../components/AddEventModal';
import type { CalendarEvent } from '../types';

const WEEK_HEADER_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

export function MonthView() {
  const { events, selectedMemberIds, currentDate, setCurrentDate, setView } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState(currentDate);
  const [editEvent, setEditEvent] = useState<CalendarEvent | undefined>();

  const monthDays = getMonthDays(currentDate);
  const currentMonth = new Date(currentDate + 'T00:00:00').getMonth();

  function openAdd(date: string) {
    setModalDate(date);
    setEditEvent(undefined);
    setShowModal(true);
  }

  return (
    <div className="flex-1 overflow-auto p-3">
      {/* Week header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK_HEADER_DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day) => {
          const dayEvents = getEventsForDate(events, day, selectedMemberIds);
          const today = isToday(day);
          const isCurrentMonth = new Date(day + 'T00:00:00').getMonth() === currentMonth;
          const dayNum = new Date(day + 'T00:00:00').getDate();

          return (
            <div
              key={day}
              className={`min-h-20 rounded-lg border flex flex-col overflow-hidden ${
                today
                  ? 'border-blue-400 bg-blue-50/60'
                  : isCurrentMonth
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              {/* Day number */}
              <div
                className="flex items-center justify-between px-2 pt-1.5 pb-1 cursor-pointer"
                onClick={() => { setCurrentDate(day); setView('day'); }}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    today
                      ? 'bg-blue-500 text-white'
                      : isCurrentMonth
                      ? 'text-gray-700'
                      : 'text-gray-300'
                  }`}
                >
                  {dayNum}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); openAdd(day); }}
                  className="text-gray-300 hover:text-blue-400 text-sm leading-none"
                >
                  +
                </button>
              </div>

              {/* Events (max 3) */}
              <div className="px-1 pb-1 space-y-0.5 flex-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <EventCard
                    key={e.id}
                    event={e}
                    compact
                    onClick={() => { setEditEvent(e); setShowModal(true); }}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div
                    className="text-xs text-center text-blue-400 cursor-pointer hover:text-blue-600"
                    onClick={() => { setCurrentDate(day); setView('day'); }}
                  >
                    +{dayEvents.length - 3} עוד
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <AddEventModal
          defaultDate={modalDate}
          editEvent={editEvent}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
