/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  darkMode: "media",
  content: [
    "src/css/**/*.css",
    "index.{html,ts}",
    "src/elm/**/*.elm",
    "src/typescript/**/*.ts",
  ],
  theme: {
    extend: {},
  },
  safelist: process.env.SAFELISTING ? [{ pattern: /.*/ }] : [],
  variants: {},
  plugins: [],
};
