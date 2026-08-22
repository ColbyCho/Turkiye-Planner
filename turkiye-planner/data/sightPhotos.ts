import type { Activity, ActivityImage } from '@/lib/types'

// ─────────────────────────────────────────────────────────────────────────────
// Photographs for the activity modals, so a block opens on the actual place or
// the actual plate of food rather than a category emoji.
//
// All from Wikimedia Commons under CC licences, each credited to its
// photographer under the picture. Fetched and reviewed with
// scripts/fetch-sight-photos.ts — Commons search will hand you a museum's
// catalogue scan as readily as the building, so every one of these was looked
// at before it landed here.
//
// Activities without a photo keep their emoji tile; that path is untouched.
// ─────────────────────────────────────────────────────────────────────────────

const PHOTOS = {
  'beach': {
    src: '/sights/beach.jpg',
    alt: 'Sun loungers and thatched umbrellas on a Bodrum beach',
    creditName: 'Tanya Dedyukhina · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Bodrum_-_panoramio_(106).jpg',
  },
  'blue-mosque': {
    src: '/sights/blue-mosque.jpg',
    alt: 'The Blue Mosque at golden hour, its six minarets against the sky',
    creditName: 'Moonik · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Exterior_of_Sultan_Ahmed_I_Mosque_in_Istanbul,_Turkey_002.jpg',
  },
  'bodrum-castle': {
    src: '/sights/bodrum-castle.jpg',
    alt: 'Bodrum Castle above the harbour, boats moored below',
    creditName: 'Ad Meskens · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Bodrum_castle_3.JPG',
  },
  'cay': {
    src: '/sights/cay.jpg',
    alt: 'A tulip glass of Turkish çay on its saucer',
    creditName: 'Kristof Zerbe · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:B%C3%BCy%C3%BCkada_Cay_(81585233).jpeg',
  },
  'durum': {
    src: '/sights/durum.jpg',
    alt: 'A dürüm cut in half, with tomato and green chilli',
    creditName: 'E4024 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Kokore%C3%A7_d%C3%BCr%C3%BCm.jpg',
  },
  'ephesus': {
    src: '/sights/ephesus.jpg',
    alt: 'The Library of Celsus at Ephesus, its two-storey façade intact',
    creditName: 'Benh LIEU SONG · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Ephesus_Celsus_Library_Fa%C3%A7ade.jpg',
  },
  'ferry': {
    src: '/sights/ferry.jpg',
    alt: 'A commuter ferry on the Bosphorus with Hagia Sophia behind it',
    creditName: 'Moonik · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Sultanahmet_ferry_on_the_Bosphorus_in_Istanbul,_Turkey_001.jpg',
  },
  'fish': {
    src: '/sights/fish.jpg',
    alt: 'A balık ekmek — grilled fish in bread with onion and lemon',
    creditName: 'E4024 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Bal%C4%B1k-ekmek_in_Ankara.jpg',
  },
  'galata': {
    src: '/sights/galata.jpg',
    alt: 'The stone drum and conical roof of the Galata Tower',
    creditName: 'Carlos Delgado · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Galata_Kulesi_-_01.jpg',
  },
  'grand-bazaar': {
    src: '/sights/grand-bazaar.jpg',
    alt: 'A vaulted, lamp-lit corridor of the Grand Bazaar',
    creditName: 'DavidConFran · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Grand_Bazaar_corridor.JPG',
  },
  'gulet': {
    src: '/sights/gulet.jpg',
    alt: 'A wooden gulet under way on the Aegean',
    creditName: 'Coskunkurt48 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Seeing_life_through_a_different_window.jpg',
  },
  'hammam': {
    src: '/sights/hammam.jpg',
    alt: 'The marble göbektaşı of a Turkish bath beneath its dome',
    creditName: 'Satayman · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Hurrem_Sultan_Hamam,_Roxelana_Bath_Interior.jpg',
  },
  'kadikoy': {
    src: '/sights/kadikoy.jpg',
    alt: 'Squid and clams on ice at the Kadıköy fish market',
    creditName: 'William Neuheisel from DC, US · CC BY 2.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Kad%C4%B1k%C3%B6y_Fish_Market_(6418934547).jpg',
  },
  'kahvalti': {
    src: '/sights/kahvalti.jpg',
    alt: 'A Turkish breakfast plate — cheeses, olives, tomato and cucumber',
    creditName: 'Sami Mlouhi · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Turkish_breakfast_photo3.jpg',
  },
  'kofte': {
    src: '/sights/kofte.jpg',
    alt: 'Grilled köfte with peppers, tomato and bread',
    creditName: 'E4024 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Inegol_kofte.jpg',
  },
  'kokorec': {
    src: '/sights/kokorec.jpg',
    alt: 'A tray of kokoreç ringed with bread rolls',
    creditName: 'Bir_Ege_Hikayesi © · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Come_to_kokorec_-)_turkish_food_-_panoramio.jpg',
  },
  'lokum': {
    src: '/sights/lokum.jpg',
    alt: 'Trays of lokum in a confectioner’s window',
    creditName: 'E4024 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Caferzade_-_Kad%C4%B1k%C3%B6y.jpg',
  },
  'marina': {
    src: '/sights/marina.jpg',
    alt: 'Gulets moored in Bodrum marina, the white town behind',
    creditName: 'Michal Osmenda from Brussels, Belgium · CC BY-SA 2.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Bodrum_marina,_Turkey_(5654561350).jpg',
  },
  'mausoleum': {
    src: '/sights/mausoleum.jpg',
    alt: 'The ruins of the Mausoleum at Halicarnassus below the white houses of Bodrum',
    creditName: 'FollowingHadrian · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:The_ruins_of_the_Mausoleum_at_Halicarnassus.jpg',
  },
  'menemen': {
    src: '/sights/menemen.jpg',
    alt: 'Menemen cooking in a pan — eggs, tomato and green pepper',
    creditName: 'E4024 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Cooking_a_menemen.jpg',
  },
  'meze': {
    src: '/sights/meze.jpg',
    alt: 'A meze plate of white cheese and olives with bread',
    creditName: 'Wikimedia Commons · CC BY-SA 2.0 de',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Meze.jpg',
  },
  'nargile': {
    src: '/sights/nargile.jpg',
    alt: 'Rows of nargile pipes lined up in a shop',
    creditName: 'srt1385 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:%D9%85%D8%B3%D8%AA%D8%B1%D9%82%D9%84.jpg',
  },
  'pide': {
    src: '/sights/pide.jpg',
    alt: 'A boat-shaped pide topped with pastırma and an egg',
    creditName: 'E4024 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Pastirmali_pide.jpg',
  },
  'topkapi': {
    src: '/sights/topkapi.jpg',
    alt: 'The Gate of Salutation at Topkapı Palace',
    creditName: 'Yair Haklai · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Gate_of_Salutation_(Topkap%C4%B1_Palace)-.jpg',
  },
  'windmills': {
    src: '/sights/windmills.jpg',
    alt: 'A stone windmill above Bodrum, its sail frame still standing',
    creditName: 'Antoloji · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Old_windmills_in_Bodrum.jpg',
  },
} satisfies Record<string, ActivityImage>

type PhotoName = keyof typeof PHOTOS

/**
 * Which photo each activity gets. Meals point at the dish, sights at the sight.
 * Anything missing here — the flights, the transfers, the Choose Your
 * Adventure forks — keeps its emoji, which suits them better than a stock
 * photograph of an airport would.
 */
const BY_ACTIVITY: Record<string, PhotoName> = {
  // Istanbul, the first run
  'd2-pandeli': 'meze',
  'd3-breakfast': 'kahvalti',
  'd3-hagia-blue': 'blue-mosque',
  'd3-lunch': 'kofte',
  'd3-bazaar': 'grand-bazaar',
  'd3-dinner': 'durum',
  'd3-nargile': 'nargile',
  'd4-breakfast': 'kahvalti',
  'd4-topkapi': 'topkapi',
  'd4-ferry-out': 'ferry',
  'd4-pide': 'pide',
  'd4-kadikoy': 'kadikoy',
  'd4-ferry-back': 'ferry',
  'd4-ciya': 'meze',
  'd4-kokorec': 'kokorec',
  'd5-breakfast': 'kahvalti',

  // Bodrum
  'd5-dinner': 'meze',
  'd6-breakfast': 'kahvalti',
  'd6-boat': 'gulet',
  'd6-dinner': 'fish',
  'd7-breakfast': 'kahvalti',
  'd7-mausoleum': 'mausoleum',
  'd7-lunch': 'meze',
  'd7-castle': 'bodrum-castle',
  'd7-marina-walk': 'marina',
  'd7-dinner': 'fish',
  'd8-brunch': 'menemen',
  'd8-lunch': 'meze',
  'd8-beach': 'beach',
  'd8-windmills': 'windmills',
  'd8-dinner': 'fish',
  'd9-ephesus': 'ephesus',
  'd9-lunch': 'meze',
  'd9-dinner': 'fish',
  'd9-nightcap': 'cay',

  // Back to Istanbul
  'd10-breakfast': 'kahvalti',
  'd10-doner': 'durum',
  'd10-hammam': 'hammam',
  'd10-galata': 'galata',
  'd11-breakfast': 'kahvalti',
  'd11-dutyfree': 'lokum',
}

/** The picture for an activity: its own if it has one, else the mapped photo. */
export function photoFor(activity: Activity): ActivityImage | null {
  return activity.image ?? PHOTOS[BY_ACTIVITY[activity.id]] ?? null
}
