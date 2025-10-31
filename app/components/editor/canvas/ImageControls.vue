<template>
  <div class="image-controls-popup" v-if="visible">
    <div class="controls-header">
      <h4>Image Controls</h4>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>

    <div class="controls-body">
      <!-- Frame Selection (if hasFrame) -->
      <div class="control-section" v-if="hasFrame">
        <label class="control-label">Frame</label>
        <div class="frame-info">
          <span class="frame-name">{{ frameName }}</span>
          <button class="remove-frame-btn" @click="$emit('remove-frame')">
            Remove Frame
          </button>
        </div>
      </div>

      <!-- Crop/Zoom Controls -->
      <div class="control-section">
        <label class="control-label">Zoom</label>
        <div class="slider-container">
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            :value="imageScale"
            @input="handleScaleChange"
            class="slider"
          />
          <span class="slider-value">{{ Math.round(imageScale * 100) }}%</span>
        </div>
      </div>

      <div class="control-section">
        <label class="control-label">Position X</label>
        <div class="slider-container">
          <input
            type="range"
            :min="-maxOffset"
            :max="maxOffset"
            step="1"
            :value="cropX"
            @input="handleCropXChange"
            class="slider"
          />
          <span class="slider-value">{{ Math.round(cropX) }}</span>
        </div>
      </div>

      <div class="control-section">
        <label class="control-label">Position Y</label>
        <div class="slider-container">
          <input
            type="range"
            :min="-maxOffset"
            :max="maxOffset"
            step="1"
            :value="cropY"
            @input="handleCropYChange"
            class="slider"
          />
          <span class="slider-value">{{ Math.round(cropY) }}</span>
        </div>
      </div>

      <!-- Reset Button -->
      <button class="reset-btn" @click="handleReset">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  visible: boolean
  imageScale?: number
  cropX?: number
  cropY?: number
  hasFrame?: boolean
  frameName?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  imageScale: 1,
  cropX: 0,
  cropY: 0,
  hasFrame: false,
  frameName: '',
})

const emit = defineEmits(['close', 'update:scale', 'update:crop-x', 'update:crop-y', 'reset', 'remove-frame'])

const maxOffset = 200

const handleScaleChange = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value)
  emit('update:scale', value)
}

const handleCropXChange = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value)
  emit('update:crop-x', value)
}

const handleCropYChange = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value)
  emit('update:crop-y', value)
}

const handleReset = () => {
  emit('reset')
}
</script>

<style scoped>
.image-controls-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 320px;
  z-index: 10000;
  border: 1px solid #e5e7eb;
}

.controls-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.controls-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.controls-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.frame-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.frame-name {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.remove-frame-btn {
  padding: 6px 12px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-frame-btn:hover {
  background: #dc2626;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: #7c3aed;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  background: #7c3aed;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.slider-value {
  min-width: 50px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 4px;
}

.reset-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.reset-btn svg {
  flex-shrink: 0;
}
</style>

