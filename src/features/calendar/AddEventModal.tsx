import { useFamily } from '../family/FamilyContext';
import { useAuth } from '../auth/AuthContext';
import { EventForm } from './EventForm';
import { createEvent } from '../../services/eventsService';
import { toTimestamp } from '../../utils/eventTime';

interface AddEventModalProps {
  defaultDate?: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function AddEventModal({ defaultDate, onClose, onRefresh }: AddEventModalProps) {
  const { activeFamily } = useFamily();
  const { user }         = useAuth();

  async function handleSubmit(data: Parameters<typeof EventForm>[0]['onSubmit'] extends (d: infer D) => unknown ? D : never) {
    if (!activeFamily || !user) return;

    const start = data.allDay
      ? new Date(`${data.date}T00:00:00`).toISOString()
      : toTimestamp(data.date, data.startTime);
    const end = data.allDay
      ? new Date(`${data.date}T23:59:59`).toISOString()
      : toTimestamp(data.date, data.endTime);

    await createEvent(
      { family_id: activeFamily.id, title: data.title, start_time: start, end_time: end,
        all_day: data.allDay, location: data.location || undefined,
        description: data.description || undefined, category: data.category,
        created_by: user.id, visibility: 'family' },
      data.participantIds,
    );
    onRefresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Drag handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <span className="font-bold text-gray-800">אירוע חדש</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <EventForm defaultDate={defaultDate} onSubmit={handleSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}
