-- =============================================================================
-- Family Planner — Initial Database Schema
-- =============================================================================
-- How to apply:
--   1. Open Supabase Dashboard → your project → SQL Editor
--   2. Paste this entire file and click "Run"
--
-- Dependencies: Supabase Auth (auth.users) must be enabled (it is by default).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Helper: auto-update updated_at column
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- families
-- ---------------------------------------------------------------------------
create table if not exists public.families (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  created_by  uuid        references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger families_updated_at
  before update on public.families
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles  (one per auth user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid  primary key default gen_random_uuid(),
  auth_user_id  uuid  references auth.users(id) on delete cascade not null unique,
  display_name  text,
  email         text,
  avatar_url    text,
  created_at    timestamptz not null default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (auth_user_id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    new.email
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- family_members
-- ---------------------------------------------------------------------------
create table if not exists public.family_members (
  id            uuid    primary key default gen_random_uuid(),
  family_id     uuid    not null references public.families(id) on delete cascade,
  user_id       uuid    references auth.users(id) on delete set null,  -- null = child w/o account
  display_name  text    not null,
  role          text    not null check (role in ('parent', 'child', 'viewer')),
  color         text    not null default '#3b82f6',
  avatar_url    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists family_members_family_id_idx on public.family_members(family_id);
create index if not exists family_members_user_id_idx   on public.family_members(user_id);

create trigger family_members_updated_at
  before update on public.family_members
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id               uuid        primary key default gen_random_uuid(),
  family_id        uuid        not null references public.families(id) on delete cascade,
  title            text        not null,
  description      text,
  location         text,
  start_time       timestamptz not null,
  end_time         timestamptz not null,
  all_day          boolean     not null default false,
  category         text,
  color            text,
  created_by       uuid        references auth.users(id) on delete set null,
  visibility       text        not null default 'family' check (visibility in ('family', 'private')),
  recurrence_rule  text,       -- future: RRULE string
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint events_end_after_start check (end_time >= start_time)
);

create index if not exists events_family_id_idx  on public.events(family_id);
create index if not exists events_start_time_idx on public.events(start_time);

create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- event_participants
-- ---------------------------------------------------------------------------
create table if not exists public.event_participants (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references public.events(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  unique (event_id, family_member_id)
);

create index if not exists event_participants_event_id_idx on public.event_participants(event_id);
create index if not exists event_participants_member_idx   on public.event_participants(family_member_id);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id                       uuid    primary key default gen_random_uuid(),
  family_id                uuid    not null references public.families(id) on delete cascade,
  title                    text    not null,
  description              text,
  assigned_to              uuid    references public.family_members(id) on delete set null,
  created_by               uuid    references auth.users(id) on delete set null,
  due_date                 date,
  due_time                 time,
  status                   text    not null default 'open'
                             check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  priority                 text    not null default 'normal'
                             check (priority in ('normal', 'important', 'urgent')),
  category                 text,
  recurrence_rule          text,
  requires_parent_approval boolean not null default false,
  completed_at             timestamptz,
  completed_by             uuid    references auth.users(id) on delete set null,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists tasks_family_id_idx   on public.tasks(family_id);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_status_idx      on public.tasks(status);
create index if not exists tasks_due_date_idx    on public.tasks(due_date);

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- task_checklist_items
-- ---------------------------------------------------------------------------
create table if not exists public.task_checklist_items (
  id           uuid    primary key default gen_random_uuid(),
  task_id      uuid    not null references public.tasks(id) on delete cascade,
  title        text    not null,
  is_completed boolean not null default false,
  sort_order   int     not null default 0
);

create index if not exists checklist_task_id_idx on public.task_checklist_items(task_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Principle: every row is scoped to a family.
-- A user may access a family's data only if they are a member of that family
-- (i.e. there is a family_members row linking their auth.users.id to the family).
-- =============================================================================

-- Enable RLS on all tables
alter table public.families             enable row level security;
alter table public.profiles             enable row level security;
alter table public.family_members       enable row level security;
alter table public.events               enable row level security;
alter table public.event_participants   enable row level security;
alter table public.tasks                enable row level security;
alter table public.task_checklist_items enable row level security;

-- ---------------------------------------------------------------------------
-- Helper: check if the current user is a member of a given family
-- ---------------------------------------------------------------------------
create or replace function public.is_family_member(p_family_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from public.family_members
    where family_id = p_family_id
      and user_id   = auth.uid()
      and is_active = true
  );
$$;

-- Helper: check if the current user is a parent in a given family
create or replace function public.is_family_parent(p_family_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from public.family_members
    where family_id = p_family_id
      and user_id   = auth.uid()
      and role      = 'parent'
      and is_active = true
  );
$$;

-- ---------------------------------------------------------------------------
-- families policies
-- ---------------------------------------------------------------------------
create policy "family members can view their family"
  on public.families for select
  using (public.is_family_member(id));

create policy "authenticated users can create a family"
  on public.families for insert
  with check (auth.uid() = created_by);

create policy "parents can update their family"
  on public.families for update
  using (public.is_family_parent(id));

-- Only the family creator can delete (soft-delete preferred — add is_active if needed)
create policy "creator can delete family"
  on public.families for delete
  using (auth.uid() = created_by);

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------
create policy "users can view their own profile"
  on public.profiles for select
  using (auth.uid() = auth_user_id);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = auth_user_id);

-- Insert handled by the handle_new_user trigger (security definer) — no user policy needed.

-- ---------------------------------------------------------------------------
-- family_members policies
-- ---------------------------------------------------------------------------
create policy "family members can view all members"
  on public.family_members for select
  using (public.is_family_member(family_id));

create policy "parents can add family members"
  on public.family_members for insert
  with check (public.is_family_parent(family_id));

create policy "parents can update family members"
  on public.family_members for update
  using (public.is_family_parent(family_id));

create policy "parents can delete family members"
  on public.family_members for delete
  using (public.is_family_parent(family_id));

-- ---------------------------------------------------------------------------
-- events policies
-- ---------------------------------------------------------------------------
create policy "family members can view family events"
  on public.events for select
  using (
    public.is_family_member(family_id)
    and (visibility = 'family' or created_by = auth.uid())
  );

create policy "family members can create events"
  on public.events for insert
  with check (
    public.is_family_member(family_id)
    and auth.uid() = created_by
  );

create policy "event creator or parent can update"
  on public.events for update
  using (
    auth.uid() = created_by
    or public.is_family_parent(family_id)
  );

create policy "event creator or parent can delete"
  on public.events for delete
  using (
    auth.uid() = created_by
    or public.is_family_parent(family_id)
  );

-- ---------------------------------------------------------------------------
-- event_participants policies
-- ---------------------------------------------------------------------------
create policy "family members can view participants"
  on public.event_participants for select
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and public.is_family_member(e.family_id)
    )
  );

create policy "event creator or parent can manage participants"
  on public.event_participants for insert
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and (e.created_by = auth.uid() or public.is_family_parent(e.family_id))
    )
  );

create policy "event creator or parent can remove participants"
  on public.event_participants for delete
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and (e.created_by = auth.uid() or public.is_family_parent(e.family_id))
    )
  );

-- ---------------------------------------------------------------------------
-- tasks policies
-- ---------------------------------------------------------------------------
create policy "family members can view tasks"
  on public.tasks for select
  using (public.is_family_member(family_id));

create policy "family members can create tasks"
  on public.tasks for insert
  with check (
    public.is_family_member(family_id)
    and auth.uid() = created_by
  );

create policy "task creator or parent can update"
  on public.tasks for update
  using (
    auth.uid() = created_by
    or public.is_family_parent(family_id)
  );

-- Children may mark their own assigned task complete
create policy "assigned member can complete task"
  on public.tasks for update
  using (
    exists (
      select 1 from public.family_members fm
      where fm.user_id   = auth.uid()
        and fm.id        = assigned_to
        and fm.family_id = family_id
    )
  );

create policy "task creator or parent can delete"
  on public.tasks for delete
  using (
    auth.uid() = created_by
    or public.is_family_parent(family_id)
  );

-- ---------------------------------------------------------------------------
-- task_checklist_items policies
-- ---------------------------------------------------------------------------
create policy "family members can view checklist items"
  on public.task_checklist_items for select
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id
        and public.is_family_member(t.family_id)
    )
  );

create policy "task editor can manage checklist items"
  on public.task_checklist_items for all
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id
        and (t.created_by = auth.uid() or public.is_family_parent(t.family_id))
    )
  );

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
