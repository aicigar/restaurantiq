import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:  "#080D1A",
        navy2: "#0F1626",
        navy3: "#162038",
        brd:   "#1E2D4A",
        orange: "#FF6B35",
        amber2: "#FF8C42",
        teal:  "#00C9A7",
        cyan:  "#00A8E0",
        coral: "#FF4D6D",
        purple: "#7C6FFF",
        amber: "#FFB547",
        green: "#22C55E",
        magenta: "#E040FB",
        magentaDim: "rgba(224,64,251,0.12)",
        magentaBrd: "rgba(224,64,251,0.35)",
        pink: "#FF4081",
        pinkDim: "rgba(255,64,129,0.10)",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
      },
      backgroundImage: {
        "grad-orange": "linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFB547 100%)",
        "grad-teal":   "linear-gradient(135deg, #00C9A7 0%, #00A8E0 100%)",
        "grad-coral":  "linear-gradient(135deg, #FF4D6D 0%, #FF6B35 100%)",
        "grad-purple": "linear-gradient(135deg, #7C6FFF 0%, #A855F7 100%)",
        "grad-card":   "linear-gradient(145deg, #0F1626 0%, #162038 100%)",
        "grad-panel":  "linear-gradient(180deg, #0F1626 0%, #162038 100%)",
      },
      boxShadow: {
        "glow-orange": "0 0 30px rgba(255,107,53,0.25)",
        "glow-teal":   "0 0 30px rgba(0,201,167,0.2)",
        "glow-coral":  "0 0 30px rgba(255,77,109,0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
