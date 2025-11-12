<template>
  <div class="image-editor-container">
    <TopBar
      v-if="!uiStore.isCheckoutMode"
      v-model="designName"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :zoom="canvasZoom"
      @undo="undo"
      @redo="redo"
      @zoom-in="handleZoomIn"
      @zoom-out="handleZoomOut"
      @download="handleDownload"
      @publish="handleCheckout"
      @share-design="handleShareDesign"
      @collection-changed="handleCollectionChanged"
      @switch-product="showProductSwitcher = true"
    />

    <PreviewCard
      v-if="uiStore.render"
      :zoom="uiStore.previewZoom"
      :canvas-element="getHiddenCanvas()"
      :is-checkout="uiStore.isCheckoutMode"
      @toggle-zoom="uiStore.togglePreviewZoom()"
    />

    <CheckoutSection
      v-if="['checkout', 'mockup'].includes(uiStore.visualization)"
      :canvas-element="uiStore.render ? getHiddenCanvas() : undefined"
      :is-checkout="uiStore.isCheckoutMode"
      @add-to-cart="addToCart"
      @go-back="uiStore.returnToDesign()"
    />

    <div class="canvas-section-container flex flex-col items-center justify-center pt-20" :style="{ transform: `scale(${canvasZoom})`, transformOrigin: 'center', transition: 'transform 0.2s ease' }">
      <CanvasSection
        v-show="uiStore.isDesignMode || (uiStore.isMockupMode && $q.screen.gt.sm)"
        ref="canvasSectionRef"
        :width="canvasWidth"
        :height="canvasHeight"
        :images="images"
        :texts="texts"
        :selected-element-id="selectedElementId || undefined"
        :locked-elements="lockedElements"
        :hidden-elements="editorStore.hiddenElements"
        :is-dragging="isDragging"
        :is-editing-text="textEditorStore.isEditingText"
        :draw-tool-active="drawToolStore.isActive"
        :text-tool-active="textEditorStore.textToolActive"
        :brush-size="drawToolStore.brushSize"
        :brush-color="drawToolStore.brushColor"
        :tool-mode="drawToolStore.toolMode"
        :eraser-size="drawToolStore.eraserSize"
        :bucket-color="drawToolStore.bucketColor"
        :hide-controls="uiStore.hideControls"
        :hide-everything="uiStore.hideEverything"
        :background-url="route.query.background_url as string | undefined"
        :can-undo="canUndo"
        :can-redo="canRedo"
        :editing-content="textEditorStore.editingTextContent"
        :editing-position="textEditorStore.editingTextPosition"
        :editing-font-size="textEditorStore.editingTextFontSize"
        :editing-font-family="textEditorStore.editingTextFontFamily"
        :editing-color="textEditorStore.editingTextColor"
        :editing-width="textEditorStore.editingTextWidth"
        :editing-height="textEditorStore.editingTextHeight"
        @element-select="selectElement"
        @element-delete="handleDeleteElement"
        @element-update="handleElementUpdate"
        @edit-start="handleTextEditStart"
        @edit-finish="finishTextEditing"
        @drawing-update="drawToolStore.setCurrentDrawing($event)"
        @stage-click="handleStageClick"
        @texture-update="canvasOps.updateCupTexture()"
        @change-image="handleChangeImage"
        @edit-drawing="handleEditDrawing"
        @format-text="handleFormatText"
        @toggle-lock="editorStore.toggleLock($event)"
        @flip-horizontal="elementOps.flipHorizontal($event)"
        @flip-vertical="elementOps.flipVertical($event)"
        @duplicate="handleDuplicate"
        @add-frame="handleAddFrame"
        @remove-frame="handleRemoveFrame"
        @rotate-element="elementOps.rotateElement($event)"
        @move-element="handleMoveElement"
        @bring-to-front="handleBringToFront"
        @send-to-back="handleSendToBack"
        @font-change="handleFontChange"
        @color-change="handleColorChange"
        @underline-change="handleUnderlineChange"
        @undo="undo"
        @redo="redo"
        @content-change="handleQuillContentChange"
        @finish-editing="finishTextEditing"
        @cancel-editing="cancelTextEditing"
        @editor-error="handleQuillError"
        @update:brush-size="drawToolStore.setBrushSize($event)"
        @update:brush-color="drawToolStore.setBrushColor($event)"
        @update:tool-mode="drawToolStore.setToolMode($event)"
        @update:eraser-size="drawToolStore.setEraserSize($event)"
        @update:bucket-color="drawToolStore.setBucketColor($event)"
        @undo-drawing="undoDrawing"
        @clear-drawing="clearDrawing"
        @finish-drawing="finishDrawing"
      />
    </div>

    <div v-show="!uiStore.isCheckoutMode" class="full-width justify-end flex q-pt-md">
      <q-btn-toggle
        v-if="$q.screen.lt.md"
        v-model="uiStore.visualization"
        style="border: 1px solid #027be3"
        no-caps
        rounded
        unelevated
        toggle-color="primary"
        color="white"
        text-color="primary"
        :options="[
          { label: 'Design', value: 'design' },
          { label: 'Mockup', value: 'mockup' },
        ]"
      />
    </div>

    <image-toolbar
      ref="sidebarRef"
      v-show="!uiStore.isCheckoutMode"
      :text-tool-active="textEditorStore.textToolActive"
      :draw-tool-active="drawToolStore.isActive"
      @upload="handleImageUpload"
      @add-image="handleImageUrl"
      @add-emoji="handleEmoji"
      @checkout="handleCheckout"
      @activate-text-tool="activateTextTool"
      @activate-draw-tool="activateDrawTool"
      @open-advanced-text="() => {}"
      @add-monogram="handleAddMonogram"
      @update-monogram="handleUpdateMonogram"
      @switch-product="handleSwitchProduct"
      @font-change="handleFontChange"
      @font-size-change="handleFontSizeChange"
      @color-change="handleColorChange"
      @bold-change="handleBoldChange"
      @italic-change="handleItalicChange"
      @underline-change="handleUnderlineChange"
      @stroke-toggle="handleStrokeToggle"
      @stroke-color-change="handleStrokeColorChange"
      @stroke-width-change="handleStrokeWidthChange"
      @shadow-toggle="handleShadowToggle"
      @shadow-color-change="handleShadowColorChange"
      @shadow-blur-change="handleShadowBlurChange"
      @shadow-offset-x-change="handleShadowOffsetXChange"
      @shadow-offset-y-change="handleShadowOffsetYChange"
      @shadow-opacity-change="handleShadowOpacityChange"
      @engrave-toggle="handleEngraveToggle"
      @letter-spacing-change="handleLetterSpacingChange"
      @line-height-change="handleLineHeightChange"
      @update:brush-size="handleBrushSizeChange"
      @update:brush-color="handleBrushColorChange"
      @undo-drawing="undoDrawing"
      @clear-drawing="handleClearDrawing"
      @finish-drawing="handleFinishDrawing"
      @layer-update="canvasOps.updateCupTexture()"
      @layer-select="handleLayerSelect"
    />

    <FrameSelectionModal
      :visible="showFrameModal"
      :image-preview="pendingImageData || undefined"
      @select="handleFrameSelectionFromModal"
      @cancel="handleCancelFrameSelection"
      @update:visible="showFrameModal = $event"
    />

    <EnhancedMonogramPicker
      :show="monogramStore.showMonogramPicker"
      :editing-element="monogramStore.editingMonogram"
      @add="handleAddMonogram"
      @update="handleUpdateMonogram"
      @close="monogramStore.closeMonogramPicker()"
    />

    <RestoreDesignModal
      :visible="showRestoreModal"
      :timestamp="restoreModalTimestamp"
      @restore="handleRestoreDesign"
      @discard="handleDiscardDesign"
      @update:visible="showRestoreModal = $event"
    />

    <ProductSwitcher
      :show="showProductSwitcher"
      @close="showProductSwitcher = false"
      @switched="handleProductSwitched"
    />

  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import TopBar from '~/components/editor/TopBar.vue'
import PreviewCard from '~/components/editor/sections/PreviewCard.vue'
import CheckoutSection from '~/components/editor/sections/CheckoutSection.vue'
import CanvasSection from '~/components/editor/sections/CanvasSection.vue'
import ImageToolbar from '~/components/editor/sidebar/Sidebar.vue'
import FrameSelectionModal from '~/components/editor/pickers/FrameSelectionModal.vue'
import MonogramPicker from '~/components/editor/pickers/MonogramPicker.vue'
import EnhancedMonogramPicker from '~/components/editor/pickers/EnhancedMonogramPicker.vue'
import RestoreDesignModal from '~/components/ui/RestoreDesignModal.vue'
import ProductSwitcher from '~/components/editor/ProductSwitcher.vue'
import { useEditorStore } from '~/store/editor'
import { useUIStore } from '~/store/ui'
import { useDrawToolStore } from '~/store/drawTool'
import { useTextEditorStore } from '~/store/textEditor'
import { useFramesStore } from '~/store/frames'
import { useMonogramStore } from '~/store/monogram'
import { useProductStore } from '~/store/product'
import { useCollectionStore } from '~/store/collection'
import { useHistory } from '~/composables/useHistory'
import { useCanvasOperations } from '~/composables/useCanvasOperations'
import { useElementOperations } from '~/composables/useElementOperations'
import { useDesignState } from '~/composables/useDesignState'
import { useCart } from '~/composables/useCart'
import { useProductSwitcher } from '~/composables/useProductSwitcher'

const $q = useQuasar()
const route = useRoute()

const editorStore = useEditorStore()
const uiStore = useUIStore()
const drawToolStore = useDrawToolStore()
const textEditorStore = useTextEditorStore()
const framesStore = useFramesStore()
const monogramStore = useMonogramStore()
const productStore = useProductStore()
const collectionStore = useCollectionStore()

const { saveState: saveHistoryState, undo, redo, canUndo, canRedo } = useHistory()
const canvasOps = useCanvasOperations()
const elementOps = useElementOperations()
const designState = useDesignState()
const cart = useCart()
const productSwitcher = useProductSwitcher()

const isDragging = ref(false)
const nextDrawingId = ref(1)
const canvasZoom = ref(1)
const designName = ref('Untitled Design')

const showFrameModal = ref(false)
const pendingImageData = ref<string | null>(null)
const pendingImageFile = ref<File | null>(null)
const pendingImageUrl = ref<string | null>(null)
const pendingElementId = ref<string | null>(null)

const showProductSwitcher = ref(false)
const showRestoreModal = ref(false)
const restoreModalTimestamp = ref(0)

const canvasSectionRef = ref<any>(null)
const sidebarRef = ref<any>(null)

const getHiddenCanvas = () => canvasSectionRef.value?.hiddenCanvas
const getKonvaCanvasRef = () => canvasSectionRef.value?.konvaCanvasRef
const getContainerRef = () => canvasSectionRef.value?.containerRef

const canvasWidth = ref(952)
const canvasHeight = ref(550)
const images = computed(() => editorStore.elements.filter(el => el.type === 'image'))
const texts = computed(() => editorStore.elements.filter(el => el.type === 'text' || el.type === 'emoji' || el.type === 'monogram'))
const selectedElementId = computed({
  get: () => editorStore.selectedElementId,
  set: (val) => editorStore.selectElement(val)
})
const lockedElements = computed(() => editorStore.lockedElements)

watch(() => getContainerRef(), (container) => {
  if (container) {
    canvasWidth.value = container.offsetWidth || 952
    canvasHeight.value = container.offsetHeight || 550
  }
}, { immediate: true })
watch(() => canvasSectionRef.value, (section) => {
  if (section) {
    canvasOps.containerRef.value = section.containerRef
    canvasOps.konvaCanvasRef.value = section.konvaCanvasRef
    canvasOps.hiddenCanvas.value = section.hiddenCanvas
  }
}, { immediate: true, flush: 'post' })

const saveState = () => {
  saveHistoryState()
}

const activateTextTool = () => {
  textEditorStore.activateTextTool()
  drawToolStore.deactivate()
  editorStore.deselectAll()
}

const activateDrawTool = () => {
  drawToolStore.activate()
  textEditorStore.deactivateTextTool()
  editorStore.deselectAll()
  textEditorStore.finishEditing()
}

const handleImageUrl = async (url: string) => {
  const imageId = elementOps.addImageFromUrl(url)

  const element = editorStore.elements.find(el => el.id === imageId)
  if (element) {
    const updatedElement = {
      ...element,
      isSticker: true
    }
    editorStore.updateElement(imageId, updatedElement)
  }
  
  saveState()
  await nextTick()
  await nextTick()
  canvasOps.updateCupTexture()
  
  $q.notify({
    message: 'Sticker added!',
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
  })
}

const handleImageUpload = async (file: File) => {
  try {
    const reader = new FileReader()
    reader.onload = (event) => {
      pendingImageData.value = event.target?.result as string
      pendingImageFile.value = file
      pendingImageUrl.value = null
      showFrameModal.value = true
    }
    reader.readAsDataURL(file)
  } catch (error) {
    $q.notify({
      message: 'Failed to load image',
      color: 'negative',
    })
  }
}

const handleFrameSelectionFromModal = async (frame: any) => {
  try {
    let imageId: string

    if (pendingElementId.value) {
      imageId = pendingElementId.value
      const element = editorStore.elements.find(el => el.id === imageId)
      if (element) {
        const updatedElement = {
          ...element,
          frame: frame.id !== 'none' ? {
            id: frame.id,
            shape: frame.shape,
          } : undefined,
          imageCrop: frame.id !== 'none' ? {
            x: 0,
            y: 0,
            scale: 1,
          } : undefined
        }
        editorStore.updateElement(imageId, updatedElement)
      }
      
      $q.notify({
        message: frame.id === 'none' ? 'Frame removed' : `Frame added: ${frame.name}`,
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
      })
    } else {
      if (pendingImageFile.value) {
        imageId = await elementOps.addImageFromFile(pendingImageFile.value)
      } else if (pendingImageUrl.value) {
        imageId = elementOps.addImageFromUrl(pendingImageUrl.value)
      } else {
        throw new Error('No image data available')
      }

      if (frame.id !== 'none') {
        const element = editorStore.elements.find(el => el.id === imageId)
        if (element) {
          const updatedElement = {
            ...element,
            frame: {
              id: frame.id,
              shape: frame.shape,
            },
            imageCrop: {
              x: 0,
              y: 0,
              scale: 1,
            }
          }
          editorStore.updateElement(imageId, updatedElement)
        }
      }

      $q.notify({
        message: frame.id === 'none' ? 'Image added' : `Image added with ${frame.name} frame`,
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
      })
    }

    saveState()
    await nextTick()
    await nextTick()
    canvasOps.debouncedTextureUpdate()
  } catch (error) {
    $q.notify({
      message: 'Failed to process frame selection',
      color: 'negative',
    })
  } finally {
    pendingImageData.value = null
    pendingImageFile.value = null
    pendingImageUrl.value = null
    pendingElementId.value = null
  }
}

const handleCancelFrameSelection = () => {
  pendingImageData.value = null
  pendingImageFile.value = null
  pendingImageUrl.value = null
  pendingElementId.value = null
  
  $q.notify({
    message: pendingElementId.value ? 'Frame selection cancelled' : 'Image upload cancelled',
    color: 'info',
    position: 'top',
  })
}

const handleChangeImage = (elementId: string) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        elementOps.changeImageSource(elementId, event.target?.result as string)
        saveState()
        canvasOps.updateCupTexture()
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const handleEmoji = (emoji: any) => {
  elementOps.addEmoji(emoji.i)
  saveState()
  canvasOps.updateCupTexture()
}

const handleAdjustImage = (elementId: string) => {
}

const handleAddFrame = (elementId: string) => {
  const element = editorStore.elements.find(el => el.id === elementId) as any
  if (!element || element.type !== 'image') return

  const imagePreview = element.src
  pendingImageData.value = imagePreview
  pendingImageFile.value = null
  pendingImageUrl.value = imagePreview
  pendingElementId.value = elementId
  showFrameModal.value = true
}

const handleRemoveFrame = (elementId: string) => {
  const element = editorStore.elements.find(el => el.id === elementId) as any
  if (!element || element.type !== 'image') return

  $q.dialog({
    title: 'Remove Frame',
    message: 'Are you sure you want to remove the frame from this image?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      const updatedElement = {
        ...element,
        frame: undefined,
        imageCrop: undefined,
      }

      editorStore.updateElement(elementId, updatedElement)
      saveState()
      canvasOps.debouncedTextureUpdate()

      $q.notify({
        message: 'Frame removed successfully',
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
      })
    } catch (error) {
      $q.notify({
        message: 'Failed to remove frame',
        color: 'negative',
      })
    }
  })
}

const handleRestoreDesign = async () => {
  const savedDesign = designState.getSaved()
  if (!savedDesign) return

  const restored = await designState.restore(savedDesign)

  if (restored) {
    $q.notify({
      message: 'Design restored successfully!',
      color: 'positive',
      icon: 'restore',
      position: 'top',
    })

    await nextTick()
    await nextTick()

    const konva = canvasSectionRef.value?.konvaCanvasRef
    if (konva) {
      const stage = konva.getStage?.()
      if (stage) {
        stage.find('Layer').forEach((layer: any) => layer.batchDraw())
        stage.batchDraw()
      }
    }

    await nextTick()
    await canvasOps.updateCupTexture()

    setTimeout(() => canvasOps.updateCupTexture(), 500)
    setTimeout(() => canvasOps.updateCupTexture(), 1000)
  } else {
    $q.notify({
      message: 'Failed to restore design. Starting fresh.',
      color: 'warning',
      icon: 'warning',
      position: 'top',
    })
    designState.clear()
  }

  showRestoreModal.value = false
}

const handleDiscardDesign = async () => {
  designState.clear()

  await nextTick()
  await canvasOps.updateCupTexture()

  $q.notify({
    message: 'Previous design discarded',
    color: 'info',
    icon: 'delete_sweep',
    position: 'top',
  })

  showRestoreModal.value = false
}

const handleTextEditStart = (elementId?: string) => {
  const id = elementId || selectedElementId.value
  if (!id) return
  
  handleFormatText(id)
}

const addNewText = (x: number, y: number) => {
  const id = elementOps.addText(x, y)
  
  nextTick(() => {
    nextTick(() => {
      const canvasContainer = getContainerRef()
      
      let screenX = x
      let screenY = y
      
      if (canvasContainer) {
        const containerRect = canvasContainer.getBoundingClientRect()
        screenX = containerRect.left + x
        screenY = containerRect.top + y
      }
      
      textEditorStore.startEditing({
        elementId: id,
        content: '',
        position: { x: screenX, y: screenY },
        fontSize: 16,
        fontFamily: textEditorStore.selectedFont,
        color: textEditorStore.selectedFontColor,
        width: 400,
        height: 100,
      })
    })
  })
  
  saveState()
}

const handleQuillContentChange = (content: string) => {
  textEditorStore.setEditingContent(content)
  
  if (selectedElementId.value) {
    editorStore.updateElement(selectedElementId.value, { content })
    canvasOps.debouncedTextureUpdate()
  }
}

const finishTextEditing = () => {
  if (selectedElementId.value && textEditorStore.editingTextContent) {
    editorStore.updateElement(selectedElementId.value, { 
      content: textEditorStore.editingTextContent 
    })
    saveState()
    canvasOps.immediateTextureUpdate()
  }
  
  textEditorStore.finishEditing()
}

const cancelTextEditing = () => {
  if (selectedElementId.value) {
    canvasOps.immediateTextureUpdate()
  }
  textEditorStore.cancelEditing()
}

const handleFormatText = (elementId: string) => {
  const element = editorStore.elements.find(el => el.id === elementId)
  if (!element || (element.type !== 'text' && element.type !== 'emoji')) return
  
  const text = element as any
  
  nextTick(() => {
    const canvasContainer = getContainerRef()
    if (!canvasContainer) return
    
    const containerRect = canvasContainer.getBoundingClientRect()
    const currentElement = editorStore.elements.find(el => el.id === elementId)
    const currentPosition = currentElement?.position || text.position
    
    const screenX = containerRect.left + currentPosition.x
    const screenY = containerRect.top + currentPosition.y
    
    const textElement = currentElement as any
    const fontSize = textElement?.fontSize || 16
    
    textEditorStore.startEditing({
      elementId: elementId,
      content: textElement?.content || '',
      position: { x: screenX, y: screenY },
      fontSize: fontSize,
      fontFamily: textElement?.font || 'Roboto',
      color: textElement?.color || '#FF5CA0',
      width: 300,
      height: fontSize * 2,
    })
  })
}

const handleFontChange = (elementIdOrFont: string, newFont?: string) => {
  if (newFont !== undefined) {
    elementOps.updateTextFont(elementIdOrFont, newFont)
    saveState()
    canvasOps.updateCupTexture()
  } else {
    if (selectedElementId.value) {
      elementOps.updateTextFont(selectedElementId.value, elementIdOrFont)
      saveState()
      canvasOps.updateCupTexture()
    }
  }
}

const handleColorChange = (elementIdOrColor: string, newColor?: string) => {
  if (newColor !== undefined) {
    elementOps.updateTextColor(elementIdOrColor, newColor)
    saveState()
    canvasOps.updateCupTexture()
  } else {
    if (selectedElementId.value) {
      elementOps.updateTextColor(selectedElementId.value, elementIdOrColor)
      saveState()
      canvasOps.updateCupTexture()
    }
  }
}

const handleFontSizeChange = (size: number) => {
  if (selectedElementId.value) {
    editorStore.updateElement(selectedElementId.value, { fontSize: size })
    saveState()
  }
}

const handleBoldChange = (isBold: boolean) => {
  if (selectedElementId.value) {
    editorStore.updateElement(selectedElementId.value, { bold: isBold })
    saveState()
  }
}

const handleItalicChange = (isItalic: boolean) => {
  if (selectedElementId.value) {
    editorStore.updateElement(selectedElementId.value, { italic: isItalic })
    saveState()
  }
}

const handleUnderlineChange = (isUnderline: boolean) => {
  if (selectedElementId.value) {
    editorStore.updateElement(selectedElementId.value, { underline: isUnderline })
    saveState()
  }
}

const handleStrokeToggle = (enabled: boolean) => {
  if (selectedElementId.value) {
    editorStore.updateElement(selectedElementId.value, { 
      stroke: { 
        ...(editorStore.elements.find(el => el.id === selectedElementId.value) as any)?.stroke,
        enabled 
      }
    } as any)
    saveState()
  }
}

const handleStrokeColorChange = (color: string) => {
  if (selectedElementId.value) {
    const element = editorStore.elements.find(el => el.id === selectedElementId.value) as any
    editorStore.updateElement(selectedElementId.value, { 
      stroke: { 
        ...element?.stroke,
        color 
      }
    } as any)
    saveState()
  }
}

const handleStrokeWidthChange = (width: number) => {
  if (selectedElementId.value) {
    const element = editorStore.elements.find(el => el.id === selectedElementId.value) as any
    editorStore.updateElement(selectedElementId.value, { 
      stroke: { 
        ...element?.stroke,
        width 
      }
    } as any)
    saveState()
  }
}

const handleShadowToggle = (enabled: boolean) => {
  if (selectedElementId.value) {
    const element = editorStore.elements.find(el => el.id === selectedElementId.value) as any
    editorStore.updateElement(selectedElementId.value, { 
      shadow: { 
        ...element?.shadow,
        enabled 
      }
    } as any)
    saveState()
  }
}

const handleShadowColorChange = (color: string) => {
  if (selectedElementId.value) {
    const element = editorStore.elements.find(el => el.id === selectedElementId.value) as any
    editorStore.updateElement(selectedElementId.value, { 
      shadow: { 
        ...element?.shadow,
        color 
      }
    } as any)
    saveState()
  }
}

const handleShadowBlurChange = (blur: number) => {
  if (selectedElementId.value) {
    const element = editorStore.elements.find(el => el.id === selectedElementId.value) as any
    editorStore.updateElement(selectedElementId.value, { 
      shadow: { 
        ...element?.shadow,
        blur 
      }
    } as any)
    saveState()
  }
}

const handleShadowOffsetXChange = (offsetX: number) => {
  if (selectedElementId.value) {
    const element = editorStore.elements.find(el => el.id === selectedElementId.value) as any
    editorStore.updateElement(selectedElementId.value, { 
      shadow: { 
        ...element?.shadow,
        offsetX 
      }
    } as any)
    saveState()
  }
}

const handleShadowOffsetYChange = (offsetY: number) => {
  if (selectedElementId.value) {
    const element = editorStore.elements.find(el => el.id === selectedElementId.value) as any
    editorStore.updateElement(selectedElementId.value, { 
      shadow: { 
        ...element?.shadow,
        offsetY 
      }
    } as any)
    saveState()
  }
}

const handleShadowOpacityChange = (opacity: number) => {
  if (selectedElementId.value) {
    const element = editorStore.elements.find(el => el.id === selectedElementId.value) as any
    editorStore.updateElement(selectedElementId.value, { 
      shadow: { 
        ...element?.shadow,
        opacity 
      }
    } as any)
    saveState()
  }
}

const handleEngraveToggle = (enabled: boolean) => {
  if (selectedElementId.value) {
    editorStore.updateElement(selectedElementId.value, { engrave: enabled } as any)
    saveState()
  }
}

const handleLetterSpacingChange = (spacing: number) => {
  if (selectedElementId.value) {
    editorStore.updateElement(selectedElementId.value, { letterSpacing: spacing } as any)
    saveState()
  }
}

const handleLineHeightChange = (height: number) => {
  if (selectedElementId.value) {
    editorStore.updateElement(selectedElementId.value, { lineHeight: height } as any)
    saveState()
  }
}

const applyAdvancedTextStyles = () => {
  if (!selectedElementId.value) {
    $q.notify({
      message: 'Please select a text element first',
      color: 'warning',
      icon: 'warning',
      position: 'top',
    })
    return
  }

  const element = editorStore.elements.find(el => el.id === selectedElementId.value)
  if (!element || (element.type !== 'text' && element.type !== 'emoji' && element.type !== 'monogram')) {
    $q.notify({
      message: 'Please select a text element to apply styles',
      color: 'warning',
      icon: 'warning',
      position: 'top',
    })
    return
  }

  const styles = textEditorStore.getCurrentTextStyles()

  editorStore.updateElement(selectedElementId.value, styles)

  saveState()
  canvasOps.updateCupTexture()


  $q.notify({
    message: 'Text styles applied successfully!',
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
  })
  
}

const openTextPanel = () => {
  if (sidebarRef.value) {
    sidebarRef.value.openTextPanel()
  }
}

const closeTextPanel = () => {
  if (sidebarRef.value) {
    sidebarRef.value.closeTextPanel()
  }
}

const isLayerPanelSelection = ref(false)

const handleLayerSelect = (id: string) => {
  isLayerPanelSelection.value = true
  setTimeout(() => {
    isLayerPanelSelection.value = false
  }, 100)
}

watch(selectedElementId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    if (isLayerPanelSelection.value) {
      return
    }
    
    const element = editorStore.elements.find(el => el.id === newId)
    if (element) {
      if ((element as any).type === 'monogram') {
        if (sidebarRef.value) {
          sidebarRef.value.openMonogramPanel()
        }
      } else if (element.type === 'text') {
        textEditorStore.applyStylesFromElement(element)
        openTextPanel()
      }
    }
  } else if (!newId) {
    closeTextPanel()
    if (sidebarRef.value) {
      sidebarRef.value.closeMonogramPanel()
    }
  }
}, { immediate: true })

const resetTextStyles = () => {
  textEditorStore.reset()
  $q.notify({
    message: 'Text styles reset to defaults',
    color: 'info',
    icon: 'refresh',
    position: 'top',
  })
}

const handleAddMonogram = (config: any) => {
  const x = canvasWidth.value / 2
  const y = canvasHeight.value / 2

  const id = elementOps.addText(x, y)

  const monogramContent = config.content || 'ABC'

  const monogramFont = config.font || 'monogram_kk'

  const updateData = {
    content: monogramContent,
    font: monogramFont,
    fontSize: config.fontSize || 64,
    color: config.color || '#000000',
    letterSpacing: config.spacing || 10,
    type: 'monogram',
    monogramTemplate: config.template,
    monogramLetters: config.letters,
    layoutStyle: config.layoutStyle,
    isCursive: config.isCursive,
  }

  editorStore.updateElement(id, updateData)

  saveState()
  canvasOps.updateCupTexture()

  $q.notify({
    message: `Monogram "${monogramContent}" added!`,
    color: 'positive',
    icon: 'mdi-alpha-m-circle',
    position: 'top',
  })
}

const handleUpdateMonogram = (config: any) => {
  const editingId = selectedElementId.value

  if (!editingId) {
    $q.notify({
      message: 'Please select a monogram to edit',
      color: 'warning',
      icon: 'warning',
      position: 'top',
    })
    return
  }

  const element = editorStore.elements.find(el => el.id === editingId)
  if (!element || (element as any).type !== 'monogram') {
    $q.notify({
      message: 'Selected element is not a monogram',
      color: 'warning',
      icon: 'warning',
      position: 'top',
    })
    return
  }

  const monogramContent = config.content || 'ABC'
  const monogramFont = config.font || 'monogram_kk'

  const updateData = {
    content: monogramContent,
    font: monogramFont,
    fontSize: config.fontSize || 64,
    color: config.color || '#000000',
    letterSpacing: config.spacing || 10,
    monogramTemplate: config.template,
    monogramLetters: config.letters,
    layoutStyle: config.layoutStyle,
    isCursive: config.isCursive,
  }

  editorStore.updateElement(editingId, updateData)

  saveState()
  canvasOps.updateCupTexture()

  $q.notify({
    message: `Monogram "${monogramContent}" updated!`,
    color: 'positive',
    icon: 'mdi-alpha-m-circle',
    position: 'top',
  })
}

const handleSwitchProduct = async (product: any) => {
  try {
    $q.loading.show({ message: 'Switching product...' })

    const result = await productSwitcher.switchProduct(product.type, product.size)

    if (result.success) {
      saveState()
      await nextTick()
      await canvasOps.updateCupTexture()

      $q.notify({
        message: `Switched to ${product.name}`,
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
      })
    } else {
      $q.notify({
        message: result.error || 'Failed to switch product',
        color: 'negative',
        icon: 'error',
        position: 'top',
      })
    }
  } catch (error) {
    $q.notify({
      message: 'Error switching product',
      color: 'negative',
      icon: 'error',
      position: 'top',
    })
  } finally {
    $q.loading.hide()
  }
}

const handleBrushSizeChange = (size: number) => {
  drawToolStore.setBrushSize(size)
}

const handleBrushColorChange = (color: string) => {
  drawToolStore.setBrushColor(color)
}

const handleToolModeChange = (mode: 'brush' | 'eraser' | 'bucket') => {
  drawToolStore.setToolMode(mode)
}

const handleEraserSizeChange = (size: number) => {
  drawToolStore.setEraserSize(size)
}

const handleBucketColorChange = (color: string) => {
  drawToolStore.setBucketColor(color)
}

const handleClearDrawing = () => {
  clearDrawing()
}

const handleFinishDrawing = async () => {
  await saveDrawing()
  drawToolStore.isActive = false
}

const clearDrawing = () => {
  const konvaRef = getKonvaCanvasRef()
  const drawTool = konvaRef?.getDrawTool()
  if (drawTool) {
    drawTool.clearCanvas()
  }
  drawToolStore.clearCurrentDrawing()
}

const undoDrawing = () => {
  const konvaRef = getKonvaCanvasRef()
  const drawTool = konvaRef?.getDrawTool()
  if (drawTool) {
    drawTool.undoLastStroke()
  }
}

const saveDrawing = async () => {
  const konvaRef = getKonvaCanvasRef()
  const drawTool = konvaRef?.getDrawTool()
  if (!drawTool) return;

  const data = drawTool.downloadDrawing();
  if (!data.imageData) return;

  const id = drawToolStore.getNextDrawingId();

  const centerX = data.left + data.width / 2;
  const centerY = data.top + data.height / 2;

  editorStore.addElement({
    id,
    type: 'image',
    src: data.imageData,
    position: { x: centerX, y: centerY },
    scale: 1,
    rotation: 0,
    width: data.width,
    height: data.height,
    isDrawing: true,
    originalWidth: data.width,
    originalHeight: data.height,
  });

  editorStore.selectElement(id);
  saveState();

  await nextTick();
  await nextTick();
  canvasOps.updateCupTexture();
  clearDrawing();
}

const finishDrawing = async () => {
  await saveDrawing()
  drawToolStore.deactivate()
}

const handleEditDrawing = (elementId: string) => {
  const element = editorStore.elements.find(el => el.id === elementId)
  if (element && (element as any).isDrawing) {
    editorStore.deleteElement(elementId)
    saveState()
    canvasOps.updateCupTexture()
  }
  
  editorStore.deselectAll()
  drawToolStore.activate()
  textEditorStore.deactivateTextTool()
  textEditorStore.finishEditing()
}

const selectElement = (id: string) => {
  if (textEditorStore.isEditingText && textEditorStore.editingElementId !== id) {
    finishTextEditing()
  }
  
  editorStore.selectElement(id)
  
  const element = editorStore.elements.find(el => el.id === id)
  if (element && element.type === 'text') {
    const textEl = element as any
    textEditorStore.setSelectedFont(textEl.font)
    textEditorStore.setSelectedFontColor(textEl.color)
  } else if (element && element.type === 'emoji') {
    textEditorStore.setSelectedFont('Emoji')
    textEditorStore.setSelectedFontColor('#000000')
  }
}

const handleDeleteElement = (id: string) => {
  if (elementOps.deleteElement(id)) {
    saveState()
    canvasOps.updateCupTexture()
  }
}

const handleDuplicate = (elementId: string) => {
  elementOps.duplicate(elementId)
  saveState()
  canvasOps.updateCupTexture()
}

const handleBringToFront = (elementId: string) => {
  elementOps.bringToFront(elementId, getKonvaCanvasRef())
  saveState()
  nextTick(() => {
    canvasOps.immediateTextureUpdate()
  })
}

const handleSendToBack = (elementId: string) => {
  elementOps.sendToBack(elementId, getKonvaCanvasRef())
  saveState()
  nextTick(() => {
    canvasOps.immediateTextureUpdate()
  })
}

const handleElementUpdate = (elementId: string, updatedElement: any) => {
  if (editorStore.isElementLocked(elementId)) {
    return
  }
  
  const currentElement = editorStore.elements.find(el => el.id === elementId)
  if (!currentElement) return
  
  const merged = { ...currentElement, ...updatedElement }
  editorStore.updateElement(elementId, merged)
  
  if (textEditorStore.isEditingText && 
      textEditorStore.editingElementId === elementId &&
      (merged.type === 'text' || merged.type === 'emoji') && 
      merged.position && 
      (merged.position.x !== currentElement.position.x || merged.position.y !== currentElement.position.y)) {
    
    updateEditorPositionIfEditing(elementId)
  }
  
  clearTimeout((saveState as any).timeout)
  ;(saveState as any).timeout = setTimeout(() => {
    saveState()
  }, 300)
  canvasOps.debouncedTextureUpdate()
}

const handleMoveElement = (elementId: string) => {
  updateEditorPositionIfEditing(elementId)
}

const updateEditorPositionIfEditing = (elementId: string) => {
  if (textEditorStore.isEditingText) {
    const element = editorStore.elements.find(el => el.id === elementId)
    
    if (element && (element.type === 'text' || element.type === 'emoji')) {
      const canvasContainer = getContainerRef()
      
      if (canvasContainer) {
        const containerRect = canvasContainer.getBoundingClientRect()
        const screenX = containerRect.left + element.position.x
        const screenY = containerRect.top + element.position.y
        
        textEditorStore.setEditingPosition(screenX, screenY)
      }
    }
  }
}

const handleStageClick = (e: any) => {
  if (textEditorStore.isEditingText) {
    const stage = e.target?.getStage?.()
    if (!e.target || e.target === stage) {
      finishTextEditing()
      return
    }
  }

  if (textEditorStore.textToolActive) {
    const konvaRef = getKonvaCanvasRef()
    const stage = konvaRef?.getStage()
    if (stage) {
      const pos = stage.getPointerPosition()
      if (pos) {
        addNewText(pos.x, pos.y)
      } else {
        addNewText(200, 100)
      }
      textEditorStore.deactivateTextTool()
    }
    return
  }

  editorStore.deselectAll()
}

const handleCheckout = async () => {
  try {
    uiStore.setVisualization('design')
    await nextTick()
    uiStore.prepareForExport()
    await nextTick()
    await canvasOps.updateCupTexture(true)
    uiStore.showCheckout()
  } finally {
    uiStore.restoreAfterExport()
  }
}

const handleDownload = async () => {
  try {
    const canvas = getHiddenCanvas()
    if (!canvas) {
      $q.notify({
        message: 'Canvas not ready for download',
        color: 'negative',
      })
      return
    }

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')

    const sanitizedName = designName.value.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'untitled-design'
    const timestamp = new Date().toISOString().split('T')[0]
    link.download = `${sanitizedName}-${timestamp}.png`

    link.href = dataUrl
    link.click()

    $q.notify({
      message: 'Design downloaded successfully!',
      color: 'positive',
      icon: 'download',
    })
  } catch (error) {
    $q.notify({
      message: 'Failed to download design',
      color: 'negative',
    })
  }
}

function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1]
  const bstr = atob(arr[arr.length - 1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

const addToCart = async () => {
  $q.loading.show()

  try {
    const canvas = getHiddenCanvas()
    if (!canvas) {
      $q.loading.hide()
      throw new Error('Canvas not ready')
    }

    const hasUploadedImages = editorStore.elements.some((el: any) => el.uploaded === true)
    if (hasUploadedImages && collectionStore.requiresTOS && !collectionStore.tosAccepted) {
      $q.notify({
        message: 'Please accept terms of service for uploaded images before checkout',
        color: 'warning',
        icon: 'warning',
        position: 'top',
      })
      $q.loading.hide()
      return
    }

    const validation = cart.validateDesign()
    if (!validation.valid) {
      $q.notify({
        message: validation.errors[0] || 'Design validation failed',
        color: 'warning',
        icon: 'warning',
        position: 'top',
      })
      $q.loading.hide()
      return
    }

    const result = await cart.addToCart(canvas)

    if (!result.success) {
      $q.notify({
        message: result.errors?.[0] || 'Failed to add to cart',
        color: 'negative',
        icon: 'error',
        position: 'top',
      })
      return
    }

    const finalImageUrl = canvas.toDataURL('image/png')

    const serializedData = JSON.parse(JSON.stringify({
      imageUrl: finalImageUrl,
      designData: result.cartItem?.designData,
      metadata: result.cartItem?.metadata,
    }))

    window.top?.postMessage(serializedData, '*')

    $q.notify({
      message: 'Design added to cart!',
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      message: 'Failed to add to cart',
      color: 'negative',
      icon: 'error',
      position: 'top',
    })
  } finally {
    $q.loading.hide()
  }
}

const handleProductSwitched = (product: { type: string; size: string }) => {
  saveState()
  canvasOps.updateCupTexture()

  $q.notify({
    message: `Switched to ${product.type} ${product.size}`,
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
  })
}

const handleShareDesign = async () => {
  try {
    const shareableLink = designState.generateShareLink()

    if (!shareableLink) {
      $q.notify({
        message: 'Failed to generate shareable link',
        color: 'negative',
        icon: 'error',
        position: 'top',
      })
      return
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareableLink)
      $q.notify({
        message: 'Shareable link copied to clipboard!',
        color: 'positive',
        icon: 'link',
        position: 'top',
        timeout: 3000,
      })
    } else {
      $q.dialog({
        title: 'Share Design',
        message: 'Copy this link to share your design:',
        prompt: {
          model: shareableLink,
          type: 'text',
          isValid: () => true,
        },
        cancel: false,
        persistent: false,
      })
    }
  } catch (error) {
    $q.notify({
      message: 'Failed to generate shareable link',
      color: 'negative',
      icon: 'error',
      position: 'top',
    })
  }
}

const handleQuillError = (error: any) => {
  $q.notify({
    message: error.message || 'Text editor error occurred',
    color: 'negative',
    timeout: 3000,
  })
}

const handleZoomIn = () => {
  canvasZoom.value = Math.min(canvasZoom.value + 0.25, 2)
}

const handleZoomOut = () => {
  canvasZoom.value = Math.max(canvasZoom.value - 0.25, 0.25)
}

const handleCollectionChanged = async (collectionId: string) => {
  await nextTick()
  await nextTick()
  canvasOps.updateCupTexture()
}

const handleKeyDown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement
  const isTypingInInput = target && (
    target.tagName === 'INPUT' || 
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  )
  
  if (e.key === 'Escape' && textEditorStore.isEditingText) {
    textEditorStore.cancelEditing()
  }
  
  if (
    (e.key === 'Delete' || e.key === 'Backspace') &&
    selectedElementId.value &&
    !textEditorStore.isEditingText &&
    !isTypingInInput
  ) {
    handleDeleteElement(selectedElementId.value)
  }
  
  if ((e.ctrlKey || e.metaKey) && !textEditorStore.isEditingText) {
    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
      e.preventDefault()
      redo()
    }
  }
}

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (designState.hasUnsavedChanges.value && editorStore.elements.length > 0) {
    e.preventDefault()
    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
    return 'You have unsaved changes. Are you sure you want to leave?'
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('beforeunload', handleBeforeUnload)

  setTimeout(() => canvasOps.updateCanvasDimensions(), 200)
  setTimeout(() => saveState(), 500)

  const { loadedFromUrl, hasAutosave } = designState.initialize()

  if (loadedFromUrl) {
    $q.notify({
      message: 'Design loaded from shared link!',
      color: 'positive',
      icon: 'link',
      position: 'top',
    })

    await nextTick()
    await nextTick()
    canvasOps.updateCupTexture()
  } else if (hasAutosave) {
    const savedDesign = designState.getSaved()

    if (savedDesign) {
      const currentCollection = collectionStore.activeCollection
      const savedCollection = savedDesign.collection || 'general'

      if (currentCollection === savedCollection) {
        showRestoreModal.value = true
        restoreModalTimestamp.value = savedDesign.timestamp
      } else {
        designState.clear()
      }
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('beforeunload', handleBeforeUnload)

  designState.stopAutosave()
})
</script>

<style scoped>
.image-editor-container {
  position: relative;
  width: 100%;
}
</style>

