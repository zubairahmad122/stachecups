/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{vue,js,ts}', './layouts/**/*.{vue,js,ts}', './pages/**/*.{vue,js,ts}', './plugins/**/*.{js,ts}', './nuxt.config.{js,ts}', './app.vue'],
  theme: {
    extend: {
      colors: {
        primaryBg: '#F0F1F5',
        primary: '#1EADB0',
        darkest: '#100F30',
        secondary: '#4B5574',
        darkBorder: '#868DAA',
        lightBorder: '#DADEED',
        lightBg: '#F4F4F7',
      },
    },
  },
  plugins: [],
  
}

