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
      return inferno()
    }

    case "preact": {
      return preact()
    }

    case "react": {
      return react()
    }

    case "snabbdom": {
      return [{}]
    }
  }
}

const esbuildConfig = () => {
  switch (VDOM_IMPL) {
    case "snabbdom": {
      // https://michealpearce.dev/custom-jsx-with-vite-typescript/
      return {
        jsx: "transform",
        jsxDev: false,
        jsxImportSource: "snabbdom",
        jsxInject: `import { h, jsx, Fragment } from 'snabbdom'`,
        jsxFactory: "jsx",
        jsxFragment: "Fragment",
      } as const
    }

    // https://michealpearce.dev/custom-jsx-with-vite-typescript/
    case "custom-jsx": {
      return {
        jsx: "transform",
        jsxDev: false,
        jsxImportSource: "@",
        jsxInject: `import { jsx } from 'gamezilla-app/@SHARED/vdom/jsx-runtime'`,
        jsxFactory: "jsx.component",
        jsxFragment: "jsx.fragment",
      } as const
    }

    default: {
      return {} as const
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), vDomPlugin()],
  esbuild: esbuildConfig(),
  define: { "process.env": process.env },
})
