/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#152420",
        surface: "#1D302A",
        surface2: "#233A33",
        gold: "#D9A441",
        jade: "#4FA37D",
        burnt: "#E0763E",
        brick: "#C84B4B",
        ink: "#F3EEDD",
        inkdim: "#9CA9A0",
        hair: "rgba(243,238,221,0.12)",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
