-- Current production RPC snapshot: restaurant location and order progression.

create or replace function public.cf_restaurant_set_location(p_restaurant_name text,p_lat double precision,p_lng double precision,p_accuracy_m double precision)
returns void language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists(select 1 from public.cf_restaurant_members m where m.user_id=v_user and m.restaurant_name=p_restaurant_name) then raise exception 'Restaurant authorization required' using errcode='42501';end if;
 if p_lat not between -90 and 90 or p_lng not between -180 and 180 or p_accuracy_m not between 0 and 100 then raise exception 'Invalid location' using errcode='22023';end if;
 insert into public.cf_restaurant_locations(restaurant_name,lat,lng,accuracy_m,updated_at) values(p_restaurant_name,p_lat,p_lng,p_accuracy_m,now())
 on conflict(restaurant_name) do update set lat=excluded.lat,lng=excluded.lng,accuracy_m=excluded.accuracy_m,updated_at=now();
end $$;

create or replace function public.cf_restaurant_advance_order(p_order_id uuid,p_next_status text)
returns table(id uuid,status text) language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_current text;v_restaurant text;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='28000';end if;
 if p_next_status not in ('Preparando','Listo') then raise exception 'Unsupported status' using errcode='22023';end if;
 select o.status,o.restaurant_name into v_current,v_restaurant from public.cf_orders o where o.id=p_order_id for update;if not found then raise exception 'Order unavailable' using errcode='22023';end if;
 if not exists(select 1 from public.cf_restaurant_members m where m.user_id=v_user and m.restaurant_name=v_restaurant) then raise exception 'Order unavailable' using errcode='42501';end if;
 if not ((v_current='Nuevo' and p_next_status='Preparando') or (v_current='Preparando' and p_next_status='Listo')) then raise exception 'Invalid order transition' using errcode='22023';end if;
 return query update public.cf_orders o set status=p_next_status,ready_at=case when p_next_status='Listo' then now() else o.ready_at end where o.id=p_order_id returning o.id,o.status;
end $$;

revoke all on function public.cf_restaurant_set_location(text,double precision,double precision,double precision),public.cf_restaurant_advance_order(uuid,text) from public,anon;
grant execute on function public.cf_restaurant_set_location(text,double precision,double precision,double precision),public.cf_restaurant_advance_order(uuid,text) to authenticated;
