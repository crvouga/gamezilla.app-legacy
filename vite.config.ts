import preact from '@preact/preset-vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error
import inferno from 'vite-plugin-inferno'
import tsconfigPaths from 'vite-tsconfig-paths'

const vDomPlugin = () => {
  const { VDOM_IMPL } = require('./src/config-public')
  switch (VDOM_IMPL) {
    case 'inferno': {
      return inferno()
    }

    case 'preact': {
      return preact()
    }

    case 'react': {
      return react()
    }

    case 'react-with-compiler': {
      return react({
        babel: {
          plugins: [['babel-plugin-react-compiler', {}]]
        }
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), vDomPlugin(), tsconfigPaths()],
  define: {
    'process.env': process.env
  },
  server: {
    hmr: false
  },
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
