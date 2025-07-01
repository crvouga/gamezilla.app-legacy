import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import wasm from 'vite-plugin-wasm'
import tsconfigPaths from 'vite-tsconfig-paths'

const KILOBYTE = 1024
const MEGABYTE = KILOBYTE * KILOBYTE

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    wasm(),
    VitePWA({ workbox: { maximumFileSizeToCacheInBytes: 3 * MEGABYTE } }),
  ],
  optimizeDeps: {
    exclude: [
      '@journeyapps/wa-sqlite',
      '@powersync/web',
      'bcrypt',
      'argon2',
      'better-sqlite3',
      'ws',
      '@mapbox/node-pre-gyp',
    ],
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  build: {
    target: ['es2022', 'chrome100', 'safari15'],
    chunkSizeWarningLimit: 2 * MEGABYTE,
    rollupOptions: {
      external: [
        // '@journeyapps/wa-sqlite',
        // '@powersync/web',
        'bcrypt',
        'argon2',
        'better-sqlite3',
        'ws',
        '@mapbox/node-pre-gyp',
        'crypto',
      ],
    },
  },
  worker: {
    format: 'es',
    plugins: () => [wasm()],
  },
  resolve: {
    alias: {
      inferno: process.env.NODE_ENV === 'production' ? 'inferno' : 'inferno/dist/index.dev.mjs',
    },
  },
})
