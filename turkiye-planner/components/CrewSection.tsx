'use client'

import { CREW } from '@/data/itinerary'
import { avatarColor, profileFor, type CrewName } from '@/lib/crew'
import { useIdentity } from './IdentityProvider'

/** Rotations so the row reads like photos laid on a desk, not a contact sheet. */
const ROTATIONS = ['-rotate-2', 'rotate-1', 'rotate-3', '-rotate-1', 'rotate-2']

interface CrewSectionProps {
  onOpenProfile: (name: CrewName) => void
}

export default function CrewSection({ onOpenProfile }: CrewSectionProps) {
  const { me, promptMe } = useIdentity()

  return (
    <section
      aria-label="The Crew"
      className="border-t border-dashed border-rule px-5 pb-8 pt-6 text-center sm:px-8"
    >
      <p className="font-hand text-2xl text-spice">The Crew</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ink/45">
        party of {CREW.length} · tap a face
      </p>

      <div className="mt-5 flex flex-wrap items-start justify-center gap-3 sm:gap-4">
        {CREW.map((name, i) => {
          const profile = profileFor(name)
          const isMe = me === name
          return (
            <button
              key={name}
              type="button"
              onClick={() => onOpenProfile(name)}
              aria-label={`${name}'s profile`}
              className={`group w-[4.5rem] bg-white p-1 pb-1.5 shadow-note transition-transform duration-300 hover:z-10 hover:rotate-0 hover:scale-105 sm:w-24 ${
                ROTATIONS[i % ROTATIONS.length]
              } ${isMe ? 'ring-2 ring-spice ring-offset-2 ring-offset-paper-card' : ''}`}
            >
              {profile.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photo}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div
                  className="flex aspect-square w-full items-center justify-center font-display text-3xl font-semibold text-paper sm:text-4xl"
                  style={{ backgroundColor: avatarColor(name) }}
                  aria-hidden
                >
                  {name[0]}
                </div>
              )}
              <span className="mt-0.5 block truncate text-center font-hand text-lg leading-tight text-ink/75">
                {isMe ? `${name} (you)` : name}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-5 text-[11px] text-ink/40">
        {me ? (
          <>
            planner set to <span className="font-medium text-ink/60">{me}</span> ·{' '}
            <button
              type="button"
              onClick={promptMe}
              className="font-medium text-spice underline underline-offset-2 hover:text-spice-dark"
            >
              not you?
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={promptMe}
            className="font-medium text-spice underline underline-offset-2 hover:text-spice-dark"
          >
            which one are you?
          </button>
        )}
      </p>
    </section>
  )
}
