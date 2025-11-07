<template>
  <q-dialog :model-value="show" @update:model-value="$emit('close')" position="right" maximized>
    <q-card class="advanced-text-panel">
      <!-- Header -->
      <q-card-section class="panel-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <q-icon name="mdi-format-text" size="24px" />
            <span class="text-h6">Advanced Text Styling</span>
          </div>
          <q-btn flat round dense icon="mdi-close" @click="handleClose" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="panel-content q-pa-md">
        <q-scroll-area style="height: calc(100vh - 100px)">
          <!-- Font Selection -->
          <div class="style-section">
            <div class="section-header">
              <q-icon name="mdi-format-font" />
              <span>Font Family</span>
            </div>

            <!-- Font Categories -->
            <q-tabs
              v-model="selectedCategory"
              dense
              class="q-mb-md"
              active-color="primary"
              indicator-color="primary"
            >
              <q-tab
                v-for="category in fontCategories"
                :key="category.id"
                :name="category.id"
                :label="category.label"
                :icon="category.icon"
              />
            </q-tabs>

            <!-- Font Search -->
            <q-input
              v-model="fontSearch"
              dense
              outlined
              placeholder="Search fonts..."
              class="q-mb-md"
            >
              <template #prepend>
                <q-icon name="mdi-magnify" />
              </template>
            </q-input>

            <!-- Font Grid -->
            <div class="font-grid">
              <div
                v-for="font in filteredFonts"
                :key="font.value"
                class="font-item"
                :class="{ selected: selectedFont === font.value }"
                @click="handleFontChange(font.value)"
              >
                <span :style="{ fontFamily: font.fontFamily }">{{ font.label }}</span>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Font Size -->
          <div class="style-section">
            <div class="section-header">
              <q-icon name="mdi-format-size" />
              <span>Font Size</span>
            </div>

            <div class="flex items-center gap-2">
              <q-slider
                :model-value="fontSize"
                @update:model-value="handleFontSizeChange"
                :min="12"
                :max="200"
                :step="1"
                label
                label-always
                class="flex-1"
              />
              <q-input
                :model-value="fontSize"
                @update:model-value="handleFontSizeChange"
                type="number"
                dense
                outlined
                style="width: 80px"
                suffix="px"
              />
            </div>

            <!-- Size Presets -->
            <div class="size-presets q-mt-sm">
              <q-chip
                v-for="preset in fontSizePresets"
                :key="preset.value"
                clickable
                :color="fontSize === preset.value ? 'primary' : 'grey-3'"
                :text-color="fontSize === preset.value ? 'white' : 'black'"
                size="sm"
                @click="handleFontSizeChange(preset.value)"
              >
                {{ preset.label }}
              </q-chip>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Color -->
          <div class="style-section">
            <div class="section-header">
              <q-icon name="mdi-palette" />
              <span>Text Color</span>
            </div>

            <q-btn
              :style="{ backgroundColor: color }"
              :label="color"
              class="color-picker-btn"
              @click="showTextColorPicker = true"
              unelevated
            >
              <q-dialog v-model="showTextColorPicker">
                <q-card style="min-width: 300px;">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Pick Text Color</div>
                    <VueColorPicker
                      :color="color"
                      :theme="'light'"
                      :sucker-hide="true"
                      @changeColor="handleTextColorChange"
                    />
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn flat label="Close" color="primary" v-close-popup />
                  </q-card-actions>
                </q-card>
              </q-dialog>
            </q-btn>
          </div>

          <q-separator class="q-my-md" />

          <!-- Stroke -->
          <div class="style-section">
            <div class="section-header">
              <q-icon name="mdi-border-outside" />
              <span>Stroke / Outline</span>
              <q-space />
              <q-toggle
                :model-value="stroke.enabled"
                @update:model-value="handleStrokeToggle"
                color="primary"
                size="sm"
              />
            </div>

            <template v-if="stroke.enabled">
              <div class="q-mt-md">
                <div class="text-caption q-mb-xs">Stroke Color</div>
                <q-btn
                  :style="{ backgroundColor: stroke.color }"
                  :label="stroke.color"
                  class="color-picker-btn"
                  @click="showStrokeColorPicker = true"
                  unelevated
                >
                  <q-dialog v-model="showStrokeColorPicker">
                    <q-card style="min-width: 300px;">
                      <q-card-section>
                        <div class="text-h6 q-mb-md">Pick Stroke Color</div>
                        <VueColorPicker
                          :color="stroke.color"
                          :theme="'light'"
                          :sucker-hide="true"
                          @changeColor="handleStrokeColorPickerChange"
                        />
                      </q-card-section>
                      <q-card-actions align="right">
                        <q-btn flat label="Close" color="primary" v-close-popup />
                      </q-card-actions>
                    </q-card>
                  </q-dialog>
                </q-btn>
              </div>

              <div class="q-mt-md">
                <div class="text-caption q-mb-xs">Stroke Width</div>
                <div class="flex items-center gap-2">
                  <q-slider
                    :model-value="stroke.width"
                    @update:model-value="handleStrokeWidthChange"
                    :min="1"
                    :max="10"
                    :step="1"
                    label
                    label-always
                    class="flex-1"
                  />
                  <q-input
                    :model-value="stroke.width"
                    @update:model-value="handleStrokeWidthChange"
                    type="number"
                    dense
                    outlined
                    style="width: 70px"
                    suffix="px"
                  />
                </div>
              </div>
            </template>
          </div>

          <q-separator class="q-my-md" />

          <!-- Shadow -->
          <div class="style-section">
            <div class="section-header">
              <q-icon name="mdi-blur" />
              <span>Drop Shadow</span>
              <q-space />
              <q-toggle
                :model-value="shadow.enabled"
                @update:model-value="handleShadowToggle"
                color="primary"
                size="sm"
              />
            </div>

            <template v-if="shadow.enabled">
              <div class="q-mt-md">
                <div class="text-caption q-mb-xs">Shadow Color</div>
                <q-btn
                  :style="{ backgroundColor: shadow.color }"
                  :label="shadow.color"
                  class="color-picker-btn"
                  @click="showShadowColorPicker = true"
                  unelevated
                >
                  <q-dialog v-model="showShadowColorPicker">
                    <q-card style="min-width: 300px;">
                      <q-card-section>
                        <div class="text-h6 q-mb-md">Pick Shadow Color</div>
                        <VueColorPicker
                          :color="shadow.color"
                          :theme="'light'"
                          :sucker-hide="true"
                          @changeColor="handleShadowColorPickerChange"
                        />
                      </q-card-section>
                      <q-card-actions align="right">
                        <q-btn flat label="Close" color="primary" v-close-popup />
                      </q-card-actions>
                    </q-card>
                  </q-dialog>
                </q-btn>
              </div>

              <div class="q-mt-md">
                <div class="text-caption q-mb-xs">Blur: {{ shadow.blur }}px</div>
                <q-slider
                  :model-value="shadow.blur"
                  @update:model-value="handleShadowBlurChange"
                  :min="0"
                  :max="20"
                  :step="1"
                  label
                  label-always
                />
              </div>

              <div class="q-mt-md">
                <div class="text-caption q-mb-xs">Offset X: {{ shadow.offsetX }}px</div>
                <q-slider
                  :model-value="shadow.offsetX"
                  @update:model-value="handleShadowOffsetXChange"
                  :min="-20"
                  :max="20"
                  :step="1"
                  label
                  label-always
                />
              </div>

              <div class="q-mt-md">
                <div class="text-caption q-mb-xs">Offset Y: {{ shadow.offsetY }}px</div>
                <q-slider
                  :model-value="shadow.offsetY"
                  @update:model-value="handleShadowOffsetYChange"
                  :min="-20"
                  :max="20"
                  :step="1"
                  label
                  label-always
                />
              </div>

              <div class="q-mt-md">
                <div class="text-caption q-mb-xs">Opacity: {{ Math.round(shadow.opacity * 100) }}%</div>
                <q-slider
                  :model-value="shadow.opacity"
                  @update:model-value="handleShadowOpacityChange"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  label
                  label-always
                />
              </div>
            </template>
          </div>

          <q-separator class="q-my-md" />

          <!-- Engrave Effect -->
          <div class="style-section">
            <div class="section-header">
              <q-icon name="mdi-invert-colors" />
              <span>Engrave Effect</span>
              <q-space />
              <q-toggle
                :model-value="engrave"
                @update:model-value="handleEngraveChange"
                color="primary"
                size="sm"
              />
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              Creates a knockout effect where text cuts through the background layer
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Letter Spacing -->
          <div class="style-section">
            <div class="section-header">
              <q-icon name="mdi-format-letter-spacing" />
              <span>Letter Spacing</span>
            </div>

            <div class="flex items-center gap-2">
              <q-slider
                :model-value="letterSpacing"
                @update:model-value="handleLetterSpacingChange"
                :min="-5"
                :max="20"
                :step="0.5"
                label
                label-always
                class="flex-1"
              />
              <q-input
                :model-value="letterSpacing"
                @update:model-value="handleLetterSpacingChange"
                type="number"
                dense
                outlined
                style="width: 70px"
                suffix="px"
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Line Height -->
          <div class="style-section">
            <div class="section-header">
              <q-icon name="mdi-format-line-spacing" />
              <span>Line Height</span>
            </div>

            <div class="flex items-center gap-2">
              <q-slider
                :model-value="lineHeight"
                @update:model-value="handleLineHeightChange"
                :min="0.5"
                :max="3"
                :step="0.1"
                label
                label-always
                class="flex-1"
              />
              <q-input
                :model-value="lineHeight"
                @update:model-value="handleLineHeightChange"
                type="number"
                dense
                outlined
                style="width: 70px"
              />
            </div>
          </div>
        </q-scroll-area>
      </q-card-section>

      <!-- Footer Actions -->
      <q-card-section class="panel-footer">
        <div class="flex gap-2">
          <q-btn flat label="Reset to Defaults" @click="handleReset" />
          <q-space />
          <q-btn flat label="Close" @click="handleClose" />
          <q-btn color="primary" label="Apply" @click="handleApply" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AVAILABLE_FONTS, FONT_CATEGORIES, FONT_SIZE_PRESETS, getFontsByCategory } from '~/config/fonts'
import { ColorPicker as VueColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'

interface TextStroke {
  enabled: boolean
  color: string
  width: number
}

interface TextShadow {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
  opacity: number
}

const props = defineProps<{
  show: boolean
  selectedFont: string
  fontSize: number
  color: string
  stroke: TextStroke
  shadow: TextShadow
  engrave: boolean
  letterSpacing: number
  lineHeight: number
}>()

const emit = defineEmits<{
  'close': []
  'update:font': [value: string]
  'update:fontSize': [value: number]
  'update:color': [value: string]
  'update:stroke': [value: TextStroke]
  'update:shadow': [value: TextShadow]
  'update:engrave': [value: boolean]
  'update:letterSpacing': [value: number]
  'update:lineHeight': [value: number]
  'reset': []
  'apply': []
}>()

const selectedCategory = ref('all')
const fontSearch = ref('')

const showTextColorPicker = ref(false)
const showStrokeColorPicker = ref(false)
const showShadowColorPicker = ref(false)

const fontCategories = FONT_CATEGORIES
const fontSizePresets = FONT_SIZE_PRESETS

const filteredFonts = computed(() => {
  let fonts = getFontsByCategory(selectedCategory.value)

  if (fontSearch.value.trim()) {
    const query = fontSearch.value.toLowerCase()
    fonts = fonts.filter(f =>
      f.label.toLowerCase().includes(query) ||
      f.category.toLowerCase().includes(query)
    )
  }

  return fonts
})

// Event handlers
const handleFontChange = (font: string) => {
  emit('update:font', font)
}

const handleFontSizeChange = (size: number) => {
  emit('update:fontSize', Number(size))
}

const handleColorChange = (color: string) => {
  emit('update:color', color)
}

let textColorTimeout: ReturnType<typeof setTimeout> | null = null
const handleTextColorChange = (colorObj: any) => {
  if (colorObj && colorObj.hex) {
    if (textColorTimeout) {
      clearTimeout(textColorTimeout)
    }
    textColorTimeout = setTimeout(() => {
      emit('update:color', colorObj.hex)
    }, 50)
  }
}

let strokeColorTimeout: ReturnType<typeof setTimeout> | null = null
const handleStrokeColorPickerChange = (colorObj: any) => {
  if (colorObj && colorObj.hex) {
    if (strokeColorTimeout) {
      clearTimeout(strokeColorTimeout)
    }
    strokeColorTimeout = setTimeout(() => {
      emit('update:stroke', { ...props.stroke, color: colorObj.hex })
    }, 50)
  }
}

let shadowColorTimeout: ReturnType<typeof setTimeout> | null = null
const handleShadowColorPickerChange = (colorObj: any) => {
  if (colorObj && colorObj.hex) {
    if (shadowColorTimeout) {
      clearTimeout(shadowColorTimeout)
    }
    shadowColorTimeout = setTimeout(() => {
      emit('update:shadow', { ...props.shadow, color: colorObj.hex })
    }, 50)
  }
}

const handleStrokeToggle = (enabled: boolean) => {
  emit('update:stroke', { ...props.stroke, enabled })
}


const handleStrokeWidthChange = (width: number) => {
  emit('update:stroke', { ...props.stroke, width: Number(width) })
}

const handleShadowToggle = (enabled: boolean) => {
  emit('update:shadow', { ...props.shadow, enabled })
}


const handleShadowBlurChange = (blur: number) => {
  emit('update:shadow', { ...props.shadow, blur })
}

const handleShadowOffsetXChange = (offsetX: number) => {
  emit('update:shadow', { ...props.shadow, offsetX })
}

const handleShadowOffsetYChange = (offsetY: number) => {
  emit('update:shadow', { ...props.shadow, offsetY })
}

const handleShadowOpacityChange = (opacity: number) => {
  emit('update:shadow', { ...props.shadow, opacity })
}

const handleEngraveChange = (engrave: boolean) => {
  emit('update:engrave', engrave)
}

const handleLetterSpacingChange = (spacing: number) => {
  emit('update:letterSpacing', Number(spacing))
}

const handleLineHeightChange = (height: number) => {
  emit('update:lineHeight', Number(height))
}

const handleReset = () => {
  emit('reset')
}

const handleApply = () => {
  emit('apply')
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.advanced-text-panel {
  width: 400px;
  max-width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.panel-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.panel-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 16px;
  background: #f5f5f5;
}

.style-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  color: #333;
}

.font-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.font-item {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-size: 16px;

  &:hover {
    border-color: #667eea;
    background: #f5f7ff;
  }

  &.selected {
    border-color: #667eea;
    background: #667eea;
    color: white;
  }
}

.size-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-picker-btn {
  width: 100%;
  justify-content: flex-start;
  font-size: 13px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
  padding: 10px 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.color-picker-btn:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}
</style>

