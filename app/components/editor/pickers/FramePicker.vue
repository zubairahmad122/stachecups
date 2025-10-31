<template>
  <div class="frame-picker">
    <div class="categories-tabs">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-tab"
        :class="{ active: selectedCategory === category.id }"
        @click="selectedCategory = category.id"
      >
        {{ category.name }}
      </button>
    </div>

    <div class="frames-grid">
      <div
        v-for="frame in filteredFrames"
        :key="frame.id"
        class="frame-item"
        :class="{ selected: framesStore.selectedFrame?.id === frame.id }"
        @click="selectFrame(frame)"
      >
        <div class="frame-preview">
          <svg viewBox="0 0 100 100" class="frame-shape">
            <circle
              v-if="frame.shape === 'circle'"
              cx="50"
              cy="50"
              r="45"
              :fill="getPreviewFill(frame)"
              :stroke="getPreviewStroke(frame)"
              stroke-width="2"
            />
            
            <rect
              v-else-if="frame.shape === 'square'"
              x="5"
              y="5"
              width="90"
              height="90"
              :rx="frame.borderRadius || 0"
              :fill="getPreviewFill(frame)"
              :stroke="getPreviewStroke(frame)"
              stroke-width="2"
            />
            
            <rect
              v-else-if="frame.shape === 'rounded-square'"
              x="5"
              y="5"
              width="90"
              height="90"
              :rx="frame.borderRadius || 20"
              :fill="getPreviewFill(frame)"
              :stroke="getPreviewStroke(frame)"
              stroke-width="2"
            />
            
            <path
              v-else-if="frame.shape === 'heart'"
              d="M50,85 C50,85 15,60 15,40 C15,25 25,15 35,15 C42,15 48,20 50,25 C52,20 58,15 65,15 C75,15 85,25 85,40 C85,60 50,85 50,85 Z"
              :fill="getPreviewFill(frame)"
              :stroke="getPreviewStroke(frame)"
              stroke-width="2"
            />
            
            <path
              v-else-if="frame.shape === 'star'"
              d="M50,10 L61,41 L95,41 L68,61 L79,92 L50,72 L21,92 L32,61 L5,41 L39,41 Z"
              :fill="getPreviewFill(frame)"
              :stroke="getPreviewStroke(frame)"
              stroke-width="2"
            />
            
            <path
              v-else-if="frame.shape === 'hexagon'"
              d="M50,5 L85,27.5 L85,72.5 L50,95 L15,72.5 L15,27.5 Z"
              :fill="getPreviewFill(frame)"
              :stroke="getPreviewStroke(frame)"
              stroke-width="2"
            />
            
            <path
              v-else-if="frame.shape === 'octagon'"
              d="M30,5 L70,5 L95,30 L95,70 L70,95 L30,95 L5,70 L5,30 Z"
              :fill="getPreviewFill(frame)"
              :stroke="getPreviewStroke(frame)"
              stroke-width="2"
            />
            
            <path
              v-else-if="frame.shape === 'diamond'"
              d="M50,5 L95,50 L50,95 L5,50 Z"
              :fill="getPreviewFill(frame)"
              :stroke="getPreviewStroke(frame)"
              stroke-width="2"
            />
            
            <g v-else-if="frame.shape === 'none'">
              <line x1="20" y1="20" x2="80" y2="80" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
              <line x1="80" y1="20" x2="20" y2="80" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
            </g>
          </svg>
        </div>
        <div class="frame-name">{{ frame.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFramesStore } from '~/store/frames'
import type { Frame } from '~/store/frames'

const emit = defineEmits(['select'])

const framesStore = useFramesStore()

const selectedCategory = ref('all')

const categories = [
  { id: 'all', name: 'All' },
  { id: 'basic', name: 'Basic' },
  { id: 'geometric', name: 'Geometric' },
  { id: 'organic', name: 'Organic' },
]

const filteredFrames = computed(() => {
  return framesStore.getFramesByCategory(selectedCategory.value)
})

const selectFrame = (frame: Frame) => {
  framesStore.selectFrame(frame)
  emit('select', frame)
}

const getPreviewFill = (frame: Frame) => {
  return frame.id === 'none' ? 'none' : '#f1f5f9'
}

const getPreviewStroke = (frame: Frame) => {
  return frame.id === 'none' ? 'none' : '#64748b'
}
</script>

<style scoped>
.frame-picker {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.categories-tabs {
  display: flex;
  gap: 8px;
  padding: 0 4px;
  border-bottom: 1px solid #e5e7eb;
}

.category-tab {
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-tab:hover {
  color: #374151;
  background: #f9fafb;
  border-radius: 6px 6px 0 0;
}

.category-tab.active {
  color: #8b5cf6;
  border-bottom-color: #8b5cf6;
}

.frames-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.frame-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.frame-item:hover {
  border-color: #c4b5fd;
  background: #faf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
}

.frame-item.selected {
  border-color: #8b5cf6;
  background: #faf5ff;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.frame-preview {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.frame-shape {
  width: 100%;
  height: 100%;
}

.frame-name {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.2;
}

.frame-item.selected .frame-name {
  color: #8b5cf6;
  font-weight: 600;
}

/* Scrollbar Styling */
.frames-grid::-webkit-scrollbar {
  width: 6px;
}

.frames-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.frames-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.frames-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

