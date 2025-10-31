<template>
  <div class="background-picker">
    <div class="bg-tabs-container">
      <q-tabs
        v-model="backgroundType"
        dense
        class="bg-type-tabs"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        no-caps
      >
        <q-tab name="none" label="None" class="bg-tab" />
        <q-tab name="solid" label="Color" class="bg-tab" />
        <q-tab name="pattern" label="Pattern" class="bg-tab" />
      </q-tabs>
    </div>

    <div class="bg-content">
      <div v-if="backgroundType === 'none'" class="empty-state">
        <div class="empty-icon-container">
          <q-icon name="layers_clear" size="48px" class="text-grey-4" />
        </div>
        <div class="empty-title">Transparent Background</div>
        <div class="empty-subtitle">
          Select Color or Pattern tab to add a background
        </div>
      </div>

      <div v-if="backgroundType === 'solid'" class="color-content">
        <ColorPicker />
      </div>

      <div v-if="backgroundType === 'pattern'" class="pattern-content">
        <PatternPicker />
      </div>
    </div>

    <div v-if="backgroundType !== 'none'" class="clear-button-container">
      <q-separator class="q-my-sm" />
      <div class="q-px-md q-pb-md">
        <q-btn
          flat
          color="negative"
          label="Remove Background"
          icon="close"
          class="full-width"
          no-caps
          size="sm"
          @click="clearBackground"
        />
      </div>
    </div>

    <q-dialog v-model="backgroundStore.showVarianceDisclaimer" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            <q-icon name="info" color="warning" class="q-mr-sm" />
            Color Variance Notice
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-body2">
            Please note that actual printed colors may vary slightly from what you see on screen.
          </div>
          <ul class="q-mt-md q-pl-md">
            <li>Screen displays use RGB color (light)</li>
            <li>Printing uses CMYK color (ink)</li>
            <li>Different screens show colors differently</li>
            <li>Material and lighting affect final appearance</li>
          </ul>
          <q-banner class="bg-warning text-white q-mt-md" rounded>
            <template #avatar>
              <q-icon name="lightbulb" color="white" />
            </template>
            For best results, order a sample or contact us for color matching.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            unelevated
            color="primary"
            label="I Understand"
            @click="dismissDisclaimer"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { useBackgroundStore } from '~/store/background'
import ColorPicker from './ColorPicker.vue'
import PatternPicker from './PatternPicker.vue'
import { useQuasar } from 'quasar'

const backgroundStore = useBackgroundStore()
const $q = useQuasar()

const backgroundType = computed({
  get: () => backgroundStore.backgroundType,
  set: (value) => {
    if (value !== backgroundStore.backgroundType) {
      backgroundStore.setBackgroundType(value, true)
    }
  }
})

const currentBgStyle = computed(() => {
  const style: any = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  }

  if (backgroundStore.backgroundType === 'solid') {
    style.backgroundColor = backgroundStore.solidColor
  } else if (backgroundStore.backgroundType === 'pattern' && backgroundStore.selectedPattern) {
    style.backgroundImage = `url(${backgroundStore.selectedPattern.preview})`
    style.backgroundRepeat = 'repeat'
    style.backgroundSize = 'auto'
  }

  style.opacity = backgroundStore.opacity
  return style
})

const clearBackground = () => {
  backgroundStore.clearBackground()
  $q.notify({
    message: 'Background removed',
    color: 'info',
    position: 'top',
    timeout: 800,
    icon: 'check_circle'
  })
}

const dismissDisclaimer = () => {
  backgroundStore.dismissDisclaimer()
}
</script>

<style scoped>
.background-picker {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.bg-tabs-container {
  padding: 12px 16px 12px 16px;
  flex-shrink: 0;
}

.bg-type-tabs {
  background: #f5f5f5;
  border-radius: 10px;
  padding: 4px;
}

.bg-type-tabs :deep(.q-tab) {
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;
  min-height: 32px;
}

.bg-type-tabs :deep(.q-tab--active) {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #7c3aed;
}

.bg-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  text-align: center;
}

.empty-icon-container {
  width: 64px;
  height: 64px;
  background: #f9fafb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.empty-subtitle {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.color-content,
.pattern-content {
  padding: 0 12px;
  height: 100%;
  overflow-y: auto;
}

.clear-button-container {
  margin-top: auto;
  flex-shrink: 0;
  background: white;
}

.bg-content::-webkit-scrollbar,
.color-content::-webkit-scrollbar,
.pattern-content::-webkit-scrollbar {
  width: 6px;
}

.bg-content::-webkit-scrollbar-track,
.color-content::-webkit-scrollbar-track,
.pattern-content::-webkit-scrollbar-track {
  background: transparent;
}

.bg-content::-webkit-scrollbar-thumb,
.color-content::-webkit-scrollbar-thumb,
.pattern-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.bg-content::-webkit-scrollbar-thumb:hover,
.color-content::-webkit-scrollbar-thumb:hover,
.pattern-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>

