import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import type { FamilyMemberRole } from '../../types/database';

const PRESET_COLORS = [
  '#3b82f6', '#ec4899', '#f59e0b', '#10b981',
  '#8b5cf6', '#f97316', '#06b6d4', '#ef4444',
];

const ROLES: { value: FamilyMemberRole; label: string }[] = [
  { value: 'parent',  label: 'הורה' },
  { value: 'child',   label: 'ילד/ה' },
  { value: 'viewer',  label: 'צפייה בלבד' },
];

interface MemberFormData {
  display_name: string;
  role: FamilyMemberRole;
  color: string;
}

interface MemberFormProps {
  initial?: Partial<MemberFormData>;
  onSubmit: (data: MemberFormData) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function MemberForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'הוסף',
  loading = false,
}: MemberFormProps) {
  const [name, setName]   = useState(initial?.display_name ?? '');
  const [role, setRole]   = useState<FamilyMemberRole>(initial?.role ?? 'child');
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
  const [busy, setBusy]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    await onSubmit({ display_name: name.trim(), role, color });
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          שם לתצוגה
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם הילד / שם ההורה"
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          autoFocus
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">תפקיד</label>
        <div className="flex gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={[
                'flex-1 py-2 rounded-xl text-sm font-medium border transition-colors',
                role === r.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              ].join(' ')}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">צבע</label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full transition-transform focus:outline-none"
              style={{
                backgroundColor: c,
                transform: color === c ? 'scale(1.25)' : 'scale(1)',
                outline: color === c ? `2px solid ${c}` : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <div>
          <div className="font-semibold text-gray-800 text-sm">{name || 'שם...'}</div>
          <div className="text-xs text-gray-400">
            {ROLES.find((r) => r.value === role)?.label}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" fullWidth onClick={onCancel} size="md">
            ביטול
          </Button>
        )}
        <Button
          type="submit"
          fullWidth
          size="md"
          loading={busy || loading}
          disabled={!name.trim()}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
