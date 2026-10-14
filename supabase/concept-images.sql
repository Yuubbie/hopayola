-- Real AI design concepts: prompt, generation status, and image storage.
-- Run this once in the Hopayola Supabase SQL editor.

alter table public.ai_design_concepts
  add column if not exists prompt text,
  add column if not exists status text default 'pending',
  add column if not exists error text;

-- Public bucket so generated concept images can be shown directly.
insert into storage.buckets (id, name, public)
values ('concept-images', 'concept-images', true)
on conflict (id) do update set public = true;

drop policy if exists "concept images read" on storage.objects;
create policy "concept images read"
  on storage.objects for select
  using (bucket_id = 'concept-images');
