import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import inferno from "vite-plugin-inferno";
import preact from "@preact/preset-vite";
import react from "@vitejs/plugin-react";
import * as config from "./config";

function getVdomPlugin() {
  switch (config.vDom) {
    case "inferno": {
      return inferno();
    }
    case "preact": {
      return preact();
    }
    case "react": {
      return react();
    }
  }
}

// https://vivittejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    getVdomPlugin(),
  ],
  define: { "process.env": process.env },
});
