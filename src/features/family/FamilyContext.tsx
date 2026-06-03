import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  getMyFamilies,
  createFamily as createFamilyService,
  getFamilyMembers,
  addFamilyMember as addFamilyMemberService,
  updateFamilyMember as updateFamilyMemberService,
  removeFamilyMember,
} from '../../services/familyService';
import type { FamilyRow, FamilyMemberRow, FamilyMemberInsert, FamilyMemberUpdate } from '../../types/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FamilyContextValue {
  activeFamily: FamilyRow | null;
  members: FamilyMemberRow[];
  loading: boolean;
  /** true = checked DB, false = hasn't loaded yet */
  checked: boolean;
  refreshFamily: () => Promise<void>;
  createFamily: (
    name: string,
    creatorDisplayName: string,
    creatorColor: string,
  ) => Promise<string | null>;
  addMember: (data: Omit<FamilyMemberInsert, 'family_id'>) => Promise<string | null>;
  updateMember: (id: string, data: FamilyMemberUpdate) => Promise<string | null>;
  removeMember: (id: string) => Promise<string | null>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const FamilyContext = createContext<FamilyContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [activeFamily, setActiveFamily] = useState<FamilyRow | null>(null);
  const [members, setMembers]           = useState<FamilyMemberRow[]>([]);
  const [loading, setLoading]           = useState(false);
  const [checked, setChecked]           = useState(false);

  // Load family whenever user changes
  const loadFamily = useCallback(async () => {
    if (!user) {
      setActiveFamily(null);
      setMembers([]);
      setChecked(true);
      return;
    }

    setLoading(true);
    const { data: families, error } = await getMyFamilies();

    if (error) {
      console.error('[FamilyContext] loadFamily:', error);
      setLoading(false);
      setChecked(true);
      return;
    }

    if (families.length === 0) {
      setActiveFamily(null);
      setMembers([]);
      setLoading(false);
      setChecked(true);
      return;
    }

    // Use the first family for now (multi-family selector is a future feature)
    const family = families[0];
    setActiveFamily(family);

    const { data: familyMembers } = await getFamilyMembers(family.id);
    setMembers(familyMembers);
    setLoading(false);
    setChecked(true);
  }, [user]);

  useEffect(() => {
    loadFamily().catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ---------------------------------------------------------------------------
  const createFamily = useCallback(async (
    name: string,
    creatorDisplayName: string,
    creatorColor: string,
  ): Promise<string | null> => {
    const { familyId, error } = await createFamilyService(name, creatorDisplayName, creatorColor);
    if (error || !familyId) return error ?? 'שגיאה ביצירת המשפחה';
    // Reload family state
    await loadFamily();
    return null;
  }, [loadFamily]);

  // ---------------------------------------------------------------------------
  const addMember = useCallback(async (
    data: Omit<FamilyMemberInsert, 'family_id'>,
  ): Promise<string | null> => {
    if (!activeFamily) return 'לא נמצאה משפחה פעילה';
    const { error } = await addFamilyMemberService({ ...data, family_id: activeFamily.id });
    if (error) return error;
    const { data: updated } = await getFamilyMembers(activeFamily.id);
    setMembers(updated);
    return null;
  }, [activeFamily]);

  // ---------------------------------------------------------------------------
  const updateMember = useCallback(async (
    id: string,
    data: FamilyMemberUpdate,
  ): Promise<string | null> => {
    const { error } = await updateFamilyMemberService(id, data);
    if (error) return error;
    if (activeFamily) {
      const { data: updated } = await getFamilyMembers(activeFamily.id);
      setMembers(updated);
    }
    return null;
  }, [activeFamily]);

  // ---------------------------------------------------------------------------
  const removeMember = useCallback(async (id: string): Promise<string | null> => {
    const { error } = await removeFamilyMember(id);
    if (error) return error;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    return null;
  }, []);

  // ---------------------------------------------------------------------------
  const refreshFamily = useCallback(() => loadFamily(), [loadFamily]);

  return (
    <FamilyContext.Provider value={{
      activeFamily,
      members,
      loading,
      checked,
      refreshFamily,
      createFamily,
      addMember,
      updateMember,
      removeMember,
    }}>
      {children}
    </FamilyContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook — co-located with provider by convention
// ---------------------------------------------------------------------------
// eslint-disable-next-line react-refresh/only-export-components
export function useFamily(): FamilyContextValue {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be used inside <FamilyProvider>');
  return ctx;
}
