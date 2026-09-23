-- Pilot operations accounts are assigned by a project administrator, not self-service.
create table if not exists public.cf_operations_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.cf_operations_members enable row level security;
create policy cf_operations_self_read on public.cf_operations_members
 for select to authenticated using (user_id=(select auth.uid()));
grant select on public.cf_operations_members to authenticated;
revoke insert,update,delete on public.cf_operations_members from authenticated,anon;

-- Operations can view shared pilot orders without giving clients service-role keys.
-- Read policy is limited to verified operations membership. Operational changes
-- (courier assignment, refunds, cancellations) are NOT permitted here.
drop policy if exists cf_orders_participant_read on public.cf_orders;
create policy cf_orders_participant_read on public.cf_orders
 for select to authenticated using (
 customer_id=(select auth.uid()) or courier_id=(select auth.uid())
 or exists (
  select 1 from public.cf_restaurant_members m
  where m.user_id=(select auth.uid()) and m.restaurant_name=cf_orders.restaurant_name
 )
 or exists (
  select 1 from public.cf_operations_members op where op.user_id=(select auth.uid())
 )
);
-- Administrator-only setup after verifying the actual operations account:
-- insert into public.cf_operations_members(user_id) values ('<verified auth.users UUID>');
