# Türkiye Planner

A day-by-day trip planner for the crew's Istanbul & Bodrum trip, **August 21–31, 2026**.
Styled like a tangible paper planner: 24-hour day pages, İznik-tile palette,
passport stamps, sticky-note fun facts.

## Run it

```bash
npm install
npm run dev      # http://localhost:3117
```

## Edit the itinerary

Everything lives in **`data/itinerary.ts`** — one entry per day, one object per
activity. No other file needs touching as plans firm up.

- Times are 24h `'HH:MM'` in Türkiye local time (UTC+3).
- For activities running past midnight, keep counting: `'26:00'` = 2:00 AM next day.
- Categories: `meal` · `stay` · `transport` · `tour` · `night` · `misc` — each
  gets its own visual treatment (defined in `lib/categories.ts`).
- Crew names live in the `CREW` array in `data/crew.ts`.

## Crew profiles

**`data/crew.ts`** is the single source of truth for who's on this trip: the
`CREW` names, each person's profile, and their `joins`/`leaves` dates — which
is what builds the itinerary's participant lists, so a changed flight is a
one-line edit there.

A profile holds title, home city, dietary notes, room, seats, fun fact, quote.
Every field is optional and the card hides whatever's missing. Everyone can
fill in their own from the card's edit form, including the questionnaire in
`FUN_QUESTIONS` — add a question there and it appears in the form and on every
card.

Photos go in `public/crew/` (square crops), wired up with
`photo: '/crew/matt.jpg'`. Without one, the card falls back to their initial on
their avatar color. Photos are committed and served publicly — see
`public/crew/README.md`.

Plan counts, days on trip, hours booked, and the date range are computed from
the itinerary, so they stay right as plans change. So are the badges — and a
badge is only awarded when leading it means something, so with everyone on an
identical schedule most stay unclaimed until people start voting, pitching, and
posting.

Each card is linkable: `#crew/matt` opens that person's profile.

## Which one are you?

Tapping a face — or any action that needs to know who you are — asks once and
then remembers, so the planner can filter the grid to your plans and export a
calendar of just your events. The name is stored in `localStorage` **and** a
400-day cookie, each read repairing the other; it never leaves the device and
there are no accounts. (Safari evicts both after ~7 idle days unless the site is
added to the home screen.)

## Features

- 24-hour planner grid per day; overlapping activities split into lanes
- Click any activity → modal with notes, booking link, participants, and
  **Add to calendar** (`.ics` download + Google Calendar link, correct
  Europe/Istanbul timezone)
- Arrow navigation + date tabs; `←`/`→` keys flip days; days are deep-linkable
  (`#2026-08-25`)
- Cheeky fun fact sticky note at the bottom of every day
- Crew polaroids → profile cards with that person's copy of the itinerary;
  tap any of their plans to jump straight to it
- "Only my plans" filter and a whole-trip `.ics` of just your events, both of
  which ask which one you are the first time
- **Up next for you** — your current or next plan, in Türkiye time
- **Votes, reactions, and notes** on every activity; a **suggestion box** and
  **polls** per day; a **shared album** per day
- **Packing list** that stays on your device, and a printable **one-pager** of
  just your plans
- Weather normals and a "today's stops" map link per day; a pocket
  **Turkish phrasebook**

## Shared data

Votes, comments, reactions, ideas, polls, photos, and self-edited profiles all
work with no backend — they just live in your own browser until Supabase
credentials exist, at which point the same features become shared with no code
changes. Setup is about ten minutes: **[docs/BACKEND.md](docs/BACKEND.md)**.

## Deploy

`npm run build` produces a fully static site in `out/` (Next.js static export) —
host it on Vercel, Netlify, GitHub Pages, or any static file host.

**GitHub Pages** is wired up already: `.github/workflows/deploy.yml` builds and
publishes on every push to `main`. Enable it once in **Settings → Pages →
Source → GitHub Actions**, and the site lands at
`https://<owner>.github.io/<repo>/`.

A project site is served from `/<repo>`, not the domain root, so the build
takes `NEXT_PUBLIC_BASE_PATH` (the workflow defaults it to `/<repo-name>`) and
`lib/asset.ts` applies it to everything in `public/`. On a custom domain or
Vercel, set the repo variable `NEXT_PUBLIC_BASE_PATH` to an empty string.

To ship with the database connected, add `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` as repository secrets — they're baked in at
build time, so changing them needs a redeploy.
