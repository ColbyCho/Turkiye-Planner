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
const PER_SUBJECT = 6

// Wikimedia asks for a User-Agent that identifies the project and gives them
// somewhere to complain, and answers 429 to anything that comes at it in a
// tight loop. So: identify ourselves, and go slowly.
const UA = 'turkiye-planner/1.0 (https://github.com/ColbyCho/Turkiye-Planner) trip itinerary site'
const PAUSE_MS = 1200

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** GET with Wikimedia's manners: identified, paced, and patient about 429s. */
async function polite(url: string, attempt = 0): Promise<Response | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (res.status === 429 && attempt < 5) {
      const wait = Number(res.headers.get('retry-after') ?? 0) * 1000 || 2000 * 2 ** attempt
      console.log(`  429 — waiting ${Math.round(wait / 1000)}s`)
      await sleep(wait)
      return polite(url, attempt + 1)
    }
    if (!res.ok) {
      console.log(`  HTTP ${res.status}`)
      return null
    }
    return res
  } catch (err) {
    console.log(`  request threw: ${String(err).slice(0, 100)}`)
    return null
  }
}

/** What each activity wants a picture of. */
const SUBJECTS: { slug: string; query: string }[] = [
  // The queries that actually produced the photographs in public/sights/.
  // Commons search does better with the plain name of a thing than with a
  // descriptive phrase, and it still needs a human eye afterwards: "börek"
  // returns a Czech village called Bôrka, "meze" the French town of Mèze,
  // "meyhane" a Serbian mehana, and "nargile" a hookah in Jaipur.
  { slug: 'spice-bazaar', query: 'Spice Bazaar Istanbul interior' },
  { slug: 'grand-bazaar', query: 'Grand Bazaar Istanbul interior' },
  { slug: 'topkapi', query: 'Topkapı Palace gate' },
  { slug: 'kadikoy', query: 'Kadıköy Istanbul street market' },
  { slug: 'ferry', query: 'Istanbul ferry Bosphorus' },
  { slug: 'bosphorus-dusk', query: 'Bosphorus Istanbul sunset' },
  { slug: 'galata', query: 'Galata Tower Istanbul' },
  { slug: 'karakoy', query: 'Karaköy Istanbul' },
  { slug: 'hammam', query: 'hamam interior' },
  { slug: 'nargile-cafe', query: 'Çorlulu Ali Paşa Medresesi' },
  { slug: 'stadium', query: 'Başakşehir Fatih Terim Stadium' },
  { slug: 'ephesus', query: 'Library of Celsus Ephesus' },
  { slug: 'selcuk', query: 'Selçuk İsa Bey Mosque' },
  { slug: 'mausoleum', query: 'Mausoleum at Halicarnassus Bodrum ruins' },
  { slug: 'bodrum-castle', query: 'Bodrum Castle Saint Peter' },
  { slug: 'castle-night', query: 'Bodrum castle night' },
  { slug: 'windmills', query: 'Bodrum windmills' },
  { slug: 'gulet', query: 'gulet' },
  { slug: 'marina', query: 'Bodrum marina' },
  { slug: 'bodrum-harbour', query: 'Bodrum harbour' },
  { slug: 'bodrum-night', query: 'Bodrum night' },
  { slug: 'bitez', query: 'Bitez Bodrum' },
  { slug: 'beach', query: 'Bodrum beach' },
  { slug: 'kahvalti', query: 'Turkish breakfast' },
  { slug: 'serpme', query: 'serpme kahvaltı' },
  { slug: 'borek', query: 'su böreği' },
  { slug: 'simit', query: 'simit Istanbul' },
  { slug: 'menemen', query: 'menemen Turkish eggs' },
  { slug: 'kofte', query: 'Turkish köfte meatballs plate' },
  { slug: 'durum', query: 'dürüm' },
  { slug: 'pide', query: 'kıymalı pide' },
  { slug: 'gozleme', query: 'gözleme' },
  { slug: 'meze', query: 'meze' },
  { slug: 'ciya', query: 'lokanta Turkish food' },
  { slug: 'cokertme', query: 'çökertme kebabı' },
  { slug: 'levrek', query: 'ızgara levrek grilled sea bass' },
  { slug: 'fish', query: 'balık ekmek' },
  { slug: 'kokorec', query: 'kokoreç Turkish street food' },
  { slug: 'lokum', query: 'Turkish delight lokum shop' },
  { slug: 'raki', query: 'rakı' },
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
    `${API}?action=query&format=json` +
    `&generator=search&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrnamespace=6&gsrlimit=${limit * 3}` +
    `&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=${WIDTH}`
  const res = await polite(url)
  if (!res) return []
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
  const res = await polite(url)
  if (!res) return false
  try {
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
    await sleep(PAUSE_MS)
    const found = await search(query, PER_SUBJECT)
    if (found.length === 0) {
      console.log('  nothing usable')
      continue
    }
    for (let i = 0; i < found.length; i++) {
      const c = found[i]
      const name = `${slug}-${i + 1}.jpg`
      await sleep(PAUSE_MS)
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
