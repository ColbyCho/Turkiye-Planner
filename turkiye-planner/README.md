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

## Features

- 24-hour planner grid per day; overlapping activities split into lanes
- Click any activity → modal with notes, booking link, participants, and
  **Add to calendar** (`.ics` download + Google Calendar link, correct
  Europe/Istanbul timezone)
- Arrow navigation + date tabs; `←`/`→` keys flip days; days are deep-linkable
  (`#2026-08-25`)
- Cheeky fun fact sticky note at the bottom of every day

## Trip photos

The postcard pile under each day prefers the crew's own photos from the iCloud
shared album, falling back to the stock Wikimedia postcards on a day with none.
A photo lands on a day page by its capture time, read on a Türkiye clock, so
nobody has to file anything.

Photos reach the page by whichever of three routes answers first:

| Route | How it works | Needs |
| --- | --- | --- |
| Snapshot | `.github/workflows/album.yml` runs `npm run album` every two hours and commits `public/album/` | nothing — on by default |
| Proxy | `/api/photos` reads the album server-side, same-origin | `PHOTO_PROXY=1` in the deploy env |
| Direct | The browser calls Apple itself | Apple allowing the cross-origin call |

The snapshot paints first because it's local and cached offline; anything a live
route turns up is merged over it, so new photos appear without waiting for the
next snapshot. All three can fail without breaking the page.

Run a snapshot by hand with `npm run album`. `ALBUM_TOKEN` overrides which album
is read; the default is the one the Photo Album stamp links to.

## Deploy

`npm run build` produces a fully static site in `out/` (Next.js static export) —
host it on Vercel, Netlify, GitHub Pages, or any static file host.

Setting `PHOTO_PROXY=1` builds a Next server app instead, adding the
`/api/photos` route above. The planner detects the route at runtime, so turning
it on is purely an env-var change.
