import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import inferno from "vite-plugin-inferno";
import preact from "@preact/preset-vite";

const vDomImpl = "preact" as string

// https://vivittejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), vDomImpl === "inferno" ? inferno() : preact()],
  define: { "process.env": process.env },
});
