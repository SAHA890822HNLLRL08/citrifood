-- Harden verified delivery chain with executable production definitions.

create or replace function public.cf_courier_arrive_restaurant(p_order_id uuid,p_lat double precision,p_lng double precision,p_accuracy_m double precision)
returns table(id uuid,status text,restaurant_arrival_verified boolean) language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_rlat double precision;v_rlng double precision;v_distance double precision;
begin
 if v_user is null or not exists(select 1 from public.cf_courier_members m where m.user_id=v_user and m.active) then raise exception 'Courier authorization required' using errcode='42501';end if;
 if p_lat is null or p_lng is null or p_accuracy_m is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 or p_accuracy_m not between 0 and 50 then raise exception 'Invalid GPS position' using errcode='22023';end if;
 select r.lat,r.lng into v_rlat,v_rlng from public.cf_orders o join public.cf_restaurant_locations r on r.restaurant_name=o.restaurant_name where o.id=p_order_id and o.courier_id=v_user and o.status='Esperando repartidor' and o.ready_at is not null and r.updated_at>=now()-interval '30 days';
 if not found then raise exception 'Order or current restaurant location unavailable' using errcode='22023';end if;
 v_distance:=6371000*2*asin(sqrt(power(sin(radians(p_lat-v_rlat)/2),2)+cos(radians(v_rlat))*cos(radians(p_lat))*power(sin(radians(p_lng-v_rlng)/2),2)));
 if v_distance>50 then raise exception 'Courier is too far from restaurant' using errcode='22023';end if;
 return query update public.cf_orders o set arrived_restaurant_at=coalesce(o.arrived_restaurant_at,now()),restaurant_arrival_verified=true where o.id=p_order_id and o.courier_id=v_user and o.status='Esperando repartidor' and o.ready_at is not null returning o.id,o.status,o.restaurant_arrival_verified;
end $$;

create or replace function public.cf_courier_pickup_order(p_order_id uuid)
returns table(id uuid,status text) language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_debt integer;v_payment text;v_committed integer;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 select m.cash_debt_cents into v_debt from public.cf_courier_members m where m.user_id=v_user and m.active for update;if not found then raise exception 'Courier authorization required' using errcode='42501';end if;
 select o.payment_method into v_payment from public.cf_orders o where o.id=p_order_id and o.courier_id=v_user and o.status='Esperando repartidor' and o.ready_at is not null and o.restaurant_arrival_verified=true and o.arrived_restaurant_at is not null for update;
 if not found then raise exception 'Ready order and verified restaurant arrival required' using errcode='22023';end if;
 select coalesce(sum(o.total_cents),0)::integer into v_committed from public.cf_orders o where o.courier_id=v_user and o.payment_method='Efectivo (simulado)' and o.status in ('Esperando repartidor','En entrega');
 if v_payment='Efectivo (simulado)' and v_debt+v_committed>80000 then raise exception 'Cash exposure limit exceeded before pickup' using errcode='22023';end if;
 return query update public.cf_orders o set status='En entrega',picked_up_at=now() where o.id=p_order_id and o.courier_id=v_user and o.status='Esperando repartidor' and o.ready_at is not null and o.restaurant_arrival_verified=true and o.arrived_restaurant_at is not null returning o.id,o.status;
end $$;

create or replace function public.cf_courier_arrive_customer(p_order_id uuid,p_lat double precision,p_lng double precision,p_accuracy_m double precision)
returns table(id uuid,arrived_customer_at timestamptz,customer_arrival_verified boolean) language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_delivery_lat double precision;v_delivery_lng double precision;v_distance_m double precision;
begin
 if v_user is null or not exists(select 1 from public.cf_courier_members m where m.user_id=v_user and m.active) then raise exception 'Courier authorization required' using errcode='42501';end if;
 if p_lat is null or p_lat < -90 or p_lat > 90 or p_lng is null or p_lng < -180 or p_lng > 180 or p_accuracy_m is null or p_accuracy_m < 0 or p_accuracy_m > 50 then raise exception 'Invalid GPS reading' using errcode='22023';end if;
 select o.delivery_lat,o.delivery_lng into v_delivery_lat,v_delivery_lng from public.cf_orders o where o.id=p_order_id and o.courier_id=v_user and o.status='En entrega' and o.picked_up_at is not null for update;
 if not found or v_delivery_lat is null or v_delivery_lng is null then raise exception 'Order unavailable or destination coordinates missing' using errcode='22023';end if;
 v_distance_m:=6371000*2*asin(sqrt(power(sin(radians(p_lat-v_delivery_lat)/2),2)+cos(radians(v_delivery_lat))*cos(radians(p_lat))*power(sin(radians(p_lng-v_delivery_lng)/2),2)));
 if v_distance_m>10 then raise exception 'Courier is too far from customer' using errcode='22023';end if;
 return query update public.cf_orders o set arrived_customer_at=coalesce(o.arrived_customer_at,now()),customer_arrival_verified=true where o.id=p_order_id and o.courier_id=v_user and o.status='En entrega' and o.picked_up_at is not null returning o.id,o.arrived_customer_at,o.customer_arrival_verified;
end $$;

create or replace function public.cf_courier_complete_order(p_order_id uuid,p_pin text)
returns table(id uuid,status text) language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_expected text;v_payment text;v_total integer;v_updated uuid;v_debt integer;v_failed integer;v_locked timestamptz;v_next integer;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 select m.cash_debt_cents into v_debt from public.cf_courier_members m where m.user_id=v_user and m.active for update;if not found then raise exception 'Courier authorization required' using errcode='42501';end if;
 if p_pin is null or p_pin !~ '^[0-9]{4}$' then return query select null::uuid,'PIN_INVALID'::text;return;end if;
 select s.delivery_pin,s.failed_pin_attempts,s.pin_locked_until,o.payment_method,o.total_cents into v_expected,v_failed,v_locked,v_payment,v_total from public.cf_order_secrets s join public.cf_orders o on o.id=s.order_id where o.id=p_order_id and o.courier_id=v_user and o.status='En entrega' and o.picked_up_at is not null for update of o,s;
 if not found then return query select null::uuid,'PIN_INVALID'::text;return;end if;
 if v_locked is not null and v_locked>now() then return query select null::uuid,'PIN_LOCKED'::text;return;end if;
 if p_pin<>v_expected then v_next:=v_failed+1;update public.cf_order_secrets set failed_pin_attempts=v_next,pin_locked_until=case when v_next>=5 then now()+interval '10 minutes' else null end where order_id=p_order_id;return query select null::uuid,case when v_next>=5 then 'PIN_LOCKED' else 'PIN_INVALID' end::text;return;end if;
 update public.cf_order_secrets set failed_pin_attempts=0,pin_locked_until=null where order_id=p_order_id;
 update public.cf_orders o set status='Entregado',delivered_at=now() where o.id=p_order_id and o.courier_id=v_user and o.status='En entrega' and o.picked_up_at is not null and o.customer_arrival_verified=true and o.arrived_customer_at is not null and coalesce(o.support_review->>'status','')<>'Pendiente' and not(o.delivery_issue is not null and coalesce(o.delivery_issue->>'resolvedAt','')='') returning o.id into v_updated;
 if v_updated is null then raise exception 'Order unavailable or delivery verification incomplete' using errcode='22023';end if;
 if v_payment='Efectivo (simulado)' then insert into public.cf_courier_cash_ledger(courier_id,order_id,amount_cents,kind,note) values(v_user,p_order_id,v_total,'cash_order','Efectivo cobrado al entregar');update public.cf_courier_members set cash_debt_cents=v_debt+v_total where user_id=v_user;end if;
 return query select v_updated,'Entregado'::text;
end $$;

revoke all on function public.cf_courier_arrive_restaurant(uuid,double precision,double precision,double precision),public.cf_courier_pickup_order(uuid),public.cf_courier_arrive_customer(uuid,double precision,double precision,double precision),public.cf_courier_complete_order(uuid,text) from public,anon;
grant execute on function public.cf_courier_arrive_restaurant(uuid,double precision,double precision,double precision),public.cf_courier_pickup_order(uuid),public.cf_courier_arrive_customer(uuid,double precision,double precision,double precision),public.cf_courier_complete_order(uuid,text) to authenticated;
