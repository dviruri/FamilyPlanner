import type { CalendarEvent } from '../types';

export function getEventsForDate(
  events: CalendarEvent[],
  dateStr: string,
  memberIds: string[]
): CalendarEvent[] {
  const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();
  return events
    .filter((e) => {
      const matchesDate =
        e.date === dateStr ||
        (e.isRecurring && e.recurringDays?.includes(dayOfWeek));
      const matchesMember = e.memberIds.some((id) => memberIds.includes(id));
      return matchesDate && matchesMember;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export const CATEGORY_LABELS: Record<string, string> = {
  school: 'בית ספר / גן',
  work: 'עבודה',
  activity: 'חוג',
  training: 'אימון',
  family: 'משפחתי',
  other: 'אחר',
};

export const CATEGORY_COLORS: Record<string, string> = {
  school: '#6366f1',
  work: '#0ea5e9',
  activity: '#f59e0b',
  training: '#10b981',
  family: '#ec4899',
  other: '#8b5cf6',
};
