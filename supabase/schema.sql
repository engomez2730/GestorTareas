-- =============================================================================
-- ProjectManager — schema, roles and RLS policies
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'user');
create type public.project_type as enum ('Por Hora', 'Por Tareas');
create type public.payment_status as enum ('pending', 'confirmed');

-- ---------------------------------------------------------------------------
-- profiles — 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null unique,
  role       public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'App-level profile for every authenticated user, keyed to auth.users.';

-- Auto-create a profile row whenever a new auth.users row is inserted.
-- username and role are read from the signup metadata (see AuthContext.signUp).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'user')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table public.projects (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  start_date        date not null,
  end_date          date,
  price_without_tax numeric(12, 2) not null default 0,
  price_with_tax    numeric(12, 2) not null default 0,
  project_type      public.project_type not null,
  min_hours         integer,
  max_hours         integer,
  created_at        timestamptz not null default now(),

  constraint projects_dates_check check (end_date is null or end_date >= start_date),
  constraint projects_hours_check check (
    min_hours is null or max_hours is null or max_hours >= min_hours
  )
);

-- ---------------------------------------------------------------------------
-- tasks
-- Work items scoped to a project. Only admins create/edit/delete them; the
-- `original_time` estimate is fixed by the admin at creation time and is
-- strictly formatted as 'HH:MM' (e.g. '02:00', '00:25').
-- ---------------------------------------------------------------------------
create table public.tasks (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  description   text not null,
  original_time text not null check (original_time ~ '^[0-9]{2}:[0-5][0-9]$'),
  created_at    timestamptz not null default now()
);

create index tasks_project_id_idx on public.tasks (project_id);

-- ---------------------------------------------------------------------------
-- task_logs
-- Time actually worked by regular users against a task. Any number of users
-- may log time on the same task; `worked_time` uses the same 'HH:MM' format.
-- ---------------------------------------------------------------------------
create table public.task_logs (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  worked_time text not null check (worked_time ~ '^[0-9]{2}:[0-5][0-9]$'),
  created_at  timestamptz not null default now()
);

create index task_logs_task_id_idx on public.task_logs (task_id);
create index task_logs_user_id_idx on public.task_logs (user_id);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table public.payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  amount       numeric(12, 2) not null check (amount > 0),
  status       public.payment_status not null default 'pending',
  confirmed_by uuid references public.profiles (id),
  created_at   timestamptz not null default now()
);

create index payments_user_id_idx on public.payments (user_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles  enable row level security;
alter table public.projects  enable row level security;
alter table public.tasks     enable row level security;
alter table public.task_logs enable row level security;
alter table public.payments  enable row level security;

-- Helper: is the current user an admin? SECURITY DEFINER avoids recursive
-- RLS lookups against profiles from inside a profiles policy.
create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_username"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles_admin_update_role"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- projects policies — every authenticated user can read (needed to log
-- tasks against a project); only admins can write.
-- ---------------------------------------------------------------------------
create policy "projects_select_authenticated"
  on public.projects for select
  to authenticated
  using (true);

create policy "projects_admin_insert"
  on public.projects for insert
  to authenticated
  with check (public.is_admin());

create policy "projects_admin_update"
  on public.projects for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "projects_admin_delete"
  on public.projects for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- tasks policies — every authenticated user can read (needed to browse and
-- take tasks); only admins can create, edit or delete them.
-- ---------------------------------------------------------------------------
create policy "tasks_select_authenticated"
  on public.tasks for select
  to authenticated
  using (true);

create policy "tasks_admin_insert"
  on public.tasks for insert
  to authenticated
  with check (public.is_admin());

create policy "tasks_admin_update"
  on public.tasks for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "tasks_admin_delete"
  on public.tasks for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- task_logs policies — users log and see only their own worked time; admins
-- see every log. No update/delete policy is defined, so entries are
-- immutable once created (by design — this is a time-tracking audit trail).
-- ---------------------------------------------------------------------------
create policy "task_logs_select_own_or_admin"
  on public.task_logs for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "task_logs_insert_own"
  on public.task_logs for insert
  to authenticated
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- payments policies — users read only their own rows; only admins write.
-- ---------------------------------------------------------------------------
create policy "payments_select_own_or_admin"
  on public.payments for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "payments_admin_insert"
  on public.payments for insert
  to authenticated
  with check (public.is_admin());

create policy "payments_admin_update"
  on public.payments for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "payments_admin_delete"
  on public.payments for delete
  to authenticated
  using (public.is_admin());
