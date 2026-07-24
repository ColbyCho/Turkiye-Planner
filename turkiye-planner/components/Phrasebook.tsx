import { PHRASEBOOK } from '@/data/phrases'
import Disclosure from './Disclosure'

/** Pocket phrasebook — the handful that actually get used. */
export default function Phrasebook() {
  return (
    <Disclosure title="Say it in Turkish" hint="pocket phrasebook">
      <div className="grid gap-3 sm:grid-cols-2">
        {PHRASEBOOK.map((group) => (
          <section
            key={group.title}
            className="rounded border border-rule bg-paper px-3 py-3"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink/45">
              <span aria-hidden>{group.emoji}</span> {group.title}
            </p>
            <dl className="mt-2 space-y-2">
              {group.phrases.map((phrase) => (
                <div key={phrase.tr}>
                  <dt className="font-display text-lg font-semibold leading-tight text-ink">
                    {phrase.tr}
                    <span className="ml-2 font-sans text-[11px] font-normal italic text-turquoise-dark">
                      {phrase.say}
                    </span>
                  </dt>
                  <dd className="text-sm leading-snug text-ink/70">
                    {phrase.en}
                    {phrase.when && (
                      <span className="text-ink/40"> — {phrase.when}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Disclosure>
  )
}
