-- Authorized restaurant transitions for the controlled multi-phone pilot.
-- This RPC is the only way restaurant staff may change shared order status.
create or replace function public.cf_restaurant_advance_order(
 p_order_id uuid,
 p_next_status text
) returns table (id uuid, status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
 v_user uuid := (select auth.uid());
 v_current text;
 v_restaurant text;
begin
 if v_user is null then
  raise exception 'Authentication required' using errcode='28000';
 end if;
 if p_next_status not in ('Preparando','Listo') then
  raise exception 'Unsupported status' using errcode='22023';
 end if;
 select o.status,o.restaurant_name into v_current,v_restaurant
 from public.cf_orders o where o.id=p_order_id for update;
 if not found then
  raise exception 'Order unavailable' using errcode='22023';
 end if;
 if not exists (
  select 1 from public.cf_restaurant_members m
  where m.user_id=v_user and m.restaurant_name=v_restaurant
 ) then
  raise exception 'Order unavailable' using errcode='42501';
 end if;
 if not ((v_current='Nuevo' and p_next_status='Preparando')
      or (v_current='Preparando' and p_next_status='Listo')) then
  raise exception 'Invalid order transition' using errcode='22023';
 end if;
 return query update public.cf_orders o
  set status=p_next_status
  where o.id=p_order_id
  returning o.id,o.status;
end;
$$;
revoke all on function public.cf_restaurant_advance_order(uuid,text) from public,anon;
grant execute on function public.cf_restaurant_advance_order(uuid,text) to authenticated;
-- Restaurant staff cannot directly update cf_orders; the RPC verifies role
-- and current state inside the transaction to avoid racing two status changes.
