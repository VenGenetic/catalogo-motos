/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#ff5626',
        'brand-bg': '#051424',
        'brand-surface-1': '#0d1c2d',
        'brand-surface-2': '#122131',
        'brand-surface-3': '#1c2b3c',
        'brand-border': '#273647',
      },
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        hanken: ['Hanken Grotesk', 'sans-serif'],
        geist: ['Geist', 'sans-serif'],
      },
    },
  },
  plugins: [],
}