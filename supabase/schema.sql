-- MDSSPL Service Hub — database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It is safe to run more than once.
--
-- Security model: the app talks to the database AS the signed-in person
-- (with the public "anon / publishable" key plus their login token).
-- Every rule about who may see or change what is enforced HERE, in the
-- database, so it holds even if someone calls the database directly.

-- 1. People: one row per account, created automatically on sign-up.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  organisation text not null default '',
  role text not null default 'client' check (role in ('client', 'staff', 'verifier', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. Projects: one row per service project; all entered data is in "data".
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  service text not null,
  title text not null default '',
  financial_year text not null default '',
  status text not null default 'draft' check (status in ('draft', 'submitted', 'under_review', 'verified')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_owner_idx on public.projects(owner_id);
create index if not exists projects_service_idx on public.projects(service);

-- 3. Change history: every save and status change.
create table if not exists public.activity_log (
  id bigserial primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);
create index if not exists activity_project_idx on public.activity_log(project_id, at desc);
create index if not exists activity_user_idx on public.activity_log(user_id);

-- 4. Helper: the role of the person making the request.
create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;
revoke all on function public.my_role() from public, anon;
grant execute on function public.my_role() to authenticated;

-- 5. Create a profile automatically when someone signs up (always as a client).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, organisation, role)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data->>'full_name', ''), 200),
    left(coalesce(new.raw_user_meta_data->>'organisation', ''), 200),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Workflow rules, checked on every change to a project.
create or replace function public.check_project_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r text := public.my_role();
begin
  if auth.uid() is null then
    return new; -- changes made from the Supabase dashboard / SQL editor
  end if;
  if new.owner_id <> old.owner_id or new.service <> old.service or new.id <> old.id or new.created_at <> old.created_at then
    raise exception 'These project details cannot be changed.';
  end if;
  if old.status = 'verified' and r <> 'admin' then
    raise exception 'A verified project cannot be changed.';
  end if;
  -- data / title edits
  if new.data is distinct from old.data or new.title is distinct from old.title or new.financial_year is distinct from old.financial_year then
    if not (
      r in ('staff', 'admin')
      or (r = 'client' and old.owner_id = auth.uid() and old.status = 'draft')
    ) then
      raise exception 'This project can no longer be edited.';
    end if;
  end if;
  -- status changes
  if new.status <> old.status then
    if not (
      r = 'admin'
      or (r = 'client' and old.owner_id = auth.uid() and old.status = 'draft' and new.status = 'submitted')
      or (r = 'staff' and new.status in ('draft', 'submitted', 'under_review'))
      or (r = 'verifier' and old.status = 'submitted' and new.status in ('under_review', 'draft'))
      or (r = 'verifier' and old.status = 'under_review' and new.status in ('verified', 'draft'))
    ) then
      raise exception 'You cannot move this project to that status.';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.check_project_change() from public, anon, authenticated;

drop trigger if exists project_change_rules on public.projects;
create trigger project_change_rules
  before update on public.projects
  for each row execute function public.check_project_change();

-- Only admins may change a role; nobody may change their own id or email here.
create or replace function public.check_profile_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if new.id <> old.id or new.email <> old.email then
    raise exception 'These details cannot be changed.';
  end if;
  if new.role <> old.role then
    if public.my_role() <> 'admin' then raise exception 'Only an admin can change roles.'; end if;
    if old.id = auth.uid() then raise exception 'You cannot change your own role.'; end if;
  end if;
  return new;
end;
$$;
revoke all on function public.check_profile_change() from public, anon, authenticated;

drop trigger if exists profile_change_rules on public.profiles;
create trigger profile_change_rules
  before update on public.profiles
  for each row execute function public.check_profile_change();

-- 7. Row Level Security: who can see and change which rows.
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.activity_log enable row level security;

-- profiles
drop policy if exists "read own profile" on public.profiles;
drop policy if exists "profiles: read" on public.profiles;
create policy "profiles: read" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.my_role()) in ('staff', 'admin', 'verifier'));

drop policy if exists "profiles: update" on public.profiles;
create policy "profiles: update" on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.my_role()) = 'admin')
  with check (id = (select auth.uid()) or (select public.my_role()) = 'admin');

-- projects
drop policy if exists "read own projects" on public.projects;
drop policy if exists "projects: read" on public.projects;
create policy "projects: read" on public.projects for select to authenticated
  using (
    owner_id = (select auth.uid())
    or (select public.my_role()) in ('staff', 'admin')
    or ((select public.my_role()) = 'verifier' and status in ('submitted', 'under_review', 'verified'))
  );

drop policy if exists "projects: create" on public.projects;
create policy "projects: create" on public.projects for insert to authenticated
  with check (
    status = 'draft'
    and (
      (owner_id = (select auth.uid()) and (select public.my_role()) in ('client', 'staff', 'admin'))
      or (select public.my_role()) in ('staff', 'admin')
    )
  );

drop policy if exists "projects: update" on public.projects;
create policy "projects: update" on public.projects for update to authenticated
  using (
    owner_id = (select auth.uid())
    or (select public.my_role()) in ('staff', 'admin')
    or ((select public.my_role()) = 'verifier' and status in ('submitted', 'under_review'))
  )
  with check (true); -- the detailed rules are in check_project_change()

-- activity log: visible with the project; anyone who can see a project may add their own entries
drop policy if exists "activity: read" on public.activity_log;
create policy "activity: read" on public.activity_log for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id));

drop policy if exists "activity: add" on public.activity_log;
create policy "activity: add" on public.activity_log for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id));

-- No delete policies: nothing can be deleted through the app.

-- 8. Make yourself the first admin (run after you have signed up once):
--    update public.profiles set role = 'admin' where email = 'you@example.com';
