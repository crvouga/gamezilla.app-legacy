import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { DotEnv } from './src/@/dotenv/dotenv'
import { FileSystem } from './src/@/file-system'

DotEnv.load({ fs: FileSystem({ t: 'node' }), paths: ['.env'] })

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), VitePWA()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
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
    testTimeout: 30000, // 10 seconds
    // pool: 'threads',
    // poolOptions: {
    //   threads: {
    //     singleThread: true,
    //   },
    // },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      inferno: process.env.NODE_ENV === 'production' ? 'inferno' : 'inferno/dist/index.dev.mjs',
    },
  },
})
