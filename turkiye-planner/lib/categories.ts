import type { Category } from './types'

export interface CategoryStyle {
  label: string
  icon: string
  /** Classes for the block on the day grid — each category gets its own treatment. */
  block: string
  /** Inline background pattern layered on top of the block color, if any. */
  pattern?: string
  /** Classes for the small badge/chip (legend + modal). */
  chip: string
  /** Accent used for the modal's tape + headline underline. */
  accent: string
}

export const CATEGORIES: Record<Category, CategoryStyle> = {
  meal: {
    label: 'Meals',
    icon: '🍴',
    // Recipe-card: warm saffron wash with a hand-torn dashed edge
    block:
      'bg-saffron-light/40 border-2 border-dashed border-saffron text-ink hover:bg-saffron-light/60',
    chip: 'bg-saffron-light/50 border border-dashed border-saffron text-saffron-dark',
    accent: '#D99323',
  },
  stay: {
    label: 'Housing',
    icon: '🗝️',
    // Booked-solid: a sturdy cobalt slab, like a stamped reservation
    block:
      'bg-cobalt text-paper border-2 border-cobalt-dark hover:bg-cobalt-light',
    chip: 'bg-cobalt text-paper border border-cobalt-dark',
    accent: '#1E4B8E',
  },
  transport: {
    label: 'Transport',
    icon: '🎫',
    // Ticket stub: pale card with a perforated right edge
    block:
      'bg-paper-card text-ink border border-turquoise-dark/60 border-r-4 border-r-turquoise border-dotted hover:bg-turquoise-light/20 font-mono tracking-tight',
    pattern:
      'repeating-linear-gradient(90deg, transparent 0 10px, rgba(23,138,153,0.06) 10px 20px)',
    chip: 'bg-paper-card border border-dotted border-turquoise-dark text-turquoise-dark',
    accent: '#178A99',
  },
  tour: {
    label: 'Tours & sights',
    icon: '🕌',
    // İznik tile: turquoise wash with a faint diamond-tile lattice
    block:
      'bg-turquoise/15 border-l-[6px] border-turquoise text-ink hover:bg-turquoise/25',
    pattern:
      'repeating-linear-gradient(45deg, rgba(23,138,153,0.05) 0 2px, transparent 2px 14px), repeating-linear-gradient(-45deg, rgba(30,75,142,0.04) 0 2px, transparent 2px 14px)',
    chip: 'bg-turquoise/20 border border-turquoise text-turquoise-dark',
    accent: '#178A99',
  },
  night: {
    label: 'Nighttime shenanigans',
    icon: '🌙',
    // Bosphorus at night: deep plum with a scatter of stars
    block:
      'bg-night text-paper border-2 border-night-light/60 hover:bg-night-light',
    pattern:
      'radial-gradient(circle 1.5px at 18% 30%, rgba(244,239,232,0.9) 99%, transparent), radial-gradient(circle 1px at 62% 68%, rgba(244,239,232,0.8) 99%, transparent), radial-gradient(circle 1.5px at 84% 22%, rgba(240,201,126,0.9) 99%, transparent), radial-gradient(circle 1px at 38% 82%, rgba(244,239,232,0.7) 99%, transparent), radial-gradient(circle 1px at 90% 58%, rgba(244,239,232,0.6) 99%, transparent)',
    chip: 'bg-night text-paper border border-night-light',
    accent: '#2C2A4A',
  },
  adventure: {
    label: 'Choose Your Adventure',
    icon: '🧭',
    // Dotted map-route look: open paper with a spice compass-stripe wash
    block:
      'bg-paper border-2 border-dashed border-spice/70 text-ink hover:bg-spice/10',
    pattern:
      'repeating-linear-gradient(135deg, rgba(193,68,14,0.05) 0 6px, transparent 6px 18px)',
    chip: 'bg-spice/10 border border-dashed border-spice text-spice-dark',
    accent: '#C1440E',
  },
  misc: {
    label: 'Miscellaneous',
    icon: '📎',
    // Kraft-paper scrap: neutral, unfussy, clipped in
    block:
      'bg-kraft-light/60 border border-kraft-dark/70 text-ink hover:bg-kraft-light',
    chip: 'bg-kraft-light/70 border border-kraft-dark text-ink/80',
    accent: '#8F7C5F',
  },
}

export const CATEGORY_ORDER: Category[] = [
  'meal',
  'stay',
  'transport',
  'tour',
  'night',
  'adventure',
  'misc',
]
