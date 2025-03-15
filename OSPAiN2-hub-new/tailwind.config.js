/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f1f8',
          100: '#cce3f1',
          200: '#99c7e3',
          300: '#66abd5',
          400: '#338fc7',
          500: '#3498db', // Primary color
          600: '#2980b9',
          700: '#1f6897',
          800: '#154f76',
          900: '#0b2d44',
        },
        secondary: {
          50: '#e8f8ef',
          100: '#d0f0df',
          200: '#a1e2bf',
          300: '#72d39f',
          400: '#43c57f',
          500: '#2ecc71', // Secondary color
          600: '#25ad5e',
          700: '#1c874a',
          800: '#146237',
          900: '#0b3c21',
        },
        accent: {
          50: '#f4ecf7',
          100: '#e9d9ef',
          200: '#d4b3df',
          300: '#be8dcf',
          400: '#a967c0',
          500: '#9b59b6', // Accent color
          600: '#844ca0',
          700: '#683c7e',
          800: '#4d2d5d',
          900: '#33203f',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} 