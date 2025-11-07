import { useEditorStore } from '~/store/editor'
import { useProductStore } from '~/store/product'
import { useBackgroundStore } from '~/store/background'
import { useCollectionStore } from '~/store/collection'

export interface CartItem {
  designData: {
    version: string
    timestamp: number
    product: {
      type: string
      size: string
    }
    elements: any[]
    background: any
    layerStack: any[]
    collection: {
      id: string
      name: string
      licensing: {
        required: boolean
        disclaimer: string | null
        watermark: string | null
      }
    }
  }
  previewImage: string // Base64 PNG
  metadata: {
    elementCount: number
    hasBackground: boolean
    hasText: boolean
    hasImages: boolean
    hasUploadedImages: boolean
    usedAssets: string[]
    collection: string
    restrictedDesign: boolean
  }
  production: {
    outputFormat: 'png'
    resolution: { width: number; height: number }
    colorMode: 'RGB' | 'CMYK'
    sourceCollection: string
    licensingAuditTrail: {
      collection: string
      timestamp: string
      tosAccepted: boolean
      assetsUsed: Array<{
        id: string
        type: string
        source: 'collection' | 'upload' | 'shared'
        licensed: boolean
      }>
    }
  }
}

export function useCart() {
  const editorStore = useEditorStore()
  const productStore = useProductStore()
  const backgroundStore = useBackgroundStore()
  const collectionStore = useCollectionStore()

  const prepareDesignData = () => {
    const layerStack = editorStore.elements.map((element, index) => ({
      id: element.id,
      type: element.type,
      zIndex: index,
      visible: !editorStore.hiddenElements.has(element.id),
      locked: editorStore.lockedElements.has(element.id),
    }))

    const currentCollection = collectionStore.currentCollection

    return {
      version: '2.0',
      timestamp: Date.now(),
      product: {
        type: productStore.currentProduct.type,
        size: productStore.currentProduct.size,
      },
      elements: editorStore.elements,
      background: backgroundStore.currentBackground,
      layerStack,
      collection: {
        id: currentCollection?.id || 'general',
        name: currentCollection?.name || 'General',
        licensing: {
          required: currentCollection?.rules.licensing.required || false,
          disclaimer: currentCollection?.rules.licensing.disclaimer || null,
          watermark: currentCollection?.rules.licensing.watermark || null,
        },
      },
    }
  }

  const generatePreviewImage = (hiddenCanvas: HTMLCanvasElement | null): string => {
    if (!hiddenCanvas) {
      throw new Error('Canvas not available')
    }

    try {
      return hiddenCanvas.toDataURL('image/png', 1.0)
    } catch (error) {
      throw new Error('Failed to generate preview image')
    }
  }

  const getMetadata = () => {
    const hasText = editorStore.elements.some(
      (el) => el.type === 'text' || el.type === 'monogram' || el.type === 'emoji'
    )
    const hasImages = editorStore.elements.some((el) => el.type === 'image')
    const hasUploadedImages = editorStore.elements.some(
      (el: any) => el.type === 'image' && el.uploaded
    )

    const usedAssets = editorStore.elements
      .map((el: any) => el.assetId || el.src || el.id)
      .filter(Boolean)

    return {
      elementCount: editorStore.elements.length,
      hasBackground: backgroundStore.hasBackground,
      hasText,
      hasImages,
      hasUploadedImages,
      usedAssets,
      collection: collectionStore.activeCollection,
      restrictedDesign: collectionStore.isRestrictedCollection,
    }
  }

  const prepareProductionData = (canvas: HTMLCanvasElement) => {
    const assetsUsed = editorStore.elements.map((element: any) => ({
      id: element.id,
      type: element.type,
      source: element.uploaded ? 'upload' as const :
              element.shared ? 'shared' as const :
              'collection' as const,
      licensed: element.licensed || false,
    }))

    return {
      outputFormat: 'png' as const,
      resolution: {
        width: canvas.width,
        height: canvas.height,
      },
      colorMode: collectionStore.canUseCMYK ? 'CMYK' as const : 'RGB' as const,
      sourceCollection: collectionStore.activeCollection,
      licensingAuditTrail: {
        collection: collectionStore.activeCollection,
        timestamp: new Date().toISOString(),
        tosAccepted: collectionStore.tosAccepted,
        assetsUsed,
      },
    }
  }

  const createCartItem = (hiddenCanvas: HTMLCanvasElement | null): CartItem => {
    if (!hiddenCanvas) {
      throw new Error('Canvas is required to create cart item')
    }

    return {
      designData: prepareDesignData(),
      previewImage: generatePreviewImage(hiddenCanvas),
      metadata: getMetadata(),
      production: prepareProductionData(hiddenCanvas),
    }
  }

  const validateDesign = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    const hasBackground = backgroundStore.hasBackground
    if (editorStore.elements.length === 0 && !hasBackground) {
      errors.push('Design is empty. Please add some elements or background.')
    }

    const emptyTextElements = editorStore.elements.filter(
      (el) =>
        (el.type === 'text' || el.type === 'monogram') &&
        (!el.content || el.content.trim() === '')
    )

    if (emptyTextElements.length > 0) {
      errors.push('Some text elements are empty.')
    }

    const unloadedImages = editorStore.elements.filter(
      (el) => el.type === 'image' && (!el.src || el.src === '')
    )

    if (unloadedImages.length > 0) {
      errors.push('Some images are not loaded.')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  const addToCart = async (hiddenCanvas: HTMLCanvasElement | null) => {
    try {
      const validation = validateDesign()
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
        }
      }

      const cartItem = createCartItem(hiddenCanvas)

      console.log('✅ Design Added to Cart\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        '📦 Final Cart Includes:\n' +
        '  ✓ JSON layer stack (designData.layerStack)\n' +
        '  ✓ Flattened PNG preview (previewImage)\n' +
        '  ✓ source_collection tag (production.sourceCollection)\n' +
        '  ✓ Production format with licensing audit trail\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        `📊 Metadata:\n` +
        `  Elements: ${cartItem.metadata.elementCount}\n` +
        `  Collection: ${cartItem.metadata.collection}\n` +
        `  Resolution: ${cartItem.production.resolution.width}x${cartItem.production.resolution.height}\n` +
        `  Color Mode: ${cartItem.production.colorMode}\n` +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        cartItem
      )

      return {
        success: true,
        cartItem,
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  const downloadDesignJSON = () => {
    const designData = prepareDesignData()
    const json = JSON.stringify(designData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `stachecups-design-${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
  }

  const downloadPreview = (hiddenCanvas: HTMLCanvasElement | null) => {
    try {
      const dataUrl = generatePreviewImage(hiddenCanvas)
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `stachecups-preview-${Date.now()}.png`
      link.click()
    } catch (error) {
      throw error
    }
  }

  return {
    prepareDesignData,
    generatePreviewImage,
    getMetadata,
    createCartItem,
    validateDesign,
    addToCart,
    downloadDesignJSON,
    downloadPreview,
  }
}
