import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { FamilyProvider, useFamily } from './features/family/FamilyContext';
import { AuthScreen } from './features/auth/AuthScreen';
import { LoadingScreen } from './features/auth/LoadingScreen';
import { OnboardingFlow } from './features/family/OnboardingFlow';
import { AppShell } from './components/layout/AppShell';
import { TvPage } from './features/tv/TvPage';

// ---------------------------------------------------------------------------
// Normal app flow (auth → family → shell)
// ---------------------------------------------------------------------------
function FamilyRouter() {
  const { activeFamily, loading: familyLoading, checked } = useFamily();
  if (!checked || familyLoading) return <LoadingScreen />;
  if (!activeFamily) return <OnboardingFlow />;
  return <AppShell />;
}

function AppRouter() {
  const { user, loading: authLoading } = useAuth();
  if (authLoading) return <LoadingScreen />;
  if (!user)       return <AuthScreen />;
  return (
    <FamilyProvider>
      <FamilyRouter />
    </FamilyProvider>
  );
}

// ---------------------------------------------------------------------------
// TV flow (same auth, same family context, but renders TvPage)
// ---------------------------------------------------------------------------
function TvRouter() {
  const { user, loading: authLoading } = useAuth();
  if (authLoading) return <LoadingScreen />;
  if (!user)       return <AuthScreen />;
  return (
    <FamilyProvider>
      <TvFamilyRouter />
    </FamilyProvider>
  );
}

function TvFamilyRouter() {
  const { activeFamily, loading: familyLoading, checked } = useFamily();
  if (!checked || familyLoading) return <LoadingScreen />;
  if (!activeFamily) return <OnboardingFlow />;
  return <TvPage />;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/tv" element={<TvRouter />} />
        <Route path="*"  element={<AppRouter />} />
      </Routes>
    </AuthProvider>
  );
}
