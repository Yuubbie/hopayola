-- Night wipe. Keeps every admin + CincinSoko Egbunu.
-- Cannot be undone. Run once in Supabase SQL Editor.

begin;

create temporary table keep_ids as
select id
from public.profiles
where role = 'admin'
   or full_name ilike '%cincinsoko%';

do $$
begin
  if (select count(*) from keep_ids) < 1 then
    raise exception 'Stop: no admin or CincinSoko profile found.';
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
