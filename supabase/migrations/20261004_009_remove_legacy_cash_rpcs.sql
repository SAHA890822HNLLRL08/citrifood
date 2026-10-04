-- Remove superseded cash RPCs.
-- cf_courier_cash_exposure() replaces the simple balance RPC.
-- Operations cash changes must go through ledger-backed payment/adjustment flows,
-- not overwrite cash_debt_cents directly.
drop function if exists public.cf_operations_set_courier_cash_debt(uuid,integer);
drop function if exists public.cf_courier_cash_balance();
