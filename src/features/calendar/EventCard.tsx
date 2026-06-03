import type { EventWithParticipants } from '../../services/eventsService';
import type { FamilyMemberRow } from '../../types/database';
import { formatEventTime } from '../../utils/eventTime';
import { CATEGORY_META } from './categoryMeta';

interface EventCardProps {
  event: EventWithParticipants;
  members: FamilyMemberRow[];
  onClick: () => void;
  compact?: boolean;
}

export function EventCard({ event, members, onClick, compact = false }: EventCardProps) {
  const meta   = CATEGORY_META[event.category ?? 'other'] ?? CATEGORY_META.other;
  const color  = event.color ?? meta.color;
  const participants = members.filter((m) => event.participantIds.includes(m.id));

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-white text-xs cursor-pointer truncate"
        style={{ backgroundColor: color }}
        title={event.title}
      >
        <span className="truncate font-medium">{event.title}</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-2xl cursor-pointer
                 hover:shadow-md transition-all active:scale-[0.99] bg-white border border-gray-100 shadow-sm"
      style={{ borderRightWidth: 4, borderRightColor: color }}
    >
      {/* Time + category */}
      <div className="flex flex-col items-center min-w-[52px] flex-shrink-0 pt-0.5">
        <span className="text-lg leading-none">{meta.icon}</span>
        <span className="text-xs text-gray-400 mt-1 text-center leading-tight">
          {event.all_day
            ? 'כל היום'
            : new Date(event.start_time).toLocaleTimeString('he-IL', {
                hour: '2-digit', minute: '2-digit', hour12: false,
              })}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm leading-snug truncate">
          {event.title}
        </div>
        {!event.all_day && (
          <div className="text-xs text-gray-400 mt-0.5">
            {formatEventTime(event.start_time, event.end_time, event.all_day)}
          </div>
        )}
        {event.location && (
          <div className="text-xs text-gray-400 mt-0.5 truncate">📍 {event.location}</div>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{meta.label}</span>
          {event.recurrence_rule && (
            <span className="text-xs text-blue-500 font-medium">🔄 חוזר</span>
          )}
        </div>
      </div>

      {/* Participants */}
      {participants.length > 0 && (
        <div className="flex -space-x-1.5 flex-shrink-0 pt-0.5 flex-row-reverse">
          {participants.slice(0, 4).map((m) => (
            <div
              key={m.id}
              title={m.display_name}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white"
              style={{ backgroundColor: m.color }}
            >
              {m.display_name.charAt(0)}
            </div>
          ))}
          {participants.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 ring-2 ring-white">
              +{participants.length - 4}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
