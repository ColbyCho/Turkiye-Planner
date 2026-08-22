import { NextResponse } from 'next/server'
import { fetchAlbum } from '@/lib/icloud'

// Server-side reader for the shared album, for browsers that won't let the
// page talk to Apple directly. Same-origin, so CORS never enters into it.
// Signed URLs live about an hour; the short cache keeps us well inside that
// while still sparing Apple a round trip per visitor.
export const dynamic = 'force-dynamic'

export async function GET() {
  const photos = await fetchAlbum()
  return NextResponse.json(
    { photos },
    { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=900' } }
  )
}
