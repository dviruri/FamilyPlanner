import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useFamily } from '../family/FamilyContext';
import { Button } from '../../components/ui/Button';
import { TaskForm } from './TaskForm';
import { PRIORITY_META, STATUS_META, formatDueDate, TASK_CATEGORIES } from './taskMeta';
import { updateTask, deleteTask, completeTask, reopenTask } from '../../services/tasksService';
import type { TaskRow } from '../../types/database';

interface TaskDetailsModalProps {
  task: TaskRow;
  onClose: () => void;
  onRefresh: () => void;
}

export function TaskDetailsModal({ task, onClose, onRefresh }: TaskDetailsModalProps) {
  const { user }    = useAuth();
  const { members } = useFamily();

  const [mode, setMode]       = useState<'view' | 'edit'>('view');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const isDone   = task.status === 'completed';
  const assignee = members.find((m) => m.id === task.assigned_to);
  const due      = formatDueDate(task.due_date, task.due_time);
  const priority = PRIORITY_META[task.priority];
  const status   = STATUS_META[task.status];
  const catMeta  = TASK_CATEGORIES.find((c) => c.value === task.category);

  async function handleUpdate(data: Parameters<typeof TaskForm>[0]['onSubmit'] extends (d: infer D) => unknown ? D : never) {
    setBusy(true);
    const { error: err } = await updateTask(task.id, {
      title: data.title,
      description: data.description || undefined,
      assigned_to: data.assignedTo || null,
      due_date: data.dueDate || null,
      due_time: data.dueTime ? `${data.dueTime}:00` : null,
      priority: data.priority,
      category: data.category || undefined,
    });
    setBusy(false);
    if (err) { setError(err); return; }
    onRefresh();
    onClose();
  }

  async function handleToggle() {
    if (!user) return;
    setBusy(true);
    const { error: err } = isDone
      ? await reopenTask(task.id)
      : await completeTask(task.id, user.id);
    setBusy(false);
    if (err) { setError(err); return; }
    onRefresh();
    onClose();
  }

  async function handleDelete() {
    if (!confirm('למחוק את המטלה?')) return;
    setBusy(true);
    const { error: err } = await deleteTask(task.id);
    setBusy(false);
    if (err) { setError(err); return; }
    onRefresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Drag handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${PRIORITY_META[task.priority].dot}`} />
            <span className="font-bold text-gray-800 truncate">{task.title}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1 flex-shrink-0">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {mode === 'view' ? (
            <div className="px-5 py-4 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
                {due.label && (
                  <span className={`text-sm ${due.isOverdue ? 'text-red-500 font-semibold' : due.isToday ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>
                    · {due.label}
                  </span>
                )}
              </div>

              {/* Assignee */}
              {assignee && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: assignee.color }}>
                    {assignee.display_name.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-700">{assignee.display_name}</span>
                </div>
              )}

              {/* Priority + category */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`flex items-center gap-1 text-sm ${priority.color}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${priority.dot}`} />
                  {priority.label}
                </span>
                {catMeta && <span className="text-sm text-gray-500">{catMeta.icon} {catMeta.label}</span>}
              </div>

              {/* Description */}
              {task.description && (
                <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-xl p-3">
                  {task.description}
                </div>
              )}

              {/* Completed info */}
              {isDone && task.completed_at && (
                <div className="text-xs text-gray-400">
                  הושלמה: {new Date(task.completed_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}

              {/* Error */}
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button variant="danger" size="md" onClick={() => void handleDelete()} loading={busy && !mode}>מחק</Button>
                <Button variant="secondary" size="md" onClick={() => setMode('edit')}>✏️ עריכה</Button>
                <Button fullWidth size="md" onClick={() => void handleToggle()} loading={busy}
                  variant={isDone ? 'secondary' : 'primary'}>
                  {isDone ? 'פתח מחדש' : 'סמן כבוצע ✓'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4">
              <TaskForm
                initial={task}
                onSubmit={handleUpdate}
                onCancel={() => setMode('view')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
