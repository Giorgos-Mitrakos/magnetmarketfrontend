

/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '360px',
      ...defaultTheme.screens
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        siteColors: {
          lightblue: '#246eb5',
          blue: '#24488f',
          pink: '#a9488e',
          purple: '#6e276f'
        },
      },
      gridTemplateRows: {
        'cardLayout': 'minmax(32.5px, 0.5fr) 3.6fr 2.2fr 0.5fr minmax(60px, 0.8fr) 0.7fr'
      },
      boxShadow: {
        'discountPrice': ` 0px -32px 0px -1px #fff, 
        0px -48px #a9488e,0px 48px #a9488e,
        17px -45px #a9488e,-17px -45px #a9488e,
        32px -36px #a9488e,-32px -36px #a9488e,
        42px -23px #a9488e,-42px -23px #a9488e,
        47px -8px #a9488e,-47px -8px #a9488e,        
        47px 8px #a9488e,-47px 8px #a9488e,
        42px 23px #a9488e,-42px 23px #a9488e,
        32px 36px #a9488e,-32px 36px #a9488e,
        17px 45px #a9488e,-17px 45px #a9488e`,
        'topShadow': '0 -5px 20px 0px rgba(0, 0, 0, 0.3)',

      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)', 'transform-origin': '48px 10px' },
          '50%': { transform: 'rotate(3deg)', 'transform-origin': '48px 10px' },
        },
        scrollText :{
          from :{
            transform: 'translateX(0%)'
          },
          to :{
            transform: 'translateX(-75%)'
          }
        }
      },
      animation: {
        wiggle: 'wiggle 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'scroll-text-horizontal':'scrollText 10s infinite linear'
      }
    },
  },
  plugins: [],
}
