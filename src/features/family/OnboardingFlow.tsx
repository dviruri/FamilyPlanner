import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useFamily } from './FamilyContext';
import { Button } from '../../components/ui/Button';
import { MemberForm } from './MemberForm';
import type { FamilyMemberRole } from '../../types/database';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#8b5cf6', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#ef4444', // red
];

// ---------------------------------------------------------------------------
// Step 1 — Create family
// ---------------------------------------------------------------------------
function StepCreateFamily({
  onNext,
}: {
  onNext: (familyName: string, displayName: string, color: string) => void;
}) {
  const { user } = useAuth();
  const defaultName =
    (user?.user_metadata?.display_name as string | undefined) ?? '';

  const [familyName, setFamilyName] = useState('');
  const [displayName, setDisplayName] = useState(defaultName);
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const canContinue = familyName.trim().length > 0 && displayName.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-3">🏠</div>
        <h2 className="text-xl font-bold text-gray-900">בוא ניצור את הבית שלך</h2>
        <p className="text-sm text-gray-500 mt-1">תוכל לשנות את הפרטים מאוחר יותר</p>
      </div>

      {/* Family name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          שם המשפחה / שם הבית
        </label>
        <input
          type="text"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="משפחת כהן"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          autoFocus
        />
      </div>

      {/* Your display name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          השם שלך במשפחה
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="אבא / אמא / השם שלך"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          צבע שלך
        </label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-9 h-9 rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
              style={{
                backgroundColor: c,
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
                outline: color === c ? `3px solid ${c}` : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>

      <Button
        fullWidth
        size="lg"
        disabled={!canContinue}
        onClick={() => onNext(familyName.trim(), displayName.trim(), color)}
      >
        המשך ←
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Add family members
// ---------------------------------------------------------------------------
function StepAddMembers({ onFinish }: { onFinish: () => void }) {
  const { members, addMember } = useFamily();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(data: {
    display_name: string;
    role: FamilyMemberRole;
    color: string;
  }) {
    const err = await addMember(data);
    if (err) { setError(err); return; }
    setShowForm(false);
    setError(null);
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
        <h2 className="text-xl font-bold text-gray-900">הוסף בני משפחה</h2>
        <p className="text-sm text-gray-500 mt-1">
          תוכל להוסיף עוד בכל עת מדף המשפחה
        </p>
      </div>

      {/* Current members */}
      {members.length > 0 && (
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <div
                className="w-9 h-9 rounded-full flex-shrink-0"
                style={{ backgroundColor: m.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 text-sm">{m.display_name}</div>
                <div className="text-xs text-gray-400">
                  {m.role === 'parent' ? 'הורה' : m.role === 'child' ? 'ילד/ה' : 'צפייה בלבד'}
                </div>
              </div>
              {m.user_id && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  מנהל
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add member form */}
      {showForm ? (
        <div className="border border-gray-200 rounded-2xl p-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2 mb-3">
              {error}
            </div>
          )}
          <MemberForm
            onSubmit={handleAdd}
            onCancel={() => { setShowForm(false); setError(null); }}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4
                     text-gray-500 text-sm font-medium hover:border-blue-300 hover:text-blue-500
                     transition-colors focus:outline-none"
        >
          + הוסף בן/בת משפחה
        </button>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="ghost" fullWidth onClick={onFinish} size="lg">
          דלג
        </Button>
        <Button fullWidth onClick={onFinish} size="lg">
          סיום 🎉
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Onboarding wrapper
// ---------------------------------------------------------------------------
export function OnboardingFlow() {
  const { createFamily } = useFamily();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateFamily(
    familyName: string,
    displayName: string,
    color: string,
  ) {
    setError(null);
    setLoading(true);
    const err = await createFamily(familyName, displayName, color);
    setLoading(false);
    if (err) { setError(err); return; }
    setStep(2);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="flex gap-2 mb-8 justify-center">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-blue-500 w-12' : 'bg-gray-200 w-8'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {step === 1 && (
            <StepCreateFamily
              onNext={(name, dn, color) => void handleCreateFamily(name, dn, color)}
            />
          )}
          {step === 2 && (
            <StepAddMembers onFinish={() => {/* FamilyContext reloaded → AppRouter re-renders */}} />
          )}

          {loading && (
            <div className="absolute inset-0 bg-white/60 rounded-3xl flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
