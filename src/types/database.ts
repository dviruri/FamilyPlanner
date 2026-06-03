/**
 * TypeScript types generated from the Supabase database schema.
 * These mirror the SQL tables defined in supabase/schema.sql.
 *
 * Convention:
 *  - Row    = what the database returns (snake_case)
 *  - Insert = what you send when creating a row
 *  - Update = partial Insert used for updates
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type FamilyMemberRole = 'parent' | 'child' | 'viewer';
export type EventVisibility   = 'family'  | 'private';
export type TaskStatus        = 'open'    | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority      = 'normal'  | 'important'   | 'urgent';

// ---------------------------------------------------------------------------
// families
// ---------------------------------------------------------------------------

export interface FamilyRow {
  id: string;
  name: string;
  created_by: string;        // auth.users.id
  created_at: string;
  updated_at: string;
}

export interface FamilyInsert {
  name: string;
  created_by: string;
}

export interface FamilyUpdate {
  name?: string;
}

// ---------------------------------------------------------------------------
// profiles
// ---------------------------------------------------------------------------

export interface ProfileRow {
  id: string;
  auth_user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface ProfileInsert {
  auth_user_id: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
}

export interface ProfileUpdate {
  display_name?: string;
  avatar_url?: string;
}

// ---------------------------------------------------------------------------
// family_members
// ---------------------------------------------------------------------------

export interface FamilyMemberRow {
  id: string;
  family_id: string;
  user_id: string | null;    // null = child without account
  display_name: string;
  role: FamilyMemberRole;
  color: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyMemberInsert {
  family_id: string;
  user_id?: string;
  display_name: string;
  role: FamilyMemberRole;
  color: string;
  avatar_url?: string;
}

export interface FamilyMemberUpdate {
  display_name?: string;
  role?: FamilyMemberRole;
  color?: string;
  avatar_url?: string;
  is_active?: boolean;
}

// ---------------------------------------------------------------------------
// events
// ---------------------------------------------------------------------------

export interface EventRow {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;          // ISO 8601 timestamptz
  end_time: string;
  all_day: boolean;
  category: string | null;
  color: string | null;
  created_by: string;
  visibility: EventVisibility;
  recurrence_rule: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventInsert {
  family_id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  location?: string;
  all_day?: boolean;
  category?: string;
  color?: string;
  created_by: string;
  visibility?: EventVisibility;
  recurrence_rule?: string;
}

export interface EventUpdate {
  title?: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  all_day?: boolean;
  category?: string;
  color?: string;
  visibility?: EventVisibility;
  recurrence_rule?: string | null;
}

// ---------------------------------------------------------------------------
// event_participants
// ---------------------------------------------------------------------------

export interface EventParticipantRow {
  id: string;
  event_id: string;
  family_member_id: string;
}

export interface EventParticipantInsert {
  event_id: string;
  family_member_id: string;
}

// ---------------------------------------------------------------------------
// tasks
// ---------------------------------------------------------------------------

export interface TaskRow {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;    // family_members.id
  created_by: string;            // auth.users.id
  due_date: string | null;       // YYYY-MM-DD
  due_time: string | null;       // HH:MM:SS
  status: TaskStatus;
  priority: TaskPriority;
  category: string | null;
  recurrence_rule: string | null;
  requires_parent_approval: boolean;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  family_id: string;
  title: string;
  created_by: string;
  assigned_to?: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  recurrence_rule?: string;
  requires_parent_approval?: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  assigned_to?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  recurrence_rule?: string | null;
  completed_at?: string | null;
  completed_by?: string | null;
}

// ---------------------------------------------------------------------------
// task_checklist_items
// ---------------------------------------------------------------------------

export interface TaskChecklistItemRow {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
}

export interface TaskChecklistItemInsert {
  task_id: string;
  title: string;
  is_completed?: boolean;
  sort_order?: number;
}

export interface TaskChecklistItemUpdate {
  title?: string;
  is_completed?: boolean;
  sort_order?: number;
}

// ---------------------------------------------------------------------------
// Supabase Database type (used by createClient<Database>)
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      families: {
        Row: FamilyRow;
        Insert: FamilyInsert;
        Update: FamilyUpdate;
      };
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      family_members: {
        Row: FamilyMemberRow;
        Insert: FamilyMemberInsert;
        Update: FamilyMemberUpdate;
      };
      events: {
        Row: EventRow;
        Insert: EventInsert;
        Update: EventUpdate;
      };
      event_participants: {
        Row: EventParticipantRow;
        Insert: EventParticipantInsert;
        Update: never;
      };
      tasks: {
        Row: TaskRow;
        Insert: TaskInsert;
        Update: TaskUpdate;
      };
      task_checklist_items: {
        Row: TaskChecklistItemRow;
        Insert: TaskChecklistItemInsert;
        Update: TaskChecklistItemUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      family_member_role: FamilyMemberRole;
      event_visibility: EventVisibility;
      task_status: TaskStatus;
      task_priority: TaskPriority;
    };
  };
}
