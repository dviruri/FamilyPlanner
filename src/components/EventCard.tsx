import type { CalendarEvent } from '../types';
import { useAppStore } from '../store';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/eventHelpers';

interface Props {
  event: CalendarEvent;
  onClick?: () => void;
  compact?: boolean;
}

export function EventCard({ event, onClick, compact }: Props) {
  const { members } = useAppStore();
  const color = CATEGORY_COLORS[event.category] || '#8b5cf6';
  const eventMembers = members.filter((m) => event.memberIds.includes(m.id));

  const workIcon =
    event.workLocation === 'home' ? '🏠' : event.workLocation === 'office' ? '🏢' : null;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs cursor-pointer truncate"
        style={{ backgroundColor: color }}
        title={event.title}
      >
        <span className="truncate">{event.title}</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:brightness-95 transition-all shadow-sm"
      style={{ backgroundColor: color + '18', borderRight: `4px solid ${color}` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-gray-800 truncate">{event.title}</span>
          {workIcon && <span className="text-base">{workIcon}</span>}
        </div>
        <div className="text-sm text-gray-500">
          {event.startTime} – {event.endTime}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {CATEGORY_LABELS[event.category]}
        </div>
      </div>
      <div className="flex gap-1 flex-wrap justify-end">
        {eventMembers.map((m) => (
          <span
            key={m.id}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: m.color + '30', border: `2px solid ${m.color}` }}
            title={m.name}
          >
            {m.avatar}
          </span>
        ))}
      </div>
    </div>
  );
}
