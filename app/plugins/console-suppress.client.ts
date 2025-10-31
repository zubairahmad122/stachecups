export default defineNuxtPlugin(() => {
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || ''

    if (
      message.includes('THREE.WebGLRenderer: image is not power of two') ||
      message.includes('THREE.ColladaLoader') ||
      message.includes('convertUpAxis') ||
      message.includes('faces with more than 4 vertices') ||
      message.includes('[Vue warn]')
    ) {
      return
    }

    originalWarn.apply(console, args)
  }

  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || ''

    if (
      message.includes('InvalidCharacterError') ||
      message.includes('is not a valid attribute name')
    ) {
      return
    }

    originalError.apply(console, args)
  }
})
