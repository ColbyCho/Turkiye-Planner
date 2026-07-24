-- ─────────────────────────────────────────────────────────────────────────────
-- Türkiye Planner — shared trip data.
--
-- Paste this whole file into the Supabase SQL editor and run it once. It is
-- idempotent: re-running only adds what's missing, so it's safe to run again
-- after pulling changes.
--
-- SECURITY MODEL, stated plainly: there are no accounts. Everyone identifies
-- themselves by picking a name in the app, so anyone who has the site URL can
-- read and write anything here, including as someone else. That is the right
-- trade for seven friends sharing a trip planner and the wrong one for
-- anything private — keep passport numbers, card details, and home addresses
-- out of these tables.
-- ─────────────────────────────────────────────────────────────────────────────

-- Profiles — the self-edited half of a crew card. Static defaults live in
-- data/crew.ts; a row here overlays them.
create table if not exists public.profiles (
  name        text primary key,
  photo_url   text,
  title       text,
  home_city   text,
  known_for   text,
  dietary     text,
  fun_fact    text,
  quote       text,
  room        text,
  seat_out    text,
  seat_home   text,
  fun         jsonb default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Votes — one verdict per person per activity. -1 skip · 0 neutral · 1 in.
create table if not exists public.votes (
  activity_id text not null,
  voter       text not null,
  value       smallint not null check (value between -1 and 1),
  updated_at  timestamptz not null default now(),
  primary key (activity_id, voter)
);

-- Reactions — emoji on an activity, one of each per person.
create table if not exists public.reactions (
  activity_id text not null,
  author      text not null,
  emoji       text not null,
  created_at  timestamptz not null default now(),
  primary key (activity_id, author, emoji)
);

-- Comments — the thread under an activity.
create table if not exists public.comments (
  id          uuid primary key,
  activity_id text not null,
  author      text not null,
  body        text not null check (char_length(body) between 1 and 2000),
  created_at  timestamptz not null default now()
);
create index if not exists comments_activity_idx on public.comments (activity_id, created_at);

-- Proposals — suggested activities, before they graduate into the itinerary.
create table if not exists public.proposals (
  id         uuid primary key,
  author     text not null,
  title      text not null,
  day_date   date not null,
  start      text,
  "end"      text,
  category   text,
  notes      text,
  url        text,
  created_at timestamptz not null default now()
);
create index if not exists proposals_day_idx on public.proposals (day_date);

-- Polls — "what do we do Thursday night?" with a fixed set of options.
create table if not exists public.polls (
  id         uuid primary key,
  author     text not null,
  day_date   date not null,
  question   text not null,
  options    jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_votes (
  poll_id    uuid not null references public.polls (id) on delete cascade,
  voter      text not null,
  option_id  text not null,
  updated_at timestamptz not null default now(),
  primary key (poll_id, voter)
);

-- Photos — shared album, one row per uploaded image.
create table if not exists public.photos (
  id         uuid primary key,
  author     text not null,
  day_date   date not null,
  url        text not null,
  caption    text,
  created_at timestamptz not null default now()
);
create index if not exists photos_day_idx on public.photos (day_date, created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-level security. RLS is ON for every table (Supabase requires it before
-- the anon key may touch anything), with policies that allow the whole crew
-- through. Tighten later by swapping these for auth-based policies.
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'votes', 'reactions', 'comments',
    'proposals', 'polls', 'poll_votes', 'photos'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists crew_all on public.%I', t);
    execute format(
      'create policy crew_all on public.%I for all to anon, authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage bucket for the shared album, public-read so <img> tags just work.
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('trip-photos', 'trip-photos', true)
on conflict (id) do update set public = true;

drop policy if exists trip_photos_all on storage.objects;
create policy trip_photos_all on storage.objects
  for all to anon, authenticated
  using (bucket_id = 'trip-photos')
  with check (bucket_id = 'trip-photos');
