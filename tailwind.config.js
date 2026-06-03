/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'sf-gold': {
          DEFAULT: '#D4AF37',
          light: '#F9D423',
          dark: '#B39431'
        },
        'sf-black': '#1A1A1A',
        'sf-charcoal': '#2A2A2A',
        'sf-emerald': '#50C878'
      },
      fontFamily: {
        sans: ['Inter var', 'ui-sans-serif', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale': 'scale 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to right, #F9D423, #D4AF37)',
        'dark-gradient': 'linear-gradient(to bottom, #2A2A2A, #1A1A1A)',
      },
      boxShadow: {
        'gold': '0 0 15px rgba(212, 175, 55, 0.3)',
        'gold-sm': '0 0 10px rgba(212, 175, 55, 0.2)',
        'inner-gold': 'inset 0 2px 4px 0 rgba(212, 175, 55, 0.06)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      backdropBlur: {
        xs: '2px',
      },
      letterSpacing: {
        'widest': '0.2em',
      },
    },
  },
  plugins: [],
};