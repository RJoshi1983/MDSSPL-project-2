-- Referral partners: staff publish them; partners and the registration page can only check one code at a time.
create table if not exists public.referrers (
  code text primary key,
  owner uuid not null default auth.uid(),
  name text not null,
  type text,
  email text,
  phone text,
  pan_last4 text,
  gstin text,
  rate numeric,
  status text not null default 'Active',
  enrolled_at timestamptz,
  notes text,
  updated_at timestamptz not null default now()
);
alter table public.referrers enable row level security;
drop policy if exists ref_own on public.referrers;
create policy ref_own on public.referrers for all to authenticated using (owner = (select auth.uid())) with check (owner = (select auth.uid()));

-- Registration page: is this code an active referral partner? Returns the name only.
create or replace function public.referral_check(p_code text)
returns table(code text, name text, type text)
language sql stable security definer set search_path = ''
as $$
  select r.code, r.name, r.type from public.referrers r
  where r.code = upper(trim(p_code)) and r.status = 'Active';
$$;

-- Referral partner page: the partner's own onboarding details, only with the code plus the email or phone given at onboarding.
create or replace function public.referrer_lookup(p_code text, p_who text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('code', r.code, 'name', r.name, 'type', r.type, 'email', r.email, 'phone', r.phone,
    'pan_last4', r.pan_last4, 'gstin', r.gstin, 'rate', r.rate, 'status', r.status, 'enrolled_at', r.enrolled_at)
  from public.referrers r
  where r.code = upper(trim(p_code))
    and (lower(coalesce(r.email,'')) = lower(trim(p_who))
         or (length(regexp_replace(coalesce(r.phone,''), '\D', '', 'g')) >= 7
             and regexp_replace(coalesce(r.phone,''), '\D', '', 'g') = regexp_replace(p_who, '\D', '', 'g')))
  limit 1;
$$;

revoke all on function public.referral_check(text) from public;
revoke all on function public.referrer_lookup(text, text) from public;
grant execute on function public.referral_check(text) to anon, authenticated;
grant execute on function public.referrer_lookup(text, text) to anon, authenticated;

-- Code change register (admin record of every modification file)
insert into public.change_history (layer, version, summary, details, changed_by) values
('frontend','0.4.2','Razorpay.me payment link','code-changes/02-v0.4.2.js','Claude for MDSSPL'),
('frontend','0.4.3','Blank page fix (terms and accounts storage key)','code-changes/03-v0.4.3.js','Claude for MDSSPL'),
('frontend','0.5.0','17 new services in 5 groups','code-changes/04-v0.5.0.js','Claude for MDSSPL'),
('frontend','0.5.1','ESRS and HSE duplicates merged','code-changes/05-v0.5.1.js','Claude for MDSSPL'),
('all','0.5.2','More merges, sample data, demos, manuals, service tables','code-changes/06-v0.5.2.js','Claude for MDSSPL'),
('all','0.5.3','Admin-only control pages, code register, referral partner page, simpler registration, referrers table','code-changes/07-v0.5.3.js','Claude for MDSSPL');
