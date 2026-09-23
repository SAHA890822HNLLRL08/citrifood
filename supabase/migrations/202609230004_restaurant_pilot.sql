-- Pilot restaurant accounts: membership is assigned by the project administrator,
-- NEVER by a public registration form or client-provided restaurant name.
create table if not exists public.cf_restaurant_members (
 user_id uuid not null references auth.users(id) on delete cascade,
 restaurant_name text not null check (char_length(btrim(restaurant_name)) between 1 and 100),
 created_at timestamptz not null default now(),
 primary key (user_id,restaurant_name)
);
create index if not exists cf_restaurant_members_name_idx on public.cf_restaurant_members(restaurant_name);
alter table public.cf_restaurant_members enable row level security;
create policy cf_restaurant_members_self_read on public.cf_restaurant_members
 for select to authenticated using (user_id=(select auth.uid()));
grant select on public.cf_restaurant_members to authenticated;
revoke insert,update,delete on public.cf_restaurant_members from authenticated,anon;
-- The same order can be viewed by its customer, assigned courier, or authorized
-- restaurant staff. Restaurant staff cannot change status via this policy.
drop policy if exists cf_orders_participant_read on public.cf_orders;
create policy cf_orders_participant_read on public.cf_orders
 for select to authenticated using (
 customer_id=(select auth.uid()) or courier_id=(select auth.uid())
 or exists (
  select 1 from public.cf_restaurant_members m
  where m.user_id=(select auth.uid()) and m.restaurant_name=cf_orders.restaurant_name
 )
);
-- Project administrator: assign membership using Supabase SQL editor only after
-- verifying that the email/account belongs to the restaurant:
-- insert into public.cf_restaurant_members(user_id,restaurant_name)
-- values ('<verified auth.users UUID>','<exact restaurant_name from pilot>');
-- No generic restaurant-wide public access and no service-role key in the app.
