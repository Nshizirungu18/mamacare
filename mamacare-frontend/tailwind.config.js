/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#FDE2E4",
          DEFAULT: "#FF6B6B",
          dark: "#C44536",
        },
        calm: {
          light: "#E0F7FA",
          DEFAULT: "#00ACC1",
          dark: "#006064",
        },
        trust: {
          light: "#E3F2FD",
          DEFAULT: "#2196F3",
          dark: "#0D47A1",
        },
      },
      fontFamily: {
        sans: ["Inter", "Nunito", "sans-serif"],
        heading: ["Nunito Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
