-- Current production RPC snapshot: shared cash exposure and assignment controls.
-- Requires migrations 001 and 002.

create or replace function public.cf_courier_cash_exposure()
returns table(cash_debt_cents integer,committed_cash_cents integer,available_cash_cents integer)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_debt integer;v_committed integer;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 select m.cash_debt_cents into v_debt from public.cf_courier_members m where m.user_id=v_user and m.active;
 if not found then raise exception 'Courier authorization required' using errcode='42501';end if;
 select coalesce(sum(o.total_cents),0)::integer into v_committed from public.cf_orders o where o.courier_id=v_user and o.payment_method='Efectivo (simulado)' and o.status in ('Esperando repartidor','En entrega');
 return query select v_debt,v_committed,greatest(0,80000-v_debt-v_committed);
end $$;

create or replace function public.cf_operations_assign_courier(p_order_id uuid,p_courier_id uuid)
returns table(id uuid,status text,courier_id uuid) language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_debt integer;v_total integer;v_payment text;v_committed integer;v_active integer;v_id uuid;v_status text;v_courier uuid;
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 select m.cash_debt_cents into v_debt from public.cf_courier_members m where m.user_id=p_courier_id and m.active and m.accepting_orders for update;if not found then raise exception 'Courier unavailable for new orders' using errcode='22023';end if;
 select count(*)::integer into v_active from public.cf_orders o where o.courier_id=p_courier_id and o.status in ('Esperando repartidor','En entrega');if v_active>=4 then raise exception 'Courier active order limit reached' using errcode='22023';end if;
 select o.total_cents,o.payment_method into v_total,v_payment from public.cf_orders o where o.id=p_order_id and o.status='Listo' and o.courier_id is null for update;if not found then raise exception 'Order is not ready or already assigned' using errcode='22023';end if;
 select coalesce(sum(o.total_cents),0)::integer into v_committed from public.cf_orders o where o.courier_id=p_courier_id and o.payment_method='Efectivo (simulado)' and o.status in ('Esperando repartidor','En entrega');
 if v_payment='Efectivo (simulado)' and v_debt+v_committed+v_total>80000 then raise exception 'Cash exposure limit exceeded' using errcode='22023';end if;
 update public.cf_orders o set courier_id=p_courier_id,status='Esperando repartidor' where o.id=p_order_id and o.status='Listo' and o.courier_id is null returning o.id,o.status,o.courier_id into v_id,v_status,v_courier;
 if v_id is null then raise exception 'Order is not ready or already assigned' using errcode='22023';end if;
 insert into public.cf_operations_audit(operations_user_id,action,order_id,metadata) values(v_user,'assign_courier',p_order_id,jsonb_build_object('courier_id',p_courier_id,'active_before',v_active));
 return query select v_id,v_status,v_courier;
end $$;

create or replace function public.cf_operations_courier_cash_balances()
returns table(user_id uuid,display_name text,active boolean,accepting_orders boolean,cash_debt_cents integer,committed_cash_cents integer,available_cash_cents integer,active_orders integer)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 return query select c.user_id,c.display_name,c.active,c.accepting_orders,c.cash_debt_cents,coalesce(x.committed,0)::integer,greatest(0,80000-c.cash_debt_cents-coalesce(x.committed,0))::integer,coalesce(x.active_count,0)::integer
 from public.cf_courier_members c left join lateral(select sum(o.total_cents) filter(where o.payment_method='Efectivo (simulado)')::integer committed,count(*)::integer active_count from public.cf_orders o where o.courier_id=c.user_id and o.status in ('Esperando repartidor','En entrega')) x on true order by c.display_name,c.user_id;
end $$;

create or replace function public.cf_operations_record_courier_cash_payment(p_courier_id uuid,p_amount_cents integer,p_note text default null)
returns integer language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_current integer;v_applied integer;
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 if p_amount_cents is null or p_amount_cents<=0 then raise exception 'Invalid payment amount' using errcode='22023';end if;
 select cash_debt_cents into v_current from public.cf_courier_members where user_id=p_courier_id for update;if not found then raise exception 'Courier not found' using errcode='22023';end if;
 v_applied:=least(v_current,p_amount_cents);if v_applied=0 then return 0;end if;
 insert into public.cf_courier_cash_ledger(courier_id,amount_cents,kind,note) values(p_courier_id,-v_applied,'deposit',left(coalesce(p_note,'Depósito de efectivo'),250));
 update public.cf_courier_members set cash_debt_cents=v_current-v_applied where user_id=p_courier_id;
 return v_applied;
end $$;

revoke all on function public.cf_courier_cash_exposure(),public.cf_operations_assign_courier(uuid,uuid),public.cf_operations_courier_cash_balances(),public.cf_operations_record_courier_cash_payment(uuid,integer,text) from public,anon;
grant execute on function public.cf_courier_cash_exposure(),public.cf_operations_assign_courier(uuid,uuid),public.cf_operations_courier_cash_balances(),public.cf_operations_record_courier_cash_payment(uuid,integer,text) to authenticated;
