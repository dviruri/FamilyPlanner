import type { TaskRow } from '../../types/database';

export const TASK_CATEGORIES = [
  { value: 'home',    label: 'בית',        icon: '🏠' },
  { value: 'school',  label: 'בית ספר',    icon: '🎒' },
  { value: 'health',  label: 'בריאות',     icon: '💊' },
  { value: 'work',    label: 'עבודה',      icon: '💼' },
  { value: 'errand',  label: 'סידורים',    icon: '🛒' },
  { value: 'other',   label: 'אחר',        icon: '📌' },
];

export const PRIORITY_META: Record<TaskRow['priority'], { label: string; color: string; dot: string }> = {
  normal:    { label: 'רגילה',  color: 'text-gray-400',  dot: 'bg-gray-300'   },
  important: { label: 'חשובה',  color: 'text-amber-500', dot: 'bg-amber-400'  },
  urgent:    { label: 'דחופה',  color: 'text-red-500',   dot: 'bg-red-500'    },
};

export const STATUS_META: Record<TaskRow['status'], { label: string; color: string }> = {
  open:        { label: 'פתוחה',      color: 'text-blue-500'  },
  in_progress: { label: 'בתהליך',     color: 'text-amber-500' },
  completed:   { label: 'הושלמה',     color: 'text-green-500' },
  cancelled:   { label: 'בוטלה',      color: 'text-gray-400'  },
};

/** Returns a Hebrew due-date label with overdue indicator */
export function formatDueDate(dueDate: string | null, dueTime: string | null): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
} {
  if (!dueDate) return { label: '', isOverdue: false, isToday: false };

  const today     = new Date();
  today.setHours(0, 0, 0, 0);
  const due       = new Date(`${dueDate}T00:00:00`);
  const diffDays  = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  const timeLabel = dueTime ? ` ${dueTime.slice(0, 5)}` : '';

  if (diffDays < 0)  return { label: `באיחור ${Math.abs(diffDays)} ימים${timeLabel}`, isOverdue: true,  isToday: false };
  if (diffDays === 0) return { label: `היום${timeLabel}`,                               isOverdue: false, isToday: true  };
  if (diffDays === 1) return { label: `מחר${timeLabel}`,                                isOverdue: false, isToday: false };
  return {
    label: due.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }) + timeLabel,
    isOverdue: false,
    isToday: false,
  };
}
