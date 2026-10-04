-- Persist failed delivery PIN attempts without rolling the UPDATE back via exception.
create index if not exists cf_operations_audit_user_idx on public.cf_operations_audit(operations_user_id,created_at desc);

create or replace function public.cf_courier_complete_order(p_order_id uuid,p_pin text)
returns table(id uuid,status text) language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_expected text;v_payment text;v_total integer;v_updated uuid;v_debt integer;v_failed integer;v_locked timestamptz;v_next integer;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 select m.cash_debt_cents into v_debt from public.cf_courier_members m where m.user_id=v_user and m.active for update;if not found then raise exception 'Courier authorization required' using errcode='42501';end if;
 if p_pin is null or p_pin !~ '^[0-9]{4}$' then return query select null::uuid,'PIN_INVALID'::text;return;end if;
 select s.delivery_pin,s.failed_pin_attempts,s.pin_locked_until,o.payment_method,o.total_cents into v_expected,v_failed,v_locked,v_payment,v_total from public.cf_order_secrets s join public.cf_orders o on o.id=s.order_id where o.id=p_order_id and o.courier_id=v_user and o.status='En entrega' for update of o,s;
 if not found then return query select null::uuid,'PIN_INVALID'::text;return;end if;
 if v_locked is not null and v_locked>now() then return query select null::uuid,'PIN_LOCKED'::text;return;end if;
 if p_pin<>v_expected then
  v_next:=v_failed+1;
  update public.cf_order_secrets set failed_pin_attempts=v_next,pin_locked_until=case when v_next>=5 then now()+interval '10 minutes' else null end where order_id=p_order_id;
  return query select null::uuid,case when v_next>=5 then 'PIN_LOCKED' else 'PIN_INVALID' end::text;return;
 end if;
 update public.cf_order_secrets set failed_pin_attempts=0,pin_locked_until=null where order_id=p_order_id;
 update public.cf_orders o set status='Entregado',delivered_at=now() where o.id=p_order_id and o.courier_id=v_user and o.status='En entrega' and o.customer_arrival_verified=true and o.arrived_customer_at is not null and coalesce(o.support_review->>'status','')<>'Pendiente' and not(o.delivery_issue is not null and coalesce(o.delivery_issue->>'resolvedAt','')='') returning o.id into v_updated;
 if v_updated is null then raise exception 'Order unavailable or delivery verification incomplete' using errcode='22023';end if;
 if v_payment='Efectivo (simulado)' then insert into public.cf_courier_cash_ledger(courier_id,order_id,amount_cents,kind,note) values(v_user,p_order_id,v_total,'cash_order','Efectivo cobrado al entregar');update public.cf_courier_members set cash_debt_cents=v_debt+v_total where user_id=v_user;end if;
 return query select v_updated,'Entregado'::text;
end $$;
revoke all on function public.cf_courier_complete_order(uuid,text) from public,anon;
grant execute on function public.cf_courier_complete_order(uuid,text) to authenticated;
