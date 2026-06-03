import { useState } from 'react';
import { useFamily } from '../family/FamilyContext';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { EventForm } from './EventForm';
import { CATEGORY_META } from './categoryMeta';
import { formatEventDate, formatEventTime, toTimestamp } from '../../utils/eventTime';
import { updateEvent, deleteEvent } from '../../services/eventsService';
import type { EventWithParticipants } from '../../services/eventsService';

interface EventDetailsModalProps {
  event: EventWithParticipants;
  onClose: () => void;
  onRefresh: () => void;
}

export function EventDetailsModal({ event, onClose, onRefresh }: EventDetailsModalProps) {
  const { members, activeFamily } = useFamily();
  const { user } = useAuth();

  const [mode, setMode]         = useState<'view' | 'edit'>('view');
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const meta         = CATEGORY_META[event.category ?? 'other'] ?? CATEGORY_META.other;
  const participants = members.filter((m) => event.participantIds.includes(m.id));

  async function handleUpdate(data: Parameters<typeof EventForm>[0]['onSubmit'] extends (d: infer D) => unknown ? D : never) {
    if (!activeFamily || !user) return;
    const start = data.allDay
      ? new Date(`${data.date}T00:00:00`).toISOString()
      : toTimestamp(data.date, data.startTime);
    const end = data.allDay
      ? new Date(`${data.date}T23:59:59`).toISOString()
      : toTimestamp(data.date, data.endTime);

    const { error: err } = await updateEvent(
      event.id,
      { title: data.title, start_time: start, end_time: end, all_day: data.allDay,
        location: data.location || undefined, description: data.description || undefined,
        category: data.category, visibility: 'family' },
      data.participantIds,
    );
    if (err) { setError(err); return; }
    onRefresh();
    onClose();
  }

  async function handleDelete() {
    if (!confirm('למחוק את האירוע?')) return;
    setDeleting(true);
    const { error: err } = await deleteEvent(event.id);
    setDeleting(false);
    if (err) { setError(err); return; }
    onRefresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Drag handle (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.icon}</span>
            <span className="font-bold text-gray-800 text-base truncate max-w-[200px]">
              {event.title}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {mode === 'view' ? (
            <div className="px-5 py-4 space-y-4">
              {/* Date + time */}
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">📅</span>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {formatEventDate(event.start_time)}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {formatEventTime(event.start_time, event.end_time, event.all_day)}
                  </div>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📍</span>
                  <span className="text-sm text-gray-700">{event.location}</span>
                </div>
              )}

              {/* Category */}
              <div className="flex items-center gap-3">
                <span className="text-xl">🏷️</span>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.label}
                </span>
              </div>

              {/* Description */}
              {event.description && (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📝</span>
                  <span className="text-sm text-gray-700 whitespace-pre-wrap">{event.description}</span>
                </div>
              )}

              {/* Participants */}
              {participants.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">👥</span>
                  <div className="flex flex-wrap gap-2">
                    {participants.map((m) => (
                      <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium"
                        style={{ backgroundColor: m.color }}>
                        {m.display_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="danger" size="md" onClick={() => void handleDelete()} loading={deleting}>
                  מחק
                </Button>
                <Button variant="secondary" fullWidth size="md" onClick={() => setMode('edit')}>
                  ✏️ עריכה
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4">
              <EventForm
                initial={event}
                onSubmit={handleUpdate}
                onCancel={() => setMode('view')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
