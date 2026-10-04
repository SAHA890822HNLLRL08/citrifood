# CitriFood Supabase migrations

These files version the current shared-order backend and can now bootstrap the CitriFood schema on a fresh Supabase project.

## Order

1. `20261004_000_base_bootstrap.sql` — core tables, indexes and RLS policies.
2. `001` — shared operations schema additions, cash ledger, audit and PIN lock columns.
3. `002` — courier privacy/shift state and operations PIN audit RPCs.
4. `003` — cash exposure, deposits and assignment controls.
5. `004` — verified courier GPS/pickup/PIN delivery flow.
6. `005` — restaurant location and order progression.
7. `006` — customer history, private delivery PIN and cancellation.

The bootstrap intentionally uses the current application payment contract: `Efectivo (simulado)` and `Tarjeta (simulada)`. The existing production database still contains an older historical customer-payload constraint referring to `Efectivo (prueba)`; that legacy constraint should be migrated separately rather than copied into a new environment.

Security convention: SECURITY DEFINER functions use `set search_path=''`, perform their own authorization checks, revoke anonymous execution and grant only the minimum authenticated execution needed.

Before promoting a fresh environment, run Supabase security/performance advisors and an authenticated end-to-end smoke test for customer, restaurant, courier and operations roles.
