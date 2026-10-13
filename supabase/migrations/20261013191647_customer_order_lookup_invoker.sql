-- Keep the focused customer lookup on caller privileges for cf_orders.
-- The delivery PIN continues through its existing owner-checked helper.

create or replace function public.cf_customer_order(p_order_id uuid)
returns table(
 id uuid,
 restaurant_name text,
 delivery_address text,
 delivery_notes text,
 items jsonb,
 total_cents integer,
 payment_method text,
 status text,
 created_at timestamptz,
 delivery_pin text,
 customer_arrival_verified boolean,
 arrived_customer_at timestamptz,
 ready_at timestamptz,
 picked_up_at timestamptz
)
language sql
security invoker
set search_path=''
stable
as $$
 select o.id,o.restaurant_name,o.delivery_address,o.delivery_notes,o.items,o.total_cents,o.payment_method,o.status,o.created_at,public.cf_customer_delivery_pin(o.id),o.customer_arrival_verified,o.arrived_customer_at,o.ready_at,o.picked_up_at
 from public.cf_orders o
 where o.id=p_order_id and o.customer_id=(select auth.uid())
 limit 1
$$;

revoke all on function public.cf_customer_order(uuid) from public,anon;
grant execute on function public.cf_customer_order(uuid) to authenticated;
