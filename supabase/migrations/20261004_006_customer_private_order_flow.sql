-- Current production RPC snapshot: customer order history, private PIN and cancellation.

create or replace function public.cf_create_order_secret()
returns trigger language plpgsql security definer set search_path=''
as $$ begin
 insert into public.cf_order_secrets(order_id,delivery_pin)
 values(new.id,lpad(floor(random()*10000)::int::text,4,'0'))
 on conflict(order_id) do nothing;
 return new;
end $$;
revoke all on function public.cf_create_order_secret() from public,anon,authenticated;

drop trigger if exists cf_orders_delivery_pin_secret on public.cf_orders;
create trigger cf_orders_delivery_pin_secret after insert on public.cf_orders
for each row execute function public.cf_create_order_secret();

create or replace function public.cf_customer_delivery_pin(p_order_id uuid)
returns text language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_pin text;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 select s.delivery_pin into v_pin from public.cf_order_secrets s join public.cf_orders o on o.id=s.order_id where s.order_id=p_order_id and o.customer_id=v_user;
 if not found then raise exception 'Order not found' using errcode='42501';end if;
 return v_pin;
end $$;

create or replace function public.cf_customer_cancel_order(p_order_id uuid)
returns table(id uuid,status text) language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 return query update public.cf_orders o set status='Cancelado' where o.id=p_order_id and o.customer_id=v_user and o.status='Nuevo' returning o.id,o.status;
 if not found then raise exception 'Order cannot be cancelled' using errcode='22023';end if;
end $$;

create or replace function public.cf_customer_orders()
returns table(id uuid,restaurant_name text,delivery_address text,delivery_notes text,items jsonb,total_cents integer,payment_method text,status text,created_at timestamptz,delivery_pin text,customer_arrival_verified boolean,arrived_customer_at timestamptz,ready_at timestamptz,picked_up_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 return query select o.id,o.restaurant_name,o.delivery_address,o.delivery_notes,o.items,o.total_cents,o.payment_method,o.status,o.created_at,s.delivery_pin,o.customer_arrival_verified,o.arrived_customer_at,o.ready_at,o.picked_up_at
 from public.cf_orders o left join public.cf_order_secrets s on s.order_id=o.id where o.customer_id=v_user order by o.created_at desc limit 30;
end $$;

revoke all on function public.cf_customer_delivery_pin(uuid),public.cf_customer_cancel_order(uuid),public.cf_customer_orders() from public,anon;
grant execute on function public.cf_customer_delivery_pin(uuid),public.cf_customer_cancel_order(uuid),public.cf_customer_orders() to authenticated;
