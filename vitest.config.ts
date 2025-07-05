import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import wasm from 'vite-plugin-wasm'
import { defineConfig } from 'vitest/config'
import path from 'path'
import { DotEnv } from './src/@/dotenv/dotenv'
import { FileSystem } from './src/@/file-system'

const KILOBYTE = 1024
const MEGABYTE = KILOBYTE * KILOBYTE

DotEnv.load({ fs: FileSystem({ t: 'node' }), paths: ['.env'] })

export default defineConfig({
  plugins: [
    tailwindcss(),
    wasm(),
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * MEGABYTE,
      },
    }),
  ],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['src/**/*.{test,spec,e2e}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
    testTimeout: 30000, // 10 seconds
    // pool: 'threads',
    // poolOptions: {
    //   threads: {
    //     singleThread: true,
    //   },
    // },
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      inferno: 'inferno/dist/index.dev.mjs',
      // inferno: 'inferno/dist/index.esm.js',
    },
  },
})
