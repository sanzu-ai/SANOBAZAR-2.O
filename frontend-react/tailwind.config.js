/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#087f5b',
        brandDark: '#066347',
        accent: '#069bf1',
        surface: '#f9fafb'
      }
    },
  },
  plugins: [],
}