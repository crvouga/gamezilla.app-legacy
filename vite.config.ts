import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import preact from "@preact/preset-vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.png"],
      manifest: {
        name: "gamezilla.app",
        short_name: "gamezilla.app",
        description:
          "gamezilla.app is a multiplayer gaming app. Play games online with your friends.",
        theme_color: "#2663EB",
        background_color: "#000000",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    preact(),
    tsconfigPaths(),
  ],
});
