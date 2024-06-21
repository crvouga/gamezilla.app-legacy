import preact from "@preact/preset-vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import inferno from "vite-plugin-inferno";
import solid from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
// @ts-ignore
import { VDOM_IMPL } from "./public-config";

const vDomPlugin = () => {
	switch (VDOM_IMPL) {
		case "inferno": {
			return inferno();
		}

		case "preact": {
			return preact();
		}

		case "react": {
			return react();
		}

		case "react-with-compiler": {
			const ReactCompilerConfig = {};

			return react({
				babel: {
					plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
				},
			});
		}

		case "solid": {
			return solid();
		}
	}
};

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vDomPlugin(), tsconfigPaths()],
	define: { "process.env": process.env },
	server: {
		hmr: false,
	},
});
