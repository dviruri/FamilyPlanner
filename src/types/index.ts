// Re-export existing types
export type { EventCategory, WorkLocation, FamilyMember, CalendarEvent } from '../types';

// App navigation
export type AppPage = 'dashboard' | 'calendar' | 'tasks' | 'family' | 'settings';

// Task types (MVP data shape — not yet wired to backend)
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'normal' | 'important' | 'urgent';
export type MemberRole = 'parent' | 'child' | 'viewer';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string; // family member id
  createdBy: string;
  dueDate?: string;   // YYYY-MM-DD
  dueTime?: string;   // HH:MM
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  requiresParentApproval?: boolean;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  checklistItems?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
}
