-- ResQMeal Milestone 4: volunteer pickup and delivery workflow.
-- Apply manually in the Supabase SQL editor AFTER supabase/schema.sql and supabase/ngo_claims.sql.
-- Additive only: drops no tables, rows or users; RLS stays enabled.
-- Synthetic demo use only. Do not enter real personal or business data.
-- Volunteers never read donations directly: every volunteer action goes through a SECURITY DEFINER RPC.

-- 1. Allow the 'volunteer' role. Role rows are still created outside the app only.
alter table public.user_roles
  drop constraint if exists user_roles_role_check;

alter table public.user_roles
  add constraint user_roles_role_check check (role in ('restaurant', 'ngo', 'volunteer'));

-- 2. Assignment and timeline columns on donations. Status values 'claimed', 'collected'
--    and 'delivered' already exist in the donations status check (schema.sql).
alter table public.donations
  add column if not exists volunteer_id uuid references auth.users(id),
  add column if not exists volunteer_accepted_at timestamptz,
  add column if not exists collected_at timestamptz,
  add column if not exists delivered_at timestamptz;

-- A volunteer assignment only makes sense on a claimed donation, and only one volunteer may hold it.
-- Accepting is the only place volunteer_id is set, so the check keeps the workflow states consistent.
alter table public.donations
  drop constraint if exists donations_volunteer_status_check;

alter table public.donations
  add constraint donations_volunteer_status_check check (
    volunteer_id is null or status in ('claimed', 'collected', 'delivered')
  );

create index if not exists donations_open_tasks_idx
  on public.donations (pickup_by) where status = 'claimed' and volunteer_id is null;

create index if not exists donations_volunteer_idx
  on public.donations (volunteer_id, pickup_by);

-- 3. Party details shown to a volunteer after accepting a task (donor = restaurant, receiver = NGO).
--    One row per user; users may maintain only their own row. Volunteers read these through the RPCs below.
create table if not exists public.party_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 120),
  address text check (char_length(address) <= 300),
  contact_name text check (char_length(contact_name) <= 120),
  contact_phone text check (char_length(contact_phone) <= 40)
);

alter table public.party_profiles enable row level security;

drop policy if exists party_profiles_select_own on public.party_profiles;
create policy party_profiles_select_own on public.party_profiles
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists party_profiles_insert_own on public.party_profiles;
create policy party_profiles_insert_own on public.party_profiles
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists party_profiles_update_own on public.party_profiles;
create policy party_profiles_update_own on public.party_profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke all on public.party_profiles from anon, authenticated;
grant select, insert, update on public.party_profiles to authenticated;

-- 4. Role helper. Returns false when there is no session.
create or replace function public.current_user_is_volunteer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'volunteer'
  );
$$;

revoke all on function public.current_user_is_volunteer() from public, anon;
grant execute on function public.current_user_is_volunteer() to authenticated;

-- 5. Open tasks: claimed donations that no volunteer has accepted and that are not past pickup.
--    Party contact details are deliberately NOT returned until a volunteer accepts the task.
create or replace function public.list_open_volunteer_tasks()
returns table (
  id uuid,
  food_name text,
  category text,
  quantity numeric,
  unit text,
  prepared_at timestamptz,
  pickup_by timestamptz,
  storage_conditions text,
  allergens text[],
  handling_instructions text,
  status text,
  claimed_at timestamptz,
  volunteer_accepted_at timestamptz,
  collected_at timestamptz,
  delivered_at timestamptz,
  donor_name text,
  donor_address text,
  donor_contact_name text,
  donor_contact_phone text,
  receiver_name text,
  receiver_address text,
  receiver_contact_name text,
  receiver_contact_phone text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not public.current_user_is_volunteer() then
    raise exception 'Only volunteer accounts can view volunteer tasks' using errcode = '42501';
  end if;

  return query
    select d.id,
           d.food_name,
           d.category,
           d.quantity,
           d.unit,
           d.prepared_at,
           d.pickup_by,
           d.storage_conditions,
           d.allergens,
           d.handling_instructions,
           d.status,
           d.claimed_at,
           d.volunteer_accepted_at,
           d.collected_at,
           d.delivered_at,
           null::text, null::text, null::text, null::text,
           null::text, null::text, null::text, null::text
      from public.donations d
     where d.status = 'claimed'
       and d.volunteer_id is null
       and d.pickup_by > pg_catalog.now()
     order by d.pickup_by asc;
end;
$$;

-- 6. Own tasks: donations this volunteer accepted, with party details for pickup and delivery.
create or replace function public.list_my_volunteer_tasks()
returns table (
  id uuid,
  food_name text,
  category text,
  quantity numeric,
  unit text,
  prepared_at timestamptz,
  pickup_by timestamptz,
  storage_conditions text,
  allergens text[],
  handling_instructions text,
  status text,
  claimed_at timestamptz,
  volunteer_accepted_at timestamptz,
  collected_at timestamptz,
  delivered_at timestamptz,
  donor_name text,
  donor_address text,
  donor_contact_name text,
  donor_contact_phone text,
  receiver_name text,
  receiver_address text,
  receiver_contact_name text,
  receiver_contact_phone text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not public.current_user_is_volunteer() then
    raise exception 'Only volunteer accounts can view volunteer tasks' using errcode = '42501';
  end if;

  return query
    select d.id,
           d.food_name,
           d.category,
           d.quantity,
           d.unit,
           d.prepared_at,
           d.pickup_by,
           d.storage_conditions,
           d.allergens,
           d.handling_instructions,
           d.status,
           d.claimed_at,
           d.volunteer_accepted_at,
           d.collected_at,
           d.delivered_at,
           donor.display_name,
           donor.address,
           donor.contact_name,
           donor.contact_phone,
           receiver.display_name,
           receiver.address,
           receiver.contact_name,
           receiver.contact_phone
      from public.donations d
      left join public.party_profiles donor on donor.user_id = d.restaurant_id
      left join public.party_profiles receiver on receiver.user_id = d.claimed_by
     where d.volunteer_id = auth.uid()
     order by d.pickup_by asc;
end;
$$;

-- 7. Accept an open task. Atomic: the UPDATE only matches an unassigned, claimed, not-yet-past-pickup donation,
--    so two volunteers racing for the same task cannot both succeed.
create or replace function public.accept_donation(p_donation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not public.current_user_is_volunteer() then
    raise exception 'Only volunteer accounts can accept tasks' using errcode = '42501';
  end if;

  update public.donations d
     set volunteer_id = auth.uid(),
         volunteer_accepted_at = pg_catalog.now()
   where d.id = p_donation_id
     and d.status = 'claimed'
     and d.volunteer_id is null
     and d.pickup_by > pg_catalog.now()
  returning d.id into v_id;

  if v_id is null then
    raise exception 'Donation is no longer available' using errcode = 'P0001';
  end if;
end;
$$;

-- 8. Mark an accepted task as collected. Only the assigned volunteer, only from 'claimed'.
create or replace function public.mark_collected(p_donation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not public.current_user_is_volunteer() then
    raise exception 'Only volunteer accounts can update tasks' using errcode = '42501';
  end if;

  update public.donations d
     set status = 'collected',
         collected_at = pg_catalog.now()
   where d.id = p_donation_id
     and d.volunteer_id = auth.uid()
     and d.status = 'claimed'
  returning d.id into v_id;

  if v_id is null then
    raise exception 'Task is no longer in the expected state' using errcode = 'P0001';
  end if;
end;
$$;

-- 9. Mark a collected task as delivered. Only the assigned volunteer, only from 'collected'.
create or replace function public.mark_delivered(p_donation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not public.current_user_is_volunteer() then
    raise exception 'Only volunteer accounts can update tasks' using errcode = '42501';
  end if;

  update public.donations d
     set status = 'delivered',
         delivered_at = pg_catalog.now()
   where d.id = p_donation_id
     and d.volunteer_id = auth.uid()
     and d.status = 'collected'
  returning d.id into v_id;

  if v_id is null then
    raise exception 'Task is no longer in the expected state' using errcode = 'P0001';
  end if;
end;
$$;

-- 10. Privileges. Only signed-in users may call the RPCs; the RPCs enforce the volunteer role themselves.
revoke all on function public.list_open_volunteer_tasks() from public, anon;
grant execute on function public.list_open_volunteer_tasks() to authenticated;

revoke all on function public.list_my_volunteer_tasks() from public, anon;
grant execute on function public.list_my_volunteer_tasks() to authenticated;

revoke all on function public.accept_donation(uuid) from public, anon;
grant execute on function public.accept_donation(uuid) to authenticated;

revoke all on function public.mark_collected(uuid) from public, anon;
grant execute on function public.mark_collected(uuid) to authenticated;

revoke all on function public.mark_delivered(uuid) from public, anon;
grant execute on function public.mark_delivered(uuid) to authenticated;

-- No direct UPDATE or DELETE policy is added on public.donations. Volunteer changes happen only through the RPCs above.
