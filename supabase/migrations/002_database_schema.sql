-- Phase 2: Production database schema for the ME MARS FAMILY NGO platform.
-- This migration adds access-control tables, content tables, website CMS tables,
-- public form submission tables, indexes, soft-delete columns, and RLS preparation.

-- Additional platform enums.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type public.content_status as enum ('draft', 'published', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'event_media_type') then
    create type public.event_media_type as enum ('image', 'video');
  end if;

  if not exists (select 1 from pg_type where typname = 'approval_status') then
    create type public.approval_status as enum ('pending', 'approved', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'media_visibility') then
    create type public.media_visibility as enum ('public', 'private');
  end if;

  if not exists (select 1 from pg_type where typname = 'news_category') then
    create type public.news_category as enum ('success_story', 'announcement', 'program_update', 'impact_story');
  end if;

  if not exists (select 1 from pg_type where typname = 'report_category') then
    create type public.report_category as enum ('annual_report', 'financial_report', 'strategic_plan', 'research_document');
  end if;

  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type public.submission_status as enum ('new', 'in_review', 'responded', 'closed', 'spam');
  end if;
end $$;

-- Access-control tables. The legacy profiles.role column from Phase 1 remains
-- as a compatibility/default role, while user_roles supports future multi-role access.
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name public.app_role not null unique,
  display_name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger roles_set_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

insert into public.roles (name, display_name, description)
values
  ('admin', 'Admin', 'Full platform access including users, settings, content, media, reports, and governance.'),
  ('editor', 'Editor', 'Can manage and publish content such as events, news, reports, and homepage content.'),
  ('media_manager', 'Media Manager', 'Can upload and manage approved media, captions, alt text, and galleries.'),
  ('viewer', 'Viewer', 'Can access the admin dashboard in read-only mode.')
on conflict (name) do update
set display_name = excluded.display_name,
    description = excluded.description,
    updated_at = now(),
    deleted_at = null;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, role_id)
);

create trigger user_roles_set_updated_at
before update on public.user_roles
for each row execute function public.set_updated_at();

-- Update role helpers to use user_roles first and profiles.role as fallback.
create or replace function public.current_user_roles()
returns public.app_role[]
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    array_agg(distinct r.name) filter (where r.name is not null),
    array[p.role]
  )
  from public.profiles p
  left join public.user_roles ur
    on ur.user_id = p.id
   and ur.deleted_at is null
  left join public.roles r
    on r.id = ur.role_id
   and r.deleted_at is null
  where p.id = auth.uid()
    and p.is_active = true
  group by p.role
$$;

create or replace function public.current_user_role()
returns public.app_role
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((public.current_user_roles())[1], 'viewer'::public.app_role)
$$;

create or replace function public.has_role(required_roles public.app_role[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_user_roles() && required_roles, false)
$$;

-- Content: events.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  event_date date,
  location text,
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint events_slug_not_blank check (length(trim(slug)) > 0),
  constraint events_title_not_blank check (length(trim(title)) > 0),
  constraint events_published_at_check check (status <> 'published' or published_at is not null)
);

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- Content: event media stored in Supabase Storage.
create table if not exists public.event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  media_type public.event_media_type not null,
  file_path text not null,
  public_url text,
  caption text,
  alt_text text,
  consent_confirmed boolean not null default false,
  approval_status public.approval_status not null default 'pending',
  visibility public.media_visibility not null default 'private',
  sort_order integer not null default 0,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint event_media_file_path_not_blank check (length(trim(file_path)) > 0),
  constraint event_media_public_approval_check check (visibility <> 'public' or approval_status = 'approved'),
  constraint event_media_image_alt_check check (media_type <> 'image' or visibility <> 'public' or nullif(trim(coalesce(alt_text, '')), '') is not null)
);

create trigger event_media_set_updated_at
before update on public.event_media
for each row execute function public.set_updated_at();

-- Content: news, success stories, announcements, program updates, and impact stories.
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  content text,
  category public.news_category not null,
  cover_image_path text,
  cover_image_url text,
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  author_id uuid references public.profiles(id) on delete set null,
  publish_date date,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint news_slug_not_blank check (length(trim(slug)) > 0),
  constraint news_title_not_blank check (length(trim(title)) > 0),
  constraint news_published_at_check check (status <> 'published' or published_at is not null)
);

create trigger news_set_updated_at
before update on public.news
for each row execute function public.set_updated_at();

-- Content: downloadable reports and documents.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category public.report_category not null,
  description text,
  file_path text not null,
  public_url text,
  cover_image_path text,
  cover_image_url text,
  publication_date date,
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint reports_slug_not_blank check (length(trim(slug)) > 0),
  constraint reports_title_not_blank check (length(trim(title)) > 0),
  constraint reports_file_path_not_blank check (length(trim(file_path)) > 0),
  constraint reports_published_at_check check (status <> 'published' or published_at is not null)
);

create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

-- Website CMS: homepage settings. One active row is expected, but UUID keeps
-- the table extensible for future draft/revision support.
create table if not exists public.homepage_settings (
  id uuid primary key default gen_random_uuid(),
  hero_title text not null default 'ME MARS FAMILY',
  hero_subtitle text,
  hero_intro text,
  hero_media_path text,
  hero_media_url text,
  primary_cta_label text,
  primary_cta_url text,
  secondary_cta_label text,
  secondary_cta_url text,
  featured_event_id uuid references public.events(id) on delete set null,
  featured_news_id uuid references public.news(id) on delete set null,
  is_active boolean not null default true,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists homepage_settings_one_active_idx
on public.homepage_settings (is_active)
where is_active = true and deleted_at is null;

create trigger homepage_settings_set_updated_at
before update on public.homepage_settings
for each row execute function public.set_updated_at();

-- Website CMS: editable impact statistics.
create table if not exists public.impact_statistics (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  description text,
  icon text,
  sort_order integer not null default 0,
  featured boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint impact_statistics_label_not_blank check (length(trim(label)) > 0),
  constraint impact_statistics_value_not_blank check (length(trim(value)) > 0)
);

create trigger impact_statistics_set_updated_at
before update on public.impact_statistics
for each row execute function public.set_updated_at();

-- Website CMS: testimonials with consent support.
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  attribution text,
  role_or_context text,
  photo_path text,
  photo_url text,
  consent_confirmed boolean not null default false,
  featured boolean not null default false,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint testimonials_quote_not_blank check (length(trim(quote)) > 0),
  constraint testimonials_public_consent_check check (is_active = false or consent_confirmed = true)
);

create trigger testimonials_set_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

-- Website CMS: partner logos.
create table if not exists public.partner_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  website_url text,
  logo_path text,
  logo_url text,
  alt_text text,
  sort_order integer not null default 0,
  featured boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint partner_logos_name_not_blank check (length(trim(name)) > 0),
  constraint partner_logos_alt_check check (logo_path is null or nullif(trim(coalesce(alt_text, '')), '') is not null)
);

create trigger partner_logos_set_updated_at
before update on public.partner_logos
for each row execute function public.set_updated_at();

-- Forms: contact messages.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status public.submission_status not null default 'new',
  assigned_to uuid references public.profiles(id) on delete set null,
  admin_notes text,
  spam_score numeric,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint contact_messages_name_not_blank check (length(trim(name)) > 0),
  constraint contact_messages_email_not_blank check (length(trim(email)) > 0),
  constraint contact_messages_message_not_blank check (length(trim(message)) > 0)
);

create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

-- Forms: volunteer applications.
create table if not exists public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  skills text,
  interests text,
  availability text,
  motivation text,
  status public.submission_status not null default 'new',
  assigned_to uuid references public.profiles(id) on delete set null,
  admin_notes text,
  spam_score numeric,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint volunteer_applications_name_not_blank check (length(trim(full_name)) > 0),
  constraint volunteer_applications_email_not_blank check (length(trim(email)) > 0)
);

create trigger volunteer_applications_set_updated_at
before update on public.volunteer_applications
for each row execute function public.set_updated_at();

-- Forms: partnership requests.
create table if not exists public.partnership_requests (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  contact_person text not null,
  email text not null,
  phone text,
  partnership_proposal text not null,
  status public.submission_status not null default 'new',
  assigned_to uuid references public.profiles(id) on delete set null,
  admin_notes text,
  spam_score numeric,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint partnership_requests_org_not_blank check (length(trim(organization)) > 0),
  constraint partnership_requests_contact_not_blank check (length(trim(contact_person)) > 0),
  constraint partnership_requests_email_not_blank check (length(trim(email)) > 0),
  constraint partnership_requests_proposal_not_blank check (length(trim(partnership_proposal)) > 0)
);

create trigger partnership_requests_set_updated_at
before update on public.partnership_requests
for each row execute function public.set_updated_at();

-- Phase 2 update: audit logs now also carry updated_at for consistency with the platform table standard.
alter table public.audit_logs
add column if not exists updated_at timestamptz not null default now();

drop trigger if exists audit_logs_set_updated_at on public.audit_logs;
create trigger audit_logs_set_updated_at
before update on public.audit_logs
for each row execute function public.set_updated_at();

-- Index strategy: public lookups, admin filters, relationship joins, and soft-delete filters.
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_active_role_idx on public.profiles(role, is_active) where is_active = true;
create index if not exists roles_name_idx on public.roles(name) where deleted_at is null;
create index if not exists user_roles_user_idx on public.user_roles(user_id) where deleted_at is null;
create index if not exists user_roles_role_idx on public.user_roles(role_id) where deleted_at is null;

create index if not exists events_status_featured_date_idx on public.events(status, featured, event_date desc) where deleted_at is null;
create index if not exists events_author_idx on public.events(author_id) where deleted_at is null;
create index if not exists events_slug_live_idx on public.events(slug) where deleted_at is null;

create index if not exists event_media_event_sort_idx on public.event_media(event_id, sort_order) where deleted_at is null;
create index if not exists event_media_public_idx on public.event_media(event_id, visibility, approval_status) where deleted_at is null;
create index if not exists event_media_uploaded_by_idx on public.event_media(uploaded_by) where deleted_at is null;

create index if not exists news_status_category_featured_idx on public.news(status, category, featured, publish_date desc) where deleted_at is null;
create index if not exists news_author_idx on public.news(author_id) where deleted_at is null;
create index if not exists news_slug_live_idx on public.news(slug) where deleted_at is null;

create index if not exists reports_status_category_featured_idx on public.reports(status, category, featured, publication_date desc) where deleted_at is null;
create index if not exists reports_author_idx on public.reports(author_id) where deleted_at is null;
create index if not exists reports_slug_live_idx on public.reports(slug) where deleted_at is null;

create index if not exists impact_statistics_active_sort_idx on public.impact_statistics(is_active, sort_order) where deleted_at is null;
create index if not exists testimonials_active_featured_sort_idx on public.testimonials(is_active, featured, sort_order) where deleted_at is null;
create index if not exists partner_logos_active_featured_sort_idx on public.partner_logos(is_active, featured, sort_order) where deleted_at is null;

create index if not exists contact_messages_status_created_idx on public.contact_messages(status, created_at desc) where deleted_at is null;
create index if not exists volunteer_applications_status_created_idx on public.volunteer_applications(status, created_at desc) where deleted_at is null;
create index if not exists partnership_requests_status_created_idx on public.partnership_requests(status, created_at desc) where deleted_at is null;

create index if not exists audit_logs_target_idx on public.audit_logs(entity_type, entity_id, created_at desc);

-- RLS preparation: enable RLS now. Detailed table policies are intentionally
-- deferred to the auth/admin phases so access rules can be implemented with UI workflows.
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.events enable row level security;
alter table public.event_media enable row level security;
alter table public.news enable row level security;
alter table public.reports enable row level security;
alter table public.homepage_settings enable row level security;
alter table public.impact_statistics enable row level security;
alter table public.testimonials enable row level security;
alter table public.partner_logos enable row level security;
alter table public.contact_messages enable row level security;
alter table public.volunteer_applications enable row level security;
alter table public.partnership_requests enable row level security;
