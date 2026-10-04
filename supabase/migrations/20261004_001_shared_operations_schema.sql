-- CitriFood shared operations hardening snapshot
-- Applied to production Supabase before this repository gained migrations.
-- This migration is intentionally additive/idempotent where practical.

alter table public.cf_orders
  add column if not exists ready_at timestamptz,
  add column if not exists picked_up_at timestamptz;

alter table public.cf_courier_members
  add column if not exists cash_debt_cents integer not null default 0 check (cash_debt_cents >= 0),
  add column if not exists accepting_orders boolean not null default true;

create table if not exists public.cf_courier_cash_ledger (
  id bigint generated always as identity primary key,
  courier_id uuid not null references auth.users(id),
  order_id uuid references public.cf_orders(id) on delete restrict,
  amount_cents integer not null,
  kind text not null check (kind in ('cash_order','deposit','adjustment')),
  note text,
  created_at timestamptz not null default now()
);
alter table public.cf_courier_cash_ledger enable row level security;
revoke all on table public.cf_courier_cash_ledger from public,anon,authenticated;
create unique index if not exists cf_courier_cash_ledger_cash_order_unique
  on public.cf_courier_cash_ledger(order_id) where kind='cash_order';
create index if not exists cf_courier_cash_ledger_courier_created_idx
  on public.cf_courier_cash_ledger(courier_id,created_at desc);

alter table public.cf_order_secrets
  add column if not exists failed_pin_attempts integer not null default 0 check(failed_pin_attempts>=0),
  add column if not exists pin_locked_until timestamptz;

create table if not exists public.cf_operations_audit(
  id bigint generated always as identity primary key,
  operations_user_id uuid not null references auth.users(id),
  action text not null,
  order_id uuid references public.cf_orders(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
alter table public.cf_operations_audit enable row level security;
revoke all on table public.cf_operations_audit from public,anon,authenticated;
create index if not exists cf_operations_audit_order_idx
  on public.cf_operations_audit(order_id,created_at desc);

-- SECURITY DEFINER RPC definitions are versioned in the following migration.
