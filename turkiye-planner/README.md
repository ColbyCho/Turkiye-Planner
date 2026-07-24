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
- Crew names live in the `CREW` array at the top of the data file.

## Crew profiles

Names live in `CREW` (`data/itinerary.ts`); the person behind each name lives in
**`data/crew.ts`** — title, home city, dietary notes, fun fact, quote. Every
field is optional and the profile card hides whatever's missing.

Photos go in `public/crew/` (square crops), wired up with
`photo: '/crew/matt.jpg'`. Without one, the card falls back to their initial on
their avatar color. Photos are committed and served publicly — see
`public/crew/README.md`.

Plan counts, days on trip, hours booked, and the date range are computed from
the itinerary, so they stay right as plans change.

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

## Deploy

`npm run build` produces a fully static site in `out/` (Next.js static export) —
host it on Vercel, Netlify, GitHub Pages, or any static file host.
