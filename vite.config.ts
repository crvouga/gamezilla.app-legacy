import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import inferno from "vite-plugin-inferno";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [inferno(), tsconfigPaths()],
});
