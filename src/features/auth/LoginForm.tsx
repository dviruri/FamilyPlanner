import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '../../components/ui/Button';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { signIn } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const err = await signIn(email.trim(), password);
    if (err) setError(err);

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 mb-1">ברוך הבא 👋</h2>

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
        </label>
        <input
          type="password"
          autoComplete="current-password"
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
        disabled={!email || !password}
      >
        התחברות
      </Button>

      {/* Switch to register */}
      <p className="text-center text-sm text-gray-500 pt-1">
        אין לך חשבון עדיין?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-blue-500 font-semibold hover:text-blue-700"
        >
          הרשמה
        </button>
      </p>
    </form>
  );
}
