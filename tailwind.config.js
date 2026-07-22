/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0A",
        surface: "#161616",
        surface2: "#212121",
        gold: "#D7FF4E",
        jade: "#22C55E",
        burnt: "#F5A524",
        brick: "#F43F5E",
        ink: "#FFFFFF",
        inkdim: "#8F8F8F",
        hair: "rgba(255,255,255,0.09)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        mono: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
