-- Protect shared chat at the DATABASE boundary, not only in the browser.
-- Apply after 202609230001_order_chat.sql. This is a best-effort filter:
-- it cannot guarantee that all disguised contact details are detected.
create or replace function public.cf_prepare_order_message()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
 if auth.uid() is null then
  raise exception 'Authenticated sender required';
 end if;
 if new.body ~ '[0-9]([[:space:].()+-]*[0-9]){9,}'
    or lower(new.body) ~ '(https?://|www[.]|wa[.]me/|whats[[:space:]]*app|telegram|@)' then
  raise exception 'Direct contact details and external links are not permitted in order chat';
 end if;
 new.sender_id := auth.uid();
 new.created_at := now();
 new.expires_at := new.created_at + interval '15 days';
 return new;
end;
$$;
revoke all on function public.cf_prepare_order_message() from public, anon, authenticated;
drop trigger if exists cf_prepare_order_message_trigger on public.cf_order_messages;
create trigger cf_prepare_order_message_trigger
 before insert on public.cf_order_messages
 for each row execute function public.cf_prepare_order_message();

-- Remove client-controlled timestamp requirement: trigger now assigns both
-- timestamps, while existing RLS verifies the exact 15-day expiration.
-- Deletion still requires activating the scheduled job in the hosted database.
