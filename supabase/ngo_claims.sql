-- ResQMeal Milestone 3: NGO discovery + atomic donation claiming (revised).
-- Apply manually in the Supabase SQL editor AFTER review. Additive only: drops no tables, rows or users; RLS stays enabled.

alter table public.donations
  add column if not exists claimed_by uuid references auth.users(id),
  add column if not exists claimed_at timestamptz;

create index if not exists donations_available_idx
  on public.donations (pickup_by) where status = 'posted';

-- Roles: one row per user. Rows are created outside the app (service role or SQL editor), never by users.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('restaurant', 'ngo'))
);

alter table public.user_roles enable row level security;

-- Users may read only their own role row.
drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

-- No INSERT, UPDATE or DELETE policy exists, and the privileges are revoked as well,
-- so users cannot assign or change any role, including their own.
revoke all on public.user_roles from anon, authenticated;
grant select on public.user_roles to authenticated;

-- Discovery: only NGO accounts may read donations that are posted and not yet past pickup,
-- plus donations they have claimed themselves. Restaurant access to their own donations
-- is provided by the pre-existing restaurant policy and is not changed here.
drop policy if exists ngo_select_available on public.donations;
create policy ngo_select_available on public.donations
  for select to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'ngo'
    )
    and (
      (status = 'posted' and pickup_by > pg_catalog.now())
      or claimed_by = auth.uid()
    )
  );

-- No UPDATE or DELETE policy is added for anyone. Claims change rows only through claim_donation().

-- Atomic claim. Requires an 'ngo' role. The UPDATE is conditional on status = 'posted', so when two NGOs
-- race, Postgres row locking makes the second UPDATE re-check the condition and match zero rows.
-- search_path is empty, so every object reference below is schema-qualified.
create or replace function public.claim_donation(p_donation_id uuid)
returns public.donations
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.donations;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'ngo'
  ) then
    raise exception 'Only NGO accounts can claim donations' using errcode = '42501';
  end if;

  update public.donations d
     set status = 'claimed',
         claimed_by = auth.uid(),
         claimed_at = pg_catalog.now()
   where d.id = p_donation_id
     and d.status = 'posted'
     and d.pickup_by > pg_catalog.now()
     and d.restaurant_id <> auth.uid()
  returning * into result;

  if not found then
    raise exception 'Donation is no longer available' using errcode = 'P0001';
  end if;

  return result;
end;
$$;

revoke all on function public.claim_donation(uuid) from public, anon;
grant execute on function public.claim_donation(uuid) to authenticated;
