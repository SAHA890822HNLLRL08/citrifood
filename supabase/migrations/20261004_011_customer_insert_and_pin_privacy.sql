-- Customer PIN privacy + required table privilege for RLS-protected order creation.

grant insert on table public.cf_orders to authenticated;

create or replace function public.cf_customer_delivery_pin(p_order_id uuid)
returns text language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_pin text;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 select s.delivery_pin into v_pin from public.cf_order_secrets s join public.cf_orders o on o.id=s.order_id
 where s.order_id=p_order_id and o.customer_id=v_user and o.status not in ('Entregado','Cancelado','Rechazado');
 if not found then raise exception 'Order not found' using errcode='42501';end if;
 return v_pin;
end $$;

create or replace function public.cf_customer_orders()
returns table(id uuid,restaurant_name text,delivery_address text,delivery_notes text,items jsonb,total_cents integer,payment_method text,status text,created_at timestamptz,delivery_pin text,customer_arrival_verified boolean,arrived_customer_at timestamptz,ready_at timestamptz,picked_up_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 return query select o.id,o.restaurant_name,o.delivery_address,o.delivery_notes,o.items,o.total_cents,o.payment_method,o.status,o.created_at,
 case when o.status not in ('Entregado','Cancelado','Rechazado') then s.delivery_pin else null end,
 o.customer_arrival_verified,o.arrived_customer_at,o.ready_at,o.picked_up_at
 from public.cf_orders o left join public.cf_order_secrets s on s.order_id=o.id
 where o.customer_id=v_user order by o.created_at desc limit 30;
end $$;
revoke all on function public.cf_customer_delivery_pin(uuid),public.cf_customer_orders() from public,anon;
grant execute on function public.cf_customer_delivery_pin(uuid),public.cf_customer_orders() to authenticated;
