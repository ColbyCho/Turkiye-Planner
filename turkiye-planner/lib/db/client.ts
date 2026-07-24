import { PRIMARY_KEYS, type TableMap, type TableName } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Supabase over plain fetch.
//
// PostgREST is a REST API, so the whole client is the handful of requests
// below — no SDK, no dependency, nothing added to the bundle. Set the two env
// vars and every shared feature switches from this-device-only to shared.
//
//   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
//
// These are inlined at build time (that's what NEXT_PUBLIC_ means) and are
// meant to be public — the anon key is a client key, and what it may touch is
// decided by the row-level security policies in supabase/schema.sql.
// ─────────────────────────────────────────────────────────────────────────────

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** Bucket for shared trip photos (created by supabase/schema.sql). */
export const PHOTO_BUCKET = 'trip-photos'

/** True when the site was built with Supabase credentials. */
export function isConnected(): boolean {
  return Boolean(URL_BASE && ANON_KEY)
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    ...extra,
  }
}

async function expectOk(res: Response, what: string): Promise<void> {
  if (res.ok) return
  const detail = await res.text().catch(() => '')
  throw new Error(`Supabase ${what} failed (${res.status}): ${detail.slice(0, 200)}`)
}

export async function selectAll<K extends TableName>(
  table: K
): Promise<TableMap[K][]> {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}?select=*`, {
    headers: headers(),
    cache: 'no-store',
  })
  await expectOk(res, `select ${table}`)
  return res.json()
}

export async function upsertRow<K extends TableName>(
  table: K,
  row: TableMap[K]
): Promise<void> {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers({
      'Content-Type': 'application/json',
      // Update the existing row when the primary key collides, and don't ship
      // the row back — the caller already applied it optimistically.
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify(row),
  })
  await expectOk(res, `upsert ${table}`)
}

export async function deleteRow<K extends TableName>(
  table: K,
  row: TableMap[K]
): Promise<void> {
  const query = PRIMARY_KEYS[table]
    .map((col) => `${col}=eq.${encodeURIComponent(String((row as never)[col]))}`)
    .join('&')
  const res = await fetch(`${URL_BASE}/rest/v1/${table}?${query}`, {
    method: 'DELETE',
    headers: headers({ Prefer: 'return=minimal' }),
  })
  await expectOk(res, `delete ${table}`)
}

/** Uploads to Supabase Storage and returns the public URL. */
export async function uploadPhoto(path: string, file: Blob): Promise<string> {
  const res = await fetch(
    `${URL_BASE}/storage/v1/object/${PHOTO_BUCKET}/${encodeURI(path)}`,
    {
      method: 'POST',
      headers: headers({ 'Content-Type': file.type || 'image/jpeg' }),
      body: file,
    }
  )
  await expectOk(res, 'photo upload')
  return `${URL_BASE}/storage/v1/object/public/${PHOTO_BUCKET}/${encodeURI(path)}`
}
