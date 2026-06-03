import { useState } from 'react';
import { useAuth } from './AuthContext';

export function GoogleSignInButton() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const err = await signInWithGoogle();
    // If err is returned, the redirect didn't happen (provider not configured)
    if (err) {
      setError(err);
      setLoading(false);
    }
    // On success: browser redirects — no need to setLoading(false)
  }

  return (
    <div>
      <button
        onClick={() => void handleClick()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl
                   bg-white border border-gray-200 shadow-sm
                   hover:bg-gray-50 hover:shadow-md active:scale-[0.98]
                   transition-all font-semibold text-gray-700 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-300
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        ) : (
          /* Google "G" logo — inline SVG, no external dependency */
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M47.532 24.552c0-1.636-.132-3.2-.38-4.704H24v9.06h13.22c-.576 3.024-2.268 5.592-4.812 7.308v6.048h7.764c4.548-4.188 7.36-10.356 7.36-17.712z" fill="#4285F4"/>
            <path d="M24 48c6.48 0 11.916-2.148 15.888-5.832l-7.764-6.048c-2.148 1.44-4.896 2.292-8.124 2.292-6.24 0-11.532-4.212-13.428-9.876H2.556v6.24C6.516 42.648 14.712 48 24 48z" fill="#34A853"/>
            <path d="M10.572 28.536A14.885 14.885 0 0 1 9.6 24c0-1.584.276-3.12.972-4.536V13.224H2.556A23.934 23.934 0 0 0 0 24c0 3.876.936 7.548 2.556 10.776l8.016-6.24z" fill="#FBBC05"/>
            <path d="M24 9.528c3.516 0 6.672 1.212 9.156 3.588l6.852-6.852C35.904 2.364 30.468 0 24 0 14.712 0 6.516 5.352 2.556 13.224l8.016 6.24C12.468 13.74 17.76 9.528 24 9.528z" fill="#EA4335"/>
          </svg>
        )}
        {loading ? 'מתחבר...' : 'המשך עם Google'}
      </button>

      {error && (
        <div className="mt-2 text-xs text-red-500 text-center bg-red-50 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
