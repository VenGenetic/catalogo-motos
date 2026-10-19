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
        'brand-orange': '#f15b27',
        'brand-orange-action': '#cf3f10',
        'brand-bg': '#181818',
        'brand-surface-1': '#202020',
        'brand-surface-2': '#292929',
        'brand-surface-3': '#333333',
        'brand-border': '#454545',
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
        card: '0 1px 2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 22px rgba(0, 0, 0, 0.12)',
        lifted: '0 12px 30px rgba(0, 0, 0, 0.16)',
      },
      // Valores fuera de la escala por defecto que usan los fondos /58, /72, /82, /88 y /92;
      // sin esto Tailwind no genera la clase y el fondo queda transparente.
      opacity: {
        58: '0.58',
        72: '0.72',
        82: '0.82',
        88: '0.88',
        92: '0.92',
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
      transitionTimingFunction: {
        // Salida rápida que frena suave: lo que usan todas las entradas del sitio.
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        // Un pelo de rebote: para lo que "aparece" (el contador del pedido, el visto).
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        // Entrada de tarjetas y secciones: sube 10 px mientras aparece.
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // La moto de la portada entra rodando desde la derecha.
        'drive-in': {
          '0%': { opacity: '0', transform: 'translateX(48px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // El contador del pedido salta cuando cambia.
        pop: {
          '0%': { transform: 'scale(0.6)' },
          '60%': { transform: 'scale(1.22)' },
          '100%': { transform: 'scale(1)' },
        },
        // El visto de "En pedido" se dibuja.
        'check-in': {
          '0%': { opacity: '0', transform: 'scale(0.4) rotate(-25deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        // El ícono de tema gira al cambiar.
        'spin-in': {
          '0%': { opacity: '0', transform: 'rotate(-90deg) scale(0.6)' },
          '100%': { opacity: '1', transform: 'rotate(0deg) scale(1)' },
        },
        // La rayita del menú de abajo crece bajo la pestaña activa.
        'grow-x': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
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
        // `backwards`, no `both`: al terminar, el elemento vuelve a sus estilos normales
        // y el hover (que también usa transform) funciona; con `both` el final de la
        // animación se quedaba pisando el transform del hover.
        rise: 'rise 420ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'drive-in': 'drive-in 700ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
        pop: 'pop 380ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'check-in': 'check-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards',
        'spin-in': 'spin-in 320ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'grow-x': 'grow-x 260ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'fade-in-up': 'fade-in-up 520ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-up': 'scale-up 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
