<template>
  <div class="konva-canvas-wrapper relative">
    <div v-if="!hideLabels" class="full-width full-height flex justify-between design-labels">
      <div class="label-front">Front</div>
      <q-separator vertical />
      <div class="label-back">Back</div>
    </div>

    <v-stage
      ref="stage"
      :config="stageConfig"
      :style="{ cursor: getCursor }"
      @click="handleStageClick"
      @contextmenu="handleStageContextMenu"
    >
      <v-layer ref="backgroundLayer">
        <v-rect
          v-if="backgroundStore.backgroundType === 'solid'"
          :config="{
            x: 0,
            y: 0,
            width: stageConfig.width,
            height: stageConfig.height,
            fill: backgroundStore.solidColor,
            opacity: backgroundStore.opacity,
            listening: false
          }"
        />
        <v-rect
            v-if="backgroundStore.backgroundType === 'pattern' && backgroundStore.selectedPattern"
            :config="{
    x: 0,
    y: 0,
    width: stageConfig.width,
    height: stageConfig.height,
    fillPatternImage: patternImage,
    fillPatternRepeat: 'repeat',
    fillPatternScale: { x: 0.4, y: 0.4 },
    fillPatternOffset: { x: 0, y: 0 },
    fillPatternPosition: { x: 0, y: 0 },
    opacity: backgroundStore.opacity,
    listening: false
  }"
        />
      </v-layer>

      <v-layer ref="staticLayer">
        <template v-for="(image, index) in images" :key="`loop-img-${image.id}`">
          <DesignElement
            v-if="showLoopedElements && shouldShowLeftLoop(image)"
            :element="{ ...image, position: { x: image.position.x - containerWidth, y: image.position.y }, scale: image.scale * 0.95 }"
            :is-selected="false"
            :is-dragging="false"
            :is-looped="true"
            element-type="image"
            @select="$emit('element-select', image.id)"
          />
          <DesignElement
            v-if="showLoopedElements && shouldShowRightLoop(image)"
            :element="{ ...image, position: { x: image.position.x + containerWidth, y: image.position.y }, scale: image.scale * 0.95 }"
            :is-selected="false"
            :is-dragging="false"
            :is-looped="true"
            element-type="image"
            @select="$emit('element-select', image.id)"
          />
        </template>

        <template v-for="(text, index) in texts" :key="`loop-txt-${text.id}`">
          <DesignElement
            v-if="showLoopedElements && shouldShowLeftLoop(text)"
            :element="{ ...text, position: { x: text.position.x - containerWidth, y: text.position.y }, scale: text.scale * 0.95 }"
            :is-selected="false"
            :is-dragging="false"
            :is-looped="true"
            :element-type="text.type === 'monogram' ? 'monogram' : text.type === 'emoji' ? 'emoji' : 'text'"
            @select="$emit('element-select', { id: text.id, type: 'text' })"
          />
          <DesignElement
            v-if="showLoopedElements && shouldShowRightLoop(text)"
            :element="{ ...text, position: { x: text.position.x + containerWidth, y: text.position.y }, scale: text.scale * 0.95 }"
            :is-selected="false"
            :is-dragging="false"
            :is-looped="true"
            :element-type="text.type === 'monogram' ? 'monogram' : text.type === 'emoji' ? 'emoji' : 'text'"
            @select="$emit('element-select', text.id)"
          />
        </template>
      </v-layer>

      <v-layer ref="dynamicLayer">
        <template v-for="(element, index) in sortedVisibleElements" :key="`el-${element.id}-${index}`">
          <DesignElement
            :element="element"
            :is-selected="selectedElementId === element.id"
            :is-dragging="isDragging"
            :is-editing="isEditingText && selectedElementId === element.id && element.elementType !== 'image'"
            :is-locked="lockedElements.has(element.id)"
            :is-draw-tool-active="drawToolActive"
            :canvas-width="stageConfig.width"
            :canvas-height="stageConfig.height"
            :element-type="element.elementType"
            @select="$emit('element-select', element.id)"
            @delete="$emit('element-delete', element.id)"
            @update:element="$emit('element-update', element.id, $event)"
            @edit-start="handleEditStart"
            @edit-finish="$emit('edit-finish')"
          />
        </template>
      </v-layer>

      <template v-if="drawToolActive">
        <DrawTool
          ref="drawToolRef"
          :width="stageConfig.width"
          :height="stageConfig.height"
          :line-width="brushSize"
          :line-color="brushColor"
          :active="drawToolActive"
          :stage="stage?.getStage()"
          :tool-mode="toolMode"
          :eraser-size="eraserSize"
          :bucket-color="bucketColor"
          @update:drawing="$emit('drawing-update', $event)"
        />
      </template>
    </v-stage>

    <div v-if="images.length === 0 && texts.length === 0 && !drawToolActive && !textToolActive" class="empty-state">
      Upload images or add text to begin designing
    </div>

    <!-- Text Tool Active Indicator -->
    <div v-if="textToolActive && !isEditingText" class="text-tool-active-indicator">
      <div class="text-tool-message">
        <q-icon name="mdi-cursor-text" size="24px" color="primary" />
        <span>Click anywhere on the canvas to add text</span>
      </div>
    </div>

    <FloatingToolbar
      :visible="!!selectedElement && !props.isEditingText"
      :element-position="selectedElementPosition"
      :element-size="selectedElementSize"
      :element-type="selectedElementType"
      :is-locked="props.selectedElementId ? props.lockedElements.has(props.selectedElementId) : false"
      :is-drawing="selectedElement?.isDrawing || false"
      :is-sticker="selectedElement?.isSticker || false"
      :has-frame="!!(selectedElement?.frame?.shape && selectedElement.frame.shape !== 'none')"
      @change-image="$emit('change-image', props.selectedElementId)"
      @edit-drawing="$emit('edit-drawing', props.selectedElementId)"
      @format-text="$emit('format-text', props.selectedElementId)"
      @toggle-lock="$emit('toggle-lock', props.selectedElementId)"
      @flip-horizontal="$emit('flip-horizontal', props.selectedElementId)"
      @flip-vertical="$emit('flip-vertical', props.selectedElementId)"
      @duplicate="$emit('duplicate', props.selectedElementId)"
      @add-frame="$emit('add-frame', props.selectedElementId)"
      @remove-frame="$emit('remove-frame', props.selectedElementId)"
      @delete="$emit('element-delete', props.selectedElementId)"
    />

    <TextFormatToolbar
      :visible="!!selectedElement && !props.isEditingText && selectedElementType === 'text' && selectedElement?.type !== 'emoji'"
      :element-position="selectedElementPosition"
      :element-size="selectedElementSize"
      :is-locked="props.selectedElementId ? props.lockedElements.has(props.selectedElementId) : false"
      :is-bold="selectedElement?.bold || false"
      :is-italic="selectedElement?.italic || false"
      :is-underline="selectedElement?.transformation === 'underline'"
      @edit-text="$emit('format-text', props.selectedElementId)"
      @toggle-lock="$emit('toggle-lock', props.selectedElementId)"
      @duplicate="$emit('duplicate', props.selectedElementId)"
      @delete="$emit('element-delete', props.selectedElementId)"
      @bold-change="handleBoldChange"
      @italic-change="handleItalicChange"
      @underline-change="handleUnderlineChange"
    />

    <HelperButtons
      :visible="!!props.selectedElementId && !props.isEditingText"
      :element-position="selectedElementPosition"
      :element-size="selectedElementSize"
      :is-in-move-mode="isElementInMoveMode"
      @rotate="$emit('rotate-element', props.selectedElementId)"
      @move="$emit('move-element', props.selectedElementId)"
      @drag-move="handleDragMove"
    />

    <!-- Snap Guides -->
    <SnapGuides
      :canvas-width="stageConfig.width"
      :canvas-height="stageConfig.height"
      :selected-element="selectedElement"
      :other-elements="allElements"
      :show-center-guides="true"
      :snap-threshold="8"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import FloatingToolbar from '~/components/editor/sidebar/FloatingToolbar.vue'
import HelperButtons from '~/components/editor/canvas/HelperButtons.vue'
import TextFormatToolbar from '~/components/editor/sidebar/TextFormatToolbar.vue'
import DesignElement from '~/components/editor/canvas/DesignElement.vue'
import DrawTool from '~/components/editor/canvas/DrawTool.vue'
import SnapGuides from '~/components/editor/canvas/SnapGuides.vue'
import { useBackgroundStore } from '~/store/background'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  images: { type: Array, default: () => [] },
  texts: { type: Array, default: () => [] },
  selectedElementId: { type: String, default: null },
  isDragging: { type: Boolean, default: false },
  isEditingText: { type: Boolean, default: false },
  drawToolActive: { type: Boolean, default: false },
  textToolActive: { type: Boolean, default: false },
  brushSize: { type: Number, default: 5 },
  brushColor: { type: String, default: '#000000' },
  toolMode: { type: String, default: 'brush' },
  eraserSize: { type: Number, default: 10 },
  bucketColor: { type: String, default: '#000000' },
  hideLabels: {
    type: Boolean,
    default: false
  },
  showLoopedElements: {
    type: Boolean,
    default: true
  },
  backgroundUrl: {
    type: String,
    default: ''
  },
  lockedElements: {
    type: Set,
    default: () => new Set()
  },
  hiddenElements: {
    type: Set,
    default: () => new Set()
  }
})

const backgroundStore = useBackgroundStore()

const visibleImages = computed(() => {
  return props.images.filter(img => !props.hiddenElements.has(img.id))
})

const visibleTexts = computed(() => {
  return props.texts.filter(txt => !props.hiddenElements.has(txt.id))
})

const sortedVisibleElements = computed(() => {
  const allVisible = [
    ...visibleImages.value.map(img => ({ ...img, elementType: 'image' })),
    ...visibleTexts.value.map(txt => ({
      ...txt,
      elementType: txt.type === 'monogram' ? 'monogram' : txt.type === 'emoji' ? 'emoji' : 'text'
    }))
  ]

  return allVisible.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
})

const allElements = computed(() => {
  return [...props.images, ...props.texts]
})

const emit = defineEmits([
  'element-select',
  'element-delete',
  'element-update',
  'edit-start',
  'edit-finish',
  'drawing-update',
  'stage-click',
  'texture-update',
  'change-image',
  'edit-drawing',
  'format-text',
  'toggle-lock',
  'flip-horizontal',
  'flip-vertical',
  'duplicate',
  'add-frame',
  'remove-frame',
  'rotate-element',
  'move-element',
  'underline-change'
])

const stage = ref(null)
const staticLayer = ref(null)
const dynamicLayer = ref(null)
const drawToolRef = ref(null)
const backgroundLayer = ref(null)
const patternImage = ref(null)

let batchDrawScheduled = false
let batchDrawFrameId = null

const containerWidth = computed(() => props.width)

const stageConfig = computed(() => ({
  width: props.width,
  height: props.height,
}))

const selectedElement = computed(() => {
  if (!props.selectedElementId) {
    return null
  }

  const imageElement = props.images.find(img => img.id === props.selectedElementId)
  if (imageElement) {
    return { ...imageElement, type: 'image' }
  }

  const textElement = props.texts.find(txt => txt.id === props.selectedElementId)
  if (textElement) {
    if (textElement.type === 'emoji') {
      return { ...textElement, type: 'emoji' }
    }
    if (textElement.type === 'monogram') {
      return { ...textElement, type: 'monogram' }
    }
    return { ...textElement, type: 'text' }
  }

  return null
})

const selectedElementType = computed(() => {
  return selectedElement.value ? selectedElement.value.type : null
})

const selectedElementPosition = computed(() => {
  return selectedElement.value?.position || { x: 0, y: 0 }
})

const selectedElementSize = computed(() => {
  if (!selectedElement.value) return { width: 0, height: 0 }
  const scale = selectedElement.value.scale || 1

  if (selectedElement.value.type === 'image') {
    if (selectedElement.value.isDrawing && selectedElement.value.originalWidth && selectedElement.value.originalHeight) {
      return {
        width: selectedElement.value.originalWidth * scale,
        height: selectedElement.value.originalHeight * scale
      }
    }
    return { width: 200 * scale, height: 200 * scale }
  }

  if (selectedElement.value.type === 'text') {
    const fontSize = selectedElement.value.fontSize || 16
    const content = selectedElement.value.content || 'Your text'
    const textContent = content.replace(/<[^>]*>/g, '').trim() || 'Your text'
    const textWidth = Math.max(80, textContent.length * fontSize * 0.6)
    const textHeight = fontSize * 1.5
    return { width: textWidth * scale, height: textHeight * scale }
  }

  if (selectedElement.value.type === 'emoji') {
    const fontSize = selectedElement.value.fontSize || 5
    const emojiWidth = Math.max(20, selectedElement.value.content?.length * fontSize * 0.7) || 20
    const emojiHeight = fontSize * 1.7
    return { width: emojiWidth * scale, height: emojiHeight * scale }
  }

  return { width: 100 * scale, height: 100 * scale }
})

const isElementInMoveMode = computed(() => false)

const getCursor = computed(() => {
  if (props.textToolActive) return 'text'
  if (props.drawToolActive) {
    if (props.selectedElementId) return 'default'
    if (props.toolMode === 'brush') {
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M12 19l7-7 3 3-7 7-3-3z\'/%3E%3Cpath d=\'M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z\'/%3E%3Cpath d=\'M2 2l7.586 7.586\'/%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'2\'/%3E%3C/svg%3E") 2 22, crosshair'
    }
    if (props.toolMode === 'eraser') {
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21\'/%3E%3Cpath d=\'M22 21H7\'/%3E%3Cpath d=\'m5 11 9 9\'/%3E%3C/svg%3E") 4 20, auto'
    }
    if (props.toolMode === 'bucket') {
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z\'/%3E%3Cpath d=\'m5 2 5 5\'/%3E%3Cpath d=\'m2 13 9 9\'/%3E%3Cpath d=\'m7 7 4 4\'/%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'2\'/%3E%3C/svg%3E") 4 20, auto'
    }
  }
  return 'default'
})

const handleEditStart = (elementId) => {
  emit('edit-start', elementId)
}

const handleFormatText = (elementId) => {
  emit('format-text', elementId)
}

const scheduleBatchDraw = () => {
  if (batchDrawScheduled) return

  if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
    return
  }

  batchDrawScheduled = true
  batchDrawFrameId = requestAnimationFrame(() => {
    const stageNode = stage.value?.getStage()
    const backgroundLayerNode = backgroundLayer.value?.getNode()
    const staticLayerNode = staticLayer.value?.getNode()
    const dynamicLayerNode = dynamicLayer.value?.getNode()

    if (backgroundLayerNode) {
      backgroundLayerNode.batchDraw()
    }
    if (staticLayerNode) {
      staticLayerNode.batchDraw()
    }
    if (dynamicLayerNode) {
      dynamicLayerNode.batchDraw()
    }

    if (stageNode) {
      stageNode.batchDraw()
    }

    batchDrawScheduled = false
    batchDrawFrameId = null
  })
}

const updateLoopedInstances = () => {
  const backgroundLayerNode = backgroundLayer.value?.getNode()
  const staticLayerNode = staticLayer.value?.getNode()

  if (backgroundLayerNode) {
    backgroundLayerNode.batchDraw()
  }
  if (staticLayerNode) {
    staticLayerNode.batchDraw()
  }
}

const handleDragMove = (newPosition) => {
  if (!newPosition || isNaN(newPosition.x) || isNaN(newPosition.y)) return

  if (props.selectedElementId) {
    const element = props.images.find(el => el.id === props.selectedElementId) ||
                   props.texts.find(el => el.id === props.selectedElementId)

    if (element) {
      const updatedElement = {
        ...element,
        position: newPosition
      }
      emit('element-update', props.selectedElementId, updatedElement)
      scheduleBatchDraw()
    }
  }
}

const shouldShowLeftLoop = (element) => {
  const edgeThreshold = props.width * 0.8
  return element.position.x > edgeThreshold
}

const shouldShowRightLoop = (element) => {
  const edgeThreshold = props.width * 0.2
  return element.position.x < edgeThreshold
}

const handleStageClick = (e) => {
  if (e.target === stage.value?.getStage()) {
    emit('stage-click', e)
  }
}

const handleStageContextMenu = (e) => {
  e.evt.preventDefault()
}

const handleFontChange = (newFont) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return

  const textIndex = props.texts.findIndex(txt => txt.id === props.selectedElementId)
  if (textIndex !== -1) {
    const updatedText = {
      ...props.texts[textIndex],
      font: newFont
    }
    emit('element-update', props.selectedElementId, updatedText)
    scheduleBatchDraw()
  }
}

const handleColorChange = (newColor) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return

  const textIndex = props.texts.findIndex(txt => txt.id === props.selectedElementId)
  if (textIndex !== -1) {
    const updatedText = {
      ...props.texts[textIndex],
      color: newColor
    }
    emit('element-update', props.selectedElementId, updatedText)
    scheduleBatchDraw()
  }
}

const handleFontSizeChange = (newSize) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return

  const textIndex = props.texts.findIndex(txt => txt.id === props.selectedElementId)
  if (textIndex !== -1) {
    const updatedText = {
      ...props.texts[textIndex],
      fontSize: newSize
    }
    emit('element-update', props.selectedElementId, updatedText)
    scheduleBatchDraw()
  }
}

const handleBoldChange = (isBold) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return

  const textIndex = props.texts.findIndex(txt => txt.id === props.selectedElementId)
  if (textIndex !== -1) {
    const updatedText = {
      ...props.texts[textIndex],
      bold: isBold
    }
    emit('element-update', props.selectedElementId, updatedText)
    scheduleBatchDraw()
  }
}

const handleItalicChange = (isItalic) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return

  const textIndex = props.texts.findIndex(txt => txt.id === props.selectedElementId)
  if (textIndex !== -1) {
    const updatedText = {
      ...props.texts[textIndex],
      italic: isItalic
    }
    emit('element-update', props.selectedElementId, updatedText)
    scheduleBatchDraw()
  }
}

const handleUnderlineChange = (isUnderline) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return

  emit('underline-change', isUnderline)
  scheduleBatchDraw()
}

const exportTexture = () => {
  if (!stage.value) return null
  const konvaStage = stage.value.getStage()
  if (!konvaStage) return null

  try {
    const dynamicLayerNode = dynamicLayer.value?.getNode()
    const staticLayerNode = staticLayer.value?.getNode()
    const hiddenNodesState = []

    if (dynamicLayerNode) {
      dynamicLayerNode.getChildren().forEach((node) => {
        const elementId = node.id()
        if (elementId && props.hiddenElements.has(elementId)) {
          hiddenNodesState.push({ node, wasVisible: node.visible() })
          node.visible(false)
        }
      })
    }

    if (staticLayerNode) {
      staticLayerNode.getChildren().forEach((node) => {
        const elementId = node.id()
        if (elementId && props.hiddenElements.has(elementId)) {
          hiddenNodesState.push({ node, wasVisible: node.visible() })
          node.visible(false)
        }
      })
    }

    konvaStage.batchDraw()

    const textureData = konvaStage.toDataURL({
      mimeType: 'image/png',
      quality: 1,
      pixelRatio: 2
    })

    hiddenNodesState.forEach(({ node, wasVisible }) => {
      node.visible(wasVisible)
    })

    konvaStage.batchDraw()

    return textureData
  } catch (error) {
    return null
  }
}

const cleanupBatchDraw = () => {
  if (batchDrawFrameId && typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(batchDrawFrameId)
    batchDrawFrameId = null
  }
  batchDrawScheduled = false
}

watch(() => backgroundStore.selectedPattern, (newPattern, oldPattern) => {
  if (typeof window === 'undefined') return

  patternImage.value = null
  scheduleBatchDraw()
  emit('texture-update')

  if (newPattern && newPattern.preview) {
    const img = new Image()

    setTimeout(() => {
      img.onload = () => {
        if (backgroundStore.selectedPattern?.id === newPattern.id) {
          patternImage.value = img
          scheduleBatchDraw()
          emit('texture-update')
        }
      }
      img.onerror = () => {
        patternImage.value = null
        scheduleBatchDraw()
        emit('texture-update')
      }
      img.src = newPattern.preview
    }, 10)
  }
}, { immediate: true, deep: true })

watch([
  () => backgroundStore.solidColor,
  () => backgroundStore.backgroundType,
  () => backgroundStore.opacity,
  () => backgroundStore.selectedPattern?.id
], () => {
  scheduleBatchDraw()
  emit('texture-update')
}, { immediate: true, deep: true })

watch([
  () => props.images,
  () => props.texts,
  () => props.images.map(img => img.id).join(','),
  () => props.texts.map(txt => txt.id).join(',')
], (newVals, oldVals) => {
  if (props.images.length === 0 && props.texts.length === 0 &&
      (oldVals[0]?.length > 0 || oldVals[1]?.length > 0)) {
    nextTick(() => {
      const dynamicLayerNode = dynamicLayer.value?.getNode()
      const staticLayerNode = staticLayer.value?.getNode()

      if (dynamicLayerNode) {
        dynamicLayerNode.destroyChildren()
        dynamicLayerNode.batchDraw()
      }

      if (staticLayerNode) {
        staticLayerNode.destroyChildren()
        staticLayerNode.batchDraw()
      }

      const stageNode = stage.value?.getStage()
      if (stageNode) {
        stageNode.batchDraw()
      }
    })
  } else {
    nextTick(() => {
      scheduleBatchDraw()
    })
  }
}, { deep: true })

onMounted(() => {
  const handleBackgroundChange = () => {
    scheduleBatchDraw()
    emit('texture-update')
  }

  window.addEventListener('background-changed', handleBackgroundChange)

  onUnmounted(() => {
    window.removeEventListener('background-changed', handleBackgroundChange)
  })
})

onUnmounted(() => {
  cleanupBatchDraw()
})

defineExpose({
  exportTexture,
  getStage: () => stage.value?.getStage(),
  getStaticLayer: () => staticLayer.value?.getNode(),
  getDynamicLayer: () => dynamicLayer.value?.getNode(),
  getDrawTool: () => drawToolRef.value,
  scheduleBatchDraw,
  updateLoopedInstances
})
</script>

<style scoped>
.konva-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.design-labels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.label-front, .label-back {
  width: 40%;
  color: #868DAA;
  text-align: center;
  font-size: 1rem;
  padding-top: 1rem;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #9ca3af;
  text-align: center;
  font-size: 1.25rem;
  pointer-events: none;
  z-index: 2;
}

.text-tool-active-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.05);
  border: 2px dashed #6366f1;
  border-radius: 12px;
  z-index: 5;
  pointer-events: none;
}

.text-tool-message {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  border: 1px solid #e0e7ff;
  font-weight: 500;
  color: #6366f1;
  font-size: 16px;
}

@media (max-width: 768px) {
  .label-front, .label-back {
    font-size: 0.875rem;
  }
}
</style>