import preact from '@preact/preset-vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import inferno from 'vite-plugin-inferno'
import tsconfigPaths from 'vite-tsconfig-paths'
// @ts-ignore
import { VDOM_IMPL } from './src/gamezilla-app/config'

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
  plugins: [vDomPlugin(), tsconfigPaths()],
  define: { 'process.env': process.env },
  server: {
    hmr: false
  }
})
