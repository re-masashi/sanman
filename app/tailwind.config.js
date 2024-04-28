/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./static/*.js','./static/**/*.html', './templates/**/*.spf' /* ... */],
  theme: {
      extend: {
        animation: {
          glotext: 'glotext 5s ease infinite',
          slideinabv: 'slideinabv 1.34s ease'
        },
        keyframes: {
          glotext: {
            '0%, 100%': {
              'background-size': '200% 200%',
              'background-position': 'left center',
            },
            '50%': {
              'background-size': '200% 200%',
              'background-position': 'right center',
            },
          },
          slideinabv:{
            '0%':{
              'transform': 'translateY(-10%)',
            },
            '100%':{
              'transform':'translateY(0)',
            }
          }
        },
      }
  },
  plugins: [],
}

