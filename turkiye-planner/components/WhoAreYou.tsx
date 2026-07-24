'use client'

import { CREW } from '@/data/itinerary'
import type { CrewName } from '@/lib/crew'
import { useModalChrome } from '@/lib/useModalChrome'
import Avatar from './Avatar'

interface WhoAreYouProps {
  me: CrewName | null
  /** Why we're asking, when an action triggered the prompt. */
  reason: string | null
  onChoose: (name: CrewName) => void
  onClear: () => void
  onClose: () => void
}

/**
 * The "which one are you?" picker. Opened either deliberately or by an action
 * that needs to know who you are (see IdentityProvider.requireMe).
 */
export default function WhoAreYou({
  me,
  reason,
  onChoose,
  onClear,
  onClose,
}: WhoAreYouProps) {
  useModalChrome(onClose)

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Which one are you?"
    >
      <div
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-md border border-rule bg-paper-card p-6 shadow-page sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* tape strip */}
        <div
          className="absolute -top-2 left-1/2 h-5 w-28 -translate-x-1/2 -rotate-1 bg-turquoise/35 shadow-sm"
          aria-hidden
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-ink/50 transition hover:bg-ink/10 hover:text-ink"
          aria-label="Close"
        >
          ✕
        </button>

        <p className="mt-2 text-center font-hand text-2xl text-spice">
          Before we go on&hellip;
        </p>
        <h3 className="text-center font-display text-3xl font-semibold leading-tight">
          Which one are you?
        </h3>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm text-ink/60">
          {reason ?? 'Tap your name and the planner starts keeping track of your plans.'}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          {CREW.map((name) => {
            const isMe = name === me
            return (
              <button
                key={name}
                type="button"
                onClick={() => onChoose(name)}
                aria-pressed={isMe}
                className={`flex flex-col items-center gap-1.5 rounded-md border px-1 py-3 transition ${
                  isMe
                    ? 'border-spice bg-spice/10 ring-2 ring-spice ring-offset-1 ring-offset-paper-card'
                    : 'border-rule bg-paper hover:-translate-y-px hover:border-ink/40 hover:shadow-block'
                }`}
              >
                <Avatar name={name} size={44} />
                <span className="text-xs font-medium text-ink/80">{name}</span>
              </button>
            )
          })}
        </div>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-ink/40">
          Saved on this device only — nothing is sent anywhere, and no one else
          can see it.
        </p>

        {me && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] font-medium text-spice underline underline-offset-2 hover:text-spice-dark"
            >
              forget me on this device
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
