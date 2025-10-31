import WebFont from 'webfontloader'

export default defineNuxtPlugin(() => {
  // Track font loading status
  const fontsLoaded = ref(false)
  const fontsLoading = ref(false)

  // Load Google Fonts using WebFontLoader
  fontsLoading.value = true

  WebFont.load({
    google: {
      families: [
        'Roboto:400,700',
        'Open Sans:400,700',
        'Lato:400,700',
        'Montserrat:400,700',
        'Raleway:400,700',
        'Poppins:400,700',
        'Nunito:400,700',
        'Inter:400,700',
        'Work Sans:400,700',
        'Playfair Display:400,700',
        'Merriweather:400,700',
        'Lora:400,700',
        'Crimson Text:400,700',
        'Dancing Script:400,700',
        'Pacifico:400',
        'Great Vibes:400',
        'Caveat:400,700',
        'Sacramento:400',
        'Satisfy:400',
        'Shadows Into Light:400',
        'Indie Flower:400',
        'Bebas Neue:400',
        'Permanent Marker:400',
        'Archivo Black:400',
        'Anton:400',
        'Lobster:400',
        'Righteous:400',
        'Roboto Mono:400,700',
      ]
    },
    active: () => {
      fontsLoaded.value = true
      fontsLoading.value = false

      // Emit a custom event that canvas components can listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fonts-loaded'))
      }
    },
    inactive: () => {
      fontsLoading.value = false
    },
    fontinactive: (familyName: string, fvd: string) => {
      // Font failed to load
    }
  })

  // Provide font loading status to components
  return {
    provide: {
      fontsLoaded,
      fontsLoading
    }
  }
})
