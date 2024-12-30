/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: '#3f3f46'
      }
    }
  },
  plugins: []
}
