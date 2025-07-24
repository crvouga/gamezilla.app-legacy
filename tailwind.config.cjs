/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: '#525252',
      },
    },
  },
  plugins: [],
}
