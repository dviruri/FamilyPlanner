import type { TaskRow, FamilyMemberRow } from '../../types/database';
import { PRIORITY_META, STATUS_META, formatDueDate, TASK_CATEGORIES } from './taskMeta';

interface TaskCardProps {
  task: TaskRow;
  members: FamilyMemberRow[];
  onToggleComplete: () => void;
  onClick: () => void;
  busy?: boolean;
}

export function TaskCard({ task, members, onToggleComplete, onClick, busy }: TaskCardProps) {
  const isDone    = task.status === 'completed';
  const priority  = PRIORITY_META[task.priority];
  const status    = STATUS_META[task.status];
  const assignee  = members.find((m) => m.id === task.assigned_to);
  const due       = formatDueDate(task.due_date, task.due_time);
  const catMeta   = TASK_CATEGORIES.find((c) => c.value === task.category);

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-2xl bg-white border shadow-sm transition-all
        ${isDone ? 'opacity-60 border-gray-100' : 'border-gray-100 hover:shadow-md'}`}
    >
      {/* Complete toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
        disabled={busy}
        className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300
          ${isDone
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400'
          }`}
        title={isDone ? 'פתח מחדש' : 'סמן כבוצע'}
      >
        {isDone && <span className="text-xs leading-none">✓</span>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <div className={`font-semibold text-sm leading-snug ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.title}
        </div>

        {/* Meta row */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
          {/* Priority dot */}
          <span className={`flex items-center gap-1 text-xs ${priority.color}`}>
            <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>

          {/* Due date */}
          {due.label && (
            <span className={`text-xs font-medium flex items-center gap-1 ${
              due.isOverdue ? 'text-red-500' : due.isToday ? 'text-blue-500' : 'text-gray-400'
            }`}>
              {due.isOverdue && '⚠️'}
              {due.label}
            </span>
          )}

          {/* Category */}
          {catMeta && (
            <span className="text-xs text-gray-400">
              {catMeta.icon} {catMeta.label}
            </span>
          )}

          {/* Status (only if not open/completed) */}
          {task.status === 'in_progress' && (
            <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
          )}
          {task.recurrence_rule && (
            <span className="text-xs text-blue-500 font-medium">🔄 חוזר</span>
          )}
        </div>
      </div>

      {/* Assignee avatar */}
      {assignee && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                     text-white text-xs font-bold ring-2 ring-white shadow-sm"
          style={{ backgroundColor: assignee.color }}
          title={assignee.display_name}
        >
          {assignee.display_name.charAt(0)}
        </div>
      )}
    </div>
  );
}
