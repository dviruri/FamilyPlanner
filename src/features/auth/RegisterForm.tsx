import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '../../components/ui/Button';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);
  const [loading, setLoading]         = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('הסיסמאות אינן תואמות');
      return;
    }
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setLoading(true);
    const err = await signUp(email.trim(), password, displayName.trim());
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="text-center py-4 space-y-3">
        <div className="text-5xl">📬</div>
        <h2 className="text-lg font-bold text-gray-800">כמעט סיימנו!</h2>
        <p className="text-sm text-gray-500">
          שלחנו לך אימייל אימות לכתובת{' '}
          <span className="font-medium text-gray-700">{email}</span>.
          <br />
          לחץ על הקישור באימייל כדי להפעיל את החשבון.
        </p>
        <button
          onClick={onSwitchToLogin}
          className="text-blue-500 text-sm font-semibold hover:text-blue-700"
        >
          חזור להתחברות
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 mb-1">יצירת חשבון חדש</h2>

      {/* Display name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          שם לתצוגה
        </label>
        <input
          type="text"
          autoComplete="name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="ישראל ישראלי"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                     placeholder:text-gray-300 transition"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          אימייל
        </label>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                     placeholder:text-gray-300 transition"
          dir="ltr"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          סיסמה
          <span className="text-gray-400 font-normal text-xs mr-1">(לפחות 6 תווים)</span>
        </label>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                     placeholder:text-gray-300 transition"
          dir="ltr"
        />
      </div>

      {/* Confirm password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          אימות סיסמה
        </label>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                     placeholder:text-gray-300 transition"
          dir="ltr"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={loading}
        disabled={!displayName || !email || !password || !confirm}
      >
        יצירת חשבון
      </Button>

      {/* Switch to login */}
      <p className="text-center text-sm text-gray-500 pt-1">
        יש לך חשבון?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-500 font-semibold hover:text-blue-700"
        >
          התחברות
        </button>
      </p>
    </form>
  );
}
