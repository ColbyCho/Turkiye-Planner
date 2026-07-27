'use client'

import { useEffect, useRef, useState } from 'react'
import { useProfile } from '@/lib/useProfile'
import { firstEmoji, useReactions } from '@/lib/useReactions'

/** Hand-drawn smiley with a “+”, à la the sketch — the add-reaction button. */
function SmileyPlus() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="13.5" r="8" />
        <path d="M6.6 11.3v1.6M13.4 11.3v1.6" />
        <path d="M6.6 15.4c1 1.6 2.3 2.4 3.7 2.4s2.7-.8 3.7-2.4" />
        <path d="M19 3.2v5M16.5 5.7h5" />
      </g>
    </svg>
  )
}

function EmojiPopover({
  onPick,
  onClose,
}: {
  onPick: (emoji: string) => void
  onClose: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (raw: string) => {
    const emoji = firstEmoji(raw)
    if (emoji) onPick(emoji)
  }

  return (
    <>
      {/* click-away */}
      <div className="fixed inset-0 z-[70]" onClick={onClose} aria-hidden />
      <div className="absolute bottom-full left-0 z-[71] mb-1 w-40 rounded-md border border-rule bg-paper-card p-2 shadow-page">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            submit(e.target.value) // auto-add as soon as an emoji lands
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit(value)
          }}
          placeholder="type an emoji 🎉"
          aria-label="Type an emoji to react"
          className="w-full rounded border border-rule bg-paper px-2 py-1.5 text-base focus:border-spice focus:outline-none"
        />
        <p className="mt-1 px-0.5 text-[10px] leading-tight text-ink/40">
          Use your keyboard’s emoji key
        </p>
      </div>
    </>
  )
}

export default function Reactions({ activityId }: { activityId: string }) {
  const { me, profiles, openGate } = useProfile()
  const { getFor, hasMine, toggle } = useReactions()
  const [adding, setAdding] = useState(false)

  const reactions = getFor(activityId)
  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.name ?? id

  const react = (emoji: string) => {
    if (!me) {
      openGate()
      return
    }
    toggle(activityId, emoji, me.id)
  }

  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label="Reactions"
    >
      {reactions.map((r) => {
        const mine = me ? hasMine(activityId, r.emoji, me.id) : false
        return (
          <button
            key={r.emoji}
            type="button"
            onClick={() => react(r.emoji)}
            title={r.profileIds.map(nameOf).join(', ')}
            className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs leading-none shadow-block transition ${
              mine
                ? 'border-spice bg-spice/15 text-spice-dark'
                : 'border-rule bg-paper-card text-ink/70 hover:border-spice/60'
            }`}
          >
            <span className="text-sm leading-none">{r.emoji}</span>
            <span className="font-semibold tabular-nums">{r.count}</span>
          </button>
        )
      })}

      <div className="relative">
        <button
          type="button"
          onClick={() => (me ? setAdding((v) => !v) : openGate())}
          aria-label="Add a reaction"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-rule bg-paper-card p-1 text-spice shadow-block transition hover:border-spice hover:bg-spice/10"
        >
          <SmileyPlus />
        </button>
        {adding && (
          <EmojiPopover
            onPick={(emoji) => {
              react(emoji)
              setAdding(false)
            }}
            onClose={() => setAdding(false)}
          />
        )}
      </div>
    </div>
  )
}
