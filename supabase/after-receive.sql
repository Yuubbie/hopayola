-- Rating, rework, trending photo. Run once in SQL Editor.

alter table public.projects
  add column if not exists artisan_rating int,
  add column if not exists artisan_review text,
  add column if not exists trending_photo_path text,
  add column if not exists rework_requested_at timestamptz,
  add column if not exists rework_note text;
