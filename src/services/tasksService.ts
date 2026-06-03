import { supabase } from './supabase/client';
import type { TaskRow, TaskInsert, TaskUpdate } from '../types/database';

// ---------------------------------------------------------------------------
// Hebrew error helper
// ---------------------------------------------------------------------------
function dbError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('permission') || m.includes('policy')) return 'אין הרשאה לבצע פעולה זו';
  if (m.includes('network') || m.includes('fetch'))     return 'בעיית חיבור — נסה שוב';
  return 'אירעה שגיאה. נסה שוב';
}

export interface TaskFilters {
  status?: TaskRow['status'] | 'all' | 'active'; // active = open|in_progress
  assignedTo?: string;   // family_member_id
  dueDate?: string;      // YYYY-MM-DD — exact day
  overdue?: boolean;
}

// ---------------------------------------------------------------------------
// getTasks
// ---------------------------------------------------------------------------
export async function getTasks(
  familyId: string,
  filters: TaskFilters = {},
): Promise<{ data: TaskRow[]; error: string | null }> {
  let q = supabase
    .from('tasks')
    .select('*')
    .eq('family_id', familyId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (filters.status === 'active') {
    q = q.in('status', ['open', 'in_progress']);
  } else if (filters.status && filters.status !== 'all') {
    q = q.eq('status', filters.status);
  } else if (!filters.status || filters.status === 'all') {
    q = q.neq('status', 'cancelled');
  }

  if (filters.assignedTo) {
    q = q.eq('assigned_to', filters.assignedTo);
  }

  if (filters.dueDate) {
    q = q.eq('due_date', filters.dueDate);
  }

  if (filters.overdue) {
    const today = new Date().toLocaleDateString('en-CA');
    q = q.lt('due_date', today).in('status', ['open', 'in_progress']);
  }

  const { data, error } = await q;
  if (error) {
    console.error('[tasksService] getTasks:', error);
    return { data: [], error: dbError(error.message) };
  }
  return { data: (data ?? []) as TaskRow[], error: null };
}

// ---------------------------------------------------------------------------
// createTask
// ---------------------------------------------------------------------------
export async function createTask(
  insert: TaskInsert,
): Promise<{ data: TaskRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(insert as never)
    .select()
    .single();

  if (error) {
    console.error('[tasksService] createTask:', error);
    return { data: null, error: dbError(error.message) };
  }
  return { data: data as unknown as TaskRow, error: null };
}

// ---------------------------------------------------------------------------
// updateTask
// ---------------------------------------------------------------------------
export async function updateTask(
  taskId: string,
  updates: TaskUpdate,
): Promise<{ data: TaskRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates as never)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('[tasksService] updateTask:', error);
    return { data: null, error: dbError(error.message) };
  }
  return { data: data as unknown as TaskRow, error: null };
}

// ---------------------------------------------------------------------------
// deleteTask
// ---------------------------------------------------------------------------
export async function deleteTask(
  taskId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) {
    console.error('[tasksService] deleteTask:', error);
    return { error: dbError(error.message) };
  }
  return { error: null };
}

// ---------------------------------------------------------------------------
// completeTask
// ---------------------------------------------------------------------------
export async function completeTask(
  taskId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: userId,
    } as never)
    .eq('id', taskId);

  if (error) {
    console.error('[tasksService] completeTask:', error);
    return { error: dbError(error.message) };
  }
  return { error: null };
}

// ---------------------------------------------------------------------------
// reopenTask
// ---------------------------------------------------------------------------
export async function reopenTask(
  taskId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'open',
      completed_at: null,
      completed_by: null,
    } as never)
    .eq('id', taskId);

  if (error) {
    console.error('[tasksService] reopenTask:', error);
    return { error: dbError(error.message) };
  }
  return { error: null };
}
