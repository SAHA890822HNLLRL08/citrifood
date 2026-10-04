# CitriFood Supabase migrations

These files version the current shared-order production hardening that was originally applied directly to the existing Supabase project.

## Important

Migrations `20261004_001` through `006` are **not yet a complete empty-database bootstrap**. They assume the original CitriFood core tables already exist.

Current coverage:
- 001: shared operations schema additions, cash ledger, audit and PIN lock columns
- 002: courier privacy/shift state and operations PIN audit RPCs
- 003: cash exposure, deposits and assignment controls
- 004: verified courier GPS/pickup/PIN delivery flow
- 005: restaurant location and order progression
- 006: customer history, private delivery PIN and cancellation

Do not run these files against a blank project until the base-schema/bootstrap migration is added and reviewed.

Security convention: SECURITY DEFINER functions use `set search_path=''`, perform their own authorization checks, revoke anonymous execution and grant only the minimum authenticated execution needed.
