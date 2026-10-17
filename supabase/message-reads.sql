-- Unread counts for the Messages inbox. Each side of a thread keeps its own
-- last-read stamp, so an unread count is per person, not per thread.
-- Run once in the Hopayola Supabase SQL editor. Safe to re-run.

create table if not exists public.project_message_reads (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

alter table public.project_message_reads enable row level security;

drop policy if exists "own message reads" on public.project_message_reads;
create policy "own message reads"
  on public.project_message_reads for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
