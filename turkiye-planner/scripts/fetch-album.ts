/**
 * Snapshot the crew's iCloud shared album into public/album/.
 *
 * Apple's image URLs are signed and expire within the hour, so a durable copy
 * has to be the bytes, not the link. This downloads each photo once, keyed by
 * its stable photo GUID, prunes anything that left the album, and writes an
 * index the planner reads at runtime.
 *
 *   npm run album            # snapshot into public/album/
 *
 * Runs in CI (.github/workflows/album.yml) on a schedule, so photos taken on
 * the trip land on their day's page without anyone touching the repo.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ALBUM_TOKEN, fetchAlbum, resolveStream, type AlbumPhoto } from '../lib/icloud'

const OUT_DIR = join(process.cwd(), 'public', 'album')
const INDEX = join(OUT_DIR, 'index.json')
const MAX_PHOTOS = 120
const TARGET_WIDTH = 1024

export interface AlbumIndexEntry {
  guid: string
  /** Path under public/, e.g. '/album/abc123.jpg'. */
  file: string
  caption: string
  width: number
  height: number
  takenAt: string
  day: string
}

export interface AlbumIndex {
  updatedAt: string
  photos: AlbumIndexEntry[]
}

/**
 * Say what Apple actually returned, so a CI log explains an empty run instead
 * of just reporting one.
 */
async function diagnose(token: string): Promise<void> {
  const resolved = await resolveStream(token)
  if (!resolved) {
    console.log('  Could not resolve the album host — the token may be wrong or revoked.')
    return
  }
  const { host, stream } = resolved
  console.log(`  Reached "${String(stream.streamName ?? '?')}" on ${host}`)
  console.log(`  Response keys: ${Object.keys(stream).join(', ')}`)

  const photos = stream.photos
  if (!Array.isArray(photos)) {
    console.log(`  No "photos" array. itemsReturned=${String(stream.itemsReturned)}`)
    return
  }
  if (photos.length === 0) {
    console.log('  The album is reachable and empty — nobody has added a photo yet.')
    return
  }
  console.log(`  photos: ${photos.length}`)
  const first = photos[0] as Record<string, unknown> | undefined
  if (!first) return
  console.log(`  First photo keys: ${Object.keys(first).join(', ')}`)
  const derivatives = first.derivatives as Record<string, unknown> | undefined
  if (derivatives) {
    console.log(`  Derivative sizes: ${Object.keys(derivatives).join(', ')}`)
    const one = Object.values(derivatives)[0] as Record<string, unknown> | undefined
    if (one) console.log(`  Derivative keys: ${Object.keys(one).join(', ')}`)
  }
}

async function download(photo: AlbumPhoto, file: string): Promise<boolean> {
  try {
    const res = await fetch(photo.url)
    if (!res.ok) {
      console.log(`  ✗ ${photo.guid}: HTTP ${res.status}`)
      return false
    }
    await writeFile(file, Buffer.from(await res.arrayBuffer()))
    return true
  } catch (err) {
    console.log(`  ✗ ${photo.guid}: ${String(err).slice(0, 120)}`)
    return false
  }
}

async function main() {
  const token = process.env.ALBUM_TOKEN || ALBUM_TOKEN
  console.log(`Reading shared album ${token}…`)

  const photos = await fetchAlbum({ token, maxPhotos: MAX_PHOTOS, targetWidth: TARGET_WIDTH })
  if (photos.length === 0) {
    console.log('No photos to snapshot. Checking what Apple says:')
    await diagnose(token)
    // An empty album is not a build failure — the planner falls back to its
    // own postcards, and a later run can pick the photos up.
    console.log('Leaving any existing snapshot in place.')
    return
  }

  console.log(`Found ${photos.length} photos.`)
  await mkdir(OUT_DIR, { recursive: true })

  // Anything already downloaded stays put — GUIDs are stable, so a rerun only
  // pays for what's new.
  const existing = (await readdir(OUT_DIR).catch(() => [])).filter((f) =>
    f.endsWith('.jpg')
  )
  const onDisk = new Set(existing)

  const entries: AlbumIndexEntry[] = []
  let fetched = 0
  for (const photo of photos) {
    const name = `${photo.guid}.jpg`
    const file = join(OUT_DIR, name)
    if (!onDisk.has(name)) {
      if (!(await download(photo, file))) continue
      fetched++
    }
    entries.push({
      guid: photo.guid,
      file: `/album/${name}`,
      caption: photo.caption,
      width: photo.width,
      height: photo.height,
      takenAt: photo.takenAt,
      day: photo.day,
    })
  }

  // Drop files for photos that left the album.
  const keep = new Set(entries.map((e) => `${e.guid}.jpg`))
  let pruned = 0
  for (const name of existing) {
    if (!keep.has(name)) {
      await rm(join(OUT_DIR, name), { force: true })
      pruned++
    }
  }

  const index: AlbumIndex = { updatedAt: new Date().toISOString(), photos: entries }
  const before = await readFile(INDEX, 'utf8').catch(() => '')
  const next = `${JSON.stringify(index, null, 2)}\n`

  // Compare on the photos alone; a fresh updatedAt every hour would churn the
  // repo with commits that change nothing anyone can see.
  const same =
    before && JSON.stringify(JSON.parse(before).photos) === JSON.stringify(index.photos)
  if (same) {
    console.log(`No change — ${entries.length} photos already snapshotted.`)
    return
  }

  await writeFile(INDEX, next)
  const byDay = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.day] = (acc[e.day] ?? 0) + 1
    return acc
  }, {})
  console.log(`Wrote ${entries.length} photos (+${fetched} new, -${pruned} gone).`)
  console.log('By day:', Object.entries(byDay).sort().map(([d, n]) => `${d}:${n}`).join(' '))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
