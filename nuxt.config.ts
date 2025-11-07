export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  ignore: ['stachecups-main/**'],

  modules: [
    '@pinia/nuxt',
    'nuxt-quasar-ui',
    '@nuxtjs/tailwindcss',
    '@tresjs/nuxt',
  ],

  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/monogram-fonts.css',
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  tailwindcss: {
    exposeConfig: true,
  },

  quasar: {
    plugins: ['Loading', 'Notify', 'Dialog', 'Screen'],
    iconSet: 'mdi-v7',
    extras: {
      fontIcons: ['mdi-v7', 'material-icons'],
    },
  },

  plugins: [
    '~/plugins/console-suppress.client.ts',
    '~/plugins/webfontloader.client.ts',
    '~/plugins/vue-konva.client.ts',
    '~/plugins/quill.client.ts',
  ],

  build: {
    transpile: ['vue3-emoji-picker'],
  },

  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Raleway:wght@400;700&family=Poppins:wght@400;700&family=Nunito:wght@400;700&family=Inter:wght@400;700&family=Work+Sans:wght@400;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&family=Lora:wght@400;700&family=Crimson+Text:wght@400;700&family=Dancing+Script:wght@400;700&family=Pacifico&family=Great+Vibes&family=Caveat:wght@400;700&family=Sacramento&family=Satisfy&family=Shadows+Into+Light&family=Indie+Flower&family=Bebas+Neue&family=Permanent+Marker&family=Archivo+Black&family=Anton&family=Lobster&family=Righteous&family=Roboto+Mono:wght@400;700&display=swap'
        }
      ]
    },
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'three': ['three'],
            'konva': ['vue-konva', 'konva'],
            'quill': ['quill', '@vueup/vue-quill'],
            'vendor': ['axios', 'uuid'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['vue', 'pinia', '@vueuse/core'],
    },
  },

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    viewTransition: true,
  },

  nitro: {
    compressPublicAssets: true,
    minify: true,
  },
  })
  