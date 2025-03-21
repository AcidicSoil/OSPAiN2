/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Chemical-inspired color palette
        carbon: {
          50: "#f5f5f5",
          100: "#e6e6e6",
          200: "#cccccc",
          300: "#b3b3b3",
          400: "#999999",
          500: "#808080",
          600: "#666666",
          700: "#4d4d4d",
          800: "#333333",
          900: "#1a1a1a",
        },
        oxygen: {
          50: "#e6f7ff",
          100: "#b3e6ff",
          200: "#80d4ff",
          300: "#4dc3ff",
          400: "#1ab2ff",
          500: "#00a0e6",
          600: "#0080b3",
          700: "#006080",
          800: "#00404d",
          900: "#00202b",
        },
        nitrogen: {
          50: "#ffe6f2",
          100: "#ffb3d9",
          200: "#ff80c0",
          300: "#ff4da6",
          400: "#ff1a8c",
          500: "#e60073",
          600: "#b3005c",
          700: "#800040",
          800: "#4d0026",
          900: "#2b0015",
        },
        hydrogen: {
          50: "#fff8e6",
          100: "#ffebb3",
          200: "#ffdf80",
          300: "#ffd24d",
          400: "#ffc61a",
          500: "#e6b000",
          600: "#b38900",
          700: "#806200",
          800: "#4d3b00",
          900: "#2b2100",
        },
        phosphorus: {
          50: "#f2ffe6",
          100: "#d9ffb3",
          200: "#c0ff80",
          300: "#a6ff4d",
          400: "#8cff1a",
          500: "#73e600",
          600: "#5cb300",
          700: "#408000",
          800: "#264d00",
          900: "#152b00",
        },
      },
      fontFamily: {
        mono: ["Menlo", "Monaco", "Consolas", "Courier New", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Montserrat", "system-ui", "sans-serif"],
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0)", opacity: 1 },
          "100%": { transform: "scale(4)", opacity: 0 },
        },
        reaction: {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.2)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
      },
      animation: {
        ripple: "ripple 1s linear",
        reaction: "reaction 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
