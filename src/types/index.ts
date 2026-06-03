// Re-export database types
export type {
  Database,
  FamilyRow,
  FamilyInsert,
  FamilyUpdate,
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
  FamilyMemberRow,
  FamilyMemberInsert,
  FamilyMemberUpdate,
  FamilyMemberRole,
  EventRow,
  EventInsert,
  EventUpdate,
  EventVisibility,
  EventParticipantRow,
  EventParticipantInsert,
  TaskRow,
  TaskInsert,
  TaskUpdate,
  TaskChecklistItemRow,
  TaskChecklistItemInsert,
  TaskChecklistItemUpdate,
} from './database';

// App navigation
export type AppPage = 'dashboard' | 'calendar' | 'tasks' | 'family' | 'settings';

/** @deprecated use FamilyMemberRole from database.ts */
export type MemberRole = 'parent' | 'child' | 'viewer';

// Import for local use in interfaces below
import type { TaskStatus, TaskPriority } from './database';

// Re-export so consumers can import from this barrel
export type { TaskStatus, TaskPriority };

// ---------------------------------------------------------------------------
// App-level domain models (camelCase views over the snake_case DB rows)
// These are used inside React components and the Zustand store.
// ---------------------------------------------------------------------------

export interface Task {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  assignedTo?: string;        // family_members.id
  createdBy: string;          // auth.users.id
  dueDate?: string;           // YYYY-MM-DD
  dueTime?: string;           // HH:MM
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  requiresParentApproval?: boolean;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
  checklistItems?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
}
