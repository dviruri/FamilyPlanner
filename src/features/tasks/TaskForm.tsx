import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { useFamily } from '../family/FamilyContext';
import { TASK_CATEGORIES, PRIORITY_META } from './taskMeta';
import type { TaskRow } from '../../types/database';

interface TaskFormData {
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  dueTime: string;
  priority: TaskRow['priority'];
  category: string;
}

interface TaskFormProps {
  initial?: TaskRow;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({ initial, onSubmit, onCancel }: TaskFormProps) {
  const { members } = useFamily();

  const [title, setTitle]           = useState(initial?.title ?? '');
  const [description, setDesc]      = useState(initial?.description ?? '');
  const [assignedTo, setAssignedTo] = useState(initial?.assigned_to ?? '');
  const [dueDate, setDueDate]       = useState(initial?.due_date ?? '');
  const [dueTime, setDueTime]       = useState(initial?.due_time?.slice(0, 5) ?? '');
  const [priority, setPriority]     = useState<TaskRow['priority']>(initial?.priority ?? 'normal');
  const [category, setCategory]     = useState(initial?.category ?? '');
  const [error, setError]           = useState<string | null>(null);
  const [busy, setBusy]             = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('כותרת היא שדה חובה'); return; }
    setError(null);
    setBusy(true);
    await onSubmit({ title: title.trim(), description, assignedTo, dueDate, dueTime, priority, category });
    setBusy(false);
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">כותרת *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="שם המטלה" required className={inputCls} autoFocus />
      </div>

      {/* Assignee */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">אחראי</label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setAssignedTo('')}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              !assignedTo ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            לא משויך
          </button>
          {members.map((m) => (
            <button type="button" key={m.id} onClick={() => setAssignedTo(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                assignedTo === m.id ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={assignedTo === m.id ? { backgroundColor: m.color } : {}}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: assignedTo === m.id ? 'rgba(255,255,255,0.3)' : m.color }}>
                {m.display_name.charAt(0)}
              </span>
              {m.display_name}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">חשיבות</label>
        <div className="flex gap-2">
          {(Object.entries(PRIORITY_META) as [TaskRow['priority'], typeof PRIORITY_META[keyof typeof PRIORITY_META]][]).map(([val, meta]) => (
            <button type="button" key={val} onClick={() => setPriority(val)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-medium transition-colors ${
                priority === val ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* Due date + time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">תאריך יעד</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">שעה (אופציונלי)</label>
          <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)}
            className={inputCls} dir="ltr" />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">קטגוריה</label>
        <div className="grid grid-cols-3 gap-2">
          {TASK_CATEGORIES.map((c) => (
            <button type="button" key={c.value} onClick={() => setCategory(c.value === category ? '' : c.value)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                category === c.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              <span className="text-base">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">תיאור / הערות</label>
        <textarea value={description} onChange={(e) => setDesc(e.target.value)}
          rows={2} placeholder="פרטים נוספים..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white" />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel} size="md">ביטול</Button>
        <Button type="submit" fullWidth size="md" loading={busy} disabled={!title.trim()}>
          {initial ? 'שמור שינויים' : 'הוסף מטלה'}
        </Button>
      </div>
    </form>
  );
}
