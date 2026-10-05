-- Run once in Hopayola Supabase SQL editor.

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists project_messages_project_created
  on public.project_messages (project_id, created_at);

alter table public.project_messages enable row level security;

create policy "project chat read"
  on public.project_messages for select
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid() and pr.role = 'admin'
    )
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.client_id = auth.uid()
    )
    or exists (
      select 1 from public.project_team_members t
      where t.project_id = project_messages.project_id
        and t.artisan_id = auth.uid()
    )
  );

create policy "project chat insert"
  on public.project_messages for insert
  with check (
    sender_id = auth.uid()
    and (
      exists (
        select 1 from public.profiles pr
        where pr.id = auth.uid() and pr.role = 'admin'
      )
      or exists (
        select 1 from public.projects p
        where p.id = project_id and p.client_id = auth.uid()
      )
      or exists (
        select 1 from public.project_team_members t
        where t.project_id = project_messages.project_id
          and t.artisan_id = auth.uid()
      )
    )
  );
