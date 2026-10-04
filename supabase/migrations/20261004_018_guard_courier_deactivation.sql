-- Prevent operations from deactivating a courier who still owns active work.
create or replace function public.cf_operations_upsert_courier(p_user_id uuid,p_display_name text,p_active boolean default true)
returns void language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_active boolean:=coalesce(p_active,true);
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 if p_user_id is null or char_length(btrim(coalesce(p_display_name,''))) not between 1 and 80 then raise exception 'Invalid courier data' using errcode='22023';end if;
 if not exists(select 1 from auth.users u where u.id=p_user_id) then raise exception 'Auth user not found' using errcode='22023';end if;
 if not v_active and exists(select 1 from public.cf_orders o where o.courier_id=p_user_id and o.status in ('Esperando repartidor','En entrega')) then raise exception 'Courier has active orders and cannot be deactivated' using errcode='22023';end if;
 insert into public.cf_courier_members(user_id,display_name,active) values(p_user_id,btrim(p_display_name),v_active)
 on conflict(user_id) do update set display_name=excluded.display_name,active=excluded.active;
 insert into public.cf_operations_audit(operations_user_id,action,metadata) values(v_user,'upsert_courier_member',jsonb_build_object('target_user_id',p_user_id,'active',v_active));
end $$;
revoke all on function public.cf_operations_upsert_courier(uuid,text,boolean) from public,anon;
grant execute on function public.cf_operations_upsert_courier(uuid,text,boolean) to authenticated;
