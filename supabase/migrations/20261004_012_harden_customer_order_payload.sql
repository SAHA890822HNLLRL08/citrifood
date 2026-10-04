-- Defense in depth for direct PostgREST order creation.
create or replace function public.cf_valid_order_items(p_items jsonb)
returns boolean language sql immutable set search_path=''
as $$
 select jsonb_typeof(p_items)='array'
 and jsonb_array_length(p_items) between 1 and 40
 and not exists(
  select 1 from jsonb_array_elements(p_items) e
  where jsonb_typeof(e)<>'object'
   or jsonb_typeof(e->'name')<>'string'
   or char_length(btrim(e->>'name')) not between 1 and 100
   or jsonb_typeof(e->'qty')<>'number'
   or (e->>'qty') !~ '^[0-9]+$'
   or (e->>'qty')::numeric not between 1 and 50
   or jsonb_typeof(e->'price')<>'number'
   or (e->>'price') !~ '^[0-9]+$'
   or (e->>'price')::numeric not between 1 and 100000
 );
$$;
revoke all on function public.cf_valid_order_items(jsonb) from public,anon,authenticated;
alter table public.cf_orders drop constraint if exists cf_orders_items_shape_check;
alter table public.cf_orders add constraint cf_orders_items_shape_check check(public.cf_valid_order_items(items)) not valid;

drop policy if exists cf_orders_customer_create on public.cf_orders;
create policy cf_orders_customer_create on public.cf_orders for insert to authenticated
with check(customer_id=(select auth.uid()) and courier_id is null and status='Nuevo'
 and delivery_lat is not null and delivery_lat between -90 and 90
 and delivery_lng is not null and delivery_lng between -180 and 180);
