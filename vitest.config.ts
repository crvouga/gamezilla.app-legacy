import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig } from 'vitest/config'
import { DotEnv } from './src/@/dotenv/dotenv'
import { FileSystem } from './src/@/file-system'

DotEnv.load({ fs: FileSystem({ t: 'node' }), paths: ['.env'] })

export default defineConfig({
  plugins: [tailwindcss()],
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
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      inferno: 'inferno/dist/index.dev.mjs',
    },
  },
})
