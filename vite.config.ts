import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
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
  plugins: [vDomPlugin(), tsconfigPaths(), tailwindcss()],
  define: {
    'process.env': process.env
  },
  server: {
    hmr: false,
    open: '/main.html',
  },
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: './main.html',
      },
    },
  },
  
})
