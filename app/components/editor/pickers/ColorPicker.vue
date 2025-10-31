<template>
  <div class="color-picker-container">
    <!-- Collection Restriction Banner -->
    <div v-if="collectionStore.isRestrictedCollection && collectionStore.currentRules?.colorPicker.tooltip" class="collection-restriction-banner q-px-md q-py-sm bg-orange-1">
      <div class="row items-center q-gutter-xs">
        <q-icon name="info" color="orange-7" size="16px" />
        <div class="text-caption text-orange-9" style="font-size: 11px;">
          {{ collectionStore.currentRules.colorPicker.tooltip }}
        </div>
      </div>
    </div>

    <!-- Color Format Tabs -->
    <q-tabs
      v-model="activeFormat"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="hex" label="HEX" />
      <q-tab name="rgb" label="RGB" />
      <q-tab
        name="cmyk"
        label="CMYK"
        :disable="!collectionStore.canUseCMYK"
      >
        <q-tooltip v-if="!collectionStore.canUseCMYK">
          CMYK picker disabled for this collection
        </q-tooltip>
      </q-tab>
    </q-tabs>

    <q-separator />

    <!-- Preset Color Swatches -->
    <div class="q-px-md q-pt-sm q-pb-md">
      <div class="text-caption text-grey-7 q-mb-xs" style="font-size: 11px; font-weight: 600;">Quick Colors</div>
      <div class="preset-colors-grid">
        <div
          v-for="color in presetColors"
          :key="color"
          class="preset-color-box"
          :class="{ 'active': currentColor === color }"
          :style="{ backgroundColor: color }"
          @click="selectPresetColor(color)"
        >
          <q-icon
            v-if="currentColor === color"
            name="check"
            color="white"
            size="12px"
            class="check-icon"
          />
        </div>
      </div>
    </div>

    <q-separator />

    <!-- Main Color Picker (only shown if custom colors allowed) -->
    <div v-if="collectionStore.canUseCustomColors" class="q-px-md q-py-sm">
      <VueColorPicker
        v-model="currentColor"
        :theme="'light'"
        :sucker-hide="true"
        @changeColor="handleColorChange"
      />
    </div>

    <q-separator v-if="collectionStore.canUseCustomColors" />

    <!-- Format-specific inputs (only shown if custom colors allowed) -->
    <div v-if="collectionStore.canUseCustomColors" class="q-px-md q-py-sm">
      <!-- HEX Input -->
      <div v-if="activeFormat === 'hex'" class="format-input">
        <q-input
          v-model="hexValue"
          label="HEX Color"
          outlined
          dense
          prefix="#"
          @update:model-value="updateFromHex"
        >
          <template #append>
            <q-btn
              flat
              dense
              icon="content_copy"
              size="sm"
              @click="copyColor(hexValue)"
            >
              <q-tooltip>Copy HEX</q-tooltip>
            </q-btn>
          </template>
        </q-input>
      </div>

      <!-- RGB Inputs -->
      <div v-if="activeFormat === 'rgb'" class="format-input">
        <div class="row q-col-gutter-sm">
          <div class="col">
            <q-input
              v-model.number="rgbValue.r"
              type="number"
              label="R"
              outlined
              dense
              min="0"
              max="255"
              @update:model-value="updateFromRgb"
            />
          </div>
          <div class="col">
            <q-input
              v-model.number="rgbValue.g"
              type="number"
              label="G"
              outlined
              dense
              min="0"
              max="255"
              @update:model-value="updateFromRgb"
            />
          </div>
          <div class="col">
            <q-input
              v-model.number="rgbValue.b"
              type="number"
              label="B"
              outlined
              dense
              min="0"
              max="255"
              @update:model-value="updateFromRgb"
            />
          </div>
        </div>
        <q-btn
          flat
          dense
          icon="content_copy"
          size="sm"
          class="q-mt-sm"
          @click="copyColor(`rgb(${rgbValue.r}, ${rgbValue.g}, ${rgbValue.b})`)"
        >
          Copy RGB
        </q-btn>
      </div>

      <!-- CMYK Inputs -->
      <div v-if="activeFormat === 'cmyk'" class="format-input">
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model.number="cmykValue.c"
              type="number"
              label="C %"
              outlined
              dense
              min="0"
              max="100"
              @update:model-value="updateFromCmyk"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="cmykValue.m"
              type="number"
              label="M %"
              outlined
              dense
              min="0"
              max="100"
              @update:model-value="updateFromCmyk"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="cmykValue.y"
              type="number"
              label="Y %"
              outlined
              dense
              min="0"
              max="100"
              @update:model-value="updateFromCmyk"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="cmykValue.k"
              type="number"
              label="K %"
              outlined
              dense
              min="0"
              max="100"
              @update:model-value="updateFromCmyk"
            />
          </div>
        </div>
        <q-btn
          flat
          dense
          icon="content_copy"
          size="sm"
          class="q-mt-sm"
          @click="copyColor(`cmyk(${cmykValue.c}%, ${cmykValue.m}%, ${cmykValue.y}%, ${cmykValue.k}%)`)"
        >
          Copy CMYK
        </q-btn>
      </div>
    </div>

    <q-separator />

    <!-- Recent Colors -->
    <div v-if="backgroundStore.recentColors.length > 0" class="q-px-md q-pb-sm">
      <div class="text-caption text-grey-7 q-mb-xs" style="font-size: 11px; font-weight: 600;">Recent</div>
      <div class="recent-colors-grid">
        <div
          v-for="color in backgroundStore.recentColors"
          :key="color"
          class="recent-color-box"
          :class="{ 'active': currentColor === color }"
          :style="{ backgroundColor: color }"
          @click="selectRecentColor(color)"
        >
          <q-icon
            v-if="currentColor === color"
            name="check"
            color="white"
            size="12px"
            class="check-icon"
          />
          <q-tooltip>{{ color }}</q-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ColorPicker as VueColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'
import chroma from 'chroma-js'
import { useBackgroundStore } from '~/store/background'
import { useCollectionStore } from '~/store/collection'
import { useQuasar } from 'quasar'

const backgroundStore = useBackgroundStore()
const collectionStore = useCollectionStore()
const $q = useQuasar()

const activeFormat = ref<'hex' | 'rgb' | 'cmyk'>('hex')
const currentColor = ref(backgroundStore.solidColor)

// All preset colors (default palette)
const allPresetColors = [
  '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280',
  '#4B5563', '#374151', '#1F2937', '#111827', '#000000', '#7C3AED',
  '#A855F7', '#C084FC', '#E9D5FF', '#EF4444', '#F87171', '#FCA5A5',
  '#FEE2E2', '#FB923C', '#FDBA74', '#FED7AA', '#FEF3C7', '#FDE047',
  '#FEF08A', '#FEF9C3', '#84CC16', '#BEF264', '#D9F99D', '#ECFCCB',
  '#10B981', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#14B8A6', '#5EEAD4',
  '#99F6E4', '#CCFBF1', '#06B6D4', '#67E8F9', '#A5F3FC', '#CFFAFE',
  '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#6366F1', '#818CF8',
  '#C7D2FE', '#E0E7FF', '#8B5CF6', '#A78BFA', '#C4B5FD', '#EDE9FE',
  '#EC4899', '#F472B6', '#F9A8D4', '#FCE7F3'
]

// Filter colors based on collection restrictions
const presetColors = computed(() => {
  const allowedColors = collectionStore.allowedColors

  // If no restrictions, show all colors
  if (!allowedColors) {
    return allPresetColors
  }

  // If restricted, show only the allowed colors directly
  // (Don't filter presets, use the allowed colors as the palette)
  return allowedColors.map(c => c.toUpperCase())
})

// Color values for different formats
const hexValue = ref(backgroundStore.solidColor.replace('#', ''))
const rgbValue = ref({ r: 255, g: 255, b: 255 })
const cmykValue = ref({ c: 0, m: 0, y: 0, k: 0 })

// Initialize color values
const initializeColorValues = (color: string) => {
  try {
    const chromaColor = chroma(color)
    hexValue.value = chromaColor.hex().replace('#', '')
    
    const [r, g, b] = chromaColor.rgb()
    rgbValue.value = { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
    
    const [c, m, y, k] = chromaColor.cmyk()
    cmykValue.value = {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    }
  } catch (error) {
    // Invalid color, use default
  }
}

const handleColorChange = (color: any) => {
  if (color.hex) {
    currentColor.value = color.hex
    initializeColorValues(color.hex)
    applyColorInstantly(color.hex)
  }
}

const applyColorInstantly = (color: string) => {
  // Validate color against collection rules
  const validation = collectionStore.canUseColor(color)

  if (!validation.allowed) {
    $q.notify({
      type: 'warning',
      message: validation.reason || 'This color is not allowed in the current collection',
      position: 'top',
      timeout: 2000
    })
    return
  }

  backgroundStore.solidColor = color
  backgroundStore.backgroundType = 'solid'
  backgroundStore.setSolidColor(color, true)

  nextTick(() => {
    const event = new CustomEvent('background-changed')
    window.dispatchEvent(event)
  })
}

const updateFromHex = (value: string) => {
  try {
    const hex = value.startsWith('#') ? value : `#${value}`
    const chromaColor = chroma(hex)
    currentColor.value = chromaColor.hex()
    initializeColorValues(currentColor.value)
    applyColorInstantly(currentColor.value)
  } catch (error) {
    // Invalid hex, ignore
  }
}

const updateFromRgb = () => {
  try {
    const chromaColor = chroma.rgb(rgbValue.value.r, rgbValue.value.g, rgbValue.value.b)
    currentColor.value = chromaColor.hex()
    hexValue.value = chromaColor.hex().replace('#', '')
    
    const [c, m, y, k] = chromaColor.cmyk()
    cmykValue.value = {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    }
    
    applyColorInstantly(currentColor.value)
  } catch (error) {
    // Invalid RGB values, ignore
  }
}

const updateFromCmyk = () => {
  try {
    const chromaColor = chroma.cmyk(
      cmykValue.value.c / 100,
      cmykValue.value.m / 100,
      cmykValue.value.y / 100,
      cmykValue.value.k / 100
    )
    currentColor.value = chromaColor.hex()
    hexValue.value = chromaColor.hex().replace('#', '')
    
    const [r, g, b] = chromaColor.rgb()
    rgbValue.value = { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
    
    applyColorInstantly(currentColor.value)
  } catch (error) {
    // Invalid CMYK values, ignore
  }
}

const selectPresetColor = (color: string) => {
  currentColor.value = color
  initializeColorValues(color)
  applyColorInstantly(color)
}

const selectRecentColor = (color: string) => {
  currentColor.value = color
  initializeColorValues(color)
  applyColorInstantly(color)
}

const copyColor = (value: string) => {
  navigator.clipboard.writeText(value).then(() => {
    $q.notify({
      message: 'Color copied',
      color: 'positive',
      position: 'top',
      timeout: 800,
      icon: 'content_copy'
    })
  })
}
watch(() => backgroundStore.solidColor, (newColor) => {
  if (newColor !== currentColor.value) {
    currentColor.value = newColor
    initializeColorValues(newColor)
  }
})

onMounted(() => {
  initializeColorValues(backgroundStore.solidColor)
})
</script>

<style scoped>
.color-picker-container {
  background: white;
  border-radius: 8px;
  overflow: visible;
  width: 100%;
}

.format-input {
  min-height: 60px;
}

.preset-colors-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
}

@media (max-width: 400px) {
  .preset-colors-grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
  }
}

.preset-color-box {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 5px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.preset-color-box:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
  z-index: 1;
}

.preset-color-box.active {
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
  transform: scale(1.05);
}

/* Responsive recent colors grid */
.recent-colors-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
}

@media (max-width: 400px) {
  .recent-colors-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }
}

.recent-color-box {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 5px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.recent-color-box:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
  z-index: 1;
}

.recent-color-box.active {
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
  transform: scale(1.05);
}

.check-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* Make the color picker responsive */
.color-picker-container :deep(.hu-color-picker) {
  width: 100% !important;
  max-width: 100% !important;
}

.color-picker-container :deep(.color-show) {
  width: 100% !important;
}

.color-picker-container :deep(.color-type) {
  width: 100% !important;
}
</style>


