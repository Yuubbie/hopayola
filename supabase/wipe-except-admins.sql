-- Fresh test wipe. KEEP TWO ADMIN LOGINS.
-- 1. Put the two admin emails below.
-- 2. Run in Supabase → SQL Editor (production).
-- 3. This cannot be undone. Does not touch Paystack or the shop.

begin;

-- >>> EDIT THESE <<<
-- Example: 'you@gmail.com', 'hope@...'
create temporary table keep_admins as
select id
from auth.users
where lower(email) in (
  lower('ADMIN_EMAIL_1@example.com'),
  lower('ADMIN_EMAIL_2@example.com')
);

do $$
begin
  if (select count(*) from keep_admins) < 2 then
    raise exception 'Stop: fewer than 2 matching auth users. Fix the emails.';
  end if;
end $$;

-- Enquiries / waitlist
delete from public.contact_inquiries;
delete from public.waitlist_signups;

-- Project graph (ignore if a table was never created)
do $$ begin delete from public.ai_design_concepts; exception when undefined_table then null; end $$;
do $$ begin delete from public.project_milestones; exception when undefined_table then null; end $$;
do $$ begin delete from public.project_team_members; exception when undefined_table then null; end $$;
do $$ begin delete from public.projects; exception when undefined_table then null; end $$;
do $$ begin delete from public.artisan_profiles a
  where a.id not in (select id from keep_admins);
  exception when undefined_table then null; end $$;

delete from public.profiles p
where p.id not in (select id from keep_admins);

delete from auth.users u
where u.id not in (select id from keep_admins);

commit;

-- Check
select email, id from auth.users;
select id, role, full_name from public.profiles;
