import preact from "@preact/preset-vite"
import react from "@vitejs/plugin-react"
import million from "million/compiler"
import { defineConfig } from "vite"
import inferno from "vite-plugin-inferno"
import tsconfigPaths from "vite-tsconfig-paths"
// @ts-ignore
import { VDOM_IMPL } from "./gamezilla/public-config"

function vDomPlugin() {
  switch (VDOM_IMPL) {
    case "inferno": {
      return [inferno()]
    }

    case "preact": {
      return [preact()]
    }

    case "react": {
      return [react()]
    }

    case "react-with-million": {
      return [million.vite({ auto: true }), react()]
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), ...vDomPlugin()],
  server: {
    hmr: false,
  },
  define: { "process.env": process.env },
})
