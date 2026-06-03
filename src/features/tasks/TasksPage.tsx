import { useState } from 'react';
import { useFamily } from '../family/FamilyContext';
import { useAuth } from '../auth/AuthContext';
import { useTasks } from './useTasks';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { TaskDetailsModal } from './TaskDetailsModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { createTask, completeTask, reopenTask } from '../../services/tasksService';
import type { TaskFormData } from './TaskForm';
import { todayKey } from '../../utils/calendarDates';
import type { TaskRow, FamilyMemberRow } from '../../types/database';

// ---------------------------------------------------------------------------
// Filter tab types
// ---------------------------------------------------------------------------
type FilterTab = 'all' | 'today' | 'overdue' | 'completed' | string; // string = member id

interface TabDef {
  id: FilterTab;
  label: string;
  icon?: string;
  memberId?: string;
}

function buildFilters(tab: FilterTab, today: string) {
  if (tab === 'all')       return { status: 'active' as const };
  if (tab === 'today')     return { status: 'active' as const, dueDate: today };
  if (tab === 'overdue')   return { overdue: true };
  if (tab === 'completed') return { status: 'completed' as const };
  // member id tab
  return { status: 'active' as const, assignedTo: tab };
}

// ---------------------------------------------------------------------------
// Add task modal wrapper
// ---------------------------------------------------------------------------
function AddTaskModal({
  onClose,
  onRefresh,
  defaultAssignee,
}: {
  onClose: () => void;
  onRefresh: () => void;
  defaultAssignee?: string;
}) {
  const { activeFamily } = useFamily();
  const { user }         = useAuth();

  async function handleSubmit(data: TaskFormData) {
    if (!activeFamily || !user) return;
    await createTask({
      family_id:   activeFamily.id,
      title:       data.title,
      created_by:  user.id,
      assigned_to: data.assignedTo || undefined,
      description: data.description || undefined,
      due_date:    data.dueDate || undefined,
      due_time:    data.dueTime ? `${data.dueTime}:00` : undefined,
      priority:    data.priority,
      category:        data.category || undefined,
      recurrence_rule: data.recurrenceRule || undefined,
    });
    onRefresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <span className="font-bold text-gray-800">מטלה חדשה</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1">×</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <TaskForm
            initial={defaultAssignee ? { assigned_to: defaultAssignee } as TaskRow : undefined}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TasksPage
// ---------------------------------------------------------------------------
export function TasksPage() {
  const { members } = useFamily();
  const { user }    = useAuth();
  const today       = todayKey();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showAdd, setShowAdd]     = useState(false);
  const [selected, setSelected]   = useState<TaskRow | null>(null);
  const [busyIds, setBusyIds]     = useState<Set<string>>(new Set());

  const filters = buildFilters(activeTab, today);
  const { tasks, loading, error, refresh } = useTasks(filters);

  // Build tabs: fixed + one per member
  const tabs: TabDef[] = [
    { id: 'all',       label: 'הכל',    icon: '📋' },
    { id: 'today',     label: 'להיום',  icon: '📅' },
    { id: 'overdue',   label: 'באיחור', icon: '⚠️' },
    ...members.map((m: FamilyMemberRow) => ({ id: m.id, label: m.display_name, memberId: m.id })),
    { id: 'completed', label: 'הושלמו', icon: '✅' },
  ];

  async function handleToggle(task: TaskRow) {
    if (!user) return;
    setBusyIds((prev) => new Set(prev).add(task.id));
    if (task.status === 'completed') {
      await reopenTask(task.id);
    } else {
      await completeTask(task.id, user.id);
    }
    setBusyIds((prev) => { const s = new Set(prev); s.delete(task.id); return s; });
    void refresh();
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 pt-4 pb-0">
        <PageHeader
          title="מטלות"
          subtitle="כל המטלות של המשפחה"
          action={
            <Button size="md" icon={<span>+</span>} onClick={() => setShowAdd(true)}>
              הוסף מטלה
            </Button>
          }
        />

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
          {tabs.map((tab) => {
            const member = members.find((m: FamilyMemberRow) => m.id === tab.memberId);
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                  whitespace-nowrap flex-shrink-0 transition-colors ${
                    active ? (member ? 'text-white' : 'bg-blue-500 text-white')
                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                style={active && member ? { backgroundColor: member.color } : {}}
              >
                {member ? (
                  <>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: active ? 'rgba(255,255,255,0.3)' : member.color }}>
                      {member.display_name.charAt(0)}
                    </span>
                    {tab.label}
                  </>
                ) : (
                  <>{tab.icon} {tab.label}</>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 text-red-600 text-sm rounded-2xl px-4 py-3 mb-3">{error}</div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <EmptyState
            icon={activeTab === 'overdue' ? '🎉' : activeTab === 'today' ? '☀️' : '✅'}
            title={
              activeTab === 'overdue'   ? 'אין מטלות באיחור' :
              activeTab === 'today'     ? 'אין מטלות להיום'  :
              activeTab === 'completed' ? 'אין מטלות שהושלמו' :
              'אין מטלות עדיין'
            }
            description={activeTab === 'all' ? 'לחץ על + כדי להוסיף מטלה ראשונה' : undefined}
            actionLabel={activeTab === 'all' ? 'הוסף מטלה' : undefined}
            onAction={activeTab === 'all' ? () => setShowAdd(true) : undefined}
          />
        )}

        {!loading && tasks.length > 0 && (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                members={members}
                onToggleComplete={() => void handleToggle(task)}
                onClick={() => setSelected(task)}
                busy={busyIds.has(task.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 left-4 md:bottom-6 md:left-6 w-14 h-14 bg-blue-500 text-white
                   rounded-full shadow-lg text-2xl flex items-center justify-center
                   hover:bg-blue-600 active:scale-95 transition-all
                   focus:outline-none focus:ring-4 focus:ring-blue-300 z-30"
        title="הוסף מטלה"
      >
        +
      </button>

      {/* ── Modals ── */}
      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onRefresh={() => void refresh()}
        />
      )}
      {selected && (
        <TaskDetailsModal
          task={selected}
          onClose={() => setSelected(null)}
          onRefresh={() => void refresh()}
        />
      )}
    </div>
  );
}
