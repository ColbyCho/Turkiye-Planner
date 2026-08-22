'use client'

import { useEffect, useState } from 'react'
import { fetchAlbum, type AlbumPhoto } from './icloud'

// ─────────────────────────────────────────────────────────────────────────────
// The crew's shared album, from whichever source answers.
//
//   1. The snapshot committed under public/album/ — same-origin, instant,
//      works offline through the service worker. Paints first, always.
//   2. /api/photos — the server-side reader. Only exists when the site is
//      built with PHOTO_PROXY=1; a 404 here is an ordinary outcome.
//   3. Apple directly from the browser, for anything newer than the snapshot.
//
// Whatever comes back live is merged over the snapshot by photo GUID, so a
// photo already downloaded keeps its local file (fast, cached) and only genuinely
// new shots use a signed remote URL. Every source is allowed to fail; with all
// three down the planner falls back to its own postcards.
// ─────────────────────────────────────────────────────────────────────────────

interface SnapshotEntry {
  guid: string
  file: string
  caption: string
  width: number
  height: number
  takenAt: string
  day: string
}

let snapshotCache: AlbumPhoto[] | null = null
let liveCache: AlbumPhoto[] | null = null
let livePromise: Promise<AlbumPhoto[]> | null = null

async function loadSnapshot(): Promise<AlbumPhoto[]> {
  try {
    const res = await fetch('/album/index.json', { cache: 'no-cache' })
    if (!res.ok) return []
    const json = (await res.json()) as { photos?: SnapshotEntry[] }
    return (json.photos ?? []).map((p) => ({ ...p, url: p.file }))
  } catch {
    return []
  }
}

async function loadProxy(): Promise<AlbumPhoto[]> {
  try {
    const res = await fetch('/api/photos')
    if (!res.ok) return []
    const json = (await res.json()) as { photos?: AlbumPhoto[] }
    return json.photos ?? []
  } catch {
    return []
  }
}

async function loadLive(): Promise<AlbumPhoto[]> {
  const viaProxy = await loadProxy()
  if (viaProxy.length > 0) return viaProxy
  return fetchAlbum()
}

/** Live membership wins; local files win for photos we already hold. */
function merge(snapshot: AlbumPhoto[], live: AlbumPhoto[]): AlbumPhoto[] {
  if (live.length === 0) return snapshot
  const local = new Map(snapshot.map((p) => [p.guid, p]))
  return live.map((p) => local.get(p.guid) ?? p)
}

/** Every album photo we can see, newest first. [] until something answers. */
export function useAlbum(): AlbumPhoto[] {
  const [photos, setPhotos] = useState<AlbumPhoto[]>(
    () => liveCache ?? snapshotCache ?? []
  )

  useEffect(() => {
    let alive = true

    if (snapshotCache === null) {
      loadSnapshot().then((found) => {
        snapshotCache = found
        // Don't undo a live result that beat the snapshot back.
        if (alive && liveCache === null && found.length > 0) setPhotos(found)
      })
    }

    if (liveCache === null) {
      livePromise ??= loadLive()
      livePromise.then((found) => {
        if (found.length > 0) liveCache = found
        const best = merge(snapshotCache ?? [], found)
        if (alive && best.length > 0) setPhotos(best)
      })
    }

    return () => {
      alive = false
    }
  }, [])

  return photos
}
