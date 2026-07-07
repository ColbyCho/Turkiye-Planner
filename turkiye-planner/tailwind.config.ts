import type { Config } from 'tailwindcss'

// Palette drawn from the sights of Istanbul: İznik tile cobalt & turquoise,
// spice-market paprika & saffron, aged paper, and Bosphorus-at-night plum.
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './data/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F5EDDD',
          deep: '#EDE2CC',
          card: '#FAF4E7',
        },
        ink: '#2D2A24',
        rule: '#D8CBB2',
        cobalt: {
          DEFAULT: '#1E4B8E',
          dark: '#16386B',
          light: '#4A76B5',
        },
        turquoise: {
          DEFAULT: '#178A99',
          dark: '#0F6773',
          light: '#79C1CB',
        },
        spice: {
          DEFAULT: '#C1440E',
          dark: '#96340B',
          light: '#E07A4C',
        },
        saffron: {
          DEFAULT: '#D99323',
          dark: '#A66E15',
          light: '#F0C97E',
        },
        night: {
          DEFAULT: '#2C2A4A',
          dark: '#201E38',
          light: '#565285',
        },
        kraft: {
          DEFAULT: '#B9A382',
          dark: '#8F7C5F',
          light: '#D9CBB2',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      boxShadow: {
        page: '0 1px 2px rgba(45,42,36,0.10), 0 12px 32px -12px rgba(45,42,36,0.35)',
        block: '1px 1px 0 rgba(45,42,36,0.18)',
        note: '2px 3px 8px rgba(45,42,36,0.25)',
      },
    },
  },
  plugins: [],
}

export default config
