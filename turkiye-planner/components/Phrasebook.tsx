'use client'

import { useState } from 'react'
import { Stamp, type StampLink } from './HelpfulStuff'
import StampModal from './StampModal'

const STAMP: StampLink = {
  id: 'phrases',
  label: 'Turkish phrasebook + tipping guide',
  topText: 'TURKISH PHRASEBOOK',
  bottomText: '✶ + TIPPING GUIDE ✶',
  icon: 'speech',
  url: null,
}

// Phrase, how to say it, what it means.
const PHRASES: [string, string, string][] = [
  ['Merhaba', 'mehr-hah-bah', 'Hello'],
  ['Teşekkürler', 'teh-shek-kur-lehr', 'Thank you'],
  ['Sağ ol', 'saa ohl', 'Thanks (casual)'],
  ['Lütfen', 'luut-fen', 'Please'],
  ['Evet / Hayır', 'eh-vet / high-uhr', 'Yes / No'],
  ['Pardon', 'par-dohn', 'Excuse me / sorry'],
  ['Ne kadar?', 'neh kah-dar', 'How much?'],
  ['Hesap, lütfen', 'heh-sahp luut-fen', 'The check, please'],
  ['Şerefe!', 'sheh-reh-feh', 'Cheers!'],
  ['Çok lezzetli', 'chohk lez-zet-lee', 'Delicious'],
  ['Su', 'soo', 'Water'],
  ['Çay / Kahve', 'chai / kah-veh', 'Tea / Coffee'],
  ['… nerede?', 'neh-reh-deh', 'Where is …?'],
  ['Tuvalet nerede?', 'too-vah-let neh-reh-deh', 'Where’s the bathroom?'],
  ['Günaydın', 'gew-nigh-duhn', 'Good morning'],
  ['İyi akşamlar', 'ee ahk-shahm-lar', 'Good evening'],
  ['Anlamadım', 'ahn-lah-mah-duhm', 'I don’t understand'],
  ['İngilizce biliyor musunuz?', 'een-gee-leez-jeh bee-lee-yor moo-soo-nooz', 'Do you speak English?'],
]

const TIPPING: [string, string][] = [
  ['Restaurants', '5–10% in cash if service was good — check the bill for “servis dahil” (already included).'],
  ['Cafés & street food', 'Round up or leave the coins.'],
  ['Taxis', 'No tip expected — rounding up is plenty.'],
  ['Hamam', 'Pool ~10–20% for the attendants at the end.'],
  ['Hotel porters', 'A small note per bag goes a long way.'],
]

/** Stamp → pocket phrasebook: the eighteen phrases you'll actually use, plus tipping. */
export default function Phrasebook({ rotate }: { rotate: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={STAMP.label}
        className={`group inline-block ${rotate} text-spice/75 transition-transform duration-300 hover:rotate-0 hover:scale-105 hover:text-spice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spice`}
      >
        <Stamp link={STAMP} />
      </button>

      {open && (
        <StampModal label="Turkish phrasebook" accent="#1E4B8E" onClose={() => setOpen(false)}>
          <p className="text-center font-hand text-3xl text-spice">Az Türkçe, çok sevgi</p>
          <p className="mt-1 text-center text-sm text-ink/60">
            A little Turkish, a lot of love — these eighteen carry you far.
          </p>

          <ul className="mt-4 divide-y divide-rule/60">
            {PHRASES.map(([tr, say, en]) => (
              <li key={tr} className="flex items-baseline justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="block font-semibold text-ink/90">{tr}</span>
                  <span className="block text-xs italic text-ink/50">{say}</span>
                </span>
                <span className="shrink-0 text-right text-sm text-ink/70">{en}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-md bg-saffron-light/60 p-4 shadow-note">
            <p className="font-hand text-xl text-spice">Tipping, roughly</p>
            <ul className="mt-2 space-y-1.5">
              {TIPPING.map(([where, what]) => (
                <li key={where} className="text-sm leading-snug text-ink/80">
                  <span className="font-semibold">{where}:</span> {what}
                </li>
              ))}
            </ul>
          </div>
        </StampModal>
      )}
    </>
  )
}
