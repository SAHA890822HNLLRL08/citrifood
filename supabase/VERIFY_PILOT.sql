-- Run in Supabase SQL Editor AFTER migrations 001–008.
-- This script is read-only and should report zero missing objects.
with required(kind,name,exists_ok) as (
 values
 ('table','cf_orders',to_regclass('public.cf_orders') is not null),
 ('table','cf_order_messages',to_regclass('public.cf_order_messages') is not null),
 ('table','cf_restaurant_members',to_regclass('public.cf_restaurant_members') is not null),
 ('table','cf_operations_members',to_regclass('public.cf_operations_members') is not null),
 ('table','cf_courier_members',to_regclass('public.cf_courier_members') is not null),
 ('function','cf_restaurant_advance_order',to_regprocedure('public.cf_restaurant_advance_order(uuid,text)') is not null),
 ('function','cf_operations_assign_courier',to_regprocedure('public.cf_operations_assign_courier(uuid,uuid)') is not null),
 ('function','cf_courier_complete_order',to_regprocedure('public.cf_courier_complete_order(uuid)') is not null)
)
select kind,name,case when exists_ok then 'OK' else 'MISSING' end as result
from required order by kind,name;

-- RLS must remain enabled for all pilot tables. Do not launch if any is false.
select c.relname as table_name,c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in
('cf_orders','cf_order_messages','cf_restaurant_members','cf_operations_members','cf_courier_members')
order by c.relname;
