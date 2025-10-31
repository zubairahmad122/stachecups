<template>
  <div class="enhanced-font-picker">
    <!-- Font Search -->
    <div class="font-search">
      <q-input
        v-model="searchQuery"
        placeholder="Search fonts..."
        outlined
        dense
        class="search-input"
      >
        <template #prepend>
          <q-icon name="mdi-magnify" />
        </template>
      </q-input>
    </div>

    <!-- Font Categories -->
    <div class="font-categories">
      <div class="categories-header">
        <span class="categories-title">Categories</span>
      </div>
      <div class="categories-grid">
        <button
          v-for="category in fontCategories"
          :key="category.id"
          class="category-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          <q-icon :name="category.icon" size="16px" />
          <span class="category-label">{{ category.label }}</span>
        </button>
      </div>
    </div>

    <!-- Font List -->
    <div class="font-list">
      <div class="font-list-header">
        <span class="font-count">{{ filteredFonts.length }} fonts</span>
        <div class="view-toggle">
          <button
            class="view-btn"
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <q-icon name="mdi-view-grid" size="16px" />
          </button>
          <button
            class="view-btn"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <q-icon name="mdi-view-list" size="16px" />
          </button>
        </div>
      </div>

      <div class="fonts-container" :class="viewMode">
        <div
          v-for="font in filteredFonts"
          :key="font.value"
          class="font-item"
          :class="{ 
            selected: selectedFont === font.value,
            [viewMode]: true
          }"
          @click="selectFont(font)"
        >
          <div class="font-preview" :style="{ fontFamily: font.fontFamily }">
            <span class="preview-text">{{ previewText }}</span>
          </div>
          <div class="font-info">
            <div class="font-name">{{ font.label }}</div>
            <div class="font-category">{{ getCategoryLabel(font.category) }}</div>
          </div>
          <div v-if="selectedFont === font.value" class="selected-indicator">
            <q-icon name="mdi-check" size="16px" />
          </div>
        </div>
      </div>
    </div>

    <!-- Font Size Controls -->
    <div class="font-size-section">
      <div class="size-header">
        <span class="size-title">Font Size</span>
        <span class="size-value">{{ currentFontSize }}px</span>
      </div>
      
      <!-- Size Presets -->
      <div class="size-presets">
        <button
          v-for="preset in fontSizePresets"
          :key="preset.value"
          class="size-preset"
          :class="{ active: currentFontSize === preset.value }"
          @click="selectFontSize(preset.value)"
        >
          {{ preset.label }}
        </button>
      </div>
      
      <!-- Size Slider -->
      <div class="size-slider-container">
        <q-slider
          v-model="currentFontSize"
          :min="8"
          :max="200"
          :step="1"
          label
          label-always
          class="size-slider"
          @change="onFontSizeChange"
        />
      </div>
    </div>

    <!-- Typography Controls -->
    <div class="typography-controls">
      <div class="controls-header">
        <span class="controls-title">Typography</span>
      </div>
      
      <div class="controls-grid">
        <!-- Bold -->
        <button
          class="control-btn"
          :class="{ active: isBold }"
          @click="toggleBold"
        >
          <q-icon name="mdi-format-bold" size="18px" />
        </button>
        
        <!-- Italic -->
        <button
          class="control-btn"
          :class="{ active: isItalic }"
          @click="toggleItalic"
        >
          <q-icon name="mdi-format-italic" size="18px" />
        </button>
        
        <!-- Underline -->
        <button
          class="control-btn"
          :class="{ active: isUnderline }"
          @click="toggleUnderline"
        >
          <q-icon name="mdi-format-underline" size="18px" />
        </button>
        
        <!-- Letter Spacing -->
        <div class="spacing-control">
          <q-icon name="mdi-format-letter-spacing" size="18px" />
          <q-slider
            v-model="letterSpacing"
            :min="-5"
            :max="20"
            :step="0.5"
            class="spacing-slider"
            @change="onLetterSpacingChange"
          />
          <span class="spacing-value">{{ letterSpacing }}px</span>
        </div>
        
        <!-- Line Height -->
        <div class="line-height-control">
          <q-icon name="mdi-format-line-spacing" size="18px" />
          <q-slider
            v-model="lineHeight"
            :min="0.8"
            :max="3"
            :step="0.1"
            class="line-height-slider"
            @change="onLineHeightChange"
          />
          <span class="line-height-value">{{ lineHeight }}</span>
        </div>
      </div>
    </div>

    <!-- Color Controls -->
    <div class="color-section">
      <div class="color-header">
        <span class="color-title">Text Color</span>
      </div>
      
      <div class="color-controls">
        <div class="color-picker-wrapper">
          <q-input
            v-model="textColor"
            type="color"
            outlined
            dense
            class="color-input"
            @change="onColorChange"
          />
        </div>
        
        <div class="color-presets">
          <button
            v-for="color in colorPresets"
            :key="color"
            class="color-preset"
            :style="{ backgroundColor: color }"
            :class="{ active: textColor === color }"
            @click="selectColor(color)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AVAILABLE_FONTS, FONT_CATEGORIES, FONT_SIZE_PRESETS } from '~/config/fonts'

const props = defineProps<{
  selectedFont?: string
  fontSize?: number
  textColor?: string
  isBold?: boolean
  isItalic?: boolean
  isUnderline?: boolean
  letterSpacing?: number
  lineHeight?: number
  previewText?: string
}>()

const emit = defineEmits([
  'font-change',
  'font-size-change', 
  'color-change',
  'bold-change',
  'italic-change',
  'underline-change',
  'letter-spacing-change',
  'line-height-change'
])

// State
const searchQuery = ref('')
const selectedCategory = ref('all')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedFont = ref(props.selectedFont || 'Roboto')
const currentFontSize = ref(props.fontSize || 32)
const textColor = ref(props.textColor || '#000000')
const isBold = ref(props.isBold || false)
const isItalic = ref(props.isItalic || false)
const isUnderline = ref(props.isUnderline || false)
const letterSpacing = ref(props.letterSpacing || 0)
const lineHeight = ref(props.lineHeight || 1.2)

// Constants
const fontCategories = FONT_CATEGORIES
const fontSizePresets = FONT_SIZE_PRESETS
const previewText = ref(props.previewText || 'Aa')

const colorPresets = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
]

// Computed
const filteredFonts = computed(() => {
  let fonts = AVAILABLE_FONTS

  // Filter by category
  if (selectedCategory.value !== 'all') {
    fonts = fonts.filter(font => font.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    fonts = fonts.filter(font => 
      font.label.toLowerCase().includes(query) ||
      font.category.toLowerCase().includes(query)
    )
  }

  return fonts
})

// Methods
const selectFont = (font: any) => {
  selectedFont.value = font.value
  emit('font-change', font.value)
}

const selectFontSize = (size: number) => {
  currentFontSize.value = size
  emit('font-size-change', size)
}

const selectColor = (color: string) => {
  textColor.value = color
  emit('color-change', color)
}

const toggleBold = () => {
  isBold.value = !isBold.value
  emit('bold-change', isBold.value)
}

const toggleItalic = () => {
  isItalic.value = !isItalic.value
  emit('italic-change', isItalic.value)
}

const toggleUnderline = () => {
  isUnderline.value = !isUnderline.value
  emit('underline-change', isUnderline.value)
}

const onFontSizeChange = (size: number) => {
  emit('font-size-change', size)
}

const onColorChange = (color: string) => {
  emit('color-change', color)
}

const onLetterSpacingChange = (spacing: number) => {
  emit('letter-spacing-change', spacing)
}

const onLineHeightChange = (height: number) => {
  emit('line-height-change', height)
}

const getCategoryLabel = (category: string) => {
  const cat = fontCategories.find(c => c.id === category)
  return cat ? cat.label : category
}

// Watch for prop changes
watch(() => props.selectedFont, (newFont) => {
  if (newFont) selectedFont.value = newFont
})

watch(() => props.fontSize, (newSize) => {
  if (newSize) currentFontSize.value = newSize
})

watch(() => props.textColor, (newColor) => {
  if (newColor) textColor.value = newColor
})

watch(() => props.isBold, (newBold) => {
  isBold.value = newBold
})

watch(() => props.isItalic, (newItalic) => {
  isItalic.value = newItalic
})

watch(() => props.isUnderline, (newUnderline) => {
  isUnderline.value = newUnderline
})

watch(() => props.letterSpacing, (newSpacing) => {
  if (newSpacing !== undefined) letterSpacing.value = newSpacing
})

watch(() => props.lineHeight, (newHeight) => {
  if (newHeight !== undefined) lineHeight.value = newHeight
})
</script>

<style scoped lang="scss">
.enhanced-font-picker {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.font-search {
  .search-input {
    .q-field__control {
      border-radius: 8px;
      border-color: #e2e8f0;
    }
    
    .q-field__control:hover {
      border-color: #1EADB0;
    }
  }
}

.font-categories {
  .categories-header {
    margin-bottom: 12px;
  }
  
  .categories-title {
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #4a5568;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #1EADB0;
    background: rgba(30, 173, 176, 0.05);
    color: #1EADB0;
  }
  
  &.active {
    border-color: #1EADB0;
    background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
    color: #1EADB0;
  }
  
  .category-label {
    font-size: 11px;
  }
}

.font-list {
  .font-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .font-count {
    font-size: 12px;
    color: #718096;
    font-weight: 500;
  }
  
  .view-toggle {
    display: flex;
    gap: 4px;
  }
  
  .view-btn {
    width: 28px;
    height: 28px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    color: #718096;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      border-color: #1EADB0;
      color: #1EADB0;
    }
    
    &.active {
      border-color: #1EADB0;
      background: #1EADB0;
      color: white;
    }
  }
}

.fonts-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  
  &.grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

.font-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: #1EADB0;
    background: rgba(30, 173, 176, 0.05);
  }
  
  &.selected {
    border-color: #1EADB0;
    background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
  }
  
  &.grid {
    flex-direction: column;
    text-align: center;
    padding: 16px 12px;
  }
}

.font-preview {
  min-width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  
  .preview-text {
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
  }
}

.font-info {
  flex: 1;
  min-width: 0;
  
  .font-name {
    font-size: 13px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 2px;
  }
  
  .font-category {
    font-size: 11px;
    color: #718096;
  }
}

.selected-indicator {
  color: #1EADB0;
}

.font-size-section {
  .size-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .size-title {
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .size-value {
    font-size: 12px;
    color: #1EADB0;
    font-weight: 600;
  }
}

.size-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 16px;
}

.size-preset {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #1EADB0;
    color: #1EADB0;
  }
  
  &.active {
    border-color: #1EADB0;
    background: #1EADB0;
    color: white;
  }
}

.size-slider-container {
  .size-slider {
    .q-slider__track {
      background: #e2e8f0;
    }
    
    .q-slider__thumb {
      background: #1EADB0;
    }
  }
}

.typography-controls {
  .controls-header {
    margin-bottom: 12px;
  }
  
  .controls-title {
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: #1EADB0;
    color: #1EADB0;
  }
  
  &.active {
    border-color: #1EADB0;
    background: #1EADB0;
    color: white;
  }
}

.spacing-control, .line-height-control {
  grid-column: span 3;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  
  .spacing-slider, .line-height-slider {
    flex: 1;
    
    .q-slider__track {
      background: #e2e8f0;
    }
    
    .q-slider__thumb {
      background: #1EADB0;
    }
  }
  
  .spacing-value, .line-height-value {
    font-size: 11px;
    color: #718096;
    font-weight: 500;
    min-width: 30px;
    text-align: right;
  }
}

.color-section {
  .color-header {
    margin-bottom: 12px;
  }
  
  .color-title {
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.color-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-picker-wrapper {
  .color-input {
    .q-field__control {
      height: 40px;
      border-radius: 8px;
    }
  }
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.color-preset {
  width: 28px;
  height: 28px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: #1EADB0;
  }
  
  &.active {
    border-color: #1EADB0;
    transform: scale(1.1);
  }
}

// Scrollbar styling
.enhanced-font-picker::-webkit-scrollbar,
.fonts-container::-webkit-scrollbar {
  width: 6px;
}

.enhanced-font-picker::-webkit-scrollbar-track,
.fonts-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.enhanced-font-picker::-webkit-scrollbar-thumb,
.fonts-container::-webkit-scrollbar-thumb {
  background: #1EADB0;
  border-radius: 3px;
  
  &:hover {
    background: #4B5574;
  }
}
</style>
