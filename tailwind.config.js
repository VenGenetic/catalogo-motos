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
        'brand-orange-action': '#d63b0d',
        'brand-bg': '#051424',
        'brand-surface-1': '#0d1c2d',
        'brand-surface-2': '#122131',
        'brand-surface-3': '#1c2b3c',
        'brand-border': '#273647',
        'ui-canvas': 'rgb(var(--ui-canvas) / <alpha-value>)',
        'ui-surface': 'rgb(var(--ui-surface) / <alpha-value>)',
        'ui-muted': 'rgb(var(--ui-muted) / <alpha-value>)',
        'ui-raised': 'rgb(var(--ui-raised) / <alpha-value>)',
        'ui-border': 'rgb(var(--ui-border) / <alpha-value>)',
        'ui-ink': 'rgb(var(--ui-ink) / <alpha-value>)',
        'ui-copy': 'rgb(var(--ui-copy) / <alpha-value>)',
      },
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        hanken: ['Hanken Grotesk', 'sans-serif'],
        geist: ['Geist', 'sans-serif'],
        sans: ['Hanken Grotesk', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(5, 20, 36, 0.055)',
        'card-hover': '0 18px 42px rgba(5, 20, 36, 0.11)',
        lifted: '0 14px 34px rgba(5, 20, 36, 0.12)',
      },
      zIndex: {
        sticky: '30',
        dropdown: '40',
        nav: '50',
        floating: '60',
        overlay: '80',
        modal: '90',
        toast: '100',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-up': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 520ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-up': 'scale-up 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
