import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, PluginOption } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
// @ts-expect-error library missing types
import inferno from 'vite-plugin-inferno'
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
      return react({
        babel: { plugins: [['babel-plugin-react-compiler', {}]] },
      })
  }
}

const IS_PROD = process.env.NODE_ENV === 'production'

const KILOBYTE = 1024
const MEGABYTE = KILOBYTE * KILOBYTE

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    vDomPlugin(),
    wasm(),
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * MEGABYTE,
      },
    }),
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
    // rollupOptions: {
    //   external: (id) => {
    //     // External Node.js packages that should not be bundled
    //     const nodeOnlyPackages = [
    //       'bcrypt',
    //       'argon2',
    //       'better-sqlite3',
    //       'ws',
    //       '@mapbox/node-pre-gyp',
    //       'mock-aws-s3',
    //       'aws-sdk',
    //       'nock',
    //       'node-pre-gyp',
    //       'express',
    //       'compression',
    //       'tsx',
    //       'nodemon',
    //     ]

    //     // External Node.js built-in modules
    //     const nodeBuiltins = [
    //       'crypto',
    //       'fs',
    //       'path',
    //       'url',
    //       'util',
    //       'stream',
    //       'os',
    //       'zlib',
    //       'http',
    //       'https',
    //       'net',
    //       'tls',
    //       'child_process',
    //       'cluster',
    //       'events',
    //       'buffer',
    //       'querystring',
    //       'readline',
    //       'repl',
    //       'string_decoder',
    //       'sys',
    //       'timers',
    //       'tty',
    //       'dgram',
    //       'dns',
    //       'domain',
    //       'module',
    //       'perf_hooks',
    //       'process',
    //       'punycode',
    //       'vm',
    //       'worker_threads',
    //       'constants',
    //     ]

    //     // Check if id is a Node.js-only package
    //     if (nodeOnlyPackages.some((pkg) => id === pkg || id.startsWith(pkg + '/'))) {
    //       return true
    //     }

    //     // Check if id is a Node.js built-in module (with or without 'node:' prefix)
    //     if (nodeBuiltins.some((builtin) => id === builtin || id === `node:${builtin}`)) {
    //       return true
    //     }

    //     // External backend/test files
    //     if (id.includes('/backend/') || id.includes('.test.') || id.includes('/test/')) {
    //       return true
    //     }

    //     return false
    //   },
    // },
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
