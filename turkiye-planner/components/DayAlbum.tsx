'use client'

import { useMemo, useRef, useState } from 'react'
import type { DayPlan } from '@/lib/types'
import { newId, useTable } from '@/lib/db/useTable'
import { storeImage } from '@/lib/db/media'
import { useIdentity } from './IdentityProvider'
import Disclosure from './Disclosure'
import Avatar from './Avatar'

/** Rotations so the grid reads like a pile of prints. */
const ROTATIONS = ['-rotate-1', 'rotate-1', 'rotate-2', '-rotate-2']

export default function DayAlbum({ day }: { day: DayPlan }) {
  const { me, requireMe } = useIdentity()
  const photos = useTable('photos')
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captioning, setCaptioning] = useState<string | null>(null)

  const dayPhotos = useMemo(
    () =>
      photos.rows
        .filter((p) => p.day_date === day.date)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [photos.rows, day.date]
  )

  async function addFiles(files: File[], author: string) {
    setBusy(true)
    setError(null)
    try {
      for (const file of files) {
        const id = newId()
        // 1600px keeps a phone photo sharp on a laptop without shipping 8 MB.
        const url = await storeImage(file, `days/${day.date}/${id}.jpg`, 1600)
        await photos.upsert({
          id,
          author,
          day_date: day.date,
          url,
          caption: null,
          created_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that photo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Disclosure
      title="The album"
      hint={dayPhotos.length ? `${dayPhotos.length} photo${dayPhotos.length > 1 ? 's' : ''}` : 'no photos yet'}
    >
      {dayPhotos.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {dayPhotos.map((photo, i) => (
            <figure
              key={photo.id}
              className={`w-32 bg-white p-1.5 pb-2 shadow-note transition-transform duration-300 hover:rotate-0 sm:w-40 ${
                ROTATIONS[i % ROTATIONS.length]
              }`}
            >
              <a href={photo.url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption ?? `Photo by ${photo.author}`}
                  className="aspect-square w-full object-cover"
                />
              </a>
              <figcaption className="mt-1 text-center">
                {captioning === photo.id ? (
                  <input
                    autoFocus
                    defaultValue={photo.caption ?? ''}
                    onBlur={(e) => {
                      photos
                        .upsert({ ...photo, caption: e.target.value.trim() || null })
                        .catch(() => setError('Could not save that caption.'))
                      setCaptioning(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                      if (e.key === 'Escape') setCaptioning(null)
                    }}
                    className="w-full rounded border border-rule px-1 py-0.5 text-center font-hand text-lg focus:outline-none"
                    placeholder="caption…"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => photo.author === me && setCaptioning(photo.id)}
                    className={`block w-full truncate font-hand text-lg leading-tight text-ink/70 ${
                      photo.author === me ? 'hover:text-ink' : 'cursor-default'
                    }`}
                    title={photo.caption ?? undefined}
                  >
                    {photo.caption ?? (photo.author === me ? '＋ caption' : ' ')}
                  </button>
                )}
                <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-ink/40">
                  <Avatar name={photo.author} size={12} />
                  {photo.author}
                  {photo.author === me && (
                    <button
                      type="button"
                      onClick={() => photos.remove(photo)}
                      className="ml-1 text-ink/30 transition hover:text-spice"
                      aria-label="Delete photo"
                    >
                      ✕
                    </button>
                  )}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={() =>
          requireMe('So the photos are credited to someone.', () => fileRef.current?.click())
        }
        className="rounded border border-dashed border-turquoise-dark/70 px-3 py-1.5 text-sm font-medium text-turquoise-dark transition hover:bg-turquoise/10 disabled:opacity-50"
      >
        {busy ? 'Adding…' : '＋ Add photos from this day'}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length && me) addFiles(files, me)
          e.target.value = ''
        }}
      />

      {error && <p className="mt-2 text-[11px] text-spice">{error}</p>}

      {photos.mode === 'local' && (
        <p className="mt-3 text-[10px] leading-relaxed text-ink/35">
          Photos stay on this device (and eat its storage) until the database is
          connected — see docs/BACKEND.md.
        </p>
      )}
    </Disclosure>
  )
}
