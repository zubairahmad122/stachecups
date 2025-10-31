<template>
  <div class="drawing-demo-page">
    <div class="demo-header">
      <h1 class="demo-title">
        <q-icon name="mdi-brush" size="32px" />
        Vue Drawing Canvas Demo
      </h1>
      <p class="demo-subtitle">
        Full-featured drawing tool with vue-drawing-canvas integration
      </p>
    </div>

    <div class="demo-container">
      <!-- Drawing Canvas Component -->
      <VueDrawingCanvas
        ref="canvasRef"
        :width="900"
        :height="600"
        initial-color="#1EADB0"
        :initial-line-width="5"
        :responsive="true"
        @update:image="handleImageUpdate"
        @export="handleExport"
        @clear="handleClear"
        @undo="handleUndo"
        @redo="handleRedo"
      />

      <!-- Drawing Data Display -->
      <div class="data-panel">
        <h3 class="data-title">
          <q-icon name="mdi-code-json" size="20px" />
          Drawing Data ({{ imageData.length }} strokes)
        </h3>
        <div class="data-content">
          <pre v-if="imageData.length > 0">{{ JSON.stringify(imageData[imageData.length - 1], null, 2) }}</pre>
          <p v-else class="no-data">No strokes yet. Start drawing!</p>
        </div>

        <!-- External Controls -->
        <div class="external-controls">
          <h4 class="controls-title">External Controls (via ref)</h4>
          <div class="button-group">
            <button @click="programmaticUndo" class="demo-btn">
              <q-icon name="mdi-undo" />
              Undo
            </button>
            <button @click="programmaticClear" class="demo-btn clear">
              <q-icon name="mdi-delete" />
              Clear
            </button>
            <button @click="programmaticExport" class="demo-btn export">
              <q-icon name="mdi-download" />
              Export
            </button>
            <button @click="toggleMode" class="demo-btn toggle">
              <q-icon :name="isEraserMode ? 'mdi-brush' : 'mdi-eraser'" />
              {{ isEraserMode ? 'Draw Mode' : 'Erase Mode' }}
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-panel">
          <h4 class="stats-title">Statistics</h4>
          <div class="stat-item">
            <span class="stat-label">Total Strokes:</span>
            <span class="stat-value">{{ imageData.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Last Update:</span>
            <span class="stat-value">{{ lastUpdateTime }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Export Count:</span>
            <span class="stat-value">{{ exportCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div v-if="notification" class="notification" :class="notification.type">
      <q-icon :name="notification.icon" size="20px" />
      <span>{{ notification.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VueDrawingCanvas from '~/components/editor/VueDrawingCanvas.vue'

// Page meta
definePageMeta({
  layout: 'default'
})

// Refs
const canvasRef = ref<any>(null)
const imageData = ref<any[]>([])
const lastUpdateTime = ref<string>('Never')
const exportCount = ref<number>(0)
const isEraserMode = ref<boolean>(false)
const notification = ref<{ type: string; icon: string; message: string } | null>(null)

// Event Handlers
const handleImageUpdate = (data: any[]) => {
  imageData.value = data
  lastUpdateTime.value = new Date().toLocaleTimeString()
  console.log('Canvas updated:', data)
}

const handleExport = (dataURL: string) => {
  exportCount.value++
  showNotification('success', 'mdi-check-circle', 'Drawing exported successfully!')
  console.log('Exported image data URL:', dataURL.substring(0, 50) + '...')
}

const handleClear = () => {
  showNotification('info', 'mdi-information', 'Canvas cleared')
  console.log('Canvas cleared')
}

const handleUndo = () => {
  showNotification('info', 'mdi-undo', 'Undo performed')
  console.log('Undo performed')
}

const handleRedo = () => {
  showNotification('info', 'mdi-redo', 'Redo performed')
  console.log('Redo performed')
}

// Programmatic Controls
const programmaticUndo = () => {
  if (canvasRef.value) {
    canvasRef.value.undo()
  }
}

const programmaticClear = () => {
  if (canvasRef.value) {
    canvasRef.value.clearCanvas()
  }
}

const programmaticExport = () => {
  if (canvasRef.value) {
    canvasRef.value.exportImage()
  }
}

const toggleMode = () => {
  if (canvasRef.value) {
    isEraserMode.value = !isEraserMode.value
    if (isEraserMode.value) {
      canvasRef.value.setEraseMode()
      showNotification('info', 'mdi-eraser', 'Switched to Erase Mode')
    } else {
      canvasRef.value.setDrawMode()
      showNotification('info', 'mdi-brush', 'Switched to Draw Mode')
    }
  }
}

// Notification System
const showNotification = (type: string, icon: string, message: string) => {
  notification.value = { type, icon, message }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}
</script>

<style scoped>
.drawing-demo-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.demo-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.demo-subtitle {
  font-size: 18px;
  opacity: 0.95;
  font-weight: 400;
}

.demo-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
}

.data-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.data-title,
.controls-title,
.stats-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 12px 0;
}

.controls-title,
.stats-title {
  font-size: 16px;
}

.data-content {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.data-content pre {
  margin: 0;
  font-size: 11px;
  color: #2d3748;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

.no-data {
  color: #94a3b8;
  font-style: italic;
  text-align: center;
  margin: 20px 0;
}

.external-controls {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: white;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.demo-btn.clear {
  color: #ef4444;
}

.demo-btn.export {
  color: #10b981;
}

.demo-btn.toggle {
  color: #f59e0b;
}

.stats-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.stat-value {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification.success {
  color: #10b981;
}

.notification.info {
  color: #3b82f6;
}

.notification.error {
  color: #ef4444;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .demo-container {
    grid-template-columns: 1fr;
  }

  .data-panel {
    order: 2;
  }
}

@media (max-width: 768px) {
  .demo-title {
    font-size: 28px;
  }

  .demo-subtitle {
    font-size: 14px;
  }

  .button-group {
    grid-template-columns: 1fr;
  }
}
</style>
