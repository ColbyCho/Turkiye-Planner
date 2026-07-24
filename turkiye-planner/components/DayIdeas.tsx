'use client'

import { useMemo, useState } from 'react'
import type { DayPlan } from '@/lib/types'
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories'
import { formatRange } from '@/lib/time'
import { newId, useTable } from '@/lib/db/useTable'
import { useIdentity } from './IdentityProvider'
import ActivitySocial from './ActivitySocial'
import Disclosure from './Disclosure'
import Avatar from './Avatar'

const INPUT =
  'w-full rounded border border-rule bg-paper px-2 py-1.5 text-sm placeholder:text-ink/30 focus:border-cobalt focus:outline-none'

/**
 * The suggestion box for one day: proposed activities the group votes on, and
 * polls for the slots nobody has decided yet.
 */
export default function DayIdeas({ day }: { day: DayPlan }) {
  const { me, requireMe } = useIdentity()
  const proposals = useTable('proposals')
  const polls = useTable('polls')
  const pollVotes = useTable('poll_votes')

  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState({
    title: '',
    start: '',
    end: '',
    category: 'misc',
    notes: '',
    url: '',
  })
  const [pollDraft, setPollDraft] = useState({ question: '', options: ['', ''] })
  const [showPollForm, setShowPollForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dayProposals = useMemo(
    () =>
      proposals.rows
        .filter((p) => p.day_date === day.date)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [proposals.rows, day.date]
  )

  const dayPolls = useMemo(
    () =>
      polls.rows
        .filter((p) => p.day_date === day.date)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [polls.rows, day.date]
  )

  const fail = (err: unknown) =>
    setError(err instanceof Error ? err.message : 'That didn’t save.')

  function submitProposal(e: React.FormEvent) {
    e.preventDefault()
    const title = draft.title.trim()
    if (!title) return
    setError(null)
    requireMe('So your idea has a name on it.', (name) => {
      proposals
        .upsert({
          id: newId(),
          author: name,
          title,
          day_date: day.date,
          start: draft.start || null,
          end: draft.end || null,
          category: draft.category,
          notes: draft.notes.trim() || null,
          url: draft.url.trim() || null,
          created_at: new Date().toISOString(),
        })
        .then(() => {
          setDraft({ title: '', start: '', end: '', category: 'misc', notes: '', url: '' })
          setShowForm(false)
        })
        .catch(fail)
    })
  }

  function submitPoll(e: React.FormEvent) {
    e.preventDefault()
    const question = pollDraft.question.trim()
    const options = pollDraft.options
      .map((label) => label.trim())
      .filter(Boolean)
      .map((label, i) => ({ id: `opt${i}`, label }))
    if (!question || options.length < 2) return
    setError(null)
    requireMe('So the poll has an author.', (name) => {
      polls
        .upsert({
          id: newId(),
          author: name,
          day_date: day.date,
          question,
          options,
          created_at: new Date().toISOString(),
        })
        .then(() => {
          setPollDraft({ question: '', options: ['', ''] })
          setShowPollForm(false)
        })
        .catch(fail)
    })
  }

  const castPollVote = (pollId: string, optionId: string) =>
    requireMe('So your pick has a name on it.', (name) => {
      const existing = pollVotes.rows.find(
        (v) => v.poll_id === pollId && v.voter === name
      )
      if (existing && existing.option_id === optionId) {
        pollVotes.remove(existing).catch(fail)
        return
      }
      pollVotes
        .upsert({ poll_id: pollId, voter: name, option_id: optionId })
        .catch(fail)
    })

  const hint = [
    dayProposals.length && `${dayProposals.length} idea${dayProposals.length > 1 ? 's' : ''}`,
    dayPolls.length && `${dayPolls.length} poll${dayPolls.length > 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Disclosure title="Ideas & decisions" hint={hint || 'nothing pitched yet'}>
      {/* Proposals */}
      <div className="space-y-3">
        {dayProposals.map((p) => {
          const cat = CATEGORIES[(p.category as keyof typeof CATEGORIES) ?? 'misc'] ??
            CATEGORIES.misc
          return (
            <article
              key={p.id}
              className="rounded border border-dashed border-kraft-dark/60 bg-paper px-3 py-3"
            >
              <div className="flex items-start gap-2">
                <Avatar name={p.author} size={22} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-ink">
                    <span aria-hidden>{cat.icon}</span> {p.title}
                  </p>
                  <p className="text-[11px] text-ink/45">
                    {p.author}
                    {p.start && p.end && ` · ${formatRange(p.start, p.end)}`}
                  </p>
                  {p.notes && (
                    <p className="mt-1 text-sm leading-snug text-ink/75">{p.notes}</p>
                  )}
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-cobalt underline underline-offset-2"
                    >
                      link ↗
                    </a>
                  )}
                </div>
                {p.author === me && (
                  <button
                    type="button"
                    onClick={() => proposals.remove(p).catch(fail)}
                    className="shrink-0 text-[10px] text-ink/30 transition hover:text-spice"
                    aria-label="Delete idea"
                  >
                    ✕
                  </button>
                )}
              </div>
              <ActivitySocial activityId={`proposal:${p.id}`} compact />
            </article>
          )
        })}

        {showForm ? (
          <form
            onSubmit={submitProposal}
            className="space-y-2 rounded border border-rule bg-paper-card p-3"
          >
            <input
              autoFocus
              className={INPUT}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="What should we do?"
            />
            <div className="flex flex-wrap gap-2">
              <input
                type="time"
                className={`${INPUT} w-28`}
                value={draft.start}
                onChange={(e) => setDraft({ ...draft, start: e.target.value })}
                aria-label="Start time"
              />
              <input
                type="time"
                className={`${INPUT} w-28`}
                value={draft.end}
                onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                aria-label="End time"
              />
              <select
                className={`${INPUT} w-40`}
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                aria-label="Category"
              >
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIES[c].label}
                  </option>
                ))}
              </select>
            </div>
            <input
              className={INPUT}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              placeholder="Why it's worth it (optional)"
            />
            <input
              className={INPUT}
              value={draft.url}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
              placeholder="Link (optional)"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded bg-spice px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-spice-dark"
              >
                Pitch it
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded border border-rule px-3 py-1.5 text-sm text-ink/70 transition hover:border-ink/40"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded border border-dashed border-spice/70 px-3 py-1.5 text-sm font-medium text-spice transition hover:bg-spice/10"
          >
            ＋ Suggest something for this day
          </button>
        )}
      </div>

      {/* Polls */}
      <div className="mt-6 space-y-3">
        {dayPolls.map((poll) => {
          const votes = pollVotes.rows.filter((v) => v.poll_id === poll.id)
          const myVote = votes.find((v) => v.voter === me)
          const total = votes.length
          return (
            <article key={poll.id} className="rounded border border-rule bg-paper px-3 py-3">
              <div className="flex items-start gap-2">
                <p className="flex-1 text-sm font-semibold text-ink">{poll.question}</p>
                {poll.author === me && (
                  <button
                    type="button"
                    onClick={() => polls.remove(poll).catch(fail)}
                    className="text-[10px] text-ink/30 transition hover:text-spice"
                    aria-label="Delete poll"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-[11px] text-ink/45">
                asked by {poll.author} · {total} vote{total === 1 ? '' : 's'}
              </p>
              <div className="mt-2 space-y-1.5">
                {poll.options.map((opt) => {
                  const forThis = votes.filter((v) => v.option_id === opt.id)
                  const picked = myVote?.option_id === opt.id
                  const pct = total ? Math.round((forThis.length / total) * 100) : 0
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => castPollVote(poll.id, opt.id)}
                      aria-pressed={picked}
                      className={`relative block w-full overflow-hidden rounded border px-2.5 py-1.5 text-left text-sm transition ${
                        picked
                          ? 'border-cobalt text-cobalt-dark'
                          : 'border-rule text-ink/75 hover:border-ink/40'
                      }`}
                    >
                      <span
                        className="absolute inset-y-0 left-0 bg-cobalt/10"
                        style={{ width: `${pct}%` }}
                        aria-hidden
                      />
                      <span className="relative flex items-center gap-2">
                        <span className="flex-1">{opt.label}</span>
                        {forThis.map((v) => (
                          <Avatar key={v.voter} name={v.voter} size={16} />
                        ))}
                        <span className="text-[11px] tabular-nums text-ink/45">{pct}%</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </article>
          )
        })}

        {showPollForm ? (
          <form
            onSubmit={submitPoll}
            className="space-y-2 rounded border border-rule bg-paper-card p-3"
          >
            <input
              autoFocus
              className={INPUT}
              value={pollDraft.question}
              onChange={(e) => setPollDraft({ ...pollDraft, question: e.target.value })}
              placeholder="What are we deciding?"
            />
            {pollDraft.options.map((opt, i) => (
              <input
                key={i}
                className={INPUT}
                value={opt}
                onChange={(e) => {
                  const options = [...pollDraft.options]
                  options[i] = e.target.value
                  setPollDraft({ ...pollDraft, options })
                }}
                placeholder={`Option ${i + 1}`}
                aria-label={`Option ${i + 1}`}
              />
            ))}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setPollDraft({ ...pollDraft, options: [...pollDraft.options, ''] })
                }
                className="rounded border border-rule px-2.5 py-1 text-xs text-ink/60 transition hover:border-ink/40"
              >
                ＋ option
              </button>
              <button
                type="submit"
                className="rounded bg-cobalt px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-cobalt-dark"
              >
                Post poll
              </button>
              <button
                type="button"
                onClick={() => setShowPollForm(false)}
                className="rounded border border-rule px-3 py-1.5 text-sm text-ink/70 transition hover:border-ink/40"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowPollForm(true)}
            className="rounded border border-dashed border-cobalt/70 px-3 py-1.5 text-sm font-medium text-cobalt transition hover:bg-cobalt/10"
          >
            ＋ Put it to a vote
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-[11px] text-spice">{error}</p>}
    </Disclosure>
  )
}
