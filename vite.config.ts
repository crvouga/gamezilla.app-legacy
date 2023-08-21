import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import preact from "@preact/preset-vite";
import inferno from "vite-plugin-inferno";
import legacy from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // https://github.com/vitejs/vite/discussions/7915
    false
      ? legacy({
          ignoreBrowserslistConfig: true,
          renderLegacyChunks: true,
          modernPolyfills: true,
        })
      : null,

    inferno(),
    // preact(),
    tsconfigPaths(),
  ],
});
