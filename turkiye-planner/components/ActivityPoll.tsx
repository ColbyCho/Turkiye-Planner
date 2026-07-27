'use client'

import { useState } from 'react'
import type { Activity, Category } from '@/lib/types'
import { useProfile } from '@/lib/useProfile'
import { usePolls } from '@/lib/usePolls'
import AvatarStack from './AvatarStack'

// Only these categories get a poll.
const POLLABLE = new Set<Category>(['adventure', 'meal', 'night'])

export function isPollable(category: Category): boolean {
  return POLLABLE.has(category)
}

export default function ActivityPoll({ activity }: { activity: Activity }) {
  const { me, openGate } = useProfile()
  const { getFor, hasVote, addOption, toggleVote, removeOption } = usePolls()
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')

  if (!isPollable(activity.category)) return null

  const options = getFor(activity.id)

  const vote = (optionId: string) => {
    if (!me) return openGate()
    toggleVote(optionId, me.id)
  }

  const submitAdd = () => {
    if (!me) return openGate()
    const l = label.trim()
    if (!l) return
    addOption(activity.id, l, me.id)
    setLabel('')
    setAdding(false)
  }

  return (
    <div className="mt-5 rounded-md border border-rule bg-paper/60 p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/50">
        Poll — vote for as many as you like
      </p>

      <div className="mt-2.5 space-y-1.5">
        {options.map((o) => {
          const mine = me ? hasVote(o.id, me.id) : false
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => vote(o.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-full border px-3.5 py-2 text-left transition ${
                mine
                  ? 'border-saffron bg-saffron-light/70 hover:bg-saffron-light'
                  : 'border-rule bg-paper hover:border-saffron/60 hover:bg-saffron-light/25'
              }`}
            >
              <span className="min-w-0 truncate text-sm font-medium text-ink/90">{o.label}</span>
              <span className="flex shrink-0 items-center gap-1.5">
                <AvatarStack ids={o.voterIds} max={4} />
                {me && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Remove this choice"
                    title="Remove this choice (for everyone)"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeOption(o.id)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation()
                        removeOption(o.id)
                      }
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-red-500 transition hover:bg-red-500/15 hover:text-red-600"
                  >
                    ✕
                  </span>
                )}
              </span>
            </button>
          )
        })}

        {adding ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitAdd()
                if (e.key === 'Escape') {
                  setAdding(false)
                  setLabel('')
                }
              }}
              maxLength={80}
              placeholder="Add a choice…"
              className="min-w-0 flex-1 rounded-full border border-rule bg-paper px-3.5 py-2 text-sm focus:border-saffron focus:outline-none"
            />
            <button
              type="button"
              onClick={submitAdd}
              className="shrink-0 rounded-full bg-spice px-3 py-2 text-sm font-semibold text-paper transition hover:bg-spice-dark"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => (me ? setAdding(true) : openGate())}
            className="flex w-full items-center gap-1.5 rounded-full border border-dashed border-rule px-3.5 py-2 text-left text-sm font-medium text-ink/50 transition hover:border-saffron hover:text-spice"
          >
            <span aria-hidden className="text-base leading-none">
              +
            </span>
            Add choice
          </button>
        )}
      </div>
    </div>
  )
}
