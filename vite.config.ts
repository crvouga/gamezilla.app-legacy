import preact from "@preact/preset-vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import inferno from "vite-plugin-inferno"
import tsconfigPaths from "vite-tsconfig-paths"
// @ts-ignore
import { VDOM_IMPL } from "./gamezilla-app/public-config"

const vDomPlugin = () => {
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
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()].concat(vDomPlugin()),
  server: {
    hmr: false,
  },
  define: { "process.env": process.env },
})
