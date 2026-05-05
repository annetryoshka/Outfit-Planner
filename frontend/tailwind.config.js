/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blanco': '#ffffff',
        'amarillo': '#fafbad',
        'rosado': '#f6ccfa',
        'morado': '#9f8aef',
        'celeste': '#c2e1f9',
        'verde': '#79d063',
      }
    },
  },
  plugins: [],
}