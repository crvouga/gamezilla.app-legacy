import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import { DotEnv } from './src/@/dotenv/dotenv'
import { FileSystem } from './src/@/file-system'

await DotEnv.load({ fs: FileSystem.init({ t: 'node' }), paths: ['.env'], precedence: 'skip-existing-env-var' })

const BACKEND_URL = process.env.BACKEND_URL
if (!BACKEND_URL) throw new Error('BACKEND_URL is not set')

const TOPIC_URL = process.env.TOPIC_URL
if (!TOPIC_URL) throw new Error('TOPIC_URL is not set')

const NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) throw new Error('NODE_ENV is not set')

const FRONTEND_PORT = Number(process.env.FRONTEND_PORT)
if (Number.isNaN(FRONTEND_PORT)) throw new Error('FRONTEND_PORT is not set')

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        maximumFileSizeToCacheInBytes: 1024 * 1024 * 10,
      },
    }),
  ],
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
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,e2e}.ts'],
    testTimeout: 1000 * 15,
  },
})
