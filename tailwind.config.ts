import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      colors: {
        parchment: "#f6efe4",
        walnut: "#2b241f",
        brass: "#a9722f",
        rust: "#a94f37",
        spruce: "#295145",
        ink: "#161310"
      },
      boxShadow: {
        card: "0 18px 40px rgba(22, 19, 16, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
