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
        // Dark mode palette
        background: "#18181b", // zinc-900
        foreground: "#f4f4f5", // zinc-100
        primary: "#27272a", // zinc-800
        secondary: "#3f3f46", // zinc-700

        // Princeton Theme
        accent: "#F58025", // Princeton Orange
        "accent-foreground": "#000000", // Black (for text on accent)
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "sans-serif"],
      },
      backgroundImage: {
        "dot-pattern":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)",
      },
      backgroundSize: {
        "dot-sm": "1rem 1rem",
      },
    },
  },
  plugins: [],
};
export default config;
