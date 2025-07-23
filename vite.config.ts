import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig } from 'vite'
import { DotEnv } from './src/@/dotenv/dotenv'
import { FileSystem } from './src/@/file-system'

await DotEnv.load({ fs: FileSystem.init({ t: 'node' }), paths: ['.env'] })

const BACKEND_URL = process.env.BACKEND_URL
if (!BACKEND_URL) throw new Error('BACKEND_URL is not set')

const TOPIC_URL = process.env.TOPIC_URL
if (!TOPIC_URL) throw new Error('TOPIC_URL is not set')

const NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) throw new Error('NODE_ENV is not set')

const FRONTEND_PORT = Number(process.env.FRONTEND_PORT)
if (Number.isNaN(FRONTEND_PORT)) throw new Error('FRONTEND_PORT is not set')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: Number(FRONTEND_PORT),
  },
  define: {
    'process.env.NODE_ENV': `"${NODE_ENV}"`,
    'process.env.BACKEND_URL': `"${BACKEND_URL}"`,
    'process.env.TOPIC_URL': `"${TOPIC_URL}"`,
  },
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      inferno: process.env.NODE_ENV === 'production' ? 'inferno' : 'inferno/dist/index.dev.mjs',
    },
  },
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
    testTimeout: 1000 * 15,
  },
})
