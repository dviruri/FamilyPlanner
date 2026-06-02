import { useState } from 'react';
import { useAppStore } from '../store';
import { getEventsForDate } from '../utils/eventHelpers';
import { formatDateHebrew, isToday } from '../utils/dateHelpers';
import { EventCard } from '../components/EventCard';
import { AddEventModal } from '../components/AddEventModal';
import type { CalendarEvent } from '../types';

export function DayView() {
  const { events, selectedMemberIds, currentDate } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | undefined>();

  const dayEvents = getEventsForDate(events, currentDate, selectedMemberIds);
  const today = isToday(currentDate);

  return (
    <div className="flex-1 p-4 overflow-y-auto max-w-2xl mx-auto w-full">
      {/* Date header */}
      <div className={`text-center mb-4 py-3 rounded-xl ${today ? 'bg-blue-50' : ''}`}>
        <div className={`text-xl font-bold ${today ? 'text-blue-600' : 'text-gray-700'}`}>
          {formatDateHebrew(currentDate)}
        </div>
        {today && (
          <div className="text-xs text-blue-400 mt-0.5">היום</div>
        )}
      </div>

      {/* Events */}
      {dayEvents.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📅</div>
          <div className="text-base">אין אירועים ביום זה</div>
          <button
            onClick={() => { setEditEvent(undefined); setShowModal(true); }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            + הוסף אירוע
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {dayEvents.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              onClick={() => { setEditEvent(e); setShowModal(true); }}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      {dayEvents.length > 0 && (
        <button
          onClick={() => { setEditEvent(undefined); setShowModal(true); }}
          className="fixed bottom-6 left-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-blue-600 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
          title="הוסף אירוע"
        >
          +
        </button>
      )}

      {showModal && (
        <AddEventModal
          defaultDate={currentDate}
          editEvent={editEvent}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
