/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FFFDEB',
          primary: '#CE2626',
          dark: '#9B1C1C'
        },
      },
    },
  },
  plugins: [],
}
