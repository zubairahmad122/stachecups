import { watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useEditorStore } from '~/store/editor'
import { useProductStore } from '~/store/product'
import { useBackgroundStore } from '~/store/background'

const AUTOSAVE_KEY = 'stachecups_design_autosave'
const AUTOSAVE_INTERVAL = 3000 // 3 seconds

export interface SavedDesign {
  version: string
  timestamp: number
  product: {
    type: string
    size: string
  }
  elements: any[]
  background: any
}

export function useAutosave() {
  const editorStore = useEditorStore()
  const productStore = useProductStore()
  const backgroundStore = useBackgroundStore()

  let autosaveTimer: ReturnType<typeof setTimeout> | null = null
  let lastSaveHash: string = ''

  // Generate hash of current design to detect changes
  const getDesignHash = () => {
    const design = {
      elements: editorStore.elements,
      background: backgroundStore.currentBackground,
      product: productStore.currentProduct,
    }
    return JSON.stringify(design)
  }

  // Save design to localStorage
  const saveDesign = () => {
    try {
      const currentHash = getDesignHash()

      // Only save if design has changed
      if (currentHash === lastSaveHash) {
        return
      }

      const savedDesign: SavedDesign = {
        version: '1.0',
        timestamp: Date.now(),
        product: {
          type: productStore.currentProduct.type,
          size: productStore.currentProduct.size,
        },
        elements: editorStore.elements,
        background: backgroundStore.currentBackground,
      }

      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(savedDesign))
      lastSaveHash = currentHash
    } catch (error) {
      // Failed to autosave
    }
  }

  // Load design from localStorage
  const loadDesign = (): SavedDesign | null => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY)
      if (!saved) return null

      const design: SavedDesign = JSON.parse(saved)

      // Validate design structure
      if (!design.version || !design.elements || !design.product) {
        return null
      }

      return design
    } catch (error) {
      return null
    }
  }

  // Restore design
  const restoreDesign = (design: SavedDesign) => {
    try {
      // Clear existing elements first
      editorStore.elements = []

      // Restore product first
      const productSwitched = productStore.switchProduct(design.product.type, design.product.size)
      if (!productSwitched) {
        // Failed to switch product during restore
      }

      // Wait for product switch to complete
      nextTick(() => {
        // Restore background based on type
        if (design.background && design.background.type !== 'none') {
          if (design.background.type === 'solid') {
            backgroundStore.setSolidColor(design.background.solidColor, false)
          } else if (design.background.type === 'pattern' && design.background.pattern) {
            backgroundStore.setPattern(design.background.pattern)
          } else if (design.background.type === 'image' && design.background.imageUrl) {
            backgroundStore.setImageBackground(design.background.imageUrl)
          }

          // Restore opacity if specified
          if (design.background.opacity !== undefined) {
            backgroundStore.setOpacity(design.background.opacity)
          }
        } else {
          backgroundStore.clearBackground()
        }

        // Restore elements - ensure we're creating new references
        if (design.elements && Array.isArray(design.elements)) {
          editorStore.elements = JSON.parse(JSON.stringify(design.elements))
        }

        lastSaveHash = getDesignHash()
      })

      return true
    } catch (error) {
      return false
    }
  }

  // Clear saved design
  const clearSaved = () => {
    localStorage.removeItem(AUTOSAVE_KEY)
    lastSaveHash = ''
  }

  // Start autosave
  const startAutosave = () => {
    stopAutosave() // Clear any existing timer

    // Watch for changes and debounce saves
    const unwatchElements = watch(
      () => editorStore.elements,
      () => {
        if (autosaveTimer) {
          clearTimeout(autosaveTimer)
        }
        autosaveTimer = setTimeout(saveDesign, AUTOSAVE_INTERVAL)
      },
      { deep: true }
    )

    const unwatchBackground = watch(
      () => backgroundStore.currentBackground,
      () => {
        if (autosaveTimer) {
          clearTimeout(autosaveTimer)
        }
        autosaveTimer = setTimeout(saveDesign, AUTOSAVE_INTERVAL)
      },
      { deep: true }
    )

    const unwatchProduct = watch(
      () => productStore.currentProduct,
      () => {
        if (autosaveTimer) {
          clearTimeout(autosaveTimer)
        }
        autosaveTimer = setTimeout(saveDesign, AUTOSAVE_INTERVAL)
      },
      { deep: true }
    )

    // Return cleanup function
    return () => {
      unwatchElements()
      unwatchBackground()
      unwatchProduct()
      stopAutosave()
    }
  }

  // Stop autosave
  const stopAutosave = () => {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
      autosaveTimer = null
    }
  }

  // Generate shareable link
  const generateShareableLink = (): string => {
    try {
      const design: SavedDesign = {
        version: '1.0',
        timestamp: Date.now(),
        product: {
          type: productStore.currentProduct.type,
          size: productStore.currentProduct.size,
        },
        elements: editorStore.elements,
        background: backgroundStore.currentBackground,
      }

      // Compress and encode design
      const json = JSON.stringify(design)
      const encoded = btoa(encodeURIComponent(json))

      // Generate URL
      const baseUrl = window.location.origin
      return `${baseUrl}?design=${encoded}`
    } catch (error) {
      return ''
    }
  }

  // Load design from URL
  const loadFromUrl = (): boolean => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const designParam = urlParams.get('design')

      if (!designParam) return false

      // Decode and parse
      const json = decodeURIComponent(atob(designParam))
      const design: SavedDesign = JSON.parse(json)

      // Restore design
      return restoreDesign(design)
    } catch (error) {
      return false
    }
  }

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    const currentHash = getDesignHash()
    return currentHash !== lastSaveHash
  }

  // Check if design is empty
  const isDesignEmpty = () => {
    return editorStore.elements.length === 0 && !backgroundStore.currentBackground
  }

  return {
    saveDesign,
    loadDesign,
    restoreDesign,
    clearSaved,
    startAutosave,
    stopAutosave,
    generateShareableLink,
    loadFromUrl,
    hasUnsavedChanges,
    isDesignEmpty,
  }
}
