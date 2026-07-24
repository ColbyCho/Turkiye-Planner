'use client'

import { useMemo, useState } from 'react'
import { useTable, newId } from '@/lib/db/useTable'
import type { CrewName } from '@/lib/crew'
import { useIdentity } from './IdentityProvider'
import Avatar from './Avatar'

/** The three verdicts, in display order. */
const VERDICTS = [
  { value: 1, emoji: '🙌', label: 'I’m in' },
  { value: 0, emoji: '🤷', label: 'Either way' },
  { value: -1, emoji: '🙅', label: 'Skip me' },
] as const

const QUICK_REACTIONS = ['🔥', '😍', '🤤', '😂', '🫠', '🎉']

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

interface ActivitySocialProps {
  /** Activity id, or `proposal:<id>` for a suggestion. */
  activityId: string
  /** Hide comments where there isn't room for them (the proposal list). */
  compact?: boolean
}

export default function ActivitySocial({
  activityId,
  compact = false,
}: ActivitySocialProps) {
  const { me, requireMe } = useIdentity()
  const votes = useTable('votes')
  const reactions = useTable('reactions')
  const comments = useTable('comments')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mine = votes.rows.find((v) => v.activity_id === activityId && v.voter === me)

  const byVerdict = useMemo(() => {
    const map = new Map<number, string[]>()
    for (const v of votes.rows) {
      if (v.activity_id !== activityId) continue
      map.set(v.value, [...(map.get(v.value) ?? []), v.voter])
    }
    return map
  }, [votes.rows, activityId])

  const reactionCounts = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const r of reactions.rows) {
      if (r.activity_id !== activityId) continue
      map.set(r.emoji, [...(map.get(r.emoji) ?? []), r.author])
    }
    return map
  }, [reactions.rows, activityId])

  const thread = useMemo(
    () =>
      comments.rows
        .filter((c) => c.activity_id === activityId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [comments.rows, activityId]
  )

  const guard = (reason: string, run: (me: CrewName) => void) => {
    setError(null)
    requireMe(reason, (name) => {
      Promise.resolve(run(name)).catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'That didn’t save.')
      )
    })
  }

  const castVote = (value: number) =>
    guard('So your vote has a name on it.', (name) => {
      if (mine && mine.value === value) return votes.remove(mine)
      return votes.upsert({ activity_id: activityId, voter: name, value })
    })

  const toggleReaction = (emoji: string) =>
    guard('So your reaction has a name on it.', (name) => {
      const existing = reactions.rows.find(
        (r) => r.activity_id === activityId && r.author === name && r.emoji === emoji
      )
      return existing
        ? reactions.remove(existing)
        : reactions.upsert({ activity_id: activityId, author: name, emoji })
    })

  const postComment = () => {
    const body = draft.trim()
    if (!body) return
    guard('So your comment has a name on it.', (name) => {
      setDraft('')
      return comments.upsert({
        id: newId(),
        activity_id: activityId,
        author: name,
        body,
        created_at: new Date().toISOString(),
      })
    })
  }

  return (
    <div className={compact ? 'mt-2' : 'mt-5 border-t border-rule pt-4'}>
      {/* Votes */}
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/50">
        Are we doing this?
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {VERDICTS.map((v) => {
          const voters = byVerdict.get(v.value) ?? []
          const picked = mine?.value === v.value
          return (
            <button
              key={v.value}
              type="button"
              onClick={() => castVote(v.value)}
              aria-pressed={picked}
              title={voters.length ? voters.join(', ') : 'No votes yet'}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                picked
                  ? 'border-cobalt bg-cobalt text-paper'
                  : 'border-rule bg-paper text-ink/70 hover:border-ink/40 hover:text-ink'
              }`}
            >
              <span aria-hidden>{v.emoji}</span>
              {v.label}
              {voters.length > 0 && (
                <span
                  className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                    picked ? 'bg-paper/25' : 'bg-ink/10'
                  }`}
                >
                  {voters.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Who voted which way */}
      {byVerdict.size > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {VERDICTS.map((v) => {
            const voters = byVerdict.get(v.value) ?? []
            if (voters.length === 0) return null
            return (
              <span key={v.value} className="inline-flex items-center gap-1">
                <span className="text-xs" aria-hidden>
                  {v.emoji}
                </span>
                {voters.map((voter) => (
                  <Avatar key={voter} name={voter} size={16} />
                ))}
              </span>
            )
          })}
        </div>
      )}

      {/* Reactions */}
      <div className="mt-3 flex flex-wrap gap-1">
        {QUICK_REACTIONS.map((emoji) => {
          const who = reactionCounts.get(emoji) ?? []
          const picked = me ? who.includes(me) : false
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => toggleReaction(emoji)}
              aria-pressed={picked}
              aria-label={`React ${emoji}`}
              title={who.length ? who.join(', ') : undefined}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition ${
                picked
                  ? 'border-saffron bg-saffron-light/50'
                  : 'border-transparent bg-ink/5 hover:bg-ink/10'
              }`}
            >
              <span aria-hidden>{emoji}</span>
              {who.length > 0 && (
                <span className="text-[10px] tabular-nums text-ink/60">{who.length}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Comments */}
      {!compact && (
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Notes to the group {thread.length > 0 && `(${thread.length})`}
          </p>

          {thread.length > 0 && (
            <ul className="mt-2 space-y-2">
              {thread.map((c) => (
                <li key={c.id} className="flex gap-2">
                  <Avatar name={c.author} size={20} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs">
                      <span className="font-medium text-ink/80">{c.author}</span>{' '}
                      <span className="text-ink/35">{timeAgo(c.created_at)}</span>
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm text-ink/80">
                      {c.body}
                    </p>
                  </div>
                  {c.author === me && (
                    <button
                      type="button"
                      onClick={() => comments.remove(c)}
                      className="shrink-0 self-start text-[10px] text-ink/30 transition hover:text-spice"
                      aria-label="Delete comment"
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  postComment()
                }
              }}
              placeholder="Add a note…"
              className="min-w-0 flex-1 rounded border border-rule bg-paper px-2 py-1.5 text-sm placeholder:text-ink/30 focus:border-cobalt focus:outline-none"
            />
            <button
              type="button"
              onClick={postComment}
              disabled={!draft.trim()}
              className="rounded border border-cobalt px-2.5 py-1 text-xs font-medium text-cobalt transition hover:bg-cobalt hover:text-paper disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-[11px] text-spice">{error}</p>}

      {votes.mode === 'local' && (
        <p className="mt-3 text-[10px] leading-relaxed text-ink/35">
          Saved on this device — connect the database and these become shared
          (see docs/BACKEND.md).
        </p>
      )}
    </div>
  )
}
