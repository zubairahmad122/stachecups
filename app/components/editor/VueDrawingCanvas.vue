<template>
  <div class="drawing-canvas-container">
    <!-- Controls Toolbar -->
    <div class="drawing-controls">
      <!-- Mode Toggle -->
      <div class="control-group">
        <button
          :class="['mode-btn', { active: !isEraserMode }]"
          @click="setDrawMode"
          title="Draw Mode"
        >
          <q-icon name="mdi-brush" size="20px" />
          <span>Draw</span>
        </button>
        <button
          :class="['mode-btn', { active: isEraserMode }]"
          @click="setEraseMode"
          title="Erase Mode"
        >
          <q-icon name="mdi-eraser" size="20px" />
          <span>Erase</span>
        </button>
      </div>

      <!-- Brush Size -->
      <div class="control-group">
        <label class="control-label">
          <q-icon name="mdi-resize" size="16px" />
          Size: {{ lineWidth }}px
        </label>
        <input
          v-model.number="lineWidth"
          type="range"
          min="1"
          max="50"
          class="slider"
        />
      </div>

      <!-- Brush Color (only visible in draw mode) -->
      <div v-if="!isEraserMode" class="control-group">
        <label class="control-label">
          <q-icon name="mdi-palette" size="16px" />
          Color
        </label>
        <div class="color-picker-wrapper">
          <input
            v-model="strokeColor"
            type="color"
            class="color-input"
          />
          <span class="color-value">{{ strokeColor }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="control-group actions">
        <button
          class="action-btn undo-btn"
          @click="undo"
          :disabled="!canUndo"
          title="Undo (Ctrl+Z)"
        >
          <q-icon name="mdi-undo" size="18px" />
          <span>Undo</span>
        </button>
        <button
          class="action-btn redo-btn"
          @click="redo"
          :disabled="!canRedo"
          title="Redo (Ctrl+Y)"
        >
          <q-icon name="mdi-redo" size="18px" />
          <span>Redo</span>
        </button>
        <button
          class="action-btn clear-btn"
          @click="clearCanvas"
          title="Clear Canvas"
        >
          <q-icon name="mdi-delete-outline" size="18px" />
          <span>Clear</span>
        </button>
        <button
          class="action-btn export-btn"
          @click="exportImage"
          title="Export as PNG"
        >
          <q-icon name="mdi-download" size="18px" />
          <span>Export</span>
        </button>
      </div>
    </div>

    <!-- Drawing Canvas -->
    <div class="canvas-wrapper" ref="canvasWrapperRef">
      <VueDrawingCanvas
        ref="drawingCanvas"
        v-model:image="currentImage"
        :width="canvasWidth"
        :height="canvasHeight"
        :stroke-type="strokeType"
        :line-width="lineWidth"
        :color="strokeColor"
        :background-color="backgroundColor"
        :background-image="backgroundImage"
        :watermark="watermark"
        :initial-image="initialImage"
        :eraser="isEraserMode"
        :lock="isLocked"
        :styles="canvasStyles"
        :additional-images="additionalImages"
        @update:image="handleImageUpdate"
      />
    </div>

    <!-- Info Panel -->
    <div class="info-panel">
      <div class="info-item">
        <q-icon name="mdi-information-outline" size="16px" />
        <span>Mode: <strong>{{ isEraserMode ? 'Eraser' : 'Draw' }}</strong></span>
      </div>
      <div class="info-item">
        <q-icon name="mdi-resize" size="16px" />
        <span>Size: <strong>{{ lineWidth }}px</strong></span>
      </div>
      <div class="info-item">
        <q-icon name="mdi-palette" size="16px" />
        <span>Color: <strong>{{ strokeColor }}</strong></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import VueDrawingCanvas from 'vue-drawing-canvas'

// Props
const props = defineProps({
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  },
  initialColor: {
    type: String,
    default: '#000000'
  },
  initialLineWidth: {
    type: Number,
    default: 5
  },
  backgroundImage: {
    type: String,
    default: ''
  },
  backgroundColor: {
    type: String,
    default: '#FFFFFF'
  },
  watermark: {
    type: Object,
    default: null
  },
  initialImage: {
    type: Array,
    default: () => []
  },
  additionalImages: {
    type: Array,
    default: () => []
  },
  lock: {
    type: Boolean,
    default: false
  },
  responsive: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:image', 'export', 'clear', 'undo', 'redo'])

// Refs
const drawingCanvas = ref(null)
const canvasWrapperRef = ref(null)
const currentImage = ref([])
const isEraserMode = ref(false)
const strokeColor = ref(props.initialColor)
const lineWidth = ref(props.initialLineWidth)
const canvasWidth = ref(props.width)
const canvasHeight = ref(props.height)
const isLocked = ref(props.lock)

// Canvas settings
const strokeType = ref('dash') // 'dash' for freehand drawing
const canvasStyles = {
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
}

// Computed
const canUndo = computed(() => {
  return currentImage.value && currentImage.value.length > 0
})

const canRedo = computed(() => {
  // Note: vue-drawing-canvas doesn't natively support redo
  // You would need to implement a custom history stack for full redo support
  return false
})

// Methods
const setDrawMode = () => {
  isEraserMode.value = false
}

const setEraseMode = () => {
  isEraserMode.value = true
}

const undo = () => {
  if (drawingCanvas.value) {
    drawingCanvas.value.undo()
    emit('undo')
  }
}

const redo = () => {
  if (drawingCanvas.value) {
    drawingCanvas.value.redo()
    emit('redo')
  }
}

const clearCanvas = () => {
  if (drawingCanvas.value) {
    drawingCanvas.value.reset()
    currentImage.value = []
    emit('clear')
  }
}

const exportImage = () => {
  if (drawingCanvas.value) {
    // Get the canvas as a PNG data URL
    const canvas = drawingCanvas.value.$el.querySelector('canvas')
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png')

      // Create download link
      const link = document.createElement('a')
      link.download = `drawing-${Date.now()}.png`
      link.href = dataURL
      link.click()

      emit('export', dataURL)
    }
  }
}

const handleImageUpdate = (imageData) => {
  emit('update:image', imageData)
}

// Responsive canvas sizing
const updateCanvasSize = () => {
  if (props.responsive && canvasWrapperRef.value) {
    const wrapper = canvasWrapperRef.value
    const maxWidth = wrapper.clientWidth - 40 // Account for padding
    const maxHeight = wrapper.clientHeight - 40

    if (maxWidth > 0 && maxHeight > 0) {
      canvasWidth.value = Math.min(props.width, maxWidth)
      canvasHeight.value = Math.min(props.height, maxHeight)
    }
  }
}

// Keyboard shortcuts
const handleKeyDown = (e) => {
  // Undo: Ctrl+Z or Cmd+Z
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
  }

  // Redo: Ctrl+Y or Cmd+Shift+Z
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    redo()
  }

  // Toggle eraser: E key
  if (e.key === 'e' || e.key === 'E') {
    isEraserMode.value = !isEraserMode.value
  }

  // Clear: Delete or Backspace (with Ctrl/Cmd)
  if ((e.ctrlKey || e.metaKey) && (e.key === 'Delete' || e.key === 'Backspace')) {
    e.preventDefault()
    clearCanvas()
  }
}

// Watch for lock changes
watch(() => props.lock, (newVal) => {
  isLocked.value = newVal
})

// Lifecycle
onMounted(() => {
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize)
  window.removeEventListener('keydown', handleKeyDown)
})

// Expose methods to parent
defineExpose({
  undo,
  redo,
  clearCanvas,
  exportImage,
  setDrawMode,
  setEraseMode,
  getCanvas: () => drawingCanvas.value
})
</script>

<style scoped>
.drawing-canvas-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
}

.drawing-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.control-group.actions {
  background: transparent;
  padding: 0;
  flex: 1;
  justify-content: flex-end;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  border-color: #1EADB0;
  transform: translateY(-1px);
}

.mode-btn.active {
  border-color: #1EADB0;
  background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
  color: #1EADB0;
  box-shadow: 0 2px 8px rgba(30, 173, 176, 0.2);
}

.slider {
  width: 120px;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1EADB0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(30, 173, 176, 0.4);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1EADB0;
  cursor: pointer;
  border: none;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input {
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  background: none;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 6px;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.color-value {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.undo-btn, .redo-btn {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.1) 0%, rgba(71, 85, 105, 0.1) 100%);
  color: #64748b;
}

.undo-btn:hover:not(:disabled), .redo-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.2) 0%, rgba(71, 85, 105, 0.2) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
}

.clear-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  color: #ef4444;
}

.clear-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.export-btn {
  background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
  color: white;
}

.export-btn:hover {
  background: linear-gradient(135deg, #1a9ca0 0%, #3d4758 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 173, 176, 0.4);
}

.canvas-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.info-panel {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.info-item strong {
  color: #1EADB0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .drawing-controls {
    flex-direction: column;
  }

  .control-group.actions {
    width: 100%;
    justify-content: center;
  }

  .action-btn span {
    display: none;
  }

  .info-panel {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
