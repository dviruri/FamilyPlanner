import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import type { ProfileInsert } from '../../types/database';
import { supabase } from '../../services/supabase/client';

// ---------------------------------------------------------------------------
// Hebrew error messages
// ---------------------------------------------------------------------------
function hebrewAuthError(error: AuthError | Error | unknown): string {
  const msg =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (msg.includes('invalid login credentials'))  return 'אימייל או סיסמה שגויים';
  if (msg.includes('email not confirmed'))        return 'יש לאמת את כתובת האימייל לפני ההתחברות';
  if (msg.includes('user already registered'))    return 'כתובת האימייל כבר רשומה במערכת';
  if (msg.includes('password should be at least'))return 'הסיסמה חייבת להכיל לפחות 6 תווים';
  if (msg.includes('signup is disabled'))         return 'ההרשמה אינה זמינה כרגע';
  if (msg.includes('email address is invalid'))   return 'כתובת האימייל אינה תקינה';
  if (msg.includes('rate limit'))                 return 'נסיונות רבים מדי — נסה שוב בעוד מספר דקות';
  if (msg.includes('network'))                    return 'בעיית חיבור לאינטרנט — בדוק את החיבור שלך';

  return 'אירעה שגיאה. נסה שוב';
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, displayName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);   // true until first session check

  // Subscribe to auth state changes once on mount
  useEffect(() => {
    // Get current session immediately
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for future changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ---------------------------------------------------------------------------
  // signIn
  // ---------------------------------------------------------------------------
  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return hebrewAuthError(error);
    return null;
  }, []);

  // ---------------------------------------------------------------------------
  // signUp
  // ---------------------------------------------------------------------------
  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (error) return hebrewAuthError(error);

    // Try to upsert profile. The DB trigger already creates one, but we send
    // display_name here in case the trigger fires before metadata propagates.
    if (data.user) {
      const profileData: ProfileInsert = {
        auth_user_id: data.user.id,
        display_name: displayName,
        email,
      };
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData as never, { onConflict: 'auth_user_id' });

      if (profileError) {
        // Non-fatal — the trigger will have created the row
        console.warn('[FamilyPlanner] Profile upsert warning:', profileError.message);
      }
    }

    return null;
  }, []);

  // ---------------------------------------------------------------------------
  // signOut
  // ---------------------------------------------------------------------------
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
