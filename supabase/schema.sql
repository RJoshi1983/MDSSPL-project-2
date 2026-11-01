-- MDSSPL Service Hub — database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It is safe to run more than once.

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

-- 4. Create a profile automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, organisation, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'organisation', ''),
    'client' -- everyone starts as a client; an admin promotes staff, verifiers and admins
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Row Level Security. The app's server uses the secret key and checks
--    permissions itself; these rules stop anyone reading data directly
--    with the public key.
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "read own projects" on public.projects;
create policy "read own projects" on public.projects
  for select using (auth.uid() = owner_id);

-- No insert/update/delete policies: all writes go through the app's server.

-- 6. Make yourself the first admin (run after you have signed up once):
--    update public.profiles set role = 'admin' where email = 'you@example.com';
