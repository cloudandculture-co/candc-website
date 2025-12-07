const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.html","./src/**/*.js"],
  darkMode: 'class',
  theme: {
    extend:{
      rotate: {
        'y-180': '180deg',
      },
      keyframes: {
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scaleIn': {
          '0%': { 'transform-origin': 'left', transform: 'scaleX(0)' },
          '100%': { 'transform-origin': 'left', transform: 'scaleX(1)' },
        },
        'scaleOut': {
          '0%': { 'transform-origin': 'right', transform: 'scaleX(1)' },
          '100%': { 'transform-origin': 'right', transform: 'scaleX(0)' },
        },
      },
      animation: {
        'fade-down': 'fade-down 0.5s ease-out forwards',
        'scale-out-in': 'scaleOut .25s cubic-bezier(.28,.44,.49,1) 0s forwards,scaleIn .4s cubic-bezier(.28,.44,.49,1) .4s forwards',
      },
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 2px 0px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 12px 2px rgba(0, 0, 0, 0.03)',
        'lg': '0 11px 24px 10px rgba(0, 0, 0, 0.05)',
        'xl': '0 24px 48px 0px rgba(0, 0, 0, 0.125)',
      },
      colors: {
        primary:colors.indigo,
        info:colors.blue,
        gray:colors.slate
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1rem',
          lg: '1.5rem',
          xl: '3rem',
          '2xl': '5rem',
        },
      },
    fontFamily: {
      sans: [
       ['Geist'],...defaultTheme.fontFamily.sans,
      ],
      body: [
        ['Geist'],...defaultTheme.fontFamily.sans,
      ],
      serif: [
        ['"Source Serif 4"',
        '"Georgia"',
        '"Cambria"',
        '"Times New Roman"',
        'Times',
        'serif']
      ],
      'icon': ['bootstrap-icons']
    },
    }
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.rotate-y-180': {
          transform: 'rotateY(-180deg)',
        },
      })
    }
  ],
}

