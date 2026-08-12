// ─────────────────────────────────────────────────────────────────────────────
// The Official Packing List — gender-agnostic, built from the itinerary:
// hot late-August weather, mosque visits (modest dress), a full gulet boat day,
// beaches & coves, a Turkish bath, the Big Night out, Ephesus ruins, and
// staying with Derin's family in Bodrum. Item ids are stable — do not rename
// them, or people's saved checkmarks will detach.
// ─────────────────────────────────────────────────────────────────────────────

export interface PackingItem {
  id: string
  label: string
  /** Optional aside shown under the item. */
  note?: string
}

export interface PackingSection {
  id: string
  title: string
  emoji: string
  /** Optional one-liner under the section heading. */
  blurb?: string
  items: PackingItem[]
}

export const PACKING: PackingSection[] = [
  {
    id: 'docs',
    title: 'Documents & Money',
    emoji: '🛂',
    items: [
      { id: 'docs-passport', label: 'Passport', note: 'Valid at least 6 months past the trip.' },
      { id: 'docs-flights', label: 'Flight confirmations / boarding passes' },
      { id: 'docs-visa', label: 'Türkiye entry check', note: 'Confirm whether you need an e-Visa for your nationality.' },
      { id: 'docs-insurance', label: 'Travel insurance info' },
      { id: 'docs-cards', label: 'Credit / debit cards', note: 'Tell your bank you’re traveling.' },
      { id: 'docs-cash', label: 'Some cash (USD/EUR) to change into lira' },
      { id: 'docs-id', label: 'Driver’s license / backup ID' },
      { id: 'docs-reservations', label: 'Copies of key reservations', note: 'Hotel, boat, Pandeli, Beynel.' },
    ],
  },
  {
    id: 'tech',
    title: 'Tech & Adapters',
    emoji: '🔌',
    items: [
      { id: 'tech-phone', label: 'Phone + charger' },
      { id: 'tech-adapter', label: 'Plug adapter (Type C/F)', note: 'Türkiye runs 220V — a US plug needs an adapter.' },
      { id: 'tech-battery', label: 'Portable battery pack', note: 'Long days out; the boat has no outlets.' },
      { id: 'tech-cables', label: 'Charging cables' },
      { id: 'tech-headphones', label: 'Headphones / earbuds' },
      { id: 'tech-camera', label: 'Camera + charger / memory card' },
      { id: 'tech-esim', label: 'eSIM or international data plan' },
      { id: 'tech-offline', label: 'Offline maps + translation app downloaded' },
    ],
  },
  {
    id: 'clothes',
    title: 'Clothing — Hot Weather',
    emoji: '👕',
    blurb: 'Late-August heat and a lot of walking. Pack light and breathable.',
    items: [
      { id: 'clothes-tops', label: 'Lightweight, breathable tops' },
      { id: 'clothes-bottoms', label: 'Shorts / light trousers' },
      { id: 'clothes-underwear', label: 'Underwear & socks (~10 days)' },
      { id: 'clothes-sleep', label: 'Sleepwear' },
      { id: 'clothes-layer', label: 'Light layer for AC & evening breeze' },
      { id: 'clothes-walkingshoes', label: 'Comfortable walking shoes', note: 'Broken-in — cobblestones everywhere.' },
      { id: 'clothes-sandals', label: 'Sandals / flip-flops' },
      { id: 'clothes-hat', label: 'Sun hat / cap' },
      { id: 'clothes-sunglasses', label: 'Sunglasses' },
    ],
  },
  {
    id: 'mosque',
    title: 'Mosque-Modest Layer',
    emoji: '🕌',
    blurb: 'For Hagia Sophia & the Blue Mosque — shoulders and knees covered; shoes come off at the door.',
    items: [
      { id: 'mosque-cover', label: 'Shoulders-and-knees cover', note: 'Light long sleeves + long skirt or trousers.' },
      { id: 'mosque-scarf', label: 'Lightweight scarf', note: 'Head covering for the Blue Mosque.' },
      { id: 'mosque-shoes', label: 'Easy slip-on/off shoes' },
      { id: 'mosque-socks', label: 'Socks', note: 'Nicer than bare feet on the mosque carpet.' },
    ],
  },
  {
    id: 'water',
    title: 'Beach & Boat Day',
    emoji: '🚤',
    blurb: 'The private gulet day: coves, swimming, snorkeling, paddleboard, and the rope swing.',
    items: [
      { id: 'water-swimsuit', label: 'Swimsuit(s)' },
      { id: 'water-towel', label: 'Quick-dry towel' },
      { id: 'water-shoes', label: 'Water / reef shoes', note: 'Rocky coves and that rope swing.' },
      { id: 'water-sunscreen', label: 'Reef-safe sunscreen SPF 50', note: 'Sunscreen check at Derin’s door — SPF 50 or you’re not boarding.' },
      { id: 'water-aloe', label: 'After-sun / aloe' },
      { id: 'water-pouch', label: 'Waterproof phone pouch' },
      { id: 'water-drybag', label: 'Dry bag' },
      { id: 'water-snorkel', label: 'Goggles / snorkel', note: 'Provided on the boat — BYO if you’re picky.' },
      { id: 'water-coverup', label: 'Swim cover-up' },
    ],
  },
  {
    id: 'health',
    title: 'Toiletries & Health',
    emoji: '🧴',
    items: [
      { id: 'health-teeth', label: 'Toothbrush & toothpaste' },
      { id: 'health-deodorant', label: 'Deodorant' },
      { id: 'health-skincare', label: 'Skincare / face wash' },
      { id: 'health-meds', label: 'Prescription meds', note: 'Bring copies of your scripts.' },
      { id: 'health-motion', label: 'Motion-sickness tablets', note: 'For the boat day.' },
      { id: 'health-pain', label: 'Pain reliever / anti-inflammatory' },
      { id: 'health-blister', label: 'Blister plasters & band-aids' },
      { id: 'health-sanitizer', label: 'Hand sanitizer & tissues' },
      { id: 'health-lipbalm', label: 'Lip balm with SPF' },
      { id: 'health-vitamins', label: 'Daily vitamins' },
    ],
  },
  {
    id: 'night',
    title: 'Nights Out & the Big Night',
    emoji: '🌙',
    blurb: 'One dressier look for the marquee Bodrum night.',
    items: [
      { id: 'night-outfit', label: 'One dressier outfit for the Big Night' },
      { id: 'night-shoes', label: 'Going-out shoes' },
      { id: 'night-jacket', label: 'Light jacket / overshirt for late nights' },
    ],
  },
  {
    id: 'extras',
    title: 'Day Bag & Extras',
    emoji: '🎒',
    items: [
      { id: 'extras-daybag', label: 'Crossbody / day bag', note: 'Keep valuables in front in crowds.' },
      { id: 'extras-bottle', label: 'Reusable water bottle' },
      { id: 'extras-fan', label: 'Handheld / clip fan' },
      { id: 'extras-snacks', label: 'Gum / snacks for travel days' },
      { id: 'extras-laundry', label: 'Laundry / wet bag' },
      { id: 'extras-gift', label: 'A gift for Derin’s family', note: 'Gracious hosts in Bodrum — a small thank-you goes far.' },
      { id: 'extras-tote', label: 'Foldable tote for Grand Bazaar hauls' },
      { id: 'extras-firstaid', label: 'Small first-aid kit' },
    ],
  },
]

/** Every item id, in order — handy for progress counts. */
export const PACKING_ITEM_IDS: string[] = PACKING.flatMap((s) => s.items.map((i) => i.id))
export const PACKING_TOTAL = PACKING_ITEM_IDS.length
