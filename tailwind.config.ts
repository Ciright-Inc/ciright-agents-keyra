import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#eeeef1",
          200: "#d9d9df",
          300: "#b6b6c0",
          400: "#8a8a96",
          500: "#5f5f6a",
          600: "#43434c",
          700: "#2d2d34",
          800: "#1c1c20",
          900: "#0e0e10",
          950: "#050507",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,15,18,0.04), 0 1px 0 rgba(15,15,18,0.04)",
        elev: "0 2px 4px rgba(15,15,18,0.06), 0 6px 16px rgba(15,15,18,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
