/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        // Venezuelan flag colors
        venezuela: {
          yellow: "#FFCC00",
          blue: "#00247D",
          red: "#CF142B",
        },
        // Primary palette
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Alert/danger colors
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        // Design System Colors - La Memoria de Venezuela
        // Color psychology for accountability and emotional resonance
        memoria: {
          // Danger Red - Sanctions and urgent legal matters (OFAC lists)
          danger: "#C41F2F",
          // Institutional Blue - Government positions and official records
          institutional: "#2D5F7F",
          // Justice Green - Convictions and legal victories
          justice: "#2D7F3F",
          // Warning Amber - Investigations and pending actions
          warning: "#E8A008",
          // Neutral Gray - Archived and inactive records
          neutral: "#999999",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
