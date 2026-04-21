/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crema': '#edd4b2',
        'arena': '#d0a98f',
        'vino': '#4d243d',
        'gris-claro': '#cac2b5',
        'base': '#ecdcc9',
      }
    },
  },
  plugins: [],
}