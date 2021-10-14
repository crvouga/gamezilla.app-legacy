import vercel from "@sveltejs/adapter-vercel";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // docs: https://github.com/sveltejs/svelte-preprocess
  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],

  kit: {
    target: "#svelte",
    adapter: vercel(),
  },
};

export default config;
