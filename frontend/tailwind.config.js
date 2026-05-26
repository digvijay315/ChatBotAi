/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fffcf6',
          100: '#fef3df',
          200: '#fde0b3',
          300: '#fbc37a',
          400: '#fa9e42',
          500: '#f2780c', // Elegant Saffron
          600: '#d65b04',
          700: '#ae4004',
          800: '#8c3107',
          900: '#722809',
        },
        velvet: {
          800: '#4a0808',
          900: '#300303',
        },
        gold: {
          300: '#f3e5ab',
          400: '#e6ca65',
          500: '#d4af37', // Pure Gold
          600: '#b08d24',
          700: '#8a6b18',
        }
      },
      fontFamily: {
        spiritual: ['Cinzel', 'Rozha One', 'serif'],
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'saffron-glow': '0 0 15px rgba(242, 120, 12, 0.3)',
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.4)',
      }
    },
  },
  plugins: [],
}
