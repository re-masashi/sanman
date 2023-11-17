/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./static/activity.js','./static/**/*.html', './templates/**/*.spf' /* ... */],
  theme: {
      extend: {
        animation: {
          glotext: 'glotext 5s ease infinite',
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
        },
      }
  },
  plugins: [],
}

