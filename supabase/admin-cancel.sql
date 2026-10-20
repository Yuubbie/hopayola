-- Coordinator cancel after the client has paid. Note is for the refund trail.
-- Run once in the Hopayola SQL editor. Safe to re-run.

alter table public.projects
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by uuid,
  add column if not exists cancelled_note text;
