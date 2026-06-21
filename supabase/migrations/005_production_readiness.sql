-- Production readiness hardening: event cover media support and form security metadata.

alter table public.events
add column if not exists cover_media_id uuid references public.event_media(id) on delete set null,
add column if not exists cover_image_url text;

alter table public.contact_messages add column if not exists turnstile_verified boolean not null default false;
alter table public.volunteer_applications add column if not exists turnstile_verified boolean not null default false;
alter table public.partnership_requests add column if not exists turnstile_verified boolean not null default false;

create index if not exists events_cover_media_idx on public.events(cover_media_id) where deleted_at is null;
