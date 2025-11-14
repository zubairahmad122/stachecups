<template>
  <div
    class="image-editor"
    :style="
      hideEverything
        ? 'border-radius: 0 !important; box-shadow: 0 !important'
        : ''
    "
  >
    <div
      ref="containerRef"
      class="editor-container overflow-hidden max-h-[550px] relative bg-dark-400" 
      :class="{ 'drawing-mode': drawToolActive }"
      :style="
        backgroundUrl
          ? `background: url('${backgroundUrl}'); background-size: cover`
          : ''
      "
    >
      <KonvaCanvas
        ref="konvaCanvasRef"
        :width="width"
        :height="height"
        :images="images"
        :texts="texts"
        :selected-element-id="selectedElementId"
        :is-dragging="isDragging"
        :is-editing-text="isEditingText"
        :draw-tool-active="drawToolActive"
        :text-tool-active="textToolActive"
        :brush-size="brushSize"
        :brush-color="brushColor"
        :tool-mode="toolMode"
        :eraser-size="eraserSize"
        :bucket-color="bucketColor"
        :hide-labels="hideEverything"
        :show-looped-elements="true"
        :background-url="backgroundUrl"
        :locked-elements="lockedElements"
        :hidden-elements="hiddenElements"
        @element-select="$emit('element-select', $event)"
        @element-delete="$emit('element-delete', $event)"
        @element-update="(elementId, updatedElement) => $emit('element-update', elementId, updatedElement)"
        @edit-start="$emit('edit-start', $event)"
        @edit-finish="$emit('edit-finish')"
        @drawing-update="$emit('drawing-update', $event)"
        @stage-click="$emit('stage-click', $event)"
        @texture-update="$emit('texture-update')"
        @change-image="$emit('change-image', $event)"
        @edit-drawing="$emit('edit-drawing', $event)"
        @format-text="$emit('format-text', $event)"
        @toggle-lock="$emit('toggle-lock', $event)"
        @flip-horizontal="$emit('flip-horizontal', $event)"
        @flip-vertical="$emit('flip-vertical', $event)"
        @duplicate="$emit('duplicate', $event)"
        @add-frame="$emit('add-frame', $event)"
        @remove-frame="$emit('remove-frame', $event)"
        @rotate-element="$emit('rotate-element', $event)"
        @move-element="$emit('move-element', $event)"
        @font-change="(elementId, font) => $emit('font-change', elementId, font)"
        @color-change="(elementId, color) => $emit('color-change', elementId, color)"
        @underline-change="$emit('underline-change', $event)"
      />

      <QuillTextEditor
        v-if="isEditingText"
        :visible="isEditingText"
        :content="editingContent"
        :position="editingPosition"
        :font-size="editingFontSize"
        :font-family="editingFontFamily"
        :color="editingColor"
        :width="editingWidth"
        :height="editingHeight"
        @content-change="$emit('content-change', $event)"
        @finish-editing="$emit('finish-editing')"
        @cancel-editing="$emit('cancel-editing')"
        @error="$emit('editor-error', $event)"
      />

    </div>

    <!-- Hidden canvas for 3D texture generation -->
    <canvas ref="hiddenCanvas" style="display: none"></canvas>
  </div>
</template>

<script setup>
import KonvaCanvas from '~/components/editor/canvas/KonvaCanvas.vue'
import QuillTextEditor from '~/components/editor/canvas/QuillTextEditor.vue'

const props = defineProps({
  width: { type: Number, default: 952 },
  height: { type: Number, default: 550 },
  images: { type: Array, default: () => [] },
  texts: { type: Array, default: () => [] },
  selectedElementId: { type: String, default: null },
  lockedElements: { type: Set, default: () => new Set() },
  hiddenElements: { type: Set, default: () => new Set() },
  isDragging: { type: Boolean, default: false },
  isEditingText: { type: Boolean, default: false },
  drawToolActive: { type: Boolean, default: false },
  textToolActive: { type: Boolean, default: false },
  brushSize: { type: Number, default: 5 },
  brushColor: { type: String, default: '#000000' },
  toolMode: { type: String, default: 'brush' },
  eraserSize: { type: Number, default: 10 },
  bucketColor: { type: String, default: '#000000' },
  hideControls: { type: Boolean, default: false },
  hideEverything: { type: Boolean, default: false },
  backgroundUrl: { type: String, default: '' },
  canUndo: { type: Boolean, default: false },
  canRedo: { type: Boolean, default: false },
  editingContent: { type: String, default: '' },
  editingPosition: { type: Object, default: () => ({ x: 0, y: 0 }) },
  editingFontSize: { type: Number, default: 16 },
  editingFontFamily: { type: String, default: 'Roboto' },
  editingColor: { type: String, default: '#FF5CA0' },
  editingWidth: { type: Number, default: 300 },
  editingHeight: { type: Number, default: 150 },
})

defineEmits([
  // Undo/Redo
  'undo',
  'redo',
  
  // Text editing
  'content-change',
  'finish-editing',
  'cancel-editing',
  'editor-error',
  'edit-start',
  'edit-finish',
  'format-text',
  
  // Drawing
  'update:brush-size',
  'update:brush-color',
  'clear-drawing',
  'finish-drawing',
  'drawing-update',
  'edit-drawing',
  
  // Element operations from KonvaCanvas
  'element-select',
  'element-delete',
  'element-update',
  'duplicate',
  'add-frame',
  'remove-frame',
  'rotate-element',
  'move-element',
  'toggle-lock',
  'flip-horizontal',
  'flip-vertical',
  'change-image',
  'font-change',
  'color-change',
  'underline-change',
  'bring-to-front',
  'send-to-back',
  
  // Canvas interactions
  'stage-click',
  'texture-update',
])

const containerRef = ref(null)
const konvaCanvasRef = ref(null)
const hiddenCanvas = ref(null)

defineExpose({
  containerRef,
  konvaCanvasRef,
  hiddenCanvas,
})
</script>

<style scoped>
.image-editor {
  max-width: 64rem;
  margin: 0 auto;
  width: fit-content;
  overflow: hidden;
  height: fit-content;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.editor-container {
  position: relative;
  background-color: white;
  border-radius: 0.1rem;
  overflow: hidden !important;
  width: var(--canvas-width, 252.02mm);
  height: var(--canvas-height, 145.63mm);
  touch-action: none;
}



@media screen {
  .editor-container {
    width: var(--canvas-width-px, 952.5px);
    height: var(--canvas-height-px, 550.4px);
  }
}

@media (max-width: 1000px) {
  .editor-container {
    width: 100%;
    height: auto;
    aspect-ratio: var(--canvas-aspect-ratio, 1.73/1);
  }

  .image-editor {
    width: 100%;
    height: auto;
  }
}

.drawing-toolbar {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: 90vw;
}

.undo-redo-controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

@media (max-width: 768px) {
  .drawing-toolbar {
    bottom: 5px;
  }

  .undo-redo-controls {
    top: 10px;
    left: 10px;
  }
}
</style>

