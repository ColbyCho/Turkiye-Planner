'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useProfile } from '@/lib/useProfile'
import { firstEmoji, useReactions, type EmojiAgg } from '@/lib/useReactions'
import Avatar from './Avatar'

// Custom "emoji" for Derin — stored as this token, rendered as a dedicated image.
export const DERIN_REACTION = ':derin:'
const QUICK: string[] = ['👍', '🔥', '😂', '👀', DERIN_REACTION]

/** Stays and transport don't take reactions — same rule as the grid overlay. */
export function isReactable(category: string): boolean {
  return category !== 'stay' && category !== 'transport'
}

/** Render a reaction as its emoji, or Derin's dedicated image for the token. */
function ReactionGlyph({
  emoji,
  size = 14,
  className = 'text-sm leading-none',
}: {
  emoji: string
  size?: number
  className?: string
}) {
  if (emoji === DERIN_REACTION) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/reactions/derin.jpg"
        alt="Derin"
        draggable={false}
        style={{ width: size, height: size }}
        className="pointer-events-none shrink-0 rounded-full object-cover"
      />
    )
  }
  return <span className={className}>{emoji}</span>
}

/** A reaction pill: tap toggles your reaction, press-and-hold shows who reacted. */
function ReactionPill({
  r,
  mine,
  title,
  onReact,
  onShowWho,
}: {
  r: EmojiAgg
  mine: boolean
  title: string
  onReact: () => void
  onShowWho: () => void
}) {
  const timer = useRef<number | null>(null)
  const fired = useRef(false)

  const start = () => {
    fired.current = false
    timer.current = window.setTimeout(() => {
      fired.current = true
      onShowWho()
      // Swallow the click that fires when the press is released, so it
      // doesn't land on the freshly-opened sheet backdrop and dismiss it.
      const swallow = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()
      }
      document.addEventListener('click', swallow, { capture: true, once: true })
      window.setTimeout(() => document.removeEventListener('click', swallow, true), 700)
    }, 450)
  }
  const cancel = () => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onClick={() => {
        // suppress the click that follows a long-press
        if (fired.current) {
          fired.current = false
          return
        }
        onReact()
      }}
      onContextMenu={(e) => e.preventDefault()}
      title={title}
      className={`flex h-6 select-none items-center gap-0.5 rounded-full border bg-white px-2 text-xs leading-none shadow-block transition [-webkit-touch-callout:none] ${
        mine ? 'border-spice text-spice-dark' : 'border-spice/40 text-ink/80 hover:border-spice/70'
      }`}
    >
      <ReactionGlyph emoji={r.emoji} size={16} />
      <span className="font-semibold tabular-nums">{r.count}</span>
    </button>
  )
}

/** GroupMe-style bottom half-sheet listing who reacted with one emoji. */
function ReactionSheet({
  emoji,
  reactorIds,
  onClose,
}: {
  emoji: string
  reactorIds: string[]
  onClose: () => void
}) {
  const { profiles } = useProfile()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  if (typeof document === 'undefined') return null

  // Portal to <body> so the sheet escapes the reaction layer's stacking
  // context/transforms: the backdrop then covers the true viewport and the
  // sheet sits above everything (toolbar, add buttons, etc.).
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Who reacted"
    >
      <div
        className="max-h-[60vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-rule bg-paper-card px-5 pt-3 shadow-page"
        style={{
          animation: 'sheetUp 0.22s ease-out',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink/15" aria-hidden />
        <div className="flex items-center gap-2 border-b border-rule pb-3">
          <ReactionGlyph emoji={emoji} size={26} className="text-2xl leading-none" />
          <span className="text-sm font-semibold text-ink/70">
            {reactorIds.length} {reactorIds.length === 1 ? 'reaction' : 'reactions'}
          </span>
        </div>
        <ul className="mt-3 space-y-1">
          {reactorIds.map((id) => {
            const p = profiles.find((x) => x.id === id)
            if (!p) return null
            return (
              <li key={id} className="flex items-center gap-3 rounded-md px-1 py-1.5">
                <Avatar profile={p} size={36} />
                <span className="text-base text-ink/90">{p.name}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>,
    document.body
  )
}

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
    // Don't auto-focus: the quick picks are the primary action, and the OS
    // keyboard only pops up if you tap into the free-type field.
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
      <div className="absolute bottom-full left-0 z-[71] mb-1 w-max rounded-md border border-rule bg-paper-card p-2 shadow-page">
        {/* quick picks */}
        <div className="flex items-center gap-1">
          {QUICK.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onPick(e)}
              aria-label={e === DERIN_REACTION ? 'React with Derin' : `React with ${e}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none transition hover:bg-spice/10"
            >
              <ReactionGlyph emoji={e} size={26} className="text-2xl leading-none" />
            </button>
          ))}
        </div>
        {/* free type */}
        <div className="mt-1.5 border-t border-rule pt-1.5">
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
            placeholder="or type any emoji 🎉"
            aria-label="Type an emoji to react"
            className="w-full rounded border border-rule bg-paper px-2 py-1.5 text-base focus:border-spice focus:outline-none"
          />
        </div>
      </div>
    </>
  )
}

/**
 * The modal's reactions section: every emoji with the faces + names of who
 * reacted, laid out in full — no long-press needed. Tapping a row joins (or
 * leaves) that reaction; the smiley adds a new one.
 */
export function ReactionsDetail({ activityId }: { activityId: string }) {
  const { me, profiles, openGate } = useProfile()
  const { getFor, hasMine, toggle } = useReactions()
  const [adding, setAdding] = useState(false)

  const reactions = getFor(activityId)

  const react = (emoji: string) => {
    if (!me) {
      openGate()
      return
    }
    toggle(activityId, emoji, me.id)
  }

  return (
    <div className="mt-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/50">Reactions</p>

      <div className="mt-2 space-y-1.5">
        {reactions.map((r) => {
          const mine = me ? hasMine(activityId, r.emoji, me.id) : false
          return (
            <button
              key={r.emoji}
              type="button"
              onClick={() => react(r.emoji)}
              title={mine ? 'Tap to take yours back' : 'Tap to react with this too'}
              className={`flex w-full items-center gap-2.5 rounded-full border px-3 py-1.5 text-left transition ${
                mine
                  ? 'border-spice bg-spice/5 hover:bg-spice/10'
                  : 'border-rule bg-paper hover:border-spice/60 hover:bg-spice/5'
              }`}
            >
              <ReactionGlyph emoji={r.emoji} size={22} className="text-xl leading-none" />
              <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                {r.profileIds.map((id) => {
                  const p = profiles.find((x) => x.id === id)
                  if (!p) return null
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 text-xs font-medium text-ink/80"
                    >
                      <Avatar profile={p} size={18} />
                      {p.name}
                    </span>
                  )
                })}
              </span>
            </button>
          )
        })}

        {reactions.length === 0 && (
          <p className="text-sm text-ink/40">No reactions yet — start it off.</p>
        )}

        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => (me ? setAdding((v) => !v) : openGate())}
            aria-label="Add a reaction"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-spice/40 bg-white p-1 text-spice shadow-block transition hover:border-spice"
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
    </div>
  )
}

export default function Reactions({ activityId }: { activityId: string }) {
  const { me, profiles, openGate } = useProfile()
  const { getFor, hasMine, toggle } = useReactions()
  const [adding, setAdding] = useState(false)
  const [sheetEmoji, setSheetEmoji] = useState<string | null>(null)

  const reactions = getFor(activityId)
  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.name ?? id

  const react = (emoji: string) => {
    if (!me) {
      openGate()
      return
    }
    toggle(activityId, emoji, me.id)
  }

  // Re-derived each render so the open sheet stays live as votes change.
  const sheetReactors = sheetEmoji
    ? reactions.find((r) => r.emoji === sheetEmoji)?.profileIds ?? []
    : []

  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label="Reactions"
    >
      {reactions.map((r) => (
        <ReactionPill
          key={r.emoji}
          r={r}
          mine={me ? hasMine(activityId, r.emoji, me.id) : false}
          title={`${r.profileIds.map(nameOf).join(', ')} — hold to see who`}
          onReact={() => react(r.emoji)}
          onShowWho={() => setSheetEmoji(r.emoji)}
        />
      ))}

      {sheetEmoji && sheetReactors.length > 0 && (
        <ReactionSheet
          emoji={sheetEmoji}
          reactorIds={sheetReactors}
          onClose={() => setSheetEmoji(null)}
        />
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => (me ? setAdding((v) => !v) : openGate())}
          aria-label="Add a reaction"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-spice/40 bg-white p-1 text-spice shadow-block transition hover:border-spice"
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
