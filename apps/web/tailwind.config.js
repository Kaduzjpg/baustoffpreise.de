/** @type {import('tailwindcss').Config} */
module.exports = {
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
        brand: '#009966',
        light: '#f5f5f5'
      },
      boxShadow: {
        soft: '0 6px 24px rgba(0,0,0,0.06)'
      },
      borderRadius: {
        '2xl': '1rem'
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          '2xl': '1200px'
        }
      }
    },
  },
  plugins: [],
}

