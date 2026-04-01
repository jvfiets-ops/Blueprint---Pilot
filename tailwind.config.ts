import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1a14",
        sidebar: "#152620",
        card: "#1a2e23",
        border: "#2a3e33",
        accent: "#A67C52",
        "accent-light": "#c9a67a",
        beige: "#F5EFE0",
        green: {
          dark: "#1C3D2E",
          deep: "#152620",
        },
        bronze: "#A67C52",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(90deg, #1C3D2E, #A67C52, #c9a67a)",
      },
    },
  },
  plugins: [],
};

export default config;
