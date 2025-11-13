import { useProductStore } from '~/store/product'
import { useEditorStore } from '~/store/editor'
import { useCanvasOperations } from './useCanvasOperations'

export function useProductSwitcher() {
  const productStore = useProductStore()
  const editorStore = useEditorStore()
  const canvasOps = useCanvasOperations()

  const switchProduct = async (type: string, size: string) => {
    try {
      const oldProduct = { ...productStore.currentProduct }
      const success = productStore.switchProduct(type, size)
      
      if (!success) {
        return { success: false, error: 'Product not found' }
      }

      const scaleX = productStore.currentProduct.width / oldProduct.width
      const scaleY = productStore.currentProduct.height / oldProduct.height

      scaleAllElements(scaleX, scaleY)

      canvasOps.updateCanvasDimensions({
        width: productStore.currentProduct.width,
        height: productStore.currentProduct.height,
      })

      return {
        success: true,
        scaleX,
        scaleY,
        product: productStore.currentProduct,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  const scaleAllElements = (scaleX: number, scaleY: number) => {
    editorStore.elements.forEach((element) => {
      if (element.position) {
        element.position.x *= scaleX
        element.position.y *= scaleY
      }

      if (element.scale) {
        const avgScale = (scaleX + scaleY) / 2
        element.scale *= avgScale
      }

      if ('fontSize' in element && element.fontSize) {
        const avgScale = (scaleX + scaleY) / 2
        element.fontSize = Math.round(element.fontSize * avgScale)
      }

      editorStore.updateElement(element.id, element)
    })
  }

  const getAvailableProducts = () => {
    return [
      { type: 'handlebar', label: 'Handlebar', sizes: ['18oz'] },
      { type: 'walrus', label: 'Walrus', sizes: ['24oz'] },
      { type: 'magnum', label: 'Magnum', sizes: ['16oz', '23oz', '32oz'] },
      { type: 'general', label: 'General', sizes: ['16oz', '24oz', '32oz'] },
      { type: 'sippy', label: 'Sippy', sizes: ['12oz'] },
      { type: 'zappa-wide', label: 'Zappa Wide', sizes: ['12oz'] },
      { type: 'zappa-skinny', label: 'Zappa Skinny', sizes: ['12oz'] },
    ]
  }

  const checkDesignFit = (newWidth: number, newHeight: number): boolean => {
    const currentWidth = productStore.currentProduct.width
    const currentHeight = productStore.currentProduct.height

    if (newWidth < currentWidth || newHeight < currentHeight) {
      return false
    }

    return true
  }

  return {
    switchProduct,
    scaleAllElements,
    getAvailableProducts,
    checkDesignFit,
  }
}
