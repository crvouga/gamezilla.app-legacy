module.exports = {
  mode: "jit",
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
  plugins: [],

  content: ["./src/**/*.{js,ts,jsx,tsx,html,svelte}"],
};
