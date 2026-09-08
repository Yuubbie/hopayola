-- Hopayola database schema
-- Run this in the Supabase SQL editor after creating your project.

-- Role type: the three account types the whole platform is built around
create type user_role as enum ('client', 'coordinator', 'admin');

-- Profiles table — extends Supabase's built-in auth.users
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role not null default 'client',
  full_name text,
  phone text,
  avatar_url text,
  -- Client-specific fields (null for coordinator/admin accounts)
  saved_measurements jsonb,
  style_preferences jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Auto-create a profile row whenever someone signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'client');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security — users can only see/edit their own profile,
-- admins can see everyone (needed for the future admin dashboard)
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Waitlist table — for "Hire a Talent" / "Create a Team" / "Design My Outfit"
-- CTAs that lead to a coming-soon capture for now, per Phase 1 scope
create table waitlist_signups (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  interest text, -- 'hire_talent' | 'create_team' | 'design_outfit'
  created_at timestamp with time zone default now()
);

alter table waitlist_signups enable row level security;

create policy "Anyone can join the waitlist"
  on waitlist_signups for insert
  with check (true);

-- NOTE for Phase 2/3 (not built yet, structure left ready for it):
-- projects table will reference profiles(id) as client_id and coordinator_id,
-- with a milestone/status enum matching the 9-stage production flow
-- (Consultation, Measurement, Design Approval, Pattern, Cutting,
-- Embellishment, Sewing, Quality Check, Delivery). Not created now —
-- documented here so the shape is already agreed before it's built.
