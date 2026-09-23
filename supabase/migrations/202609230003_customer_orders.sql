-- First authenticated cross-device customer order slice.
-- Existing browser-demo orders remain local and are NOT migrated automatically.
alter table public.cf_orders
 add column if not exists restaurant_name text,
 add column if not exists delivery_address text,
 add column if not exists delivery_notes text,
 add column if not exists items jsonb not null default '[]'::jsonb,
 add column if not exists total_cents integer,
 add column if not exists payment_method text not null default 'Efectivo (prueba)';
alter table public.cf_orders
 add constraint cf_order_customer_payload_check check (
 restaurant_name is not null and char_length(btrim(restaurant_name)) between 1 and 100
 and delivery_address is not null and char_length(btrim(delivery_address)) between 5 and 250
 and (delivery_notes is null or char_length(delivery_notes)<=250)
 and jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 40
 and total_cents between 1 and 10000000
 and payment_method='Efectivo (prueba)'
 ) not valid;
-- NOT VALID lets existing chat-schema test rows survive; new rows are checked.
-- No customer UPDATE/DELETE permission: assignment and state changes require
-- separately authorized restaurant/operations/courier endpoints.
create policy cf_orders_customer_create on public.cf_orders
 for insert to authenticated with check (
 customer_id=(select auth.uid())
 and courier_id is null
 and status='Nuevo'
 );
grant insert (customer_id,restaurant_name,delivery_address,delivery_notes,items,total_cents,payment_method)
 on public.cf_orders to authenticated;
-- Never expose customer phone numbers in order or message rows.
