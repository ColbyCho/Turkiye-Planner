'use client'

import { useRef, useState } from 'react'
import type { Profile } from '@/lib/supabase'
import { useProfile } from '@/lib/useProfile'
import Avatar from './Avatar'

/**
 * Edit a profile's name + photo. Used both in the first-run gate and when
 * editing later from the masthead badge.
 */
export default function ProfileEditor({
  profile,
  onSaved,
  onBack,
  backLabel = 'Back',
  saveLabel = 'Save',
}: {
  profile: Profile
  onSaved: () => void
  onBack?: () => void
  backLabel?: string
  saveLabel?: string
}) {
  const { saveProfile, uploadAvatar } = useProfile()
  const [name, setName] = useState(profile.name)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const preview: Profile = { ...profile, name: name || profile.name, avatar_url: avatarUrl }

  const onPick = async (file: File | undefined) => {
    if (!file) return
    setErr(null)
    setBusy(true)
    try {
      const url = await uploadAvatar(profile.id, file)
      setAvatarUrl(url)
    } catch {
      setErr('Couldn’t upload that photo — try again.')
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    setErr(null)
    setBusy(true)
    try {
      await saveProfile(profile.id, { name: name.trim() || profile.name, avatar_url: avatarUrl })
      onSaved()
    } catch {
      setErr('Couldn’t save — check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <div className="text-center">
      <div className="flex flex-col items-center gap-3">
        <Avatar profile={preview} size={88} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="rounded border border-cobalt bg-cobalt/10 px-3 py-1.5 text-sm font-medium text-cobalt transition hover:bg-cobalt hover:text-paper disabled:opacity-40"
          >
            {avatarUrl ? 'Change photo' : 'Add a photo'}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl(null)}
              disabled={busy}
              className="rounded border border-rule px-3 py-1.5 text-sm text-ink/60 transition hover:bg-ink/5 disabled:opacity-40"
            >
              Remove
            </button>
          )}
        </div>
        {/* accept camera or library on mobile */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </div>

      <label className="mt-5 block text-left">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/50">
          Display name
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          className="mt-1 w-full rounded border border-rule bg-paper px-3 py-2 text-lg text-ink focus:border-spice focus:outline-none focus:ring-1 focus:ring-spice"
        />
      </label>

      {err && <p className="mt-3 text-sm text-spice">{err}</p>}
      {busy && <p className="mt-3 text-sm text-ink/50">Working…</p>}

      <div className="mt-6 flex gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            className="rounded border border-rule px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5 disabled:opacity-40"
          >
            {backLabel}
          </button>
        )}
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="flex-1 rounded bg-spice px-4 py-2 text-sm font-semibold text-paper transition hover:bg-spice-dark disabled:opacity-40"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}
