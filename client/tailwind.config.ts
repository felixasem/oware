import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50:  "#fdf8f0",
          100: "#f9edda",
          200: "#f1d9b0",
          300: "#e6be7d",
          400: "#d9a04a",
          500: "#c4862e",
          600: "#a86b22",
          700: "#8a521d",
          800: "#72431e",
          900: "#5e381d",
        },
        seed: {
          light: "#c8b400",
          dark:  "#8b7d00",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
      boxShadow: {
        pit: "inset 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 4px rgba(0,0,0,0.3)",
        "pit-hover": "inset 0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px rgba(250,204,21,0.7)",
        seed: "0 2px 4px rgba(0,0,0,0.4)",
      },
      keyframes: {
        "seed-land": {
          "0%": { transform: "scale(0) translateY(-20px)", opacity: "0" },
          "60%": { transform: "scale(1.2) translateY(0)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        "capture-flash": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "seed-land": "seed-land 0.3s ease-out",
        "capture-flash": "capture-flash 0.4s ease-in-out 2",
        pulse: "pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
