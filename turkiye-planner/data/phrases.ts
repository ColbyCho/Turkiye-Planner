// ─────────────────────────────────────────────────────────────────────────────
// SAY IT IN TURKISH — the handful that actually get used on a trip.
// Pronunciations are rough-and-ready English approximations, not IPA; the
// stressed syllable is capitalized.
// ─────────────────────────────────────────────────────────────────────────────

export interface Phrase {
  tr: string
  say: string
  en: string
  /** When it earns its keep. */
  when?: string
}

export interface PhraseGroup {
  title: string
  emoji: string
  phrases: Phrase[]
}

export const PHRASEBOOK: PhraseGroup[] = [
  {
    title: 'The basics',
    emoji: '👋',
    phrases: [
      { tr: 'Merhaba', say: 'MER-ha-ba', en: 'Hello' },
      { tr: 'Teşekkürler', say: 'te-shek-kur-LER', en: 'Thank you' },
      { tr: 'Lütfen', say: 'LEWT-fen', en: 'Please' },
      { tr: 'Pardon', say: 'par-DON', en: 'Excuse me / sorry' },
      { tr: 'Evet / Hayır', say: 'e-VET / ha-YUHR', en: 'Yes / no' },
      {
        tr: 'İngilizce biliyor musunuz?',
        say: 'in-gi-LIZ-je bi-li-YOR mu-su-nuz',
        en: 'Do you speak English?',
      },
    ],
  },
  {
    title: 'Eating',
    emoji: '🍴',
    phrases: [
      { tr: 'Hesap, lütfen', say: 'he-SAP LEWT-fen', en: 'The bill, please' },
      { tr: 'Çok lezzetli', say: 'chok lez-zet-LEE', en: 'Delicious', when: 'Say it and mean it' },
      { tr: 'Bir çay, lütfen', say: 'beer CHAI LEWT-fen', en: 'One tea, please' },
      {
        tr: 'Et yemiyorum',
        say: 'ET ye-mi-YO-rum',
        en: "I don't eat meat",
        when: 'Swap et for balık (fish)',
      },
      { tr: 'Acı mı?', say: 'a-JUH muh', en: 'Is it spicy?' },
      { tr: 'Afiyet olsun', say: 'a-fi-YET ol-sun', en: 'Enjoy your meal' },
    ],
  },
  {
    title: 'Getting around & buying things',
    emoji: '🧭',
    phrases: [
      { tr: 'Ne kadar?', say: 'ne ka-DAR', en: 'How much?' },
      { tr: 'Çok pahalı', say: 'chok pa-ha-LUH', en: 'Too expensive', when: 'The bazaar opener' },
      { tr: 'Nerede?', say: 'NE-re-de', en: 'Where is it?' },
      { tr: 'Sağa / sola', say: 'sa-A / so-LA', en: 'Right / left' },
      { tr: 'Tuvalet nerede?', say: 'tu-va-LET NE-re-de', en: 'Where is the toilet?' },
      { tr: 'Yardım eder misiniz?', say: 'yar-DUHM e-DER mi-si-niz', en: 'Can you help me?' },
    ],
  },
  {
    title: 'For the group chat',
    emoji: '🎉',
    phrases: [
      { tr: 'Şerefe!', say: 'she-re-FE', en: 'Cheers!' },
      { tr: 'Hadi gidelim', say: 'HA-di gi-de-LIM', en: "Let's go" },
      { tr: 'Çok güzel', say: 'chok gew-ZEL', en: 'Very beautiful' },
      { tr: 'Görüşürüz', say: 'gur-ew-shew-REWZ', en: 'See you later' },
    ],
  },
]
