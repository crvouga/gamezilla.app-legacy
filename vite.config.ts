import preact from '@preact/preset-vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// @ts-expect-error vite-plugin-inferno missing types
import inferno from 'vite-plugin-inferno'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VDOM_IMPL } from './src/config-public'

const vDomPlugin = () => {
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
      return react({ babel: { plugins: [['babel-plugin-react-compiler', {}]] } })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), vDomPlugin()],
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
  },
  publicDir: 'public' // This is the default, but ensure it's correctly set
})
