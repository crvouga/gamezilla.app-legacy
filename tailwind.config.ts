import { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: '#3f3f46'
      }
    }
  },
  plugins: []
}

export default config
