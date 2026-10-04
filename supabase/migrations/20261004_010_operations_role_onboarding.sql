-- Operations-only pilot role onboarding. No self-promotion path is provided.
create or replace function public.cf_operations_upsert_courier(p_user_id uuid,p_display_name text,p_active boolean default true)
returns void language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 if p_user_id is null or char_length(btrim(coalesce(p_display_name,''))) not between 1 and 80 then raise exception 'Invalid courier data' using errcode='22023';end if;
 if not exists(select 1 from auth.users u where u.id=p_user_id) then raise exception 'Auth user not found' using errcode='22023';end if;
 insert into public.cf_courier_members(user_id,display_name,active) values(p_user_id,btrim(p_display_name),coalesce(p_active,true))
 on conflict(user_id) do update set display_name=excluded.display_name,active=excluded.active;
 insert into public.cf_operations_audit(operations_user_id,action,metadata) values(v_user,'upsert_courier_member',jsonb_build_object('target_user_id',p_user_id,'active',coalesce(p_active,true)));
end $$;

create or replace function public.cf_operations_upsert_restaurant_member(p_user_id uuid,p_restaurant_name text)
returns void language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 if p_user_id is null or char_length(btrim(coalesce(p_restaurant_name,''))) not between 1 and 100 then raise exception 'Invalid restaurant data' using errcode='22023';end if;
 if not exists(select 1 from auth.users u where u.id=p_user_id) then raise exception 'Auth user not found' using errcode='22023';end if;
 insert into public.cf_restaurant_members(user_id,restaurant_name) values(p_user_id,btrim(p_restaurant_name)) on conflict(user_id,restaurant_name) do nothing;
 insert into public.cf_operations_audit(operations_user_id,action,metadata) values(v_user,'upsert_restaurant_member',jsonb_build_object('target_user_id',p_user_id,'restaurant_name',btrim(p_restaurant_name)));
end $$;

create or replace function public.cf_operations_memberships()
returns table(user_id uuid,role text,label text,active boolean,created_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 return query select c.user_id,'courier'::text,c.display_name,c.active,c.created_at from public.cf_courier_members c
 union all select r.user_id,'restaurant'::text,r.restaurant_name,true,r.created_at from public.cf_restaurant_members r order by 2,3,1;
end $$;

revoke all on function public.cf_operations_upsert_courier(uuid,text,boolean),public.cf_operations_upsert_restaurant_member(uuid,text),public.cf_operations_memberships() from public,anon;
grant execute on function public.cf_operations_upsert_courier(uuid,text,boolean),public.cf_operations_upsert_restaurant_member(uuid,text),public.cf_operations_memberships() to authenticated;
