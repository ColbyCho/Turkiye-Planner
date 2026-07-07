'use client'

interface Postcard {
  src: string
  alt: string
  caption: string
  /** Short name used in the photo-credit footer line. */
  creditName: string
  /** Wikimedia Commons file page with author + license details. */
  creditUrl: string
  /** Tailwind classes for the scattered desktop placement (fixed positioning). */
  desktop: string
  rotate: string
}

// Images live in public/postcards/ (sourced from Wikimedia Commons).
const POSTCARDS: Postcard[] = [
  {
    src: '/postcards/hagia-sophia.jpg',
    alt: 'Hagia Sophia with its dome and minarets',
    caption: 'Hagia Sophia, Sultanahmet',
    creditName: 'Hagia Sophia',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Hagia_Sophia_Mars_2013.jpg',
    desktop: 'left-4 top-36',
    rotate: '-rotate-6',
  },
  {
    src: '/postcards/blue-mosque.jpg',
    alt: 'The Blue Mosque at dusk',
    caption: 'The Blue Mosque',
    creditName: 'Blue Mosque',
    creditUrl:
      'https://commons.wikimedia.org/wiki/File:Sultan_Ahmed_Mosque_Istanbul_Turkey_retouched.jpg',
    desktop: 'right-4 top-[26vh]',
    rotate: 'rotate-3',
  },
  {
    src: '/postcards/doner.jpg',
    alt: 'A döner sandwich on a plate',
    caption: 'Döner — the people’s champion',
    creditName: 'Döner',
    creditUrl:
      'https://commons.wikimedia.org/wiki/File:D%C3%B6ner_Kebab,_Berlin,_2010_(01).jpg',
    desktop: 'left-5 top-[52vh]',
    rotate: 'rotate-2',
  },
  {
    src: '/postcards/bodrum.jpg',
    alt: 'Gulets and sailboats moored in Bodrum harbour at dusk',
    caption: 'Gulets in Bodrum harbour',
    creditName: 'Bodrum harbour',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Bodrum_06.jpg',
    desktop: 'right-5 top-[62vh]',
    rotate: '-rotate-3',
  },
  {
    src: '/postcards/besiktas-stadium.jpg',
    alt: 'Inside Beşiktaş’s stadium, Tüpraş Stadyumu',
    caption: 'Tüpraş Stadyumu — Beşiktaş JK',
    creditName: 'Tüpraş Stadyumu',
    creditUrl:
      'https://commons.wikimedia.org/wiki/File:T%C3%BCpra%C5%9F_Stadyumu_20231011_2.jpg',
    desktop: 'left-4 top-[78vh]',
    rotate: 'rotate-6',
  },
]

function Frame({ card, fixed }: { card: Postcard; fixed: boolean }) {
  return (
    <figure
      className={`group bg-white p-1.5 pb-2 shadow-note transition-transform duration-300 ${
        fixed
          ? `fixed z-20 w-36 2xl:w-44 ${card.desktop} ${card.rotate} hover:rotate-0 hover:scale-110`
          : `${card.rotate} w-full hover:rotate-0`
      }`}
    >
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.src}
          alt={card.alt}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
        {/* Desktop: caption revealed on hover, over the photo */}
        {fixed && (
          <figcaption className="absolute inset-x-0 bottom-0 bg-ink/75 px-2 py-1 font-hand text-sm leading-tight text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {card.caption}
          </figcaption>
        )}
      </div>
      {/* Mobile/tablet: caption always visible below the photo */}
      {!fixed && (
        <figcaption className="px-1 pt-1.5 font-hand text-lg leading-tight text-ink/80">
          {card.caption}
        </figcaption>
      )}
    </figure>
  )
}

export default function Postcards() {
  return (
    <>
      {/* Wide screens: scattered around the planner like postcards on a desk */}
      <div className="hidden xl:block" aria-label="Postcards from Türkiye">
        {POSTCARDS.map((card) => (
          <Frame key={card.src} card={card} fixed />
        ))}
      </div>

      {/* Narrower screens: a postcard pile below the planner, captions visible */}
      <section className="mt-10 xl:hidden" aria-label="Postcards from Türkiye">
        <p className="mb-4 text-center font-hand text-2xl text-spice">
          postcards from the trip
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {POSTCARDS.map((card) => (
            <Frame key={card.src} card={card} fixed={false} />
          ))}
        </div>
      </section>

      {/* Photo credits — each link goes to the Commons file page with author & license */}
      <p className="mt-10 text-center text-[10px] leading-relaxed text-ink/35">
        Postcard photos via Wikimedia Commons (author &amp; license on each page):{' '}
        {POSTCARDS.map((card, i) => (
          <span key={card.src}>
            {i > 0 && ' · '}
            <a
              href={card.creditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink/60"
            >
              {card.creditName}
            </a>
          </span>
        ))}
      </p>
    </>
  )
}
