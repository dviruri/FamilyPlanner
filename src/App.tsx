import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { FamilyProvider, useFamily } from './features/family/FamilyContext';
import { AuthScreen } from './features/auth/AuthScreen';
import { LoadingScreen } from './features/auth/LoadingScreen';
import { OnboardingFlow } from './features/family/OnboardingFlow';
import { AppShell } from './components/layout/AppShell';

function FamilyRouter() {
  const { activeFamily, loading: familyLoading, checked } = useFamily();

  // Still loading family data
  if (!checked || familyLoading) return <LoadingScreen />;
  // No family yet → onboarding
  if (!activeFamily) return <OnboardingFlow />;
  // All good → app
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

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
