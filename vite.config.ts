import _path from "path-browserify"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    
    // why?: https://github.com/vitejs/vite/issues/8644
    esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
      },

    // //why?: 
    // resolve: {
    //     alias: {
    //       path: "path-browserify",
    //     },
    //   },

    // // why?: https://stackoverflow.com/questions/70714690/buffer-is-not-defined-in-react-vite
    // optimizeDeps: {
    //     esbuildOptions: {
    //         // Node.js global to browser globalThis
    //         define: {
    //             global: 'globalThis'
    //         },
    //         // Enable esbuild polyfill plugins
    //         plugins: [
    //             NodeGlobalsPolyfillPlugin({
    //                 buffer: true
    //             })
    //         ]
    //     }
    // }
})
