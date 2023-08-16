import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// import inferno from "vite-plugin-inferno";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // inferno(),
    preact(),
    tsconfigPaths(),
  ],
});
