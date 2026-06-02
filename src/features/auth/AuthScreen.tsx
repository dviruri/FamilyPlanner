import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

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

        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
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

        {/* Form */}
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
