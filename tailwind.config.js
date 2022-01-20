module.exports = {
  mode: "jit",
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
  plugins: [require("@tailwindcss/forms")],

  content: ["./src/**/*.{js,ts,jsx,tsx,html,svelte}"],
};
