-- Scoped customer lookup for realtime refreshes and focused tracking.
-- Returns at most one order and always enforces ownership with auth.uid().

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
language plpgsql
security definer
set search_path=''
as $$
declare
 v_user uuid := (select auth.uid());
begin
 if v_user is null then
  raise exception 'Authentication required' using errcode='42501';
 end if;
 return query
 select o.id,o.restaurant_name,o.delivery_address,o.delivery_notes,o.items,o.total_cents,o.payment_method,o.status,o.created_at,s.delivery_pin,o.customer_arrival_verified,o.arrived_customer_at,o.ready_at,o.picked_up_at
 from public.cf_orders o
 left join public.cf_order_secrets s on s.order_id=o.id
 where o.customer_id=v_user and o.id=p_order_id
 limit 1;
end $$;

revoke all on function public.cf_customer_order(uuid) from public,anon;
grant execute on function public.cf_customer_order(uuid) to authenticated;
