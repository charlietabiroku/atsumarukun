create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  slug text not null unique,
  language text not null check (language in ('ja', 'zh', 'en', 'ko')),
  created_at timestamptz not null default now()
);

create table if not exists public.event_dates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  candidate_date timestamptz not null,
  created_at timestamptz not null default now(),
  unique (event_id, candidate_date)
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.response_items (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.responses(id) on delete cascade,
  event_date_id uuid not null references public.event_dates(id) on delete cascade,
  status text not null check (status in ('available', 'maybe', 'unavailable')),
  unique (response_id, event_date_id)
);

create index if not exists idx_event_dates_event_id
  on public.event_dates(event_id);

create index if not exists idx_responses_event_id
  on public.responses(event_id);

create index if not exists idx_response_items_response_id
  on public.response_items(response_id);

create index if not exists idx_response_items_event_date_id
  on public.response_items(event_date_id);
