-- Manual payment marking: the client can say "I have already paid" when money was
-- sent outside Paystack, and Hopayola confirms it before any payout unlocks.
-- Run once in the Hopayola Supabase SQL editor. Safe to re-run.

alter table public.projects
  add column if not exists client_marked_paid_at timestamptz,
  add column if not exists client_marked_paid_note text,
  add column if not exists payment_confirmed_at timestamptz,
  add column if not exists payment_confirmed_by uuid;
