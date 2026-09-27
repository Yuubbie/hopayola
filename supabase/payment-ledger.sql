-- Run in Supabase SQL editor once. Adds ledger fields for milestone payouts.
-- Safe to re-run (IF NOT EXISTS).

alter table public.project_milestones
  add column if not exists artisan_id uuid references public.profiles(id),
  add column if not exists proof_url text,
  add column if not exists submitted_at timestamptz,
  add column if not exists confirmed_at timestamptz,
  add column if not exists disputed_at timestamptz,
  add column if not exists payout_amount numeric,
  add column if not exists paystack_transfer_code text,
  add column if not exists paystack_transfer_reference text;
