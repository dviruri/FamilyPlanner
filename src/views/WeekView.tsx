import { useState } from 'react';
import { useAppStore } from '../store';
import { getEventsForDate } from '../utils/eventHelpers';
import { getWeekDays, shortDayName, isToday } from '../utils/dateHelpers';
import { EventCard } from '../components/EventCard';
import { AddEventModal } from '../components/AddEventModal';
import type { CalendarEvent } from '../types';

export function WeekView() {
  const { events, selectedMemberIds, currentDate, setCurrentDate, setView } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState(currentDate);
  const [editEvent, setEditEvent] = useState<CalendarEvent | undefined>();

  const weekDays = getWeekDays(currentDate);

  function openAdd(date: string) {
    setModalDate(date);
    setEditEvent(undefined);
    setShowModal(true);
  }

  function openEdit(e: CalendarEvent) {
    setEditEvent(e);
    setShowModal(true);
  }

  return (
    <div className="flex-1 overflow-auto p-3">
      <div className="grid grid-cols-7 gap-2 min-w-[700px]">
        {weekDays.map((day) => {
          const dayEvents = getEventsForDate(events, day, selectedMemberIds);
          const today = isToday(day);
          const dayNum = new Date(day + 'T00:00:00').getDate();

          return (
            <div
              key={day}
              className={`rounded-xl border min-h-48 flex flex-col ${
                today ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Day header */}
              <div
                className={`flex flex-col items-center py-2 border-b cursor-pointer hover:bg-gray-50 rounded-t-xl ${
                  today ? 'border-blue-200' : 'border-gray-100'
                }`}
                onClick={() => { setCurrentDate(day); setView('day'); }}
              >
                <span className="text-xs text-gray-500">{shortDayName(day)}</span>
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
                    today ? 'bg-blue-500 text-white' : 'text-gray-700'
                  }`}
                >
                  {dayNum}
                </span>
              </div>

              {/* Events */}
              <div className="flex-1 p-1.5 space-y-1 overflow-y-auto">
                {dayEvents.map((e) => (
                  <EventCard key={e.id} event={e} compact onClick={() => openEdit(e)} />
                ))}
              </div>

              {/* Add button */}
              <button
                onClick={() => openAdd(day)}
                className="w-full py-1 text-xs text-gray-400 hover:text-blue-500 hover:bg-gray-50 rounded-b-xl transition-colors focus:outline-none"
              >
                +
              </button>
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
