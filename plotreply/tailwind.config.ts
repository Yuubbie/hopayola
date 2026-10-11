import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12241c",
        moss: "#1f6b4a",
        sand: "#f3eee4",
        gold: "#c4a35a",
        cream: "#fffdf8",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Outfit", "sans-serif"],
        serif: ["var(--font-serif)", "Fraunces", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
