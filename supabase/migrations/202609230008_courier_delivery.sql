-- Pilot courier confirms a delivery assigned to their authenticated account.
-- A production release needs pickup, proof-of-delivery and dispute handling.
create or replace function public.cf_courier_complete_order(p_order_id uuid)
returns table (id uuid,status text)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists (
  select 1 from public.cf_courier_members m
  where m.user_id=v_user and m.active
 ) then
  raise exception 'Courier authorization required' using errcode='42501';
 end if;
 return query update public.cf_orders o
  set status='Entregado'
  where o.id=p_order_id and o.courier_id=v_user and o.status='En entrega'
  returning o.id,o.status;
 if not found then
  raise exception 'Order unavailable or not in delivery' using errcode='22023';
 end if;
end;
$$;
revoke all on function public.cf_courier_complete_order(uuid) from public,anon;
grant execute on function public.cf_courier_complete_order(uuid) to authenticated;
