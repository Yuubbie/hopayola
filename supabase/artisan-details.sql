-- Artisan shop address and guarantor. Run once in the Hopayola SQL editor.

alter table public.artisan_profiles
  add column if not exists shop_address text,
  add column if not exists guarantor_phone text,
  add column if not exists legal_name text,
  add column if not exists id_document_path text;
