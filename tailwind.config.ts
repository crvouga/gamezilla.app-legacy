import { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: '#3f3f46'
      }
    }
  }
}

export default config
