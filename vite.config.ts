import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import inferno from "vite-plugin-inferno";

// https://vivittejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), inferno()],
  define: { "process.env": process.env },
});
