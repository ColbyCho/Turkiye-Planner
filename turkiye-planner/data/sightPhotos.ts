import type { Activity, ActivityImage } from '@/lib/types'

// ─────────────────────────────────────────────────────────────────────────────
// Photographs for the activity modals, so a block opens on the actual place or
// the actual plate of food rather than a category emoji.
//
// One photograph per activity, deliberately: a köfte lunch, a dürüm dinner and
// a pide lunch are three different meals and shouldn't open on the same
// picture. Where the itinerary names the dish — çökertme kebabı in Gümbet,
// börek and çay before Topkapı, whole grilled sea bream in the old town — the
// photograph is of that dish.
//
// All from Wikimedia Commons under CC licences, each credited to its
// photographer under the picture. Fetched and reviewed with
// scripts/fetch-sight-photos.ts — Commons search will hand you a Czech village
// called Bôrka for "börek" and a Serbian mehana for "meyhane", so every one of
// these was looked at before it landed here.
// ─────────────────────────────────────────────────────────────────────────────

const PHOTOS = {
  'beach': {
    src: '/sights/beach.jpg',
    alt: 'Sun loungers and thatched umbrellas on a Bodrum beach',
    creditName: 'Tanya Dedyukhina · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Bodrum_-_panoramio_(106).jpg',
  },
  'bitez': {
    src: '/sights/bitez.jpg',
    alt: 'Bitez bay with the village along the shore',
    creditName: 'Mahmut Efe · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Bitez_-_panoramio_(1).jpg',
  },
  'bodrum-castle': {
    src: '/sights/bodrum-castle.jpg',
    alt: 'Bodrum Castle above the harbour, boats moored below',
    creditName: 'Ad Meskens · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Bodrum_castle_3.JPG',
  },
  'bodrum-harbour': {
    src: '/sights/bodrum-harbour.jpg',
    alt: 'Wooden gulets moored bow-in along the Bodrum quay',
    creditName: 'Chris Mitchell · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Bodrum_05.jpg',
  },
  'bodrum-night': {
    src: '/sights/bodrum-night.jpg',
    alt: 'A lit open-air venue on the Bodrum waterfront at night',
    creditName: 'ILIE TROHIN · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:VICTORIA%27S_TANITIM_PHOTO_2013_-_panoramio_(8).jpg',
  },
  'borek': {
    src: '/sights/borek.jpg',
    alt: 'Börek with a glass of çay',
    creditName: 'E4024 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Su_b%C3%B6re%C4%9Fi_and_tea.jpg',
  },
  'bosphorus-dusk': {
    src: '/sights/bosphorus-dusk.jpg',
    alt: 'The Golden Horn at dusk, ferries crossing under a mosque silhouette',
    creditName: 'Joseph Kranak · CC BY 2.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Sunset_over_Istanbul_from_the_Galata_Bridge.jpg',
  },
  'castle-night': {
    src: '/sights/castle-night.jpg',
    alt: 'Bodrum Castle floodlit across the dark water',
    creditName: 'Mehmet Cankaya · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Bodrum_Castle_-_panoramio_(1).jpg',
  },
  'ciya': {
    src: '/sights/ciya.jpg',
    alt: 'The counter of an Anatolian lokanta, trays of regional dishes',
    creditName: 'Matt @ PEK from Taipei, Taiwan · CC BY-SA 2.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Esnaf_lokantas%C4%B1_(Dishes_in_bain_marie).jpg',
  },
  'cokertme': {
    src: '/sights/cokertme.jpg',
    alt: 'Çökertme kebabı — beef over shoestring potatoes with tomato and yoghurt',
    creditName: 'E4024 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:%C3%87%C3%B6kertme.jpg',
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
  'gozleme': {
    src: '/sights/gozleme.jpg',
    alt: 'A woman rolling and cooking gözleme on a griddle',
    creditName: 'William Neuheisel from DC, US · CC BY 2.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:G%C3%B6zleme_Break_(6335105588).jpg',
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
  'karakoy': {
    src: '/sights/karakoy.jpg',
    alt: 'The Karaköy waterfront with Galata rising behind it',
    creditName: 'Arild Vågen · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Karak%C3%B6y_Mars_2013.jpg',
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
  'levrek': {
    src: '/sights/levrek.jpg',
    alt: 'A whole grilled sea bream with lemon and salad',
    creditName: 'Benreis · CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Levrek_Izgara_Beykoz_Koru_Sosyal_Tesisleri.JPG',
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
  'nargile-cafe': {
    src: '/sights/nargile-cafe.jpg',
    alt: 'The lamp-hung arcade of the Çorlulu Ali Paşa nargile courtyard',
    creditName: 'Dosseman · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:%C3%87orlulu_Ali_Pa%C5%9Fa_complex_Nargile_tea_house_in_2024_6664.jpg',
  },
  'pide': {
    src: '/sights/pide.jpg',
    alt: 'A boat-shaped pide topped with pastırma and an egg',
    creditName: 'E4024 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Pastirmali_pide.jpg',
  },
  'raki': {
    src: '/sights/raki.jpg',
    alt: 'A rakı table with meze on a balcony above the street',
    creditName: 'aslı dağ · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Yeni-Rak%C4%B1-Table.JPG',
  },
  'selcuk': {
    src: '/sights/selcuk.jpg',
    alt: 'İsa Bey Mosque at Selçuk, the ruins and the plain behind',
    creditName: 'Carlos Delgado · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:%C4%B0sa_Bey_Camii.jpg',
  },
  'serpme': {
    src: '/sights/serpme.jpg',
    alt: 'A serpme kahvaltı laid out in dozens of small dishes',
    creditName: 'MustafaERTAN · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:TurkishBreakfastAtCesme.jpg',
  },
  'simit': {
    src: '/sights/simit.jpg',
    alt: 'A red simit cart stacked with sesame rings',
    creditName: 'Benreis · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Istanbul_Simit_(2).JPG',
  },
  'spice-bazaar': {
    src: '/sights/spice-bazaar.jpg',
    alt: 'The vaulted, painted hall of the Spice Bazaar',
    creditName: 'Zara1992 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Spice_Bazaar_---Egyptian_Bazaar.jpg',
  },
  'stadium': {
    src: '/sights/stadium.jpg',
    alt: 'A floodlit stand packed with Turkish flags on a match night',
    creditName: 'Maurice Flesier · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Greece_vs_Turkey,_17_November_2015.jpg',
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
 * Which photo each activity gets, keyed by activity id the way motifs are, so
 * the itinerary data stays untouched.
 *
 * Not everything is here. The flights keep their route maps, the days at
 * Derin's house keep the crew's own photographs of it, and the transfers and
 * Choose Your Adventure forks keep their emoji — a compass says "this one is
 * up to you" better than any stock photograph would.
 */
const BY_ACTIVITY: Record<string, PhotoName> = {
  // Istanbul — the first run
  'd2-pandeli': 'spice-bazaar',     // the Ottoman institution above the Spice Bazaar
  'd3-breakfast': 'kahvalti',
  'd3-lunch': 'kofte',
  'd3-bazaar': 'grand-bazaar',
  'd3-dinner': 'durum',
  'd3-nargile': 'nargile-cafe',     // the 300-year-old courtyard, not a shop shelf
  'd4-breakfast': 'borek',          // "light börek + çay to open the day"
  'd4-topkapi': 'topkapi',
  'd4-ferry-out': 'ferry',          // the noon crossing
  'd4-pide': 'pide',
  'd4-kadikoy': 'kadikoy',
  'd4-ferry-back': 'bosphorus-dusk', // the same water, hours later
  'd4-ciya': 'ciya',
  'd4-kokorec': 'kokorec',
  'd5-breakfast': 'simit',

  // Bodrum
  'd5-dinner': 'meze',
  'd6-boat': 'gulet',
  'd6-dinner': 'levrek',            // "whole grilled sea bream"
  'd6-bignight': 'bodrum-night',
  'd7-mausoleum': 'mausoleum',
  'd7-lunch': 'gozleme',
  'd7-castle': 'bodrum-castle',
  'd7-marina-walk': 'marina',
  'd7-dinner': 'cokertme',          // "çökertme kebabı is mandatory"
  'd7-barstreet': 'raki',
  'd8-brunch': 'menemen',           // the cook-off
  'd8-lunch': 'fish',
  'd8-beach': 'beach',
  'd8-windmills': 'windmills',
  'd8-dinner': 'bitez',
  'd8-night': 'castle-night',       // "castle glowing across the water"
  'd9-ephesus': 'ephesus',
  'd9-lunch': 'selcuk',
  'd9-dinner': 'bodrum-harbour',

  // Back to Istanbul
  'd10-hammam': 'hammam',
  'd10-shopping': 'karakoy',
  'd10-galata': 'galata',
  'd10-match': 'stadium',
  'd11-breakfast': 'serpme',        // the Çakmak feast
  'd11-dutyfree': 'lokum',
}

/**
 * The picture for an activity. The mapping above wins where it has an opinion;
 * otherwise an activity's own image stands — that is what keeps the route maps
 * on the flights and Derin's house on the days spent there.
 */
export function photoFor(activity: Activity): ActivityImage | null {
  return PHOTOS[BY_ACTIVITY[activity.id]] ?? activity.image ?? null
}
