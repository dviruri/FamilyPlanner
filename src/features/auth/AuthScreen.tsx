import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { GoogleSignInButton } from './GoogleSignInButton';

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900">יומן משפחתי</h1>
          <p className="text-sm text-gray-500 mt-1">מרכז הפיקוד של המשפחה שלך</p>
        </div>

        {/* Google sign-in — prominent, above everything */}
        <div className="mb-4">
          <GoogleSignInButton />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">או עם אימייל וסיסמה</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-4">
          <button
            onClick={() => setMode('login')}
            className={[
              'flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
              mode === 'login'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            התחברות
          </button>
          <button
            onClick={() => setMode('register')}
            className={[
              'flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
              mode === 'register'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            הרשמה
          </button>
        </div>

        {/* Email/password form */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          {mode === 'login'
            ? <LoginForm onSwitchToRegister={() => setMode('register')} />
            : <RegisterForm onSwitchToLogin={() => setMode('login')} />
          }
        </div>

      </div>
    </div>
  );
}
