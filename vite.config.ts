import path from 'path'
import { defineConfig } from 'vite'
import { DotEnv } from './src/@/dotenv/dotenv'
import { FileSystem } from './src/@/file-system'

await DotEnv.load({
  fs: FileSystem.init({ t: 'node' }),
  paths: ['.env'],
  precedence: 'preserve',
  cwd: process.cwd(),
  env: process.env,
})

const NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) throw new Error('NODE_ENV is not set')

const FRONTEND_PORT = Number(process.env.FRONTEND_PORT)
if (Number.isNaN(FRONTEND_PORT)) throw new Error('FRONTEND_PORT is not set')

const SERVER_REGISTRY_SRC_URL = process.env.SERVER_REGISTRY_SRC_URL
if (!SERVER_REGISTRY_SRC_URL) throw new Error('SERVER_REGISTRY_SRC_URL is not set')

export default defineConfig({
  server: {
    port: Number(FRONTEND_PORT),
  },
  define: {
    'process.env.NODE_ENV': `"${NODE_ENV}"`,
    'process.env.SERVER_REGISTRY_SRC_URL': `"${SERVER_REGISTRY_SRC_URL}"`,
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
    testTimeout: 1000 * 30,
  },
})
