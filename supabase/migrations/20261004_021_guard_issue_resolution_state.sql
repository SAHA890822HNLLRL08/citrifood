-- Delivery incidents may only be resolved while the courier still owns an active picked-up delivery.
create or replace function public.cf_operations_resolve_delivery_issue(p_order_id uuid,p_resolution text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid());v_resolution text:=btrim(coalesce(p_resolution,''));
begin
 if v_user is null or not exists(select 1 from public.cf_operations_members m where m.user_id=v_user) then raise exception 'Operations authorization required' using errcode='42501';end if;
 if char_length(v_resolution) not between 3 and 500 then raise exception 'Invalid issue resolution' using errcode='22023';end if;
 update public.cf_orders o set delivery_issue=o.delivery_issue||jsonb_build_object('resolution',v_resolution,'resolvedAt',now(),'resolvedBy','operations')
 where o.id=p_order_id and o.status='En entrega' and o.picked_up_at is not null and o.delivery_issue is not null and coalesce(o.delivery_issue->>'resolvedAt','')='';
 if not found then raise exception 'No unresolved active-delivery issue found' using errcode='22023';end if;
 insert into public.cf_operations_audit(operations_user_id,action,order_id,metadata) values(v_user,'resolve_delivery_issue',p_order_id,jsonb_build_object('resolution',v_resolution));
 return true;
end $$;
revoke all on function public.cf_operations_resolve_delivery_issue(uuid,text) from public,anon;
grant execute on function public.cf_operations_resolve_delivery_issue(uuid,text) to authenticated;
