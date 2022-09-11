import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // server: {
  //   hmr: false
  // },

  // why?: https://github.com/vitejs/vite/issues/8644
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },

})
