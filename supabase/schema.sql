-- ResQMeal: donations schema for Milestone 2
--
-- Synthetic demo use only. Do not enter real personal or business data.
-- Run this file in the Supabase SQL Editor for your project.
-- The app uses only the anon/publishable key; no service-role key is used.
-- ResQMeal does not certify food safety.

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  food_name text not null check (char_length(food_name) between 2 and 120),
  category text not null check (category in ('cooked_meal','bakery','produce','packaged','beverage','other')),
  quantity numeric not null check (quantity > 0),
  unit text not null check (unit in ('kg','g','portions','pieces','litres')),
  prepared_at timestamptz not null,
  pickup_by timestamptz not null,
  storage_conditions text not null check (storage_conditions in ('room_temperature','refrigerated','frozen','hot_holding')),
  allergens text[] not null default '{}',
  handling_instructions text check (char_length(handling_instructions) <= 500),
  status text not null default 'posted' check (status in ('posted','claimed','collected','delivered','expired')),
  created_at timestamptz not null default now(),
  constraint pickup_after_prepared check (pickup_by > prepared_at)
);

create index if not exists donations_restaurant_created_idx on public.donations (restaurant_id, created_at desc);
create index if not exists donations_status_pickup_idx on public.donations (status, pickup_by);

alter table public.donations enable row level security;

drop policy if exists restaurants_insert_own on public.donations;
create policy restaurants_insert_own on public.donations
  for insert to authenticated
  with check (restaurant_id = auth.uid() and status = 'posted');

drop policy if exists restaurants_select_own on public.donations;
create policy restaurants_select_own on public.donations
  for select to authenticated
  using (restaurant_id = auth.uid());

-- No update or delete policies yet. No grants to the anon role.
