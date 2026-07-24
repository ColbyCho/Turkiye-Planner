# Connecting the database

The planner runs fine with no backend at all. Votes, comments, reactions,
proposals, polls, photos, and self-edited profiles all work immediately — they
just live in your own browser, so nobody else sees them. Connecting Supabase
flips every one of those to shared, with no code changes.

The app says which mode it's in: a small "saved on this device" note appears
wherever shared data is shown, and it disappears once connected.

## Setup (about ten minutes)

1. **Create a project** at [supabase.com](https://supabase.com) — the free tier
   is far more than this needs. Any region near the group is fine.

2. **Create the tables.** Open the project's SQL editor, paste in all of
   [`supabase/schema.sql`](../supabase/schema.sql), and run it. It creates eight
   tables, the row-level security policies, and the public `trip-photos` storage
   bucket. Re-running it later is safe.

3. **Copy the credentials.** Project Settings → API gives you the Project URL
   and the `anon` `public` key.

4. **Point the app at them.** Locally, `cp .env.example .env.local` and fill in
   both values, then restart `npm run dev`. For the deployed site, set the same
   two variables in your host's environment-variables settings and redeploy —
   they're baked in at build time, so a redeploy is required.

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

5. **Check it.** Open the site, vote on something, then open it in a private
   window — the vote should already be there.

## What "shared" means here

There are no accounts. You say who you are by picking a name, and the app
trusts you. Anyone with the site's URL can therefore read and write everything
in the database, including as someone else. For seven friends planning a trip
that's the right trade — no passwords to lose, no one locked out mid-trip — but
it means:

- **Nothing private goes in the database.** No passport numbers, card details,
  home addresses, or anything you'd mind a stranger reading if the URL leaked.
- Photos in the `trip-photos` bucket are **public URLs**. Unlisted, but public.
- Anyone can delete anyone's comment. Among friends, fine; worth knowing.

If that ever stops being the right trade, the fix is Supabase Auth with a magic
link per person, and swapping the `crew_all` policies in `schema.sql` for
`auth.uid()`-based ones. The app's data layer wouldn't change.

## How it fits together

```
components/*            UI. Never talks to Supabase directly.
lib/db/useTable.ts      React hook — rows, upsert, remove, refresh.
lib/db/store.ts         Cache + optimistic writes; picks a backend.
lib/db/client.ts        Supabase over plain fetch (no SDK dependency).
lib/db/types.ts         Row shapes = the Postgres columns, verbatim.
supabase/schema.sql     The tables those rows come from.
```

`store.ts` is the only file that knows whether a backend exists. It writes to
the cache first so the UI responds instantly, then persists — to Supabase if
credentials exist, to `localStorage` if not — and rolls back if the write
fails. Connected tabs re-read every 20 seconds while visible and on window
focus, which is what makes other people's votes show up without a refresh.

Adding a shared feature means adding a table to `schema.sql`, its row type to
`types.ts`, its primary key to `PRIMARY_KEYS`, and then calling
`useTable('your_table')` from a component. Nothing else needs to change.
