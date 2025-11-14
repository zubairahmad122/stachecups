import { ref, computed, nextTick } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { PRODUCT_DIMENSIONS } from '~/config/products'
import { EDITOR_CONFIG } from '~/config/constants'
import { useBackgroundStore } from '~/store/background'

export function useCanvasOperations() {
  const route = useRoute()
  const backgroundStore = useBackgroundStore()

  const containerRef = ref<HTMLElement | null>(null)
  const konvaCanvasRef = ref<any>(null)
  const hiddenCanvas = ref<HTMLCanvasElement | null>(null)

  const selectedProduct = ref(route.query.type as string || 'bandit')
  const selectedStyle = ref(route.query.size as string || 'standard')

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
        const allNodes: any[] = []
        stage.find((node: any) => {
          const className = node.getClassName?.()
          if (className && className !== 'Transformer' && className !== 'Layer' && className !== 'Stage') {
            allNodes.push(node)
          }
        })
        const drawableElements = allNodes.filter((node: any) => node.isVisible && node.isVisible())
        const hasElements = drawableElements.length > 0

        const transformers: any[] = []
        stage.find('Transformer').forEach((transformer: any) => {
          transformers.push(transformer)
          transformer.hide()
        })

        stage.batchDraw()
        await new Promise(resolve => setTimeout(resolve, 50))

        const konvaDataURL = stage.toDataURL({
          mimeType: 'image/png',
          quality: 1,
          pixelRatio: 2,
        })

        transformers.forEach((transformer: any) => transformer.show())
        stage.batchDraw()

        if (konvaDataURL && konvaDataURL !== 'data:,') {
          const img = new Image()
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (hasElements) {
              ctx.fillStyle = '#ffffff1a'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
            }

            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
            canvas.dispatchEvent(new Event('update'))
          }
          img.crossOrigin = 'anonymous'
          img.src = konvaDataURL
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          if (hasElements) {
            ctx.fillStyle = '#ffffff1a'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
          canvas.dispatchEvent(new Event('update'))
        }
      }
    } catch (error) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffffff1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      canvas.dispatchEvent(new Event('update'))
    }
  }

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
