-- CitriFood: production database starting point. NOT connected to browser MVP yet.
-- Run in a Supabase PostgreSQL project after reviewing auth, deployment and backup policies.
create extension if not exists pgcrypto;

create table if not exists public.cf_orders (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id),
 courier_id uuid references auth.users(id),
 status text not null default 'Nuevo'
   check (status in ('Nuevo','Preparando','Listo','Esperando repartidor','En entrega','Entregado','Rechazado','Cancelado')),
 created_at timestamptz not null default now()
);
create index if not exists cf_orders_customer_idx on public.cf_orders(customer_id);
create index if not exists cf_orders_courier_idx on public.cf_orders(courier_id);

create table if not exists public.cf_order_messages (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.cf_orders(id) on delete cascade,
 sender_id uuid not null references auth.users(id),
 body text not null check (char_length(btrim(body)) between 1 and 500),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now() + interval '15 days')
);
create index if not exists cf_order_messages_expiry_idx on public.cf_order_messages(expires_at);
create index if not exists cf_order_messages_order_idx on public.cf_order_messages(order_id,created_at);

alter table public.cf_orders enable row level security;
alter table public.cf_order_messages enable row level security;
-- Authenticated users only see their own order. Operations must use a separately
-- authorized server endpoint, never an unrestricted client-side admin key.
create policy cf_orders_participant_read on public.cf_orders
 for select to authenticated using (customer_id=(select auth.uid()) or courier_id=(select auth.uid()));
create policy cf_chat_participant_read on public.cf_order_messages
 for select to authenticated using (
 expires_at>now() and exists (
  select 1 from public.cf_orders o
  where o.id=order_id and (o.customer_id=(select auth.uid()) or o.courier_id=(select auth.uid()))
 )
);
create policy cf_chat_participant_insert on public.cf_order_messages
 for insert to authenticated with check (
 sender_id=(select auth.uid())
 and expires_at<=created_at+interval '15 days'
 and expires_at>=created_at+interval '15 days'
 and created_at between now()-interval '1 minute' and now()+interval '1 minute'
 and exists (
  select 1 from public.cf_orders o where o.id=order_id
   and o.status='En entrega' and o.courier_id is not null
   and (o.customer_id=(select auth.uid()) or o.courier_id=(select auth.uid()))
 )
);
-- Never grant clients UPDATE or DELETE on evidence. The trusted service role
-- handles operational access and retention, and must be protected server-side.
revoke all on public.cf_orders from anon;
revoke all on public.cf_order_messages from anon;
grant select on public.cf_orders to authenticated;
grant select,insert on public.cf_order_messages to authenticated;

-- Scheduled deletion is required in the hosted project; execute hourly with
-- pg_cron / Supabase Cron using a privileged server role:
-- select cron.schedule('citrifood-expire-chat', '0 * * * *',
--   $$delete from public.cf_order_messages where expires_at <= now()$$);
-- Client SELECT policies also hide expired messages between cleanup runs.
-- Ensure backups, logs, analytics and legal-hold procedures follow retention policy.
