-- Prevent manipulated underpriced orders and require restaurant-ready evidence before assignment.
create or replace function public.cf_order_items_subtotal_cents(p_items jsonb)
returns bigint language sql immutable set search_path=''
as $$ select coalesce(sum(((e->>'qty')::bigint)*((e->>'price')::bigint)*100),0) from jsonb_array_elements(p_items) e; $$;
revoke all on function public.cf_order_items_subtotal_cents(jsonb) from public,anon,authenticated;
alter table public.cf_orders drop constraint if exists cf_orders_total_not_below_items_check;
alter table public.cf_orders add constraint cf_orders_total_not_below_items_check check(total_cents >= public.cf_order_items_subtotal_cents(items)) not valid;

create or replace function public.cf_operations_assign_courier(p_order_id uuid,p_courier_id uuid)
returns table(id uuid,status text,courier_id uuid) language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_debt integer;v_total integer;v_payment text;v_committed integer;v_active integer;v_id uuid;v_status text;v_courier uuid;
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 select m.cash_debt_cents into v_debt from public.cf_courier_members m where m.user_id=p_courier_id and m.active and m.accepting_orders for update;if not found then raise exception 'Courier unavailable for new orders' using errcode='22023';end if;
 select count(*)::integer into v_active from public.cf_orders o where o.courier_id=p_courier_id and o.status in ('Esperando repartidor','En entrega');if v_active>=4 then raise exception 'Courier active order limit reached' using errcode='22023';end if;
 select o.total_cents,o.payment_method into v_total,v_payment from public.cf_orders o where o.id=p_order_id and o.status='Listo' and o.ready_at is not null and o.courier_id is null for update;if not found then raise exception 'Order is not ready or already assigned' using errcode='22023';end if;
 select coalesce(sum(o.total_cents),0)::integer into v_committed from public.cf_orders o where o.courier_id=p_courier_id and o.payment_method='Efectivo (simulado)' and o.status in ('Esperando repartidor','En entrega');
 if v_payment='Efectivo (simulado)' and v_debt+v_committed+v_total>80000 then raise exception 'Cash exposure limit exceeded' using errcode='22023';end if;
 update public.cf_orders o set courier_id=p_courier_id,status='Esperando repartidor' where o.id=p_order_id and o.status='Listo' and o.ready_at is not null and o.courier_id is null returning o.id,o.status,o.courier_id into v_id,v_status,v_courier;
 if v_id is null then raise exception 'Order is not ready or already assigned' using errcode='22023';end if;
 insert into public.cf_operations_audit(operations_user_id,action,order_id,metadata) values(v_user,'assign_courier',p_order_id,jsonb_build_object('courier_id',p_courier_id,'active_before',v_active));
 return query select v_id,v_status,v_courier;
end $$;
revoke all on function public.cf_operations_assign_courier(uuid,uuid) from public,anon;
grant execute on function public.cf_operations_assign_courier(uuid,uuid) to authenticated;
