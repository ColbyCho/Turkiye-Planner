'use client'

import { useRef, useState } from 'react'
import { FUN_QUESTIONS, type CrewName } from '@/data/crew'
import type { CrewProfile } from '@/lib/types'
import { storeImage } from '@/lib/db/media'
import { avatarColor } from '@/lib/crew'
import { asset } from '@/lib/asset'

const INPUT =
  'w-full rounded border border-rule bg-paper px-2 py-1.5 text-sm text-ink placeholder:text-ink/30 focus:border-cobalt focus:outline-none'

interface ProfileEditorProps {
  name: CrewName
  profile: CrewProfile
  onSave: (profile: CrewProfile) => Promise<void>
  onCancel: () => void
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink/45">
        {label}
      </span>
      {children}
      {hint && <span className="mt-0.5 block text-[10px] text-ink/35">{hint}</span>}
    </label>
  )
}

export default function ProfileEditor({
  name,
  profile,
  onSave,
  onCancel,
}: ProfileEditorProps) {
  const [draft, setDraft] = useState<CrewProfile>(profile)
  const [saving, setSaving] = useState(false)
  const [busyPhoto, setBusyPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (patch: Partial<CrewProfile>) =>
    setDraft((prev) => ({ ...prev, ...patch }))

  const setFun = (id: string, value: string) =>
    setDraft((prev) => ({ ...prev, fun: { ...prev.fun, [id]: value } }))

  async function pickPhoto(file: File) {
    setError(null)
    setBusyPhoto(true)
    try {
      // 800px is plenty for a card that renders at ~200px, even on a retina
      // screen, and keeps the local-mode data URL small.
      const url = await storeImage(file, `profiles/${name}-${Date.now()}.jpg`, 800)
      set({ photo: url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that photo.')
    } finally {
      setBusyPhoto(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSave(draft)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      {/* Photo */}
      <div className="flex items-center gap-3">
        {draft.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset(draft.photo)}
            alt=""
            className="h-16 w-16 shrink-0 rounded object-cover shadow-note"
          />
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded font-display text-2xl font-semibold text-paper"
            style={{ backgroundColor: avatarColor(name) }}
            aria-hidden
          >
            {name[0]}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busyPhoto}
            className="rounded border border-cobalt px-2.5 py-1 text-xs font-medium text-cobalt transition hover:bg-cobalt hover:text-paper disabled:opacity-50"
          >
            {busyPhoto ? 'Adding…' : draft.photo ? 'Change photo' : 'Add a photo'}
          </button>
          {draft.photo && (
            <button
              type="button"
              onClick={() => set({ photo: undefined })}
              className="rounded border border-rule px-2.5 py-1 text-xs text-ink/60 transition hover:border-spice hover:text-spice"
            >
              Remove
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) pickPhoto(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title">
          <input
            className={INPUT}
            value={draft.title ?? ''}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Chief Vibes Officer"
          />
        </Field>
        <Field label="Home">
          <input
            className={INPUT}
            value={draft.homeCity ?? ''}
            onChange={(e) => set({ homeCity: e.target.value })}
            placeholder="Boston"
          />
        </Field>
      </div>

      <Field label="Caption under your photo">
        <input
          className={INPUT}
          value={draft.quote ?? ''}
          onChange={(e) => set({ quote: e.target.value })}
          placeholder="a line in your own words"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Known for">
          <input
            className={INPUT}
            value={draft.knownFor ?? ''}
            onChange={(e) => set({ knownFor: e.target.value })}
            placeholder="losing sunglasses"
          />
        </Field>
        <Field label="Eats" hint="allergies and hard nos — the useful kind">
          <input
            className={INPUT}
            value={draft.dietary ?? ''}
            onChange={(e) => set({ dietary: e.target.value })}
            placeholder="no shellfish"
          />
        </Field>
      </div>

      <Field label="Fun fact">
        <input
          className={INPUT}
          value={draft.funFact ?? ''}
          onChange={(e) => set({ funFact: e.target.value })}
          placeholder="something nobody here knows"
        />
      </Field>

      {/* Logistics */}
      <fieldset className="rounded border border-dashed border-rule p-3">
        <legend className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-ink/45">
          Logistics
        </legend>
        <div className="space-y-3">
          <Field label="Room" hint="so nobody has to ask who's where">
            <input
              className={INPUT}
              value={draft.room ?? ''}
              onChange={(e) => set({ room: e.target.value })}
              placeholder="Bodrum villa · upstairs twin (with Bob)"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Seat out">
              <input
                className={INPUT}
                value={draft.seatOut ?? ''}
                onChange={(e) => set({ seatOut: e.target.value })}
                placeholder="TK82 · 34K"
              />
            </Field>
            <Field label="Seat home">
              <input
                className={INPUT}
                value={draft.seatHome ?? ''}
                onChange={(e) => set({ seatHome: e.target.value })}
                placeholder="TK81 · 12A"
              />
            </Field>
          </div>
        </div>
      </fieldset>

      {/* The questionnaire */}
      <fieldset className="rounded border border-dashed border-rule p-3">
        <legend className="px-1 font-hand text-xl text-spice">
          The fun part
        </legend>
        <div className="space-y-3">
          {FUN_QUESTIONS.map((q) => (
            <Field key={q.id} label={`${q.emoji} ${q.label}`}>
              <input
                className={INPUT}
                value={draft.fun?.[q.id] ?? ''}
                onChange={(e) => setFun(q.id, e.target.value)}
                placeholder={q.placeholder}
              />
            </Field>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="rounded border border-spice/50 bg-spice/10 px-3 py-2 text-xs text-spice-dark">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-rule pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-spice px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-spice-dark disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-rule px-3 py-1.5 text-sm text-ink/70 transition hover:border-ink/40 hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
