'use client'

import { useEffect, useState } from 'react'
import { useProfile } from '@/lib/useProfile'
import Avatar from './Avatar'
import ProfileEditor from './ProfileEditor'

/** Masthead chip: shows who you're signed in as; tap to edit or switch. */
export default function ProfileBadge() {
  const { me, openGate, clearMe } = useProfile()
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!editing) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setEditing(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing])

  if (!me) {
    return (
      <button
        type="button"
        onClick={openGate}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper-card px-3 py-1 text-xs font-medium text-ink/60 shadow-block transition hover:border-spice hover:text-spice"
      >
        Sign in
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Your profile"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper-card py-1 pl-1 pr-3 text-xs font-medium text-ink/70 shadow-block transition hover:border-spice"
      >
        <Avatar profile={me} size={22} />
        <span>{me.name}</span>
      </button>

      {editing && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
          onClick={() => setEditing(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Edit your profile"
        >
          <div
            className="relative w-full max-w-sm rounded-md border border-rule bg-paper-card p-6 shadow-page sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-ink/50 transition hover:bg-ink/10 hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>
            <p className="mb-5 text-center font-hand text-2xl text-spice">Your profile</p>
            <ProfileEditor
              profile={me}
              saveLabel="Save"
              onSaved={() => setEditing(false)}
            />
            <button
              type="button"
              onClick={() => {
                clearMe()
                setEditing(false)
              }}
              className="mt-4 w-full text-center text-xs text-ink/40 underline underline-offset-2 hover:text-spice"
            >
              Not you? Switch user
            </button>
          </div>
        </div>
      )}
    </>
  )
}
