-- Night wipe. KEEP admins + cincinsoko. Deletes other clients and artisans.
-- Cannot be undone. Does not touch Paystack or shop.hopayola.com.
--
-- 1. Put the real admin emails and cincinsoko email below.
-- 2. Supabase → SQL Editor → Run when the site is quiet.
-- 3. Check the two selects at the end before you close.

begin;

create temporary table keep_ids as
select id
from auth.users
where lower(email) in (
  lower('ADMIN_EMAIL_1@example.com'),
  lower('ADMIN_EMAIL_2@example.com'),
  lower('cincinsoko@example.com')
)
or lower(email) like '%cincinsoko%';

do $$
begin
  if (select count(*) from keep_ids) < 1 then
    raise exception 'Stop: no matching users. Fix the emails.';
  end if;
end $$;

delete from public.contact_inquiries;
delete from public.waitlist_signups;

do $$ begin delete from public.saved_looks; exception when undefined_table then null; end $$;
do $$ begin delete from public.ai_design_concepts; exception when undefined_table then null; end $$;
do $$ begin delete from public.project_milestones; exception when undefined_table then null; end $$;
do $$ begin delete from public.project_team_members; exception when undefined_table then null; end $$;
do $$ begin delete from public.project_messages; exception when undefined_table then null; end $$;
do $$ begin delete from public.projects; exception when undefined_table then null; end $$;
do $$ begin
  delete from public.artisan_profiles a
  where a.id not in (select id from keep_ids);
exception when undefined_table then null; end $$;

delete from public.profiles p
where p.id not in (select id from keep_ids);

delete from auth.users u
where u.id not in (select id from keep_ids);

commit;

select email, id from auth.users;
select id, role, full_name from public.profiles;
