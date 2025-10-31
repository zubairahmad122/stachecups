import { defineNuxtPlugin } from '#app'
import 'quill/dist/quill.bubble.css'

export default defineNuxtPlugin((nuxtApp) => {
  // Make Quill available globally for client-side use
  if (process.client) {
    import('quill').then((Quill) => {
      nuxtApp.provide('quill', Quill.default)
      // Also make it available on the global object for direct imports
      ;(window as any).Quill = Quill.default
    })
  }
})