'use client'

import type { CrewName } from '@/lib/crew'
import { useIdentity } from './IdentityProvider'
import Avatar from './Avatar'

interface IdentityBadgeProps {
  /** Opens the full profile card for whoever is signed in here. */
  onOpenProfile: (name: CrewName) => void
}

/**
 * Masthead chip: who the planner thinks you are. Renders a stable placeholder
 * until storage has been read, so the prerendered HTML doesn't flicker.
 */
export default function IdentityBadge({ onOpenProfile }: IdentityBadgeProps) {
  const { me, ready, promptMe } = useIdentity()

  if (!ready) {
    return <div className="mt-3 h-7" aria-hidden />
  }

  if (!me) {
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={promptMe}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-spice/70 bg-spice/5 px-3 py-1 text-xs font-medium text-spice transition hover:bg-spice/15"
        >
          <span aria-hidden>👋</span> Which one are you?
        </button>
      </div>
    )
  }

  return (
    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper-card px-2.5 py-1 text-xs shadow-block">
      <button
        type="button"
        onClick={() => onOpenProfile(me)}
        className="inline-flex items-center gap-1.5 font-medium text-ink/80 transition hover:text-ink"
      >
        <Avatar name={me} size={18} />
        {me}
      </button>
      <span className="text-ink/25" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={promptMe}
        className="text-[11px] text-ink/45 transition hover:text-spice"
      >
        not you?
      </button>
    </div>
  )
}
