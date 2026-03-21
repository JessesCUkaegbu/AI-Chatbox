import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d1f26",
        muted: "#5c6370",
        paper: "#f4f1ea",
        brand: "#f25f2a",
        "brand-dark": "#c84b1f",
        card: "#ffffff",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(22, 22, 24, 0.15)",
      },
      fontFamily: {
        sans: ["var(--font-space)", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
