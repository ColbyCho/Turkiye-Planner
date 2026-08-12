-- ─────────────────────────────────────────────────────────────────────────────
-- Planner upgrades: RSVP + comments.
-- Run once in the Supabase SQL editor (project rhoupbaptxzambloocre).
-- Same trust model as the existing tables (see PR #14): anon key + permissive
-- RLS — the site has no real auth, everyone acts as a chosen crew profile.
-- ─────────────────────────────────────────────────────────────────────────────

-- Self-serve "I'm in / I'm out" on activities. The itinerary's hardcoded
-- participants stay as the seed; a row here overrides that default for one
-- person on one activity ('in' adds you, 'out' takes you off).
create table if not exists public.activity_signups (
  activity_id text not null,
  profile_id  text not null references public.profiles (id) on delete cascade,
  status      text not null check (status in ('in', 'out')),
  created_at  timestamptz not null default now(),
  primary key (activity_id, profile_id)
);

alter table public.activity_signups enable row level security;

create policy "signups are readable by everyone"
  on public.activity_signups for select using (true);
create policy "anyone can add a signup"
  on public.activity_signups for insert with check (true);
create policy "anyone can change a signup"
  on public.activity_signups for update using (true);
create policy "anyone can remove a signup"
  on public.activity_signups for delete using (true);

alter publication supabase_realtime add table public.activity_signups;

-- Comments: one table serves both activity threads (target = activity id,
-- e.g. 'd3-bazaar') and each day's group chat (target = ISO date).
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  target     text not null,
  profile_id text not null references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists comments_target_idx
  on public.comments (target, created_at);

alter table public.comments enable row level security;

create policy "comments are readable by everyone"
  on public.comments for select using (true);
create policy "anyone can post a comment"
  on public.comments for insert with check (true);
create policy "anyone can delete a comment"
  on public.comments for delete using (true);

alter publication supabase_realtime add table public.comments;
