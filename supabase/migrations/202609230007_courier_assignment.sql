-- Verified courier roster and guarded assignment for shared pilot.
create table if not exists public.cf_courier_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.cf_courier_members enable row level security;
create policy cf_courier_members_ops_read on public.cf_courier_members
 for select to authenticated using (
 user_id=(select auth.uid()) or exists (
  select 1 from public.cf_operations_members m where m.user_id=(select auth.uid())
 )
);
grant select on public.cf_courier_members to authenticated;
revoke insert,update,delete on public.cf_courier_members from authenticated,anon;

create or replace function public.cf_operations_assign_courier(
 p_order_id uuid,
 p_courier_id uuid
) returns table (id uuid, status text, courier_id uuid)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists (
  select 1 from public.cf_operations_members m where m.user_id=v_user
 ) then
  raise exception 'Operations authorization required' using errcode='42501';
 end if;
 if not exists (
  select 1 from public.cf_courier_members m
  where m.user_id=p_courier_id and m.active
 ) then
  raise exception 'Courier unavailable' using errcode='22023';
 end if;
 return query update public.cf_orders o
  set courier_id=p_courier_id,status='En entrega'
  where o.id=p_order_id and o.status='Listo' and o.courier_id is null
  returning o.id,o.status,o.courier_id;
 if not found then
  raise exception 'Order is not ready or already assigned' using errcode='22023';
 end if;
end;
$$;
revoke all on function public.cf_operations_assign_courier(uuid,uuid) from public,anon;
grant execute on function public.cf_operations_assign_courier(uuid,uuid) to authenticated;
-- Admin-only setup: insert into cf_courier_members(user_id,display_name)
-- values ('<verified auth.users UUID>','Repartidor de prueba');
-- Assignment is a PILOT simplification: moves Listo directly to En entrega.
-- Add courier acceptance and pickup confirmation before a real launch.
