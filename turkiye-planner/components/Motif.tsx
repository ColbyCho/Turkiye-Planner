import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Watermark motifs — hand-drawn single-weight line art, one per kind of thing
// we do, so a block reads at a glance ("that's the boat day") before you read
// a word. Same visual language as the passport stamps: stroke-only,
// currentColor, generous margins. All drawn in a 100×100 box.
// ─────────────────────────────────────────────────────────────────────────────

export type MotifName =
  | 'plane'
  | 'suitcase'
  | 'van'
  | 'compass'
  | 'footsteps'
  | 'meze'
  | 'cay'
  | 'mosque'
  | 'lantern'
  | 'doner'
  | 'nargile'
  | 'palace'
  | 'ferry'
  | 'market'
  | 'fish'
  | 'gulet'
  | 'cocktail'
  | 'moon'
  | 'ruins'
  | 'castle'
  | 'windmill'
  | 'beach'
  | 'football'

const ART: Record<MotifName, ReactNode> = {
  // Top-down airliner silhouette.
  plane: (
    <path d="M50 10 L54 22 L54 40 L84 58 L84 64 L54 54 L54 72 L64 80 L64 85 L50 80 L36 85 L36 80 L46 72 L46 54 L16 64 L16 58 L46 40 L46 22 Z" />
  ),
  suitcase: (
    <>
      <rect x="28" y="36" width="44" height="40" rx="6" />
      <path d="M42 36v-6a4 4 0 014-4h8a4 4 0 014 4v6" />
      <path d="M40 36v40M60 36v40" />
      <circle cx="50" cy="56" r="5" />
    </>
  ),
  van: (
    <>
      <path d="M18 60 V40 a4 4 0 014-4 h56 a4 4 0 014 4 v20 Z" />
      <path d="M26 44h12v8H26ZM44 44h12v8H44ZM62 44h12v8H62Z" />
      <circle cx="32" cy="64" r="5" />
      <circle cx="68" cy="64" r="5" />
      <path d="M6 46h6M4 54h8" />
    </>
  ),
  compass: (
    <>
      <circle cx="50" cy="52" r="26" />
      <circle cx="50" cy="52" r="20" />
      <path d="M50 32 L56 52 L50 72 L44 52 Z" />
      <path d="M50 28v4M50 72v4M30 52h4M66 52h4" />
      <path d="M44 22a6 6 0 0112 0" />
    </>
  ),
  footsteps: (
    <>
      <rect x="30" y="22" width="13" height="21" rx="6" />
      <rect x="32" y="47" width="9" height="7" rx="3.5" />
      <rect x="56" y="46" width="13" height="21" rx="6" />
      <rect x="58" y="71" width="9" height="7" rx="3.5" />
    </>
  ),
  // Three shared plates and a curl of steam — dinner, generally.
  meze: (
    <>
      <path d="M14 56h72" />
      <path d="M18 56a11 11 0 0022 0M39 56a11 11 0 0022 0M60 56a11 11 0 0022 0" />
      <path d="M50 36c-3 4 3 8 0 13M70 40c-2 3 2 6 0 10" />
    </>
  ),
  // Tulip tea glass on its saucer — kahvaltı and every çay stop.
  cay: (
    <>
      <path d="M36 28 C36 40 41 44 41 52 C41 62 45 68 50 68 C55 68 59 62 59 52 C59 44 64 40 64 28" />
      <path d="M36 28h28" />
      <path d="M30 76h40M36 82h28" />
      <path d="M45 10c-3 5 3 8 0 13M55 10c-3 5 3 8 0 13" />
      <rect x="70" y="66" width="9" height="9" />
    </>
  ),
  mosque: (
    <>
      <path d="M18 78h64" />
      <path d="M32 56 a18 18 0 0136 0" />
      <path d="M32 56v22M68 56v22" />
      <path d="M50 38v-8" />
      <circle cx="50" cy="26" r="2.5" />
      <path d="M21 78V40M27 78V40M18 40 L24 26 L30 40M19 52h10" />
      <path d="M73 78V40M79 78V40M70 40 L76 26 L82 40M71 52h10" />
    </>
  ),
  // Grand Bazaar hanging lamp.
  lantern: (
    <>
      <path d="M50 8v10" />
      <path d="M38 26a12 8 0 0124 0" />
      <path d="M38 26 L34 48 L40 64 L60 64 L66 48 L62 26 Z" />
      <path d="M46 27 L44 64 M54 27 L56 64" />
      <path d="M50 64v10M46 76l4 6 4-6" />
    </>
  ),
  doner: (
    <>
      <path d="M50 12v72" />
      <circle cx="50" cy="10" r="3" />
      <path d="M36 26 C33 38 33 52 38 66 L62 66 C67 52 67 38 64 26 Z" />
      <path d="M36 36h28M35 46h30M36 56h28" />
      <path d="M76 36l9 20M85 56l-8 3" />
    </>
  ),
  nargile: (
    <>
      <path d="M45 12h10M50 14v24" />
      <path d="M42 38 C33 45 31 56 35 66 C39 77 61 77 65 66 C69 56 67 45 58 38 Z" />
      <path d="M60 42 C80 38 86 54 76 63 C68 70 60 62 66 57" />
      <path d="M66 57l7 7" />
    </>
  ),
  // Topkapı gate: twin conical towers, arched door.
  palace: (
    <>
      <path d="M16 76h68" />
      <path d="M24 44V76M36 44V76M20 44 L30 28 L40 44" />
      <path d="M64 44V76M76 44V76M60 44 L70 28 L80 44" />
      <path d="M30 28v-7M70 28v-7" />
      <path d="M40 76V60a10 10 0 0120 0v16" />
    </>
  ),
  ferry: (
    <>
      <path d="M18 64 L24 78 H76 L82 64 Z" />
      <path d="M30 52h40v12H30Z" />
      <circle cx="38" cy="58" r="2" />
      <circle cx="50" cy="58" r="2" />
      <circle cx="62" cy="58" r="2" />
      <path d="M46 40h8v12h-8Z" />
      <path d="M56 34c4-4 8-2 8 2" />
      <path d="M18 28c3-4 6-4 9 0c3-4 6-4 9 0M60 20c3-4 6-4 9 0" />
    </>
  ),
  market: (
    <>
      <path d="M24 48h52" />
      <path d="M28 48 L34 76 H66 L72 48" />
      <path d="M40 48V76M50 48V76M60 48V76M32 58h36M34 68h32" />
      <path d="M36 48a14 14 0 0128 0" />
      <path d="M42 40q-2-10 6-14q2 8-6 14" />
      <path d="M58 42l10-12" />
    </>
  ),
  fish: (
    <>
      <path d="M16 50 C28 36 58 36 74 50 C58 64 28 64 16 50 Z" />
      <path d="M74 50 L88 38 C86 46 86 54 88 62 Z" />
      <circle cx="28" cy="47" r="2" />
      <path d="M38 42c4 5 4 11 0 16" />
    </>
  ),
  // Two-masted wooden gulet — THE boat day.
  gulet: (
    <>
      <path d="M18 62 L26 76 H74 L82 62 Z" />
      <path d="M38 62V22M62 62V30" />
      <path d="M38 22 L58 34 M62 30 L78 42" />
      <path d="M14 86q6-6 12 0t12 0t12 0t12 0t12 0" />
    </>
  ),
  cocktail: (
    <>
      <path d="M30 22 C30 38 40 46 50 46 C60 46 70 38 70 22 Z" />
      <path d="M50 46V70M38 72h24" />
      <path d="M68 14q10 2 4 12" />
      <path d="M22 14v8M18 18h8M80 38v7M76.5 41.5h7" />
    </>
  ),
  moon: (
    <>
      <path d="M60 16 A30 30 0 1060 84 A36 36 0 0160 16 Z" />
      <path d="M76 34v10M71 39h10M84 58v7M80.5 61.5h7" />
    </>
  ),
  // Broken columns — Ephesus, Halicarnassus.
  ruins: (
    <>
      <path d="M20 24h24M56 24h24" />
      <path d="M26 30V68M34 30V68M24 28h12M24 70h12" />
      <path d="M46 30V50M54 30V46M44 28h12M46 50l4-6 4 2" />
      <path d="M66 30V68M74 30V68M64 28h12M64 70h12" />
      <path d="M18 78h64M22 72h56" />
    </>
  ),
  castle: (
    <>
      <path d="M34 34V78M66 34V78" />
      <path d="M30 34v-8h8v8h8v-8h8v8h8v-8h8v8" />
      <path d="M30 34h40" />
      <path d="M46 78V64a6 6 0 0112 0v14" />
      <path d="M26 78h48" />
      <path d="M78 70q4-3 8 0" />
    </>
  ),
  windmill: (
    <>
      <path d="M40 76 L44 42 M60 76 L56 42" />
      <path d="M42 42a8 6 0 0116 0" />
      <circle cx="50" cy="34" r="2.5" />
      <path d="M50 34 L32 16 M50 34 L68 16 M50 34 L32 52 M50 34 L68 52" />
      <path d="M32 16l8-2M68 16l-2 8M32 52l2-8M68 52l-8 2" />
      <path d="M34 76h32" />
    </>
  ),
  beach: (
    <>
      <path d="M40 34 L58 78" />
      <path d="M22 44 A28 28 0 0162 22" />
      <path d="M22 44q7 4 13 1q7 4 13 0q7 3 14-3" />
      <path d="M40 34 L30 41 M40 34 L51 27" />
      <circle cx="80" cy="18" r="6" />
      <path d="M80 8v3M80 25v3M70 18h3M87 18h3" />
      <path d="M14 86q6-6 12 0t12 0t12 0t12 0t12 0" />
    </>
  ),
  football: (
    <>
      <circle cx="50" cy="50" r="30" />
      <path d="M50 38 L61 46 L57 59 L43 59 L39 46 Z" />
      <path d="M50 38V21M61 46l16-5M57 59l9 15M43 59l-9 15M39 46l-16-5" />
    </>
  ),
}

/**
 * Motifs with a generated ink drawing in /public/motifs (ChatGPT gpt-image,
 * white keyed to alpha). Rendered as a CSS mask filled with currentColor, so
 * raster art still inherits each block's own ink exactly like the SVGs do.
 * Names not in this set fall back to the hand-drawn SVG art above.
 */
const RASTER = new Set<MotifName>([
  'plane', 'suitcase', 'van', 'compass', 'footsteps', 'meze', 'cay',
  'mosque', 'lantern', 'doner', 'nargile', 'palace', 'ferry', 'market',
  'fish', 'gulet', 'cocktail', 'moon', 'ruins', 'castle', 'windmill',
  'beach', 'football',
])

/** Renders one motif in the current text color — generated ink art when available. */
export default function Motif({
  name,
  size = 48,
  className = '',
}: {
  name: MotifName
  size?: number
  className?: string
}) {
  if (RASTER.has(name)) {
    const mask = `url(/motifs/${name}.png)`
    return (
      <span
        aria-hidden
        className={`inline-block ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: 'currentColor',
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    )
  }
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ART[name]}
    </svg>
  )
}

// Every activity, by id. New activities fall back to keyword rules below, so
// nothing has to touch this map to get a sensible mark.
const BY_ID: Record<string, MotifName> = {
  'd1-cyoa': 'compass', 'd1-logan': 'suitcase', 'd1-flight': 'plane',
  'd2-flight': 'plane', 'd2-transfer': 'van', 'd2-checkin': 'suitcase',
  'd2-pandeli': 'meze', 'd2-cyoa': 'compass', 'd2-stroll': 'footsteps',
  'd3-breakfast': 'cay', 'd3-hagia-blue': 'mosque', 'd3-lunch': 'meze',
  'd3-bazaar': 'lantern', 'd3-cyoa': 'compass', 'd3-dinner': 'doner',
  'd3-nargile': 'nargile',
  'd4-breakfast': 'cay', 'd4-topkapi': 'palace', 'd4-ferry-out': 'ferry',
  'd4-pide': 'meze', 'd4-kadikoy': 'market', 'd4-ferry-back': 'ferry',
  'd4-cyoa': 'compass', 'd4-balikci': 'fish', 'd4-kokorec': 'fish',
  'd5-breakfast': 'cay', 'd5-cyoa': 'compass', 'd5-checkout': 'suitcase',
  'd5-transfer-ist': 'van', 'd5-flight': 'plane', 'd5-arrive-derins': 'suitcase',
  'd5-dinner': 'meze',
  'd6-breakfast': 'cay', 'd6-boat': 'gulet', 'd6-recover': 'cocktail',
  'd6-dinner': 'fish', 'd6-bignight': 'cocktail',
  'd7-breakfast': 'cay', 'd7-mausoleum': 'ruins', 'd7-lunch': 'meze',
  'd7-castle': 'castle', 'd7-marina-walk': 'footsteps', 'd7-dinner': 'meze',
  'd7-barstreet': 'cocktail',
  'd8-brunch': 'cay', 'd8-cyoa': 'compass', 'd8-lunch': 'meze',
  'd8-beach': 'beach', 'd8-windmills': 'windmill', 'd8-dinner': 'meze',
  'd8-night': 'cocktail',
  'd9-drive-out': 'van', 'd9-ephesus': 'ruins', 'd9-lunch': 'meze',
  'd9-extra': 'compass', 'd9-drive-back': 'van', 'd9-dinner': 'meze',
  'd9-nightcap': 'moon',
  'd10-breakfast': 'cay', 'd10-depart': 'van', 'd10-flight': 'plane',
  'd10-transfer': 'van', 'd10-checkin': 'suitcase', 'd10-cyoa': 'compass',
  'd10-doner': 'doner', 'd10-match': 'football',
  'd11-breakfast': 'cay', 'd11-cyoa': 'compass', 'd11-checkout': 'suitcase',
  'd11-transfer': 'van', 'd11-dutyfree': 'market', 'd11-flight': 'plane',
}

const KEYWORDS: [RegExp, MotifName][] = [
  [/flight|airport|\bbos\b|\bist\b|\bbjv\b/i, 'plane'],
  [/ferry/i, 'ferry'],
  [/check.?in|check.?out|pack/i, 'suitcase'],
  [/transfer|van|drive|taxi/i, 'van'],
  [/choose your adventure/i, 'compass'],
  [/breakfast|kahvaltı|brunch|çay/i, 'cay'],
  [/mosque|hagia/i, 'mosque'],
  [/bazaar/i, 'lantern'],
  [/market|shopping|duty.?free/i, 'market'],
  [/döner|doner|dürüm|kebab/i, 'doner'],
  [/fish|balık|midye|kokoreç/i, 'fish'],
  [/nargile/i, 'nargile'],
  [/palace|topkapı/i, 'palace'],
  [/boat|gulet|sail/i, 'gulet'],
  [/beach|swim|cove/i, 'beach'],
  [/castle/i, 'castle'],
  [/ephesus|mausoleum|ancient|ruins/i, 'ruins'],
  [/windmill/i, 'windmill'],
  [/match|soccer|football|stadium/i, 'football'],
  [/night|bar|club|rooftop|blowout/i, 'cocktail'],
  [/stroll|walk/i, 'footsteps'],
  [/wind.?down|chill|early night/i, 'moon'],
  [/dinner|lunch|feast|restaurant/i, 'meze'],
]

/** Motif for an activity: exact map first, then keyword rules, else none. */
export function motifFor(id: string, title: string): MotifName | null {
  const mapped = BY_ID[id]
  if (mapped) return mapped
  for (const [re, name] of KEYWORDS) {
    if (re.test(title)) return name
  }
  return null
}
