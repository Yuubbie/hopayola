-- Client saved looks. Run once in the Hopayola SQL editor.

create table if not exists public.saved_looks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  image_url text,
  project_id uuid,
  concept_id uuid,
  created_at timestamptz default now()
);

alter table public.saved_looks enable row level security;

drop policy if exists "saved looks own" on public.saved_looks;
create policy "saved looks own"
  on public.saved_looks for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);
