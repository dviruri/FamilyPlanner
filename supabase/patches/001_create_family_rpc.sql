-- =============================================================================
-- Patch 001: create_family RPC + family bootstrapping policy fix
-- =============================================================================
-- Run this in Supabase SQL Editor AFTER schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- RPC: create_family
-- Creates a family row AND inserts the caller as the first parent member,
-- bypassing the RLS chicken-and-egg problem.
-- SECURITY DEFINER = runs with the function owner's privileges.
-- ---------------------------------------------------------------------------
create or replace function public.create_family(
  p_family_name      text,
  p_display_name     text,
  p_color            text default '#3b82f6'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
begin
  -- 1. Create the family
  insert into public.families (name, created_by)
  values (p_family_name, auth.uid())
  returning id into v_family_id;

  -- 2. Add the creator as first parent member
  insert into public.family_members (family_id, user_id, display_name, role, color)
  values (v_family_id, auth.uid(), p_display_name, 'parent', p_color);

  return v_family_id;
end;
$$;

-- Allow all authenticated users to call this function
grant execute on function public.create_family(text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Also fix: allow parents to add members (including children with no user_id).
-- The existing policy only checks is_family_parent which is fine for adding
-- other members once you are already a parent.
-- No change needed there — just confirming the existing policy covers it.
-- ---------------------------------------------------------------------------
