import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        anthracite: '#1a1a1a',
        light: '#f5f5f5',
        'brand-green': '#2E7D32',
        'brand-blue': '#1976D2',
        cta: {
          DEFAULT: '#FF9800',
          dark: '#F57C00'
        },
        surface: '#F9F9F9',
        ink: '#333333',
        footer: '#2E2E2E'
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          '2xl': '1200px'
        }
      }
    }
  },
  plugins: []
} satisfies Config


