<template>
  <q-dialog :model-value="show" @update:model-value="$emit('close')" position="bottom" class="enhanced-monogram-dialog">
    <q-card class="enhanced-monogram-picker">
      <!-- Header -->
      <q-card-section class="picker-header">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="mdi-alpha-m-circle" size="28px" />
          </div>
          <div class="header-text">
            <span class="text-h6">Create Monogram</span>
            <span class="text-caption">Design your perfect monogram</span>
          </div>
          <q-btn 
            flat 
            round 
            dense 
            icon="mdi-close" 
            class="close-btn"
            @click="$emit('close')" 
          />
        </div>
      </q-card-section>

      <q-separator class="modal-separator" />

      <!-- Content -->
      <q-card-section class="picker-content">
        <div class="monogram-builder">
          <!-- Step 1: Template Selection -->
          <div class="builder-step" :class="{ active: currentStep === 1 }">
            <div class="step-header">
              <div class="step-number">1</div>
              <div class="step-title">Choose Style</div>
            </div>
            
            <div class="templates-grid">
              <div
                v-for="template in templates"
                :key="template.id"
                class="template-card"
                :class="{ selected: selectedTemplate?.id === template.id }"
                @click="selectTemplate(template)"
              >
                <div class="template-preview">
                  <div class="template-icon" :class="template.layoutStyle">
                    {{ getTemplateIcon(template.layoutStyle) }}
                  </div>
                </div>
                <div class="template-name">{{ template.name }}</div>
                <div class="template-description">{{ template.description }}</div>
              </div>
            </div>
          </div>

          <!-- Step 2: Letters Input -->
          <div class="builder-step" :class="{ active: currentStep === 2 }" v-if="selectedTemplate">
            <div class="step-header">
              <div class="step-number">2</div>
              <div class="step-title">Enter Letters</div>
            </div>

            <div class="letters-input-section">
              <div class="input-grid">
                <div v-if="selectedTemplate.letterCount >= 1" class="letter-input-group">
                  <label class="input-label">First Name</label>
                  <q-input
                    v-model="firstLetter"
                    maxlength="1"
                    outlined
                    dense
                    class="letter-input"
                    @input="updatePreview"
                  />
                </div>
                
                <div v-if="selectedTemplate.letterCount >= 2" class="letter-input-group">
                  <label class="input-label">Last Name</label>
                  <q-input
                    v-model="lastLetter"
                    maxlength="1"
                    outlined
                    dense
                    class="letter-input"
                    @input="updatePreview"
                  />
                </div>
                
                <div v-if="selectedTemplate.letterCount >= 3" class="letter-input-group">
                  <label class="input-label">Middle Name</label>
                  <q-input
                    v-model="middleLetter"
                    maxlength="1"
                    outlined
                    dense
                    class="letter-input"
                    @input="updatePreview"
                  />
                </div>
              </div>

              <!-- Quick Letter Buttons -->
              <div class="quick-letters">
                <div class="quick-letters-title">Quick Select</div>
                <div class="quick-letters-grid">
                  <button
                    v-for="letter in quickLetters"
                    :key="letter"
                    class="quick-letter-btn"
                    @click="insertLetter(letter)"
                  >
                    {{ letter }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Customization -->
          <div class="builder-step" :class="{ active: currentStep === 3 }" v-if="selectedTemplate && isValid">
            <div class="step-header">
              <div class="step-number">3</div>
              <div class="step-title">Customize</div>
            </div>

            <div class="customization-panel">
              <!-- Font Selection -->
              <div class="customization-group">
                <label class="group-label">Font Style</label>
                <div class="font-grid">
                  <div
                    v-for="font in monogramFonts"
                    :key="font.value"
                    class="font-option"
                    :class="{ selected: selectedFont === font.value }"
                    @click="selectedFont = font.value"
                  >
                    <div class="font-preview" :style="{ fontFamily: font.value }">
                      {{ previewText }}
                    </div>
                    <div class="font-name">{{ font.label }}</div>
                  </div>
                </div>
              </div>

              <!-- Size and Color -->
              <div class="customization-row">
                <div class="customization-item">
                  <label class="item-label">Size</label>
                  <q-slider
                    v-model="fontSize"
                    :min="24"
                    :max="128"
                    :step="4"
                    label
                    label-always
                    class="size-slider"
                  />
                  <div class="size-value">{{ fontSize }}px</div>
                </div>

                <div class="customization-item">
                  <label class="item-label">Color</label>
                  <div class="color-picker-wrapper">
                    <input
                      v-model="color"
                      type="color"
                      class="color-input"
                    />
                    <div class="color-presets">
                      <button
                        v-for="preset in colorPresets"
                        :key="preset"
                        class="color-preset"
                        :style="{ backgroundColor: preset }"
                        @click="color = preset"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Spacing (for applicable layouts) -->
              <div v-if="['horizontal', 'stacked', 'vertical'].includes(selectedTemplate.layoutStyle)" class="customization-item">
                <label class="item-label">Letter Spacing</label>
                <q-slider
                  v-model="spacing"
                  :min="0"
                  :max="50"
                  :step="2"
                  label
                  label-always
                  class="spacing-slider"
                />
                <div class="spacing-value">{{ spacing }}px</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Preview -->
        <div class="preview-section" v-if="selectedTemplate">
          <div class="preview-header">
            <q-icon name="mdi-eye" size="20px" />
            <span>Live Preview</span>
          </div>
          <div class="preview-container">
            <div class="monogram-preview" :style="previewStyle">
              {{ previewText }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator class="modal-separator" />

      <!-- Footer -->
      <q-card-section class="picker-footer">
        <div class="footer-actions">
          <q-btn 
            flat 
            label="Cancel" 
            color="grey-7"
            class="cancel-btn"
            @click="$emit('close')" 
          />
          <q-btn
            :label="editingElement ? 'Update Monogram' : 'Add Monogram'"
            color="primary"
            class="add-btn"
            :disable="!canAdd"
            @click="handleAdd"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMonogramStore } from '~/store/monogram'
import { MONOGRAM_TEMPLATES, CUSTOM_MONOGRAM_FONTS } from '~/config/fonts'

const props = defineProps<{
  show: boolean
  editingElement?: any
}>()

const emit = defineEmits(['close', 'add', 'update'])

const monogramStore = useMonogramStore()

// State
const currentStep = ref(1)
const selectedTemplate = ref<any>(null)
const firstLetter = ref('')
const middleLetter = ref('')
const lastLetter = ref('')
const selectedFont = ref('monogram_kk')
const fontSize = ref(48)
const color = ref('#000000')
const spacing = ref(10)

// Constants
const templates = MONOGRAM_TEMPLATES
const monogramFonts = CUSTOM_MONOGRAM_FONTS
const quickLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const colorPresets = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
]

// Computed
const isValid = computed(() => {
  if (!selectedTemplate.value) return false
  
  if (selectedTemplate.value.letterCount === 1) {
    return firstLetter.value.length > 0
  }
  if (selectedTemplate.value.letterCount === 2) {
    return firstLetter.value.length > 0 && lastLetter.value.length > 0
  }
  if (selectedTemplate.value.letterCount === 3) {
    return firstLetter.value.length > 0 && 
           middleLetter.value.length > 0 && 
           lastLetter.value.length > 0
  }
  
  return false
})

const canAdd = computed(() => {
  return selectedTemplate.value && isValid.value
})

const previewText = computed(() => {
  if (!selectedTemplate.value) return ''

  const layout = selectedTemplate.value.layoutStyle
  const f = firstLetter.value.toUpperCase()
  const m = middleLetter.value.toUpperCase()
  const l = lastLetter.value.toUpperCase()

  if (selectedTemplate.value.letterCount === 1) {
    return f
  }

  if (selectedTemplate.value.letterCount === 2) {
    switch (layout) {
      case 'horizontal':
        return `${f} ${l}`
      case 'stacked':
      case 'vertical':
        return `${f}\n${l}`
      case 'circle':
        return `${f}${l}`
      default:
        return `${f}${l}`
    }
  }

  switch (layout) {
    case 'traditional':
      return `${f}${l}${m}`
    case 'horizontal':
      return `${f} ${m} ${l}`
    case 'stacked':
    case 'vertical':
      return `${f}\n${m}\n${l}`
    case 'circle':
      return `${f}${m}${l}`
    default:
      return `${f}${m}${l}`
  }
})

const previewStyle = computed(() => {
  const layout = selectedTemplate.value?.layoutStyle

  const calculatedLineHeight = layout === 'stacked' || layout === 'vertical'
    ? `${fontSize.value + spacing.value}px`
    : 'normal'

  return {
    fontFamily: selectedFont.value,
    fontSize: `${fontSize.value}px`,
    color: color.value,
    letterSpacing: layout === 'horizontal' ? `${spacing.value}px` : '0px',
    lineHeight: calculatedLineHeight,
    whiteSpace: layout === 'stacked' || layout === 'vertical' ? 'pre-line' : 'normal',
  }
})

// Methods
const selectTemplate = (template: any) => {
  selectedTemplate.value = template
  currentStep.value = 2
  updatePreview()
}

const insertLetter = (letter: string) => {
  if (!selectedTemplate.value) return
  
  if (selectedTemplate.value.letterCount >= 1 && !firstLetter.value) {
    firstLetter.value = letter
  } else if (selectedTemplate.value.letterCount >= 2 && !lastLetter.value) {
    lastLetter.value = letter
  } else if (selectedTemplate.value.letterCount >= 3 && !middleLetter.value) {
    middleLetter.value = letter
  }
  
  updatePreview()
}

const updatePreview = () => {
  if (isValid.value && currentStep.value < 3) {
    currentStep.value = 3
  }
}

const getTemplateIcon = (layoutStyle: string) => {
  const icons = {
    'circle': '◯',
    'stacked': '☰',
    'horizontal': '━',
    'vertical': '┃',
    'traditional': '⊕',
  }
  return icons[layoutStyle] || '◯'
}

const handleAdd = () => {
  const config = {
    type: 'monogram',
    template: selectedTemplate.value,
    letters: {
      first: firstLetter.value.toUpperCase(),
      middle: middleLetter.value.toUpperCase(),
      last: lastLetter.value.toUpperCase(),
    },
    font: selectedFont.value,
    fontSize: fontSize.value,
    color: color.value,
    spacing: spacing.value,
    content: previewText.value,
    layoutStyle: selectedTemplate.value?.layoutStyle,
  }

  if (props.editingElement) {
    emit('update', config)
  } else {
    emit('add', config)
  }

  emit('close')
  resetForm()
}

const resetForm = () => {
  currentStep.value = 1
  selectedTemplate.value = null
  firstLetter.value = ''
  middleLetter.value = ''
  lastLetter.value = ''
  selectedFont.value = 'monogram_kk'
  fontSize.value = 48
  color.value = '#000000'
  spacing.value = 10
}

// Watch for editing element
watch(() => props.editingElement, (element) => {
  if (element && element.type === 'monogram') {
    firstLetter.value = element.monogramLetters?.first || ''
    middleLetter.value = element.monogramLetters?.middle || ''
    lastLetter.value = element.monogramLetters?.last || ''
    selectedFont.value = element.font || 'monogram_kk'
    fontSize.value = element.fontSize || 48
    color.value = element.color || '#000000'
    spacing.value = element.letterSpacing || 10

    const template = templates.find(t => t.layoutStyle === element.layoutStyle)
    if (template) {
      selectedTemplate.value = template
      currentStep.value = 3
    }
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.enhanced-monogram-dialog {
  .q-dialog__inner {
    padding: 20px;
  }
}

.enhanced-monogram-picker {
  width: 800px;
  max-width: 95vw;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15),
              0 -4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideUpIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.picker-header {
  background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
  color: white;
  padding: 24px 28px 20px;
  position: relative;
  
  .header-content {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-icon {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .header-text {
    flex: 1;
    
    .text-h6 {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .text-caption {
      opacity: 0.9;
      font-size: 13px;
    }
  }
  
  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    color: rgba(255, 255, 255, 0.8);
    
    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.modal-separator {
  margin: 0;
  background: rgba(0, 0, 0, 0.08);
}

.picker-content {
  max-height: 70vh;
  overflow-y: auto;
  background: #fafafa;
  padding: 24px 28px;
}

.monogram-builder {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.builder-step {
  opacity: 0.5;
  transition: all 0.3s ease;
  
  &.active {
    opacity: 1;
  }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  
  .step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
  }
  
  .step-title {
    font-size: 18px;
    font-weight: 600;
    color: #2d3748;
  }
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.template-card {
  padding: 20px 16px;
  border: 2px solid #e8eaf0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  background: white;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #1EADB0;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(30, 173, 176, 0.25);
  }

  &.selected {
    border-color: #1EADB0;
    background: linear-gradient(135deg, rgba(30, 173, 176, 0.12) 0%, rgba(75, 85, 116, 0.12) 100%);
    box-shadow: 0 4px 16px rgba(30, 173, 176, 0.3);
  }
}

.template-preview {
  margin-bottom: 12px;
}

.template-icon {
  font-size: 48px;
  color: #1EADB0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
  filter: drop-shadow(0 2px 4px rgba(30, 173, 176, 0.3));
  
  &.circle {
    border: 3px solid #1EADB0;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }
  
  &.stacked {
    line-height: 0.8;
  }
  
  &.horizontal {
    letter-spacing: 4px;
  }
  
  &.vertical {
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }
  
  &.traditional {
    font-weight: bold;
  }
}

.template-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
  color: #2d3748;
}

.template-description {
  font-size: 11px;
  color: #718096;
  line-height: 1.4;
}

.letters-input-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.letter-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.letter-input {
  .q-field__control {
    height: 48px;
    border-radius: 12px;
  }
  
  .q-field__native {
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    text-transform: uppercase;
  }
}

.quick-letters {
  .quick-letters-title {
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }
}

.quick-letters-grid {
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 6px;
}

.quick-letter-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #1EADB0;
    background: rgba(30, 173, 176, 0.05);
    color: #1EADB0;
  }
}

.customization-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.customization-group {
  .group-label {
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    display: block;
  }
}

.font-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.font-option {
  padding: 16px 12px;
  border: 2px solid #e8eaf0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  background: white;
  
  &:hover {
    border-color: #1EADB0;
    background: rgba(30, 173, 176, 0.05);
  }
  
  &.selected {
    border-color: #1EADB0;
    background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
  }
}

.font-preview {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-name {
  font-size: 11px;
  color: #718096;
  font-weight: 500;
}

.customization-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.customization-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-label {
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.size-slider, .spacing-slider {
  .q-slider__track {
    background: #e2e8f0;
  }
  
  .q-slider__thumb {
    background: #1EADB0;
  }
}

.size-value, .spacing-value {
  font-size: 12px;
  color: #718096;
  text-align: center;
  font-weight: 500;
}

.color-picker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-input {
  .q-field__control {
    height: 48px;
    border-radius: 12px;
  }
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.color-preset {
  width: 32px;
  height: 32px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: #1EADB0;
  }
}

.preview-section {
  margin-top: 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.preview-container {
  text-align: center;
}

.monogram-preview {
  font-size: 48px;
  font-weight: bold;
  padding: 32px 20px;
  background: #f8fafc;
  border-radius: 12px;
  white-space: pre-line;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(30, 173, 176, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
}

.picker-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
  padding: 20px 28px 24px;
  
  .footer-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .cancel-btn {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
  
  .add-btn {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
    box-shadow: 0 4px 12px rgba(30, 173, 176, 0.3);
    transition: all 0.2s ease;
    
    &:hover:not(.q-btn--disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(30, 173, 176, 0.4);
    }
    
    &:active:not(.q-btn--disabled) {
      transform: translateY(0);
    }
    
    &.q-btn--disabled {
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }
  }
}

@keyframes slideUpIn {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .enhanced-monogram-picker {
    width: 100vw;
    max-width: 100vw;
    border-radius: 16px 16px 0 0;
  }
  
  .picker-header {
    padding: 20px 20px 16px;
    
    .header-content {
      gap: 12px;
    }
    
    .header-icon {
      padding: 6px;
    }
  }
  
  .picker-content {
    padding: 20px;
  }
  
  .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  
  .input-grid {
    grid-template-columns: 1fr;
  }
  
  .customization-row {
    grid-template-columns: 1fr;
  }
  
  .quick-letters-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .font-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .picker-footer {
    padding: 16px 20px 20px;
    
    .footer-actions {
      flex-direction: column;
      gap: 8px;
    }
    
    .cancel-btn,
    .add-btn {
      width: 100%;
    }
  }
}
</style>
