import { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: '#3f3f46'
      },
      text: {
        secondary: '#d1d5db'
      }
    }
  },
  plugins: []
}

export default config
