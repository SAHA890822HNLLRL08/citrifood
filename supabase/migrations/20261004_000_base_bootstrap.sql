-- CitriFood base bootstrap for a fresh Supabase project.
-- Must run before 20261004_001...006.
-- Base payment methods match the current application contract.

create table if not exists public.cf_orders(
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id),
 courier_id uuid references auth.users(id),
 status text not null default 'Nuevo' check(status in ('Nuevo','Preparando','Listo','Esperando repartidor','En entrega','Entregado','Rechazado','Cancelado')),
 created_at timestamptz not null default now(),
 restaurant_name text not null check(char_length(btrim(restaurant_name)) between 1 and 100),
 delivery_address text not null check(char_length(btrim(delivery_address)) between 5 and 250),
 delivery_notes text check(delivery_notes is null or char_length(delivery_notes)<=250),
 items jsonb not null default '[]'::jsonb check(jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 40),
 total_cents integer not null check(total_cents between 1 and 10000000),
 payment_method text not null default 'Efectivo (simulado)' check(payment_method in ('Efectivo (simulado)','Tarjeta (simulada)')),
 arrived_customer_at timestamptz,
 customer_arrival_verified boolean not null default false,
 delivered_at timestamptz,
 support_review jsonb,
 delivery_issue jsonb,
 delivery_lat double precision check(delivery_lat is null or delivery_lat between -90 and 90),
 delivery_lng double precision check(delivery_lng is null or delivery_lng between -180 and 180),
 arrived_restaurant_at timestamptz,
 restaurant_arrival_verified boolean not null default false
);
create index if not exists cf_orders_customer_idx on public.cf_orders(customer_id);
create index if not exists cf_orders_courier_idx on public.cf_orders(courier_id);

create table if not exists public.cf_restaurant_members(
 user_id uuid not null references auth.users(id) on delete cascade,
 restaurant_name text not null check(char_length(btrim(restaurant_name)) between 1 and 100),
 created_at timestamptz not null default now(),
 primary key(user_id,restaurant_name)
);
create index if not exists cf_restaurant_members_name_idx on public.cf_restaurant_members(restaurant_name);

create table if not exists public.cf_operations_members(
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);

create table if not exists public.cf_courier_members(
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(char_length(btrim(display_name)) between 1 and 80),
 active boolean not null default true,
 created_at timestamptz not null default now()
);

create table if not exists public.cf_order_messages(
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.cf_orders(id) on delete cascade,
 sender_id uuid not null references auth.users(id),
 body text not null check(char_length(btrim(body)) between 1 and 500),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '15 days'
);
create index if not exists cf_order_messages_order_idx on public.cf_order_messages(order_id,created_at);
create index if not exists cf_order_messages_expiry_idx on public.cf_order_messages(expires_at);
create index if not exists cf_order_messages_sender_idx on public.cf_order_messages(sender_id);

create table if not exists public.cf_order_secrets(
 order_id uuid primary key references public.cf_orders(id) on delete cascade,
 delivery_pin text not null check(delivery_pin ~ '^[0-9]{4}$'),
 created_at timestamptz not null default now()
);

create table if not exists public.cf_restaurant_locations(
 restaurant_name text primary key,
 lat double precision not null check(lat between -90 and 90),
 lng double precision not null check(lng between -180 and 180),
 accuracy_m double precision not null check(accuracy_m between 0 and 100),
 updated_at timestamptz not null default now()
);

alter table public.cf_orders enable row level security;
alter table public.cf_restaurant_members enable row level security;
alter table public.cf_operations_members enable row level security;
alter table public.cf_courier_members enable row level security;
alter table public.cf_order_messages enable row level security;
alter table public.cf_order_secrets enable row level security;
alter table public.cf_restaurant_locations enable row level security;

create policy cf_operations_self_read on public.cf_operations_members for select to authenticated using(user_id=(select auth.uid()));
create policy cf_restaurant_members_self_read on public.cf_restaurant_members for select to authenticated using(user_id=(select auth.uid()));
create policy cf_courier_members_ops_read on public.cf_courier_members for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.cf_operations_members m where m.user_id=(select auth.uid())));
create policy cf_orders_customer_create on public.cf_orders for insert to authenticated with check(customer_id=(select auth.uid()) and courier_id is null and status='Nuevo');
create policy cf_orders_participant_read on public.cf_orders for select to authenticated using(customer_id=(select auth.uid()) or courier_id=(select auth.uid()) or exists(select 1 from public.cf_restaurant_members m where m.user_id=(select auth.uid()) and m.restaurant_name=cf_orders.restaurant_name) or exists(select 1 from public.cf_operations_members op where op.user_id=(select auth.uid())));
create policy cf_chat_participant_read on public.cf_order_messages for select to authenticated using(expires_at>now() and exists(select 1 from public.cf_orders o where o.id=cf_order_messages.order_id and (o.customer_id=(select auth.uid()) or o.courier_id=(select auth.uid()))));
create policy cf_chat_participant_insert on public.cf_order_messages for insert to authenticated with check(sender_id=(select auth.uid()) and expires_at=created_at+interval '15 days' and created_at between now()-interval '1 minute' and now()+interval '1 minute' and exists(select 1 from public.cf_orders o where o.id=cf_order_messages.order_id and o.status='En entrega' and o.courier_id is not null and (o.customer_id=(select auth.uid()) or o.courier_id=(select auth.uid()))));

revoke all on public.cf_order_secrets,public.cf_restaurant_locations from public,anon,authenticated;
