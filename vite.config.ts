import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// import inferno from "vite-plugin-inferno";
import preact from "@preact/preset-vite";
import legacy from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // inferno(),
    // https://github.com/vitejs/vite/discussions/7915
    legacy({
      targets: [
        "chrome >= 64",
        "edge >= 79",
        "safari >= 11.1",
        "firefox >= 67",
      ],
      ignoreBrowserslistConfig: true,
      renderLegacyChunks: false,
      /**
       * Polyfills required by modern browsers
       *
       * Since some low-version modern browsers do not support the new syntax
       * You need to load polyfills corresponding to the syntax to be compatible
       * At build, all required polyfills are packaged according to the target browser version range
       * But when the page is accessed, only the required part is loaded depending on the browser version
       *
       * Two configuration methods:
       *
       * 1. true
       *  - Automatically load all required polyfills based on the target browser version range
       *  - Demerit: will introduce polyfills that are not needed by modern browsers in higher versions,
       *    as well as more aggressive polyfills.
       *
       * 2、string[]
       *  - Add low-version browser polyfills as needed
       *  - Demerit: It needs to be added manually, which is inflexible;
       *    it will be discovered after the production is deployed, resulting in production failure! ! !
       */
      modernPolyfills: ["es/global-this"],
      //  or
      // modernPolyfills: true,
    }),
    preact(),
    tsconfigPaths(),
  ],
});
