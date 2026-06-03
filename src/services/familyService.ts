import { supabase } from './supabase/client';
import type {
  FamilyRow,
  FamilyMemberRow,
  FamilyMemberInsert,
  FamilyMemberUpdate,
} from '../types/database';

// ---------------------------------------------------------------------------
// Hebrew error helper
// ---------------------------------------------------------------------------
function hebrewDbError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('duplicate') || m.includes('unique'))
    return 'רשומה כזו כבר קיימת';
  if (m.includes('permission') || m.includes('policy') || m.includes('rls'))
    return 'אין הרשאה לבצע פעולה זו';
  if (m.includes('network') || m.includes('fetch'))
    return 'בעיית חיבור — נסה שוב';
  return 'אירעה שגיאה. נסה שוב';
}

// ---------------------------------------------------------------------------
// getMyFamilies — all families the current user is a member of
// ---------------------------------------------------------------------------
export async function getMyFamilies(): Promise<{
  data: FamilyRow[];
  error: string | null;
}> {
  // Step 1: get family IDs the current user belongs to
  const { data: memberships, error: memberError } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('is_active', true);

  if (memberError) {
    console.error('[familyService] getMyFamilies (memberships):', memberError);
    return { data: [], error: hebrewDbError(memberError.message) };
  }

  if (!memberships || memberships.length === 0) {
    return { data: [], error: null };
  }

  const familyIds = (memberships as { family_id: string }[]).map((m) => m.family_id);

  // Step 2: fetch those families
  const { data: families, error: familyError } = await supabase
    .from('families')
    .select('*')
    .in('id', familyIds);

  if (familyError) {
    console.error('[familyService] getMyFamilies (families):', familyError);
    return { data: [], error: hebrewDbError(familyError.message) };
  }

  return { data: (families ?? []) as FamilyRow[], error: null };
}

// ---------------------------------------------------------------------------
// createFamily — uses the SECURITY DEFINER RPC
// ---------------------------------------------------------------------------
export async function createFamily(
  familyName: string,
  creatorDisplayName: string,
  creatorColor: string,
): Promise<{ familyId: string | null; error: string | null }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('create_family', {
    p_family_name:  familyName,
    p_display_name: creatorDisplayName,
    p_color:        creatorColor,
  });

  if (error) {
    console.error('[familyService] createFamily error:', JSON.stringify(error));
    return { familyId: null, error: hebrewDbError(error.message ?? error.code ?? '') };
  }

  return { familyId: data as string, error: null };
}

// ---------------------------------------------------------------------------
// getFamilyMembers
// ---------------------------------------------------------------------------
export async function getFamilyMembers(familyId: string): Promise<{
  data: FamilyMemberRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .eq('is_active', true)
    .order('created_at');

  if (error) {
    console.error('[familyService] getFamilyMembers:', error);
    return { data: [], error: hebrewDbError(error.message) };
  }

  return { data: data ?? [], error: null };
}

// ---------------------------------------------------------------------------
// addFamilyMember
// ---------------------------------------------------------------------------
export async function addFamilyMember(
  member: FamilyMemberInsert,
): Promise<{ data: FamilyMemberRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('family_members')
    .insert(member as never)
    .select()
    .single();

  if (error) {
    console.error('[familyService] addFamilyMember:', error);
    return { data: null, error: hebrewDbError(error.message) };
  }

  return { data: data as FamilyMemberRow, error: null };
}

// ---------------------------------------------------------------------------
// updateFamilyMember
// ---------------------------------------------------------------------------
export async function updateFamilyMember(
  memberId: string,
  updates: FamilyMemberUpdate,
): Promise<{ data: FamilyMemberRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('family_members')
    .update(updates as never)
    .eq('id', memberId)
    .select()
    .single();

  if (error) {
    console.error('[familyService] updateFamilyMember:', error);
    return { data: null, error: hebrewDbError(error.message) };
  }

  return { data: data as FamilyMemberRow, error: null };
}

// ---------------------------------------------------------------------------
// removeFamilyMember (soft-delete via is_active)
// ---------------------------------------------------------------------------
export async function removeFamilyMember(
  memberId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('family_members')
    .update({ is_active: false } as never)
    .eq('id', memberId);

  if (error) {
    console.error('[familyService] removeFamilyMember:', error);
    return { error: hebrewDbError(error.message) };
  }

  return { error: null };
}
