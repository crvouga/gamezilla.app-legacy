import { Config } from "tailwindcss"

const config: Config = {
  content: ["./index.html", "./gamezilla-app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      textColor: {
        secondary: "#ffffffcc",
      },
      animation: {
        slide: "slide 0.5s linear infinite",
      },
    },
  },
  plugins: [],
}

export default config
