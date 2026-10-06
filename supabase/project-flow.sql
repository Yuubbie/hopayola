-- Hopayola project sequence. Run in Hopayola SQL editor (not farm2pot).

alter table public.projects
  add column if not exists fabric_sent_at timestamptz,
  add column if not exists fabric_courier text,
  add column if not exists fabric_received_at timestamptz,
  add column if not exists client_reviewed_at timestamptz,
  add column if not exists shipped_at timestamptz,
  add column if not exists shipped_courier text,
  add column if not exists client_received_at timestamptz;
