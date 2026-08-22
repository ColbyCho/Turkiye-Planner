'use client'

import { useState } from 'react'
import { useComments } from '@/lib/useComments'
import { useProfile } from '@/lib/useProfile'
import type { CommentRow } from '@/lib/supabase'
import Avatar from './Avatar'

/** The day page's group chat — one thread per day, under the fun fact. */
export function DayChat({ date, dayTitle }: { date: string; dayTitle: string }) {
  const { available } = useComments()
  if (!available) return null
  return (
    <section
      aria-label="Day group chat"
      className="border-t border-dashed border-rule px-5 pb-8 pt-6 sm:px-8"
    >
      <p className="text-center font-hand text-2xl text-spice">The Group Chat</p>
      <p className="mt-0.5 text-center text-xs text-ink/45">
        hot takes, logistics &amp; lobbying for {dayTitle}
      </p>
      <div className="mx-auto mt-4 max-w-xl">
        <CommentThread target={date} placeholder={`Anything about ${dayTitle}?`} />
      </div>
    </section>
  )
}

/** "14:32" for today, "Aug 23" otherwise. */
function stamp(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

/** Messages by one author within 5 minutes collapse into one bubble group. */
function groupMessages(list: CommentRow[]): CommentRow[][] {
  const groups: CommentRow[][] = []
  for (const c of list) {
    const last = groups[groups.length - 1]
    if (
      last &&
      last[0].profile_id === c.profile_id &&
      Date.parse(c.created_at) - Date.parse(last[last.length - 1].created_at) < 5 * 60_000
    ) {
      last.push(c)
    } else {
      groups.push([c])
    }
  }
  return groups
}

/**
 * Group-chat-style comment thread for one target (an activity or a whole
 * day). Yours ride the right edge in spice; everyone else sits left with
 * their face. Renders nothing until the comments table exists.
 */
export default function CommentThread({
  target,
  placeholder = 'Say something…',
  title,
  className = '',
}: {
  target: string
  placeholder?: string
  /** Small uppercase label above the thread (shown only when comments work). */
  title?: string
  className?: string
}) {
  const { me, profiles, openGate } = useProfile()
  const { available, getFor, post, remove } = useComments()
  const [draft, setDraft] = useState('')

  if (!available) return null

  const comments = getFor(target)
  const groups = groupMessages(comments)

  const send = () => {
    if (!me) {
      openGate()
      return
    }
    if (!draft.trim()) return
    post(target, me.id, draft)
    setDraft('')
  }

  return (
    <div className={className}>
      {title && (
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/50">
          {title}
        </p>
      )}
      {groups.length > 0 && (
        <ul className="space-y-3">
          {groups.map((group) => {
            const mine = group[0].profile_id === me?.id
            const p = profiles.find((x) => x.id === group[0].profile_id)
            return (
              <li key={group[0].id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                {!mine && (
                  <div className="mt-4 shrink-0">
                    {p ? (
                      <Avatar profile={p} size={26} />
                    ) : (
                      <span className="block h-[26px] w-[26px] rounded-full bg-rule/50" />
                    )}
                  </div>
                )}
                <div className={`min-w-0 max-w-[85%] ${mine ? 'items-end text-right' : ''}`}>
                  <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-ink/40">
                    {mine ? 'you' : (p?.name ?? group[0].profile_id)} · {stamp(group[0].created_at)}
                  </p>
                  <div className={`mt-0.5 space-y-1 ${mine ? 'flex flex-col items-end' : ''}`}>
                    {group.map((c) => (
                      <div key={c.id} className="group/bubble relative w-fit max-w-full">
                        <p
                          className={`whitespace-pre-wrap break-words rounded-2xl border px-3 py-1.5 text-left text-sm leading-snug ${
                            mine
                              ? 'rounded-tr-sm border-spice/30 bg-spice/10 text-ink/90'
                              : 'rounded-tl-sm border-rule bg-paper text-ink/85'
                          }`}
                        >
                          {c.body}
                        </p>
                        {mine && (
                          <button
                            type="button"
                            onClick={() => remove(c.id)}
                            aria-label="Delete this comment"
                            title="Delete"
                            className="absolute -left-5 top-1/2 hidden h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-[10px] text-ink/35 hover:bg-red-500/15 hover:text-red-600 group-hover/bubble:flex"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className={`flex items-center gap-2 ${groups.length > 0 ? 'mt-3' : ''}`}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
          maxLength={1000}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 rounded-full border border-rule bg-paper px-3.5 py-2 text-sm focus:border-spice focus:outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim()}
          className="shrink-0 rounded-full bg-spice px-3.5 py-2 text-sm font-semibold text-paper transition hover:bg-spice-dark disabled:opacity-30"
        >
          Send
        </button>
      </div>
    </div>
  )
}
