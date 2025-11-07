<template>
  <div class="modern-draw-toolbar">

    <!-- Tool Mode Selection -->
    <div class="toolbar-section">
      <div class="section-header">
        <q-icon name="mdi-tools" size="16px" class="section-icon" />
        <span class="section-title">Tool</span>
      </div>
      <div class="tool-mode-grid">
        <button
          class="tool-mode-btn"
          :class="{ active: toolMode === 'brush' }"
          @click="updateToolMode('brush')"
          title="Brush Tool"
        >
          <q-icon name="mdi-brush" size="18px" />
          <span>Brush</span>
        </button>
        <button
          class="tool-mode-btn"
          :class="{ active: toolMode === 'eraser' }"
          @click="updateToolMode('eraser')"
          title="Eraser Tool"
        >
          <q-icon name="mdi-eraser" size="18px" />
          <span>Eraser</span>
        </button>
        <button
          class="tool-mode-btn"
          :class="{ active: toolMode === 'bucket' }"
          @click="updateToolMode('bucket')"
          title="Bucket Fill Tool"
        >
          <q-icon name="mdi-format-color-fill" size="18px" />
          <span>Fill</span>
        </button>
      </div>
    </div>

    <div class="toolbar-divider"></div>

    <!-- Brush Size Slider (for brush and eraser) -->
    <div v-if="toolMode === 'brush' || toolMode === 'eraser'" class="toolbar-section">
      <div class="section-header">
        <q-icon name="mdi-resize" size="16px" class="section-icon" />
        <span class="section-title">{{ toolMode === 'eraser' ? 'Eraser' : 'Brush' }} Size: {{ currentSize }}px</span>
      </div>
      <div class="slider-wrapper">
        <input
          type="range"
          min="1"
          max="50"
          :value="currentSize"
          @input="updateSize(Number($event.target.value))"
          class="brush-slider"
        />
        <div class="slider-labels">
          <span>1px</span>
          <span>50px</span>
        </div>
      </div>
    </div>

    <div class="toolbar-divider"></div>

    <!-- Color Picker (for brush and bucket) -->
    <div v-if="toolMode === 'brush' || toolMode === 'bucket'" class="toolbar-section">
      <div class="section-header">
        <q-icon name="mdi-palette" size="16px" class="section-icon" />
        <span class="section-title">{{ toolMode === 'bucket' ? 'Fill' : 'Brush' }} Color</span>
      </div>
      <div class="color-section">
        <div class="color-presets">
          <button
            v-for="color in colorPresets"
            :key="color"
            class="color-preset"
            :class="{ active: currentColor === color }"
            :style="{ backgroundColor: color }"
            @click="updateColor(color)"
            :title="color"
          />
        </div>
        <div class="custom-color-wrapper">
          <button
            class="custom-color-btn"
            @click="showColorPicker = true"
            title="Pick custom color"
          >
            <div class="color-preview" :style="{ backgroundColor: currentColor }"></div>
            <span class="custom-color-label">{{ currentColor }}</span>
          </button>
        </div>

        <!-- Color Picker Popover -->
        <q-dialog v-model="showColorPicker">
          <q-card class="color-picker-dialog">
            <q-card-section class="q-pa-md">
              <div class="text-subtitle2 q-mb-md">Pick a Color</div>
              <VueColorPicker
                :color="currentColor"
                :theme="'light'"
                :sucker-hide="true"
                @changeColor="handleCustomColorChange"
              />
              <div class="q-mt-md flex justify-end gap-2">
                <q-btn flat label="Close" color="primary" @click="showColorPicker = false" />
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
    </div>

    <div class="toolbar-divider"></div>

    <!-- Action Buttons -->
    <div class="toolbar-section">
      <div class="action-buttons-grid">
        <button class="modern-btn undo-btn" @click="$emit('undo')" title="Undo (Ctrl+Z)">
          <q-icon name="mdi-undo" size="18px" />
          <span>Undo</span>
        </button>

        <button class="modern-btn clear-btn" @click="$emit('clear')" title="Clear Canvas">
          <q-icon name="mdi-delete-outline" size="18px" />
          <span>Clear</span>
        </button>

        <button class="modern-btn done-btn" @click="$emit('done')" title="Finish Drawing">
          <q-icon name="mdi-check" size="18px" />
          <span>Done</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ColorPicker as VueColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'

const props = defineProps({
  brushSize: {
    type: Number,
    default: 5
  },
  brushColor: {
    type: String,
    default: '#000000'
  },
  toolMode: {
    type: String,
    default: 'brush'
  },
  eraserSize: {
    type: Number,
    default: 10
  },
  bucketColor: {
    type: String,
    default: '#000000'
  }
});

const emit = defineEmits([
  'update:brushSize',
  'update:brushColor',
  'update:toolMode',
  'update:eraserSize',
  'update:bucketColor',
  'undo',
  'clear',
  'done'
]);

const showColorPicker = ref(false);

const colorPresets = ref([
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
]);

const currentSize = computed(() => {
  return props.toolMode === 'eraser' ? props.eraserSize : props.brushSize;
});

const currentColor = computed(() => {
  return props.toolMode === 'bucket' ? props.bucketColor : props.brushColor;
});

const updateToolMode = (mode) => {
  emit('update:toolMode', mode);
};

const updateSize = (size) => {
  if (props.toolMode === 'eraser') {
    emit('update:eraserSize', size);
  } else {
    emit('update:brushSize', size);
  }
};

let colorChangeTimeout = null;

const updateColor = (color) => {
  if (props.toolMode === 'bucket') {
    emit('update:bucketColor', color);
  } else {
    emit('update:brushColor', color);
  }
};

const handleCustomColorChange = (colorObj) => {
  if (colorObj && colorObj.hex) {
    if (colorChangeTimeout) {
      clearTimeout(colorChangeTimeout);
    }

    colorChangeTimeout = setTimeout(() => {
      updateColor(colorObj.hex);
    }, 50);
  }
};
</script>

<style scoped>
.modern-draw-toolbar {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 280px;
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.section-icon {
  color: #1EADB0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tool-mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.tool-mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tool-mode-btn:hover {
  border-color: #1EADB0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 173, 176, 0.15);
  color: #1EADB0;
}

.tool-mode-btn.active {
  border-color: #1EADB0;
  background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
  box-shadow: 0 2px 8px rgba(30, 173, 176, 0.2);
  color: #1EADB0;
}

.tool-mode-btn .q-icon {
  color: inherit;
}

.brush-size-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.size-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.size-option:hover {
  border-color: #1EADB0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 173, 176, 0.15);
}

.size-option.active {
  border-color: #1EADB0;
  background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
  box-shadow: 0 2px 8px rgba(30, 173, 176, 0.2);
}

.size-indicator {
  border-radius: 50%;
  background: #1EADB0;
  transition: all 0.2s ease;
}

.size-option.active .size-indicator {
  background: #1EADB0;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #1EADB0;
}

/* Brush Size Slider */
.slider-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.brush-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.brush-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1EADB0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.brush-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(30, 173, 176, 0.4);
}

.brush-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1EADB0;
  cursor: pointer;
  border: none;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #94a3b8;
}

.toolbar-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(30, 173, 176, 0.2) 50%, transparent 100%);
}

.color-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.color-preset {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.color-preset:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-preset.active {
  border-color: #1EADB0;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #1EADB0;
  transform: scale(1.05);
}

.custom-color-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-color-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.custom-color-btn:hover {
  border-color: #1EADB0;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid #e2e8f0;
}

.custom-color-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
}

.color-picker-dialog {
  min-width: 300px;
}

.action-buttons-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modern-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.undo-btn {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.1) 0%, rgba(71, 85, 105, 0.1) 100%);
  color: #64748b;
}

.undo-btn:hover {
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

.done-btn {
  background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
  color: white;
  border: 2px solid transparent;
}

.done-btn:hover {
  background: linear-gradient(135deg, #1a9ca0 0%, #3d4758 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 173, 176, 0.4);
}
</style>
