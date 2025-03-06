import preact from '@preact/preset-vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig, PluginOption } from 'vite'
// @ts-expect-error missing types
import inferno from 'vite-plugin-inferno'
// @ts-expect-error may be unused
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'
import tsconfigPaths from 'vite-tsconfig-paths'
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
      return react({ babel: { plugins: [['babel-plugin-react-compiler', {}]] } })
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    //
    tsconfigPaths(),
    vDomPlugin(),
    wasm(),
    // topLevelAwait(),
    VitePWA(),
  ],
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
    plugins: () => [
      wasm(),
      // topLevelAwait()
    ],
  },
})
