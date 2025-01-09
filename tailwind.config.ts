import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: '#525252',
      },
    },
  },
  plugins: [],
}

export default config
