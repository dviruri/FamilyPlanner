import { useState, type FormEvent } from 'react';
import { useFamily } from '../family/FamilyContext';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { CATEGORIES } from './categoryMeta';
import { toTimestamp, toDateInput, toTimeInput } from '../../utils/eventTime';
import type { EventWithParticipants } from '../../services/eventsService';

interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string;
  description: string;
  category: string;
  participantIds: string[];
}

interface EventFormProps {
  initial?: EventWithParticipants;
  defaultDate?: string;   // YYYY-MM-DD
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function EventForm({ initial, defaultDate, onSubmit, onCancel, loading }: EventFormProps) {
  const { members } = useFamily();
  const { user }    = useAuth();

  const today = defaultDate ?? new Date().toLocaleDateString('en-CA');

  const [title, setTitle]           = useState(initial?.title ?? '');
  const [date, setDate]             = useState(initial ? toDateInput(initial.start_time) : today);
  const [startTime, setStartTime]   = useState(initial ? toTimeInput(initial.start_time) : '09:00');
  const [endTime, setEndTime]       = useState(initial ? toTimeInput(initial.end_time)   : '10:00');
  const [allDay, setAllDay]         = useState(initial?.all_day ?? false);
  const [location, setLocation]     = useState(initial?.location ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory]     = useState(initial?.category ?? 'other');
  const [participants, setParticipants] = useState<string[]>(
    initial?.participantIds ?? (user ? [] : []),
  );
  const [error, setError]           = useState<string | null>(null);
  const [busy, setBusy]             = useState(false);

  function toggleParticipant(id: string) {
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError('כותרת היא שדה חובה'); return; }
    if (!date)          { setError('תאריך הוא שדה חובה'); return; }

    if (!allDay) {
      const start = toTimestamp(date, startTime);
      const end   = toTimestamp(date, endTime);
      if (new Date(end) <= new Date(start)) {
        setError('שעת הסיום חייבת להיות אחרי שעת ההתחלה');
        return;
      }
    }

    setBusy(true);
    await onSubmit({ title: title.trim(), date, startTime, endTime, allDay, location, description, category, participantIds: participants });
    setBusy(false);
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">כותרת *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="שם האירוע" required className={inputCls} autoFocus />
      </div>

      {/* All day toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <div
          onClick={() => setAllDay(!allDay)}
          className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${allDay ? 'bg-blue-500' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${allDay ? 'translate-x-5' : 'translate-x-1'}`} />
        </div>
        <span className="text-sm font-medium text-gray-700">כל היום</span>
      </label>

      {/* Date */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">תאריך *</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} dir="ltr" />
      </div>

      {/* Times */}
      {!allDay && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">שעת התחלה</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">שעת סיום</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} dir="ltr" />
          </div>
        </div>
      )}

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">קטגוריה</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                category === c.value
                  ? 'border-transparent text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={category === c.value ? { backgroundColor: c.color } : {}}
            >
              <span className="text-base">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">מיקום</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
          placeholder="כתובת / שם המקום" className={inputCls} />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">תיאור / הערות</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          rows={2} placeholder="פרטים נוספים..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
      </div>

      {/* Participants */}
      {members.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">משתתפים</label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const selected = participants.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleParticipant(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    selected ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                  }`}
                  style={selected ? { backgroundColor: m.color } : {}}
                >
                  <span
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: selected ? 'rgba(255,255,255,0.3)' : m.color }}
                  >
                    {m.display_name.charAt(0)}
                  </span>
                  {m.display_name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel} size="md">
          ביטול
        </Button>
        <Button type="submit" fullWidth size="md" loading={busy || loading} disabled={!title.trim()}>
          {initial ? 'שמור שינויים' : 'הוסף אירוע'}
        </Button>
      </div>
    </form>
  );
}
