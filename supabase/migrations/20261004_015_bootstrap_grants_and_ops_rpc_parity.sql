-- Reconcile grants and production-only operations RPCs for fresh bootstrap parity.

grant select,insert on table public.cf_orders to authenticated;
grant select on table public.cf_restaurant_members,public.cf_operations_members,public.cf_courier_members to authenticated;
grant select,insert on table public.cf_order_messages to authenticated;
revoke update,delete on table public.cf_orders,public.cf_restaurant_members,public.cf_operations_members,public.cf_courier_members,public.cf_order_messages from authenticated;
revoke all on table public.cf_order_secrets,public.cf_restaurant_locations,public.cf_courier_cash_ledger,public.cf_operations_audit from public,anon,authenticated;

create or replace function public.cf_operations_orders()
returns table(id uuid,customer_id uuid,courier_id uuid,status text,created_at timestamptz,restaurant_name text,delivery_address text,delivery_notes text,items jsonb,total_cents integer,payment_method text,arrived_customer_at timestamptz,customer_arrival_verified boolean,delivered_at timestamptz,support_review jsonb,delivery_issue jsonb,arrived_restaurant_at timestamptz,restaurant_arrival_verified boolean,ready_at timestamptz,picked_up_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 return query select o.id,o.customer_id,o.courier_id,o.status,o.created_at,o.restaurant_name,o.delivery_address,o.delivery_notes,o.items,o.total_cents,o.payment_method,o.arrived_customer_at,o.customer_arrival_verified,o.delivered_at,o.support_review,o.delivery_issue,o.arrived_restaurant_at,o.restaurant_arrival_verified,o.ready_at,o.picked_up_at from public.cf_orders o order by o.created_at desc limit 200;
end $$;

create or replace function public.cf_operations_courier_cash_ledger(p_courier_id uuid)
returns table(id bigint,order_id uuid,amount_cents integer,kind text,note text,created_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 if not exists(select 1 from public.cf_courier_members c where c.user_id=p_courier_id) then raise exception 'Courier not found' using errcode='22023';end if;
 return query select l.id,l.order_id,l.amount_cents,l.kind,l.note,l.created_at from public.cf_courier_cash_ledger l where l.courier_id=p_courier_id order by l.created_at desc,l.id desc limit 100;
end $$;

revoke all on function public.cf_operations_orders(),public.cf_operations_courier_cash_ledger(uuid) from public,anon;
grant execute on function public.cf_operations_orders(),public.cf_operations_courier_cash_ledger(uuid) to authenticated;
