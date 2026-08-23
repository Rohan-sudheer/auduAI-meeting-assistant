/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#dcedff",
          200: "#b6dcff",
          300: "#84c4ff",
          400: "#4da3ff",
          500: "#0a84ff",
          600: "#0071e3",
          700: "#0058b0",
          800: "#00468a",
          900: "#003665",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px -8px rgba(15, 23, 42, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
        "glass-sm": "0 2px 12px -4px rgba(15, 23, 42, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
      },
      animation: {
        "fade-in": "fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}
