'use client'

import { useMemo } from 'react'
import { CREW } from '@/data/crew'
import { awardBadge, badgesFor, type Badge, type CrewName } from './crew'
import { useTable } from './db/useTable'

// ─────────────────────────────────────────────────────────────────────────────
// Badges earned by using the planner, not by the itinerary.
//
// The schedule is nearly identical for everyone, so itinerary superlatives
// rarely separate anybody. What people actually do here — vote, argue, pitch,
// photograph — separates them immediately.
// ─────────────────────────────────────────────────────────────────────────────

interface Tally {
  id: string
  emoji: string
  label: string
  /** Below this, leading is an accident rather than a personality. */
  minimum: number
  counts: Map<string, number>
}

function tallyBy<T>(rows: T[], key: (row: T) => string | null): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const who = key(row)
    if (!who) continue
    counts.set(who, (counts.get(who) ?? 0) + 1)
  }
  return counts
}

export function useBadges(name: CrewName): Badge[] {
  const votes = useTable('votes')
  const comments = useTable('comments')
  const photos = useTable('photos')
  const proposals = useTable('proposals')

  return useMemo(() => {
    const tallies: Tally[] = [
      {
        id: 'keen',
        emoji: '🙌',
        label: 'Most up for it',
        minimum: 3,
        counts: tallyBy(votes.rows, (v) => (v.value === 1 ? v.voter : null)),
      },
      {
        id: 'picky',
        emoji: '🙅',
        label: 'Hard to please',
        minimum: 2,
        counts: tallyBy(votes.rows, (v) => (v.value === -1 ? v.voter : null)),
      },
      {
        id: 'talker',
        emoji: '💬',
        label: 'Most to say',
        minimum: 3,
        counts: tallyBy(comments.rows, (c) => c.author),
      },
      {
        id: 'ideas',
        emoji: '💡',
        label: 'Idea machine',
        minimum: 2,
        counts: tallyBy(proposals.rows, (p) => p.author),
      },
      {
        id: 'shutterbug',
        emoji: '📸',
        label: 'Shutterbug',
        minimum: 3,
        counts: tallyBy(photos.rows, (p) => p.author),
      },
    ]

    const earned = tallies
      .filter((t) =>
        awardBadge(
          CREW.map((member) => t.counts.get(member) ?? 0),
          t.counts.get(name) ?? 0,
          t.minimum
        )
      )
      .map(({ id, emoji, label }) => ({ id, emoji, label }))

    return [...badgesFor(name), ...earned]
  }, [name, votes.rows, comments.rows, photos.rows, proposals.rows])
}
