/**
 * Pull candidate photos for the activity modals from Wikimedia Commons.
 *
 *   npm run photos     # candidates into public/sights/_candidates/
 *
 * Commons search is a starting point, not an answer: it happily returns a
 * museum's catalogue scan when you wanted the building. So this fetches
 * several candidates per subject to actually look at before any of them ends
 * up in front of the crew.
 *
 * Every file carries its author and licence out of Commons' extmetadata, so
 * the credits under each photo stay accurate.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const CANDIDATES = join(process.cwd(), 'public', 'sights', '_candidates')
const WIDTH = 900
const PER_SUBJECT = 4

/** What each activity wants a picture of. */
const SUBJECTS: { slug: string; query: string }[] = [
  // Commons search does better with the plain name of a thing than with a
  // descriptive phrase — these are the queries that actually returned the
  // photographs now in public/sights/.
  { slug: 'blue-mosque', query: 'Sultan Ahmed Mosque Istanbul exterior' },
  { slug: 'grand-bazaar', query: 'Grand Bazaar Istanbul interior' },
  { slug: 'topkapi', query: 'Topkapı Palace gate' },
  { slug: 'kadikoy', query: 'Kadıköy Istanbul street market' },
  { slug: 'ferry', query: 'Istanbul ferry Bosphorus' },
  { slug: 'galata', query: 'Galata Tower Istanbul' },
  { slug: 'hammam', query: 'hamam interior' },
  { slug: 'ephesus', query: 'Library of Celsus Ephesus' },
  { slug: 'mausoleum', query: 'Mausoleum at Halicarnassus Bodrum ruins' },
  { slug: 'bodrum-castle', query: 'Bodrum Castle Saint Peter' },
  { slug: 'windmills', query: 'Bodrum windmills' },
  { slug: 'gulet', query: 'gulet' },
  { slug: 'marina', query: 'Bodrum marina' },
  { slug: 'beach', query: 'Bodrum beach' },
  { slug: 'kahvalti', query: 'Turkish breakfast' },
  { slug: 'kofte', query: 'Turkish köfte meatballs plate' },
  { slug: 'durum', query: 'dürüm' },
  { slug: 'pide', query: 'kıymalı pide' },
  { slug: 'meze', query: 'meze' },
  { slug: 'menemen', query: 'menemen Turkish eggs' },
  { slug: 'kokorec', query: 'kokoreç Turkish street food' },
  { slug: 'fish', query: 'balık ekmek' },
  { slug: 'lokum', query: 'Turkish delight lokum shop' },
  { slug: 'nargile', query: 'nargile' },
  { slug: 'cay', query: 'Turkish tea çay glass' },
]

interface Candidate {
  slug: string
  index: number
  file: string
  title: string
  descriptionUrl: string
  artist: string
  license: string
  width: number
  height: number
  thumb: string
}

const API = 'https://commons.wikimedia.org/w/api.php'

/** Commons hands back HTML in extmetadata; the credit line wants plain text. */
function plain(html: string | undefined): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

interface ImageInfo {
  thumburl?: string
  descriptionurl?: string
  width?: number
  height?: number
  extmetadata?: Record<string, { value?: string }>
}

async function search(query: string, limit: number): Promise<Candidate[]> {
  const url =
    `${API}?action=query&format=json&origin=*` +
    `&generator=search&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrnamespace=6&gsrlimit=${limit * 3}` +
    `&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=${WIDTH}`
  const res = await fetch(url, { headers: { 'User-Agent': 'turkiye-planner/1.0 (trip site)' } })
  if (!res.ok) {
    console.log(`  search failed: HTTP ${res.status}`)
    return []
  }
  const json = (await res.json()) as {
    query?: { pages?: Record<string, { title?: string; imageinfo?: ImageInfo[] }> }
  }
  const pages = Object.values(json.query?.pages ?? {})

  const out: Candidate[] = []
  for (const page of pages) {
    const info = page.imageinfo?.[0]
    const title = page.title ?? ''
    if (!info?.thumburl) continue
    // Photographs only — Commons is full of maps, plans, and scanned prints.
    if (!/\.(jpe?g)$/i.test(title)) continue
    if ((info.width ?? 0) < 900) continue
    const meta = info.extmetadata ?? {}
    out.push({
      slug: '',
      index: 0,
      file: '',
      title: title.replace(/^File:/, ''),
      descriptionUrl: info.descriptionurl ?? '',
      artist: plain(meta.Artist?.value),
      license: plain(meta.LicenseShortName?.value),
      width: info.width ?? 0,
      height: info.height ?? 0,
      thumb: info.thumburl,
    })
    if (out.length >= limit) break
  }
  return out
}

async function download(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'turkiye-planner/1.0 (trip site)' },
    })
    if (!res.ok) return false
    await writeFile(dest, Buffer.from(await res.arrayBuffer()))
    return true
  } catch {
    return false
  }
}

async function main() {
  await mkdir(CANDIDATES, { recursive: true })
  const manifest: Candidate[] = []

  for (const { slug, query } of SUBJECTS) {
    console.log(`${slug}: "${query}"`)
    const found = await search(query, PER_SUBJECT)
    if (found.length === 0) {
      console.log('  nothing usable')
      continue
    }
    for (let i = 0; i < found.length; i++) {
      const c = found[i]
      const name = `${slug}-${i + 1}.jpg`
      if (!(await download(c.thumb, join(CANDIDATES, name)))) {
        console.log(`  ✗ ${name}`)
        continue
      }
      manifest.push({ ...c, slug, index: i + 1, file: name })
      console.log(`  ${name}  ${c.width}×${c.height}  ${c.title}`)
    }
  }

  await writeFile(
    join(CANDIDATES, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  )
  console.log(`\n${manifest.length} candidates across ${SUBJECTS.length} subjects.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
