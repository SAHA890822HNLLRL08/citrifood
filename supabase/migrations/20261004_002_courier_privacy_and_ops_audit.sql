-- Current production RPC snapshot: courier privacy/shift and operations PIN audit.
-- Requires 20261004_001_shared_operations_schema.sql.

create or replace function public.cf_courier_set_accepting_orders(p_accepting boolean)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_updated boolean;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 update public.cf_courier_members set accepting_orders=coalesce(p_accepting,false) where user_id=v_user and active returning accepting_orders into v_updated;
 if not found then raise exception 'Courier authorization required' using errcode='42501';end if;
 return v_updated;
end $$;

create or replace function public.cf_courier_status()
returns table(display_name text,active boolean,accepting_orders boolean,active_orders integer)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 return query select c.display_name,c.active,c.accepting_orders,(select count(*)::integer from public.cf_orders o where o.courier_id=v_user and o.status in ('Esperando repartidor','En entrega')) from public.cf_courier_members c where c.user_id=v_user and c.active;
 if not found then raise exception 'Courier authorization required' using errcode='42501';end if;
end $$;

create or replace function public.cf_courier_orders()
returns table(id uuid,restaurant_name text,delivery_address text,delivery_notes text,items jsonb,total_cents integer,payment_method text,status text,created_at timestamptz,arrived_restaurant_at timestamptz,restaurant_arrival_verified boolean,picked_up_at timestamptz,arrived_customer_at timestamptz,customer_arrival_verified boolean,delivered_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists(select 1 from public.cf_courier_members m where m.user_id=v_user and m.active) then raise exception 'Courier authorization required' using errcode='42501';end if;
 return query with mine as (
  select o.*,case when o.status in ('Esperando repartidor','En entrega') then 0 else 1 end grp,row_number() over(partition by case when o.status in ('Esperando repartidor','En entrega') then 0 else 1 end order by o.created_at desc) rn
  from public.cf_orders o where o.courier_id=v_user
 ) select o.id,o.restaurant_name,case when o.status='En entrega' then o.delivery_address else null end,case when o.status='En entrega' then o.delivery_notes else null end,o.items,o.total_cents,o.payment_method,o.status,o.created_at,o.arrived_restaurant_at,o.restaurant_arrival_verified,o.picked_up_at,o.arrived_customer_at,o.customer_arrival_verified,o.delivered_at
 from mine o where o.grp=0 or o.rn<=10 order by o.grp,o.created_at desc;
end $$;

create or replace function public.cf_operations_pin_security()
returns table(order_id uuid,failed_attempts integer,locked_until timestamptz)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 return query select s.order_id,s.failed_pin_attempts,s.pin_locked_until from public.cf_order_secrets s join public.cf_orders o on o.id=s.order_id where o.status='En entrega' and (s.failed_pin_attempts>0 or s.pin_locked_until is not null);
end $$;

create or replace function public.cf_operations_reset_pin_lock(p_order_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_count integer;
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 update public.cf_order_secrets s set failed_pin_attempts=0,pin_locked_until=null from public.cf_orders o where s.order_id=p_order_id and o.id=s.order_id and o.status='En entrega';
 get diagnostics v_count=row_count;
 if v_count>0 then insert into public.cf_operations_audit(operations_user_id,action,order_id,metadata) values(v_user,'reset_delivery_pin_lock',p_order_id,jsonb_build_object('source','operations_panel'));end if;
 return v_count>0;
end $$;

create or replace function public.cf_operations_order_audit(p_order_id uuid)
returns table(id bigint,action text,operations_user_id uuid,created_at timestamptz,metadata jsonb)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 return query select a.id,a.action,a.operations_user_id,a.created_at,a.metadata from public.cf_operations_audit a where a.order_id=p_order_id order by a.created_at desc limit 50;
end $$;

revoke all on function public.cf_courier_set_accepting_orders(boolean),public.cf_courier_status(),public.cf_courier_orders(),public.cf_operations_pin_security(),public.cf_operations_reset_pin_lock(uuid),public.cf_operations_order_audit(uuid) from public,anon;
grant execute on function public.cf_courier_set_accepting_orders(boolean),public.cf_courier_status(),public.cf_courier_orders(),public.cf_operations_pin_security(),public.cf_operations_reset_pin_lock(uuid),public.cf_operations_order_audit(uuid) to authenticated;
