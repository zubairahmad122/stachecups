import { ref, computed, nextTick } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { PRODUCT_DIMENSIONS } from '~/config/products'
import { EDITOR_CONFIG } from '~/config/constants'

export function useCanvasOperations() {
  const route = useRoute()

  const containerRef = ref<HTMLElement | null>(null)
  const konvaCanvasRef = ref<any>(null)
  const hiddenCanvas = ref<HTMLCanvasElement | null>(null)
  
  const selectedProduct = ref(route.query.type as string || 'bandit')
  const selectedStyle = ref(route.query.size as string || '16oz')
  
  const getProductDimensions = (type: string, size: string) => {
    return PRODUCT_DIMENSIONS.find(
      (it) => it.style === size && it.name === type
    )
  }
  
  const initialDimensions = getProductDimensions(selectedProduct.value, selectedStyle.value)
  const canvasWidth = ref(initialDimensions?.width || 252.02)
  const canvasHeight = ref(initialDimensions?.height || 145.63)
  
  const containerWidth = computed(() => containerRef.value?.offsetWidth || 952)
  
  const updateCanvasDimensions = (dimensions?: { width: number; height: number }) => {
    let dims = dimensions

    if (!dims) {
      dims = PRODUCT_DIMENSIONS.find(
        (it) => it.style === selectedStyle.value && it.name === selectedProduct.value
      )
    }

    if (!dims) return

    canvasWidth.value = dims.width
    canvasHeight.value = dims.height

    if (containerRef.value) {
      containerRef.value.style.setProperty('--canvas-width', `${canvasWidth.value}mm`)
      containerRef.value.style.setProperty('--canvas-height', `${canvasHeight.value}mm`)

      const pixelsPerMm = 3.779528
      containerRef.value.style.setProperty('--canvas-width-px', `${canvasWidth.value * pixelsPerMm}px`)
      containerRef.value.style.setProperty('--canvas-height-px', `${canvasHeight.value * pixelsPerMm}px`)
      containerRef.value.style.setProperty('--canvas-aspect-ratio', `${canvasWidth.value / canvasHeight.value}/1`)
    }
  }
  
  const updateCupTexture = async (hideSelection = false) => {
    if (!konvaCanvasRef.value || !hiddenCanvas.value) return

    const canvas = hiddenCanvas.value
    const dimensions = PRODUCT_DIMENSIONS.find(
      (it) => it.style === selectedStyle.value && it.name === selectedProduct.value
    )

    if (!dimensions) return

    const pixelsPerMm = 3.779528
    canvas.width = dimensions.width * pixelsPerMm
    canvas.height = dimensions.height * pixelsPerMm
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    try {
      const stage = konvaCanvasRef.value.getStage()
      if (stage) {
        // Temporarily hide transformers/selection rectangles
        const transformers: any[] = []
        stage.find('Transformer').forEach((transformer: any) => {
          transformers.push(transformer)
          transformer.hide()
        })

        // Force a redraw without transformers
        stage.batchDraw()

        // Add a small delay to ensure frame rendering is complete
        await new Promise(resolve => setTimeout(resolve, 50))

        // Capture the stage without selection rectangles
        const konvaDataURL = stage.toDataURL({
          mimeType: 'image/png',
          quality: 1,
          pixelRatio: 2,
        })

        // Restore transformers
        transformers.forEach((transformer: any) => {
          transformer.show()
        })

        // Redraw with transformers visible again
        stage.batchDraw()

        if (konvaDataURL && konvaDataURL !== 'data:,') {
          const img = new Image()
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.drawImage(
              img,
              0, 0, img.width, img.height,
              0, 0, canvas.width, canvas.height
            )

            canvas.dispatchEvent(new Event('update'))
          }
          img.crossOrigin = 'anonymous'
          img.src = konvaDataURL
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          canvas.dispatchEvent(new Event('update'))
        }
      }
    } catch (error) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      canvas.dispatchEvent(new Event('update'))
    }
  }
  
  // Use VueUse's useDebounceFn for better performance
  const debouncedTextureUpdate = useDebounceFn(() => {
    updateCupTexture()
  }, EDITOR_CONFIG.TEXTURE_UPDATE_DEBOUNCE)

  const immediateTextureUpdate = () => {
    nextTick(() => {
      updateCupTexture()
    })
  }
  
  return {
    containerRef,
    konvaCanvasRef,
    hiddenCanvas,
    selectedProduct,
    selectedStyle,
    canvasWidth,
    canvasHeight,
    containerWidth,
    updateCanvasDimensions,
    updateCupTexture,
    debouncedTextureUpdate,
    immediateTextureUpdate,
  }
}

