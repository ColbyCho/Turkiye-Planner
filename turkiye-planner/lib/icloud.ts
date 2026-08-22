// ─────────────────────────────────────────────────────────────────────────────
// Apple Shared Album reader.
//
// A shared album is served by an undocumented but stable pair of endpoints:
//
//   POST /{token}/sharedstreams/webstream     → photo metadata (incl. capture
//                                               date and derivative sizes)
//   POST /{token}/sharedstreams/webasseturls  → short-lived signed image URLs
//
// The first call may answer 330 with an `X-Apple-MMe-Host` body field naming
// the partition that actually holds the album; we follow it once.
//
// Signed URLs expire in about an hour, so they can never be baked into a
// build — anything that wants durable images has to download the bytes
// (see scripts/fetch-album.ts).
//
// This module is isomorphic: it runs in the browser, in a serverless
// function, and under plain Node, and it never throws — every failure path
// returns an empty list so a caller can fall back.
// ─────────────────────────────────────────────────────────────────────────────

/** The crew's shared album, the same one the Photo Album stamp links to. */
export const ALBUM_TOKEN = 'B1dGWZuqDPZ79kz'

/** Türkiye is UTC+3 year-round, so a photo's trip day is a fixed shift. */
const TRIP_OFFSET_HOURS = 3

export interface AlbumPhoto {
  guid: string
  /** Signed remote URL, or a local path once snapshotted into public/. */
  url: string
  caption: string
  width: number
  height: number
  /** ISO timestamp the shot was taken. */
  takenAt: string
  /** 'YYYY-MM-DD' in Türkiye local time — the day page it belongs on. */
  day: string
}

/** The trip day a timestamp falls on, read on a Türkiye clock. */
export function tripDayOf(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  return new Date(t + TRIP_OFFSET_HOURS * 3_600_000).toISOString().slice(0, 10)
}

interface Derivative {
  fileSize?: string | number
  checksum?: string
  width?: string | number
  height?: string | number
}

interface StreamPhoto {
  photoGuid?: string
  caption?: string
  dateCreated?: string
  batchDateCreated?: string
  derivatives?: Record<string, Derivative>
}

const num = (v: string | number | undefined): number => {
  const n = typeof v === 'number' ? v : Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

/**
 * Pick the derivative closest to `targetWidth` without going under it when a
 * bigger one exists — full-size originals are needlessly heavy for a postcard.
 */
function pickDerivative(
  derivatives: Record<string, Derivative>,
  targetWidth: number
): Derivative | null {
  const all = Object.values(derivatives).filter((d) => d.checksum)
  if (all.length === 0) return null
  const big = all
    .filter((d) => num(d.width) >= targetWidth)
    .sort((a, b) => num(a.width) - num(b.width))
  if (big.length > 0) return big[0]
  return all.sort((a, b) => num(b.width) - num(a.width))[0]
}

interface PostResult {
  status: number
  json: Record<string, unknown> | null
}

/**
 * Apple answers a wrong-partition request with HTTP 330 and a JSON body naming
 * the host that actually holds the album, so the body matters even when the
 * status isn't ok — the status comes back alongside rather than swallowed.
 */
async function post(url: string, body: unknown, fetchImpl: typeof fetch): Promise<PostResult> {
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      // text/plain keeps this a CORS "simple" request — no preflight, which
      // Apple's endpoint does not answer.
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(body),
    })
    let json: Record<string, unknown> | null = null
    try {
      json = (await res.json()) as Record<string, unknown>
    } catch {
      /* not JSON — leave it null */
    }
    return { status: res.status, json }
  } catch {
    return { status: 0, json: null }
  }
}

/** The host actually holding this album, following Apple's 330 at most once. */
export async function resolveStream(
  token: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ host: string; stream: Record<string, unknown> } | null> {
  const url = (host: string) => `https://${host}/${token}/sharedstreams/webstream`

  let host = 'p01-sharedstreams.icloud.com'
  let res = await post(url(host), { streamCtag: null }, fetchImpl)

  const redirect = res.json?.['X-Apple-MMe-Host']
  if (typeof redirect === 'string' && redirect) {
    host = redirect
    res = await post(url(host), { streamCtag: null }, fetchImpl)
  }

  if (res.status !== 200 || !res.json) return null
  return { host, stream: res.json }
}

export interface FetchAlbumOptions {
  token?: string
  /** Swap in a proxy base (e.g. '/api/photos') or a custom fetch for tests. */
  fetchImpl?: typeof fetch
  /** Largest number of photos to keep, newest first. */
  maxPhotos?: number
  /** Derivative width to aim for. */
  targetWidth?: number
}

/**
 * Read a shared album into day-keyed photos, newest first. Returns [] on any
 * failure — a blocked request, a shape we don't recognise, an empty album.
 */
export async function fetchAlbum({
  token = ALBUM_TOKEN,
  fetchImpl = fetch,
  maxPhotos = 120,
  targetWidth = 1024,
}: FetchAlbumOptions = {}): Promise<AlbumPhoto[]> {
  const resolved = await resolveStream(token, fetchImpl)
  if (!resolved) return []
  const { host, stream } = resolved

  const photos = stream.photos
  if (!Array.isArray(photos) || photos.length === 0) return []

  // Newest first, then trimmed, so we only ask for the URLs we'll use.
  const chosen = (photos as StreamPhoto[])
    .filter((p) => p.photoGuid && p.derivatives)
    .sort(
      (a, b) =>
        Date.parse(b.dateCreated ?? b.batchDateCreated ?? '') -
        Date.parse(a.dateCreated ?? a.batchDateCreated ?? '')
    )
    .slice(0, maxPhotos)

  const wanted = chosen
    .map((p) => ({ photo: p, derivative: pickDerivative(p.derivatives!, targetWidth) }))
    .filter((x): x is { photo: StreamPhoto; derivative: Derivative } => !!x.derivative)
  if (wanted.length === 0) return []

  const urls = await post(
    `https://${host}/${token}/sharedstreams/webasseturls`,
    { photoGuids: wanted.map((w) => w.photo.photoGuid) },
    fetchImpl
  )
  const items = (urls.json?.items ?? {}) as Record<
    string,
    { url_location?: string; url_path?: string }
  >

  return wanted
    .map(({ photo, derivative }) => {
      const item = items[String(derivative.checksum)]
      if (!item?.url_location || !item?.url_path) return null
      const takenAt = photo.dateCreated ?? photo.batchDateCreated ?? ''
      return {
        guid: String(photo.photoGuid),
        url: `https://${item.url_location}${item.url_path}`,
        caption: (photo.caption ?? '').trim(),
        width: num(derivative.width),
        height: num(derivative.height),
        takenAt,
        day: tripDayOf(takenAt),
      }
    })
    .filter((p): p is AlbumPhoto => !!p)
}
