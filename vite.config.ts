import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import preact from "@preact/preset-vite";
// import inferno from "vite-plugin-inferno";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // inferno(),
    preact(),
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
  esbuild: {
    tsconfigRaw: require("./tsconfig.json"),
  },
});
