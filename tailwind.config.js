/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './client/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        customGreen: '#7bb44d',
        headingGreen: '#429400',
        lightGreen: '#f8fef0',
        buttonGreen: '#419400',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark', 'lemonade'],
  },
}
