import type { ReactNode } from 'react'
import Link from 'next/link'
import CurrencyConverter from './CurrencyConverter'
import TaxiCard from './TaxiCard'
import Phrasebook from './Phrasebook'

// ─────────────────────────────────────────────────────────────────────────────
// Other Helpful Stuff — passport-stamp link buttons.
// Drop real URLs in below (url: 'https://…') and the stamps become links.
// ─────────────────────────────────────────────────────────────────────────────
const LINKS: StampLink[] = [
  {
    id: 'album',
    label: 'Shared Photo Album',
    topText: 'SHARED PHOTO ALBUM',
    bottomText: '✶ TÜRKİYE 2026 ✶',
    icon: 'camera',
    url: null, // TODO: paste the shared album link here
  },
  {
    id: 'packing',
    label: 'The Official Packing List',
    topText: 'OFFICIAL PACKING LIST',
    bottomText: '✶ TÜRKİYE 2026 ✶',
    icon: 'suitcase',
    url: null,
    internalHref: '/packing', // in-app checklist page
  },
  {
    // Mark Wiens' Istanbul food guide — source of the Beli restaurant list,
    // with a Google Map of every spot linked inside the article.
    id: 'food-guide',
    label: 'Istanbul Food Guide by Mark Wiens (with map)',
    topText: 'ISTANBUL FOOD GUIDE',
    bottomText: '✶ MIGRATIONOLOGY ✶',
    icon: 'cutlery',
    url: 'https://migrationology.com/travel-guides/istanbul-turkey/',
  },
]

/** Stamp rotation per slot so the row reads hand-placed, not printed. */
const ROTATIONS = ['-rotate-3', 'rotate-2', '-rotate-2']

export interface StampLink {
  id: string
  label: string
  topText: string
  bottomText: string
  icon: 'camera' | 'suitcase' | 'cutlery' | 'taxi' | 'speech'
  url: string | null
  /** In-app route (Next Link) — takes precedence over `url` when set. */
  internalHref?: string
}

// Line-drawn icons, centered in the stamp's inner circle
const ICONS: Record<StampLink['icon'], ReactNode> = {
  camera: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="42" y="52" width="36" height="24" rx="3.5" />
      <path d="M52 52l3.5-5.5h9L68 52" />
      <circle cx="60" cy="64" r="7" />
      <circle cx="73" cy="57.5" r="0.4" />
    </g>
  ),
  suitcase: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="44" y="51" width="32" height="26" rx="4" />
      <path d="M54 51v-4.5a3.5 3.5 0 013.5-3.5h5a3.5 3.5 0 013.5 3.5V51" />
      <path d="M51.5 51v26M68.5 51v26" />
    </g>
  ),
  cutlery: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* fork */}
      <path d="M48.5 45.5v7M53 45.5v7M57.5 45.5v7" />
      <path d="M48.5 52.5a4.5 4.5 0 004.5 4.5 4.5 4.5 0 004.5-4.5" />
      <path d="M53 57v20.5" />
      {/* knife */}
      <path d="M70.5 45.5c-4.5 5-5.5 11-2.5 16h2.5" />
      <path d="M70.5 45.5v32" />
    </g>
  ),
  taxi: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* roof sign */}
      <path d="M57.5 45.5h5" />
      {/* cabin */}
      <path d="M48.5 61l4.5-10.5h14L71.5 61" />
      {/* body */}
      <rect x="42.5" y="61" width="35" height="11" rx="3" />
      {/* headlights */}
      <path d="M46.5 66.5h3M70.5 66.5h3" />
      {/* wheels */}
      <circle cx="52" cy="75.5" r="3.2" />
      <circle cx="68" cy="75.5" r="3.2" />
    </g>
  ),
  speech: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M46 47.5h28a4 4 0 014 4v14a4 4 0 01-4 4H59.5l-8.5 7v-7H46a4 4 0 01-4-4v-14a4 4 0 014-4z" />
      <path d="M50.5 56h19M50.5 61.5h12" />
    </g>
  ),
}

/** A round, line-drawn passport stamp with text on the arcs and an icon inside. */
export function Stamp({ link }: { link: StampLink }) {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 sm:h-32 sm:w-32" aria-hidden>
      <defs>
        {/* text baselines: an upper arc read over the top, a lower arc read under the bottom */}
        <path id={`${link.id}-arc-top`} d="M 15,60 A 45,45 0 0 1 105,60" />
        <path id={`${link.id}-arc-bottom`} d="M 11.5,60 A 48.5,48.5 0 0 0 108.5,60" />
      </defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="53.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text
        fontSize={link.topText.length > 19 ? 8.2 : 9}
        fontWeight="700"
        letterSpacing="1.6"
        fill="currentColor"
        style={{ fontFamily: 'var(--font-sans, "DM Sans", sans-serif)' }}
      >
        <textPath href={`#${link.id}-arc-top`} startOffset="50%" textAnchor="middle">
          {link.topText}
        </textPath>
      </text>
      <text
        fontSize="9"
        fontWeight="700"
        letterSpacing="2"
        fill="currentColor"
        style={{ fontFamily: 'var(--font-sans, "DM Sans", sans-serif)' }}
      >
        <textPath href={`#${link.id}-arc-bottom`} startOffset="50%" textAnchor="middle">
          {link.bottomText}
        </textPath>
      </text>
      {ICONS[link.icon]}
    </svg>
  )
}

function StampButton({ link, rotate }: { link: StampLink; rotate: string }) {
  const className = `group inline-block ${rotate} text-spice/75 transition-transform duration-300 hover:rotate-0 hover:scale-105 hover:text-spice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spice`

  if (link.internalHref) {
    return (
      <Link href={link.internalHref} aria-label={link.label} className={className}>
        <Stamp link={link} />
      </Link>
    )
  }
  if (link.url) {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={link.label}
        className={className}
      >
        <Stamp link={link} />
      </a>
    )
  }
  return (
    <button
      type="button"
      aria-label={`${link.label} — link coming soon`}
      title="Link coming soon"
      className={`${className} cursor-help`}
    >
      <Stamp link={link} />
    </button>
  )
}

export default function HelpfulStuff() {
  return (
    <section
      aria-label="Other Helpful Stuff"
      className="border-t border-dashed border-rule px-5 pb-10 pt-6 text-center sm:px-8"
    >
      <p className="font-hand text-2xl text-spice">Other Helpful Stuff</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
        {LINKS.map((link, i) => (
          <StampButton key={link.id} link={link} rotate={ROTATIONS[i % ROTATIONS.length]} />
        ))}
        <TaxiCard rotate={ROTATIONS[LINKS.length % ROTATIONS.length]} />
        <Phrasebook rotate={ROTATIONS[(LINKS.length + 1) % ROTATIONS.length]} />
      </div>
      <p className="mt-4 text-[11px] text-ink/40">
        tap the suitcase for the packing checklist · the taxi to hail a ride home ·
        the speech bubble for Turkish — album link coming soon
      </p>

      <CurrencyConverter />
    </section>
  )
}
