// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "fin-blue": {
          50: "#e6f0ff",
          100: "#bdd6ff",
          500: "#3366ff",
          700: "#1a4de4",
        },
        "fin-gray": {
          50: "#f6f8fc",
          100: "#edf1f9",
          200: "#e2e8f0",
          300: "#d1d8e6",
          400: "#a3aec2",
          500: "#6b7a99",
          600: "#4a5568",
          800: "#2d3748",
        },
        "fin-yellow": {
          100: "#fff8e6",
          200: "#ffedb3",
          500: "#ffd166",
        },
      },
      boxShadow: {
        fin: "0 4px 12px rgba(0, 0, 0, 0.05)",
        "fin-hover": "0 6px 16px rgba(0, 0, 0, 0.08)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
