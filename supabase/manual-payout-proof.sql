-- Manual payout when money has already settled from Paystack into Hopayola's
-- OPay (or any other bank). Admin uploads proof; the artisan confirms it.
-- Run once in the Hopayola Supabase SQL editor. Safe to re-run.

alter table public.projects
  add column if not exists payout_proof_path text,
  add column if not exists payout_proof_note text,
  add column if not exists payout_proof_at timestamptz,
  add column if not exists payout_proof_by uuid,
  add column if not exists payout_confirmed_at timestamptz;
