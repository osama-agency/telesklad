import tailwindcssLogical from 'tailwindcss-logical'
import type { Config } from 'tailwindcss'

import tailwindPlugin from './src/@core/tailwind/plugin'

const config: Config = {
    darkMode: ['class'],
    content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  corePlugins: {
    preflight: false
  },
  important: '#__next',
  theme: {
    extend: {
      fontFamily: {
        'golos': ['var(--font-golos-text)', 'Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      },
      colors: {
        brand: {
          DEFAULT: '#1B6EF3',
          light: '#3EB5EA',
          dark: '#134EC0',
          gradient: {
            from: '#1B6EF3',
            to: '#3EB5EA'
          }
        },
        telesklad: {
          primary: '#1B6EF3',
          secondary: '#3EB5EA',
          dark: '#134EC0'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #134EC0 0%, #2EA5D9 100%)'
      }
    }
  },
  plugins: [tailwindcssLogical, tailwindPlugin]
}

export default config
