import { useState } from 'react';
import { useFamily } from './FamilyContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { MemberForm } from './MemberForm';
import type { FamilyMemberRow, FamilyMemberRole } from '../../types/database';

const ROLE_LABELS: Record<FamilyMemberRole, string> = {
  parent: 'הורה',
  child: 'ילד/ה',
  viewer: 'צפייה בלבד',
};

export function FamilyPage() {
  const { activeFamily, members, addMember, updateMember, removeMember } = useFamily();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);

  async function handleAdd(data: { display_name: string; role: FamilyMemberRole; color: string }) {
    const err = await addMember(data);
    if (err) { setError(err); return; }
    setShowAddForm(false);
    setError(null);
  }

  async function handleUpdate(
    member: FamilyMemberRow,
    data: { display_name: string; role: FamilyMemberRole; color: string },
  ) {
    const err = await updateMember(member.id, data);
    if (err) { setError(err); return; }
    setEditingId(null);
    setError(null);
  }

  async function handleRemove(id: string) {
    if (!confirm('להסיר את בן/בת המשפחה?')) return;
    const err = await removeMember(id);
    if (err) setError(err);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader
        title={activeFamily?.name ?? 'המשפחה שלנו'}
        subtitle="בני המשפחה"
        action={
          !showAddForm ? (
            <Button icon={<span>+</span>} size="md" onClick={() => setShowAddForm(true)}>
              הוסף
            </Button>
          ) : undefined
        }
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <Card className="mb-4">
          <p className="text-sm font-bold text-gray-700 mb-3">הוספת בן/בת משפחה</p>
          <MemberForm
            onSubmit={handleAdd}
            onCancel={() => { setShowAddForm(false); setError(null); }}
            submitLabel="הוסף"
          />
        </Card>
      )}

      {/* Members list */}
      {members.length === 0 && !showAddForm ? (
        <EmptyState
          icon="👨‍👩‍👧‍👦"
          title="אין בני משפחה עדיין"
          actionLabel="הוסף בן משפחה"
          onAction={() => setShowAddForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {members.map((m) => {
            const isEditing = editingId === m.id;
            return (
              <Card key={m.id} padding={isEditing ? 'md' : 'md'}>
                {isEditing ? (
                  <>
                    <p className="text-sm font-bold text-gray-700 mb-3">עריכת {m.display_name}</p>
                    <MemberForm
                      initial={{ display_name: m.display_name, role: m.role as FamilyMemberRole, color: m.color }}
                      onSubmit={(data) => handleUpdate(m, data)}
                      onCancel={() => { setEditingId(null); setError(null); }}
                      submitLabel="שמור"
                    />
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* Color avatar */}
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.display_name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800">{m.display_name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {ROLE_LABELS[m.role as FamilyMemberRole]}
                        </span>
                        {m.user_id && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                            חשבון
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingId(m.id)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="עריכה"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => void handleRemove(m.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="הסרה"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
