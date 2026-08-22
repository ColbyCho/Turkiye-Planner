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
import { ALBUM_TOKEN, fetchAlbum, type AlbumPhoto } from '../lib/icloud'

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

/** Ask Apple directly what it says, so a CI log can show why a run came back empty. */
async function diagnose(token: string): Promise<void> {
  for (const host of ['p01-sharedstreams.icloud.com', 'p23-sharedstreams.icloud.com']) {
    const url = `https://${host}/${token}/sharedstreams/webstream`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ streamCtag: null }),
      })
      const text = await res.text()
      console.log(`  ${host} → HTTP ${res.status}`)
      console.log(`    ${text.slice(0, 600)}`)
    } catch (err) {
      console.log(`  ${host} → threw: ${String(err).slice(0, 200)}`)
    }
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
    console.log('No photos came back. Asking Apple directly for the reason:')
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
