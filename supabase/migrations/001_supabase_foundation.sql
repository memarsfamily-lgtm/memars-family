-- Phase 1: Supabase foundation for ME MARS FAMILY NGO platform.
-- This migration creates the role foundation, profile model, RLS helpers,
-- audit log foundation, and storage buckets used by later phases.

create extension if not exists "pgcrypto";

-- Application roles used by Supabase Auth profiles and RLS policies.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'editor', 'media_manager', 'viewer');
  end if;
end $$;

-- Shared updated_at trigger helper.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Staff/user profiles mirror auth.users and store platform roles.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role public.app_role not null default 'viewer',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Create a profile automatically whenever a Supabase Auth user is created.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    'viewer'
  )
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- RLS helper functions. These are security definer so policies can safely
-- resolve a user's active role without recursively querying through RLS.
create or replace function public.current_user_role()
returns public.app_role
language sql
security definer
set search_path = public
stable
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and is_active = true
$$;

create or replace function public.has_role(required_roles public.app_role[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_user_role() = any(required_roles), false)
$$;

-- Audit log foundation. Later phases will add entity-specific audit entries.
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_idx on public.audit_logs(actor_id, created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);

-- Enable RLS on foundation tables.
alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles policies.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
on public.profiles
for select
to authenticated
using (public.has_role(array['admin']::public.app_role[]));

drop policy if exists "profiles_update_own_basic" on public.profiles;
create policy "profiles_update_own_basic"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = public.current_user_role()
  and is_active = true
);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
on public.profiles
for all
to authenticated
using (public.has_role(array['admin']::public.app_role[]))
with check (public.has_role(array['admin']::public.app_role[]));

-- Audit log policies.
drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin"
on public.audit_logs
for select
to authenticated
using (public.has_role(array['admin']::public.app_role[]));

drop policy if exists "audit_logs_insert_staff" on public.audit_logs;
create policy "audit_logs_insert_staff"
on public.audit_logs
for insert
to authenticated
with check (
  public.has_role(array['admin', 'editor', 'media_manager']::public.app_role[])
  and actor_id = auth.uid()
);

-- Storage buckets. Object policies are intentionally conservative in Phase 1;
-- detailed media/document object access policies are added with media features.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'public-media',
    'public-media',
    true,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
  ),
  (
    'private-media',
    'private-media',
    false,
    104857600,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
  ),
  (
    'documents',
    'documents',
    false,
    52428800,
    array['application/pdf']
  ),
  (
    'admin-uploads',
    'admin-uploads',
    false,
    104857600,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'application/pdf']
  )
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Baseline storage policies for public reads and authenticated staff uploads.
-- More granular path restrictions are added in media/report phases.
drop policy if exists "public_read_public_media" on storage.objects;
create policy "public_read_public_media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'public-media');

drop policy if exists "staff_read_managed_buckets" on storage.objects;
create policy "staff_read_managed_buckets"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('public-media', 'private-media', 'documents', 'admin-uploads')
  and public.has_role(array['admin', 'editor', 'media_manager', 'viewer']::public.app_role[])
);

drop policy if exists "staff_insert_managed_buckets" on storage.objects;
create policy "staff_insert_managed_buckets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('public-media', 'private-media', 'documents', 'admin-uploads')
  and public.has_role(array['admin', 'editor', 'media_manager']::public.app_role[])
);

drop policy if exists "staff_update_managed_buckets" on storage.objects;
create policy "staff_update_managed_buckets"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('public-media', 'private-media', 'documents', 'admin-uploads')
  and public.has_role(array['admin', 'editor', 'media_manager']::public.app_role[])
)
with check (
  bucket_id in ('public-media', 'private-media', 'documents', 'admin-uploads')
  and public.has_role(array['admin', 'editor', 'media_manager']::public.app_role[])
);

drop policy if exists "admin_delete_managed_buckets" on storage.objects;
create policy "admin_delete_managed_buckets"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('public-media', 'private-media', 'documents', 'admin-uploads')
  and public.has_role(array['admin']::public.app_role[])
);
