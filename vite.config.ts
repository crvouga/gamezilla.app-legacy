import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import preact from "@preact/preset-vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    tsconfigPaths(),
    // @ts-ignore
    VitePWA({
      registerType: "prompt",
    }),
  ],
});
