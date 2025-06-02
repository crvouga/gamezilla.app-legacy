import preact from '@preact/preset-vite'
import react from '@vitejs/plugin-react'
import { defineConfig, PluginOption } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
// @ts-expect-error library missing types
import inferno from 'vite-plugin-inferno'
import wasm from 'vite-plugin-wasm'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { CONFIG_FRONTEND } from './src/config/frontend'

const vDomPlugin = (): PluginOption => {
  switch (CONFIG_FRONTEND.VDOM_IMPL) {
    case 'inferno':
      return inferno()

    case 'preact':
      return preact()

    case 'react':
      return react()

    case 'react-with-compiler':
      return react({
        babel: { plugins: [['babel-plugin-react-compiler', {}]] },
      })
  }
}

const IS_PROD = process.env.NODE_ENV === 'production'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths(), vDomPlugin(), wasm(), VitePWA()],

  optimizeDeps: {
    // https://pglite.dev/docs/bundler-support
    exclude: [
      // '@electric-sql/pglite',
      '@journeyapps/wa-sqlite',
      '@powersync/web',
    ],
    // include: ['@powersync/web > js-logger'],
  },
  build: {
    target: ['es2022', 'chrome100', 'safari15'],
  },
  worker: {
    format: 'es',
    plugins: () => [wasm()],
  },
  resolve: {
    alias: {
      inferno: IS_PROD ? 'inferno' : 'inferno/dist/index.dev.mjs',
    },
  },
})
