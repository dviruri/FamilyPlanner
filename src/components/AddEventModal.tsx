import { useState } from 'react';
import { useAppStore } from '../store';
import type { CalendarEvent, EventCategory } from '../types';
import { CATEGORY_LABELS } from '../utils/eventHelpers';

interface Props {
  defaultDate: string;
  onClose: () => void;
  editEvent?: CalendarEvent;
}

export function AddEventModal({ defaultDate, onClose, editEvent }: Props) {
  const { members, addEvent, updateEvent, deleteEvent } = useAppStore();

  const [title, setTitle] = useState(editEvent?.title ?? '');
  const [date, setDate] = useState(editEvent?.date ?? defaultDate);
  const [startTime, setStartTime] = useState(editEvent?.startTime ?? '09:00');
  const [endTime, setEndTime] = useState(editEvent?.endTime ?? '10:00');
  const [category, setCategory] = useState<EventCategory>(editEvent?.category ?? 'other');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    editEvent?.memberIds ?? []
  );
  const [workLocation, setWorkLocation] = useState(editEvent?.workLocation ?? null);
  const [notes, setNotes] = useState(editEvent?.notes ?? '');
  const [isRecurring, setIsRecurring] = useState(editEvent?.isRecurring ?? false);
  const [recurringDays, setRecurringDays] = useState<number[]>(
    editEvent?.recurringDays ?? []
  );

  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  function toggleMember(id: string) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function toggleDay(d: number) {
    setRecurringDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || selectedMembers.length === 0) return;
    const event: CalendarEvent = {
      id: editEvent?.id ?? crypto.randomUUID(),
      title: title.trim(),
      date,
      startTime,
      endTime,
      category,
      memberIds: selectedMembers,
      workLocation: category === 'work' ? workLocation : null,
      notes: notes.trim() || undefined,
      isRecurring,
      recurringDays: isRecurring ? recurringDays : undefined,
    };
    if (editEvent) updateEvent(event);
    else addEvent(event);
    onClose();
  }

  function handleDelete() {
    if (editEvent) {
      deleteEvent(editEvent.id);
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {editEvent ? 'עריכת אירוע' : 'אירוע חדש'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="שם האירוע"
              required
            />
          </div>

          {/* Date + times */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">התחלה</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סיום</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Work location */}
          {category === 'work' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מיקום עבודה</label>
              <div className="flex gap-2">
                {(['office', 'home'] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setWorkLocation(loc)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      workLocation === loc
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {loc === 'office' ? '🏢 משרד' : '🏠 בית'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">בני משפחה</label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const sel = selectedMembers.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMember(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      sel ? 'text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                    style={sel ? { backgroundColor: m.color } : {}}
                  >
                    {m.avatar} {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">אירוע חוזר</span>
            </label>
            {isRecurring && (
              <div className="flex gap-1.5 mt-2">
                {dayNames.map((name, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      recurringDays.includes(i)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="הערות נוספות..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {editEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              >
                מחק
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              {editEvent ? 'עדכן' : 'הוסף'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
