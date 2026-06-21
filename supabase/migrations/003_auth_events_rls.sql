-- Phase 3/4: Authentication authorization policies and event-management seed data.
-- Adds role assignment helpers, RLS policies for admin/event workflows, and sample NGO events.

-- Admin-only role assignment helper for future user management screens.
create or replace function public.assign_user_role(target_user_id uuid, role_name public.app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role_id uuid;
begin
  if not public.has_role(array['admin']::public.app_role[]) then
    raise exception 'Only admins can assign roles';
  end if;

  select id into selected_role_id
  from public.roles
  where name = role_name
    and deleted_at is null;

  if selected_role_id is null then
    raise exception 'Role % does not exist', role_name;
  end if;

  insert into public.user_roles (user_id, role_id, assigned_by)
  values (target_user_id, selected_role_id, auth.uid())
  on conflict (user_id, role_id) do update
  set deleted_at = null,
      assigned_by = auth.uid(),
      updated_at = now();
end;
$$;

create or replace function public.remove_user_role(target_user_id uuid, role_name public.app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role_id uuid;
begin
  if not public.has_role(array['admin']::public.app_role[]) then
    raise exception 'Only admins can remove roles';
  end if;

  select id into selected_role_id
  from public.roles
  where name = role_name
    and deleted_at is null;

  if selected_role_id is null then
    raise exception 'Role % does not exist', role_name;
  end if;

  update public.user_roles
  set deleted_at = now(),
      updated_at = now()
  where user_id = target_user_id
    and role_id = selected_role_id
    and deleted_at is null;
end;
$$;

-- Roles and user_roles policies.
drop policy if exists "roles_select_authenticated" on public.roles;
create policy "roles_select_authenticated"
on public.roles
for select
to authenticated
using (deleted_at is null);

drop policy if exists "roles_admin_manage" on public.roles;
create policy "roles_admin_manage"
on public.roles
for all
to authenticated
using (public.has_role(array['admin']::public.app_role[]))
with check (public.has_role(array['admin']::public.app_role[]));

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid() and deleted_at is null);

drop policy if exists "user_roles_admin_manage" on public.user_roles;
create policy "user_roles_admin_manage"
on public.user_roles
for all
to authenticated
using (public.has_role(array['admin']::public.app_role[]))
with check (public.has_role(array['admin']::public.app_role[]));

-- Event policies. Public visitors can read published, non-deleted events;
-- authenticated staff get role-based admin access.
drop policy if exists "events_public_select_published" on public.events;
create policy "events_public_select_published"
on public.events
for select
to anon, authenticated
using (status = 'published' and deleted_at is null);

drop policy if exists "events_staff_select" on public.events;
create policy "events_staff_select"
on public.events
for select
to authenticated
using (
  deleted_at is null
  and public.has_role(array['admin', 'editor', 'media_manager', 'viewer']::public.app_role[])
);

drop policy if exists "events_editor_insert" on public.events;
create policy "events_editor_insert"
on public.events
for insert
to authenticated
with check (
  public.has_role(array['admin', 'editor']::public.app_role[])
  and (author_id = auth.uid() or author_id is null)
);

drop policy if exists "events_editor_update" on public.events;
create policy "events_editor_update"
on public.events
for update
to authenticated
using (
  deleted_at is null
  and public.has_role(array['admin', 'editor']::public.app_role[])
)
with check (public.has_role(array['admin', 'editor']::public.app_role[]));

drop policy if exists "events_admin_delete" on public.events;
create policy "events_admin_delete"
on public.events
for delete
to authenticated
using (public.has_role(array['admin']::public.app_role[]));

-- Event media policies are read-only preparation in this phase. Upload/manage comes in Phase 5.
drop policy if exists "event_media_public_select" on public.event_media;
create policy "event_media_public_select"
on public.event_media
for select
to anon, authenticated
using (
  deleted_at is null
  and visibility = 'public'
  and approval_status = 'approved'
  and exists (
    select 1
    from public.events e
    where e.id = event_media.event_id
      and e.status = 'published'
      and e.deleted_at is null
  )
);

drop policy if exists "event_media_staff_select" on public.event_media;
create policy "event_media_staff_select"
on public.event_media
for select
to authenticated
using (
  deleted_at is null
  and public.has_role(array['admin', 'editor', 'media_manager', 'viewer']::public.app_role[])
);

-- Basic authenticated staff read policies for dashboard-adjacent data. Full CRUD comes in later phases.
drop policy if exists "news_staff_select" on public.news;
create policy "news_staff_select"
on public.news
for select
to authenticated
using (deleted_at is null and public.has_role(array['admin', 'editor', 'viewer']::public.app_role[]));

drop policy if exists "reports_staff_select" on public.reports;
create policy "reports_staff_select"
on public.reports
for select
to authenticated
using (deleted_at is null and public.has_role(array['admin', 'editor', 'viewer']::public.app_role[]));

-- Seed realistic NGO sample events for admin testing. Author is null until real staff create content.
insert into public.events (title, slug, description, event_date, location, featured, status, author_id, published_at)
values
  (
    'Positive Parenting Workshop',
    'positive-parenting-workshop-kigali-june-2026',
    '120 parents participated in a positive parenting workshop focused on child development, family wellbeing, and community support.',
    '2026-06-12',
    'Kigali, Rwanda',
    true,
    'published',
    null,
    now()
  ),
  (
    'Child Protection Awareness Campaign',
    'child-protection-awareness-campaign-rubavu-2026',
    'Community members, local leaders, and school representatives joined a child protection awareness campaign promoting safe reporting and prevention of violence against children.',
    '2026-05-18',
    'Rubavu District, Rwanda',
    true,
    'published',
    null,
    now()
  ),
  (
    'Family Resilience Training',
    'family-resilience-training-gikombe-2026',
    'Families from Gikombe Cell attended a resilience training session covering household cooperation, psychosocial support, and community-based referral pathways.',
    '2026-04-24',
    'Gikombe Cell, Rubavu Sector',
    false,
    'draft',
    null,
    null
  ),
  (
    'Inclusive Support Session for Children with Disabilities',
    'inclusive-support-session-children-disabilities-2026',
    'Caregivers and community volunteers discussed inclusive care practices, disability rights, and practical support for children living with disabilities.',
    '2026-03-09',
    'Western Province, Rwanda',
    false,
    'archived',
    null,
    null
  )
on conflict (slug) do nothing;
