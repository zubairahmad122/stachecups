<template>
  <q-dialog :model-value="show" @update:model-value="$emit('close')" position="bottom">
    <q-card class="monogram-picker">
      <!-- Header -->
      <q-card-section class="picker-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <q-icon name="mdi-alpha-m-circle" size="24px" />
            <span class="text-h6">Create Monogram</span>
          </div>
          <q-btn flat round dense icon="mdi-close" @click="$emit('close')" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="picker-content">
        <!-- Template Selection -->
        <div class="section">
          <div class="section-title">
            <q-icon name="mdi-shape" />
            <span>Select Style</span>
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
                <div class="template-icon">
                  {{ getTemplateIcon(template.layoutStyle) }}
                </div>
              </div>
              <div class="template-name">{{ template.name }}</div>
              <div class="template-description">{{ template.description }}</div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Letters Input -->
        <div class="section" v-if="selectedTemplate">
          <div class="section-title">
            <q-icon name="mdi-alphabetical-variant" />
            <span>Enter Initials</span>
          </div>

          <div class="letters-input">
            <q-input
              v-model="firstLetter"
              label="First Name"
              outlined
              dense
              maxlength="1"
              class="letter-input"
              :rules="[val => val.length > 0 || 'Required']"
            />
            
            <q-input
              v-if="selectedTemplate.letterCount >= 2"
              v-model="middleLetter"
              label="Middle Name"
              outlined
              dense
              maxlength="1"
              class="letter-input"
              :rules="selectedTemplate.letterCount === 3 ? [val => val.length > 0 || 'Required'] : []"
            />
            
            <q-input
              v-if="selectedTemplate.letterCount >= 2"
              v-model="lastName"
              label="Last Name"
              outlined
              dense
              maxlength="1"
              class="letter-input"
              :rules="[val => val.length > 0 || 'Required']"
            />
          </div>

          <!-- Preview -->
          <div class="preview-container" v-if="isValid">
            <div class="preview-label">Preview:</div>
            <div 
              class="monogram-preview"
              :style="getPreviewStyle()"
            >
              {{ getPreviewText() }}
            </div>
            <div class="text-xs text-gray-500 mt-2 text-center">
              This will be added to your canvas
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" v-if="selectedTemplate" />

        <!-- Customization Options -->
        <div class="section" v-if="selectedTemplate && isValid">
          <div class="section-title">
            <q-icon name="mdi-palette" />
            <span>Customize</span>
          </div>

          <!-- Font Selection for Monogram -->
          <div class="q-mb-md">
            <div class="text-caption q-mb-xs">Monogram Font</div>
            <q-select
              v-model="selectedFont"
              :options="monogramFonts"
              option-label="label"
              option-value="value"
              outlined
              dense
              emit-value
              map-options
            />
          </div>

          <!-- Font Size -->
          <div class="q-mb-md">
            <div class="text-caption q-mb-xs">Font Size: {{ fontSize }}px</div>
            <q-slider
              v-model="fontSize"
              :min="24"
              :max="128"
              :step="2"
              label
              label-always
            />
          </div>

          <!-- Color -->
          <div class="q-mb-md">
            <div class="text-caption q-mb-xs">Color</div>
            <q-input
              v-model="color"
              type="color"
              outlined
              dense
            >
              <template #append>
                <span class="text-caption">{{ color }}</span>
              </template>
            </q-input>
          </div>

          <!-- Spacing (for horizontal/stacked layouts) -->
          <div class="q-mb-md" v-if="['horizontal', 'stacked', 'vertical'].includes(selectedTemplate.layoutStyle)">
            <div class="text-caption q-mb-xs">Letter Spacing: {{ spacing }}px</div>
            <q-slider
              v-model="spacing"
              :min="0"
              :max="50"
              :step="2"
              label
              label-always
            />
          </div>
        </div>
      </q-card-section>

      <!-- Footer -->
      <q-card-section class="picker-footer">
        <div class="flex gap-2 justify-end">
          <q-btn flat label="Cancel" @click="$emit('close')" />
          <q-btn
            color="primary"
            :label="editingElement ? 'Update Monogram' : 'Add Monogram'"
            :disable="!isValid"
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
  editingElement?: any // For editing existing monogram
}>()

const emit = defineEmits<{
  'close': []
  'add': [config: any]
  'update': [config: any]
}>()

const monogramStore = useMonogramStore()

const templates = MONOGRAM_TEMPLATES
const monogramFonts = CUSTOM_MONOGRAM_FONTS

const selectedTemplate = ref(null)
const firstLetter = ref('')
const middleLetter = ref('')
const lastName = ref('')
const selectedFont = ref('monogram_kk')
const fontSize = ref(48)
const color = ref('#000000')
const spacing = ref(10)

// Watch for editing element and populate fields
watch(() => props.editingElement, (element) => {
  if (element && element.type === 'monogram') {
    // Populate from existing element
    firstLetter.value = element.monogramLetters?.first || ''
    middleLetter.value = element.monogramLetters?.middle || ''
    lastName.value = element.monogramLetters?.last || ''
    selectedFont.value = element.font || 'monogram_kk'
    fontSize.value = element.fontSize || 48
    color.value = element.color || '#000000'
    spacing.value = element.letterSpacing || 10

    // Find and select template
    const template = templates.find(t => t.layoutStyle === element.layoutStyle)
    if (template) {
      selectedTemplate.value = template
    }
  }
}, { immediate: true })

const isValid = computed(() => {
  if (!selectedTemplate.value) return false
  
  if (selectedTemplate.value.letterCount === 1) {
    return firstLetter.value.length > 0
  }
  if (selectedTemplate.value.letterCount === 2) {
    return firstLetter.value.length > 0 && lastName.value.length > 0
  }
  if (selectedTemplate.value.letterCount === 3) {
    return firstLetter.value.length > 0 && 
           middleLetter.value.length > 0 && 
           lastName.value.length > 0
  }
  
  return false
})

const selectTemplate = (template: any) => {
  selectedTemplate.value = template
  monogramStore.selectTemplate(template)
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

const getPreviewText = () => {
  if (!selectedTemplate.value) return ''

  const layout = selectedTemplate.value.layoutStyle
  const f = firstLetter.value.toUpperCase()
  const m = middleLetter.value.toUpperCase()
  const l = lastName.value.toUpperCase()

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
}

const getPreviewStyle = () => {
  const layout = selectedTemplate.value?.layoutStyle

  // Calculate proper line height for stacked/vertical layouts
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
}

const handleAdd = () => {
  const previewText = getPreviewText()

  const config = {
    type: 'monogram',
    template: selectedTemplate.value,
    letters: {
      first: firstLetter.value.toUpperCase(),
      middle: middleLetter.value.toUpperCase(),
      last: lastName.value.toUpperCase(),
    },
    font: selectedFont.value,
    fontSize: fontSize.value,
    color: color.value,
    spacing: spacing.value,
    content: previewText,
    layoutStyle: selectedTemplate.value?.layoutStyle,
  }

  // Check if editing or adding new
  if (props.editingElement) {
    emit('update', config)
  } else {
    emit('add', config)
  }

  emit('close')

  // Reset
  selectedTemplate.value = null
  firstLetter.value = ''
  middleLetter.value = ''
  lastName.value = ''
}
</script>

<style scoped lang="scss">
.monogram-picker {
  width: 700px;
  max-width: 95vw;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.picker-header {
  background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
  color: white;
  padding: 20px 24px;

  .text-h6 {
    font-weight: 600;
    font-size: 1.25rem;
  }
}

.picker-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 24px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #1EADB0;
    border-radius: 4px;

    &:hover {
      background: #4B5574;
    }
  }
}

.picker-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #fafafa;
  padding: 16px 24px;
}

.section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.template-card {
  padding: 20px 16px;
  border: 2px solid #e8eaf0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  background: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(30, 173, 176, 0.05) 0%, rgba(75, 85, 116, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    border-color: #1EADB0;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(30, 173, 176, 0.25);

    &::before {
      opacity: 1;
    }

    .template-icon {
      transform: scale(1.1);
    }
  }

  &.selected {
    border-color: #1EADB0;
    background: linear-gradient(135deg, rgba(30, 173, 176, 0.12) 0%, rgba(75, 85, 116, 0.12) 100%);
    box-shadow: 0 4px 16px rgba(30, 173, 176, 0.3);

    &::before {
      opacity: 0;
    }

    .template-icon {
      color: #1EADB0;
      transform: scale(1.05);
    }
  }
}

.template-preview {
  margin-bottom: 8px;
}

.template-icon {
  font-size: 52px;
  color: #1EADB0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
  filter: drop-shadow(0 2px 4px rgba(30, 173, 176, 0.3));
}

.template-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #2d3748;
  position: relative;
  z-index: 1;
}

.template-description {
  font-size: 11px;
  color: #718096;
  line-height: 1.4;
  position: relative;
  z-index: 1;
}

.letters-input {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.letter-input {
  font-size: 18px;
  text-align: center;
  text-transform: uppercase;
}

.preview-container {
  margin-top: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 16px;
  text-align: center;
  border: 2px solid #e2e8f0;
}

.preview-label {
  font-size: 11px;
  color: #718096;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
}

.monogram-preview {
  font-size: 48px;
  font-weight: bold;
  padding: 32px 20px;
  background: white;
  border-radius: 12px;
  white-space: pre-line;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(30, 173, 176, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.12),
      0 4px 8px rgba(0, 0, 0, 0.06);
  }
}
</style>

