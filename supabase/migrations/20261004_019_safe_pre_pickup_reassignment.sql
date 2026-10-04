-- Operations may safely remove a courier only before physical pickup.
create or replace function public.cf_operations_unassign_courier(p_order_id uuid,p_reason text default null)
returns table(id uuid,status text,courier_id uuid)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_previous uuid;v_id uuid;v_status text;v_courier uuid;v_reason text:=nullif(btrim(coalesce(p_reason,'')),'');
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 if v_reason is not null and char_length(v_reason)>250 then raise exception 'Reason is too long' using errcode='22023';end if;
 select o.courier_id into v_previous from public.cf_orders o where o.id=p_order_id and o.status='Esperando repartidor' and o.courier_id is not null and o.picked_up_at is null for update;
 if not found then raise exception 'Only assigned orders awaiting pickup can be unassigned' using errcode='22023';end if;
 update public.cf_orders o set courier_id=null,status='Listo',arrived_restaurant_at=null,restaurant_arrival_verified=false
 where o.id=p_order_id and o.status='Esperando repartidor' and o.courier_id=v_previous and o.picked_up_at is null
 returning o.id,o.status,o.courier_id into v_id,v_status,v_courier;
 if v_id is null then raise exception 'Order could not be unassigned' using errcode='22023';end if;
 insert into public.cf_operations_audit(operations_user_id,action,order_id,metadata)
 values(v_user,'unassign_courier',p_order_id,jsonb_build_object('previous_courier_id',v_previous,'reason',v_reason));
 return query select v_id,v_status,v_courier;
end $$;
revoke all on function public.cf_operations_unassign_courier(uuid,text) from public,anon;
grant execute on function public.cf_operations_unassign_courier(uuid,text) to authenticated;
