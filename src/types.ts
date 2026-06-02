export type EventCategory =
  | 'school'
  | 'work'
  | 'activity'
  | 'training'
  | 'family'
  | 'other';

export type WorkLocation = 'office' | 'home' | null;

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  avatar: string;
  isAdult: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  category: EventCategory;
  memberIds: string[];
  workLocation?: WorkLocation;
  notes?: string;
  isRecurring?: boolean;
  recurringDays?: number[]; // 0=Sun ... 6=Sat
}
