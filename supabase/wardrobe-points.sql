alter table public.profiles
  add column if not exists points integer not null default 0;

create table if not exists public.wardrobe_shop_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  shop_url text,
  created_at timestamptz not null default now()
);

alter table public.wardrobe_shop_items enable row level security;

drop policy if exists "own shop wardrobe" on public.wardrobe_shop_items;
create policy "own shop wardrobe"
  on public.wardrobe_shop_items
  for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);
