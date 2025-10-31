<template>
  <div class="layer-panel">
    <!-- Header -->
    <div class="layer-header">
      <h3 class="layer-title">Layers</h3>
      <div class="layer-actions">
        <q-btn
          flat
          dense
          round
          size="sm"
          icon="delete_sweep"
          @click="clearAllLayers"
        >
          <q-tooltip>Clear All Layers</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Layer List -->
    <div class="layer-list" v-if="layers.length > 0">
      <draggable
        v-model="layers"
        :item-key="(item) => item.id"
        @end="handleDragEnd"
        ghost-class="layer-ghost"
        handle=".layer-drag-handle"
      >
        <template #item="{ element: layer, index }">
          <div
            class="layer-item"
            :class="{
              'layer-selected': isSelected(layer.id),
              'layer-locked': isLocked(layer.id),
              'layer-hidden': isHidden(layer.id),
            }"
            @click="selectLayer(layer.id)"
          >
            <!-- Drag Handle -->
            <div class="layer-drag-handle">
              <q-icon name="drag_indicator" size="16px" />
            </div>

            <!-- Layer Icon -->
            <div class="layer-icon">
              <q-icon
                :name="getLayerIcon(layer)"
                size="20px"
                :color="isSelected(layer.id) ? 'primary' : 'grey-7'"
              />
            </div>

            <!-- Layer Info -->
            <div class="layer-info">
              <!-- Editable Layer Name -->
              <div
                v-if="editingLayerId !== layer.id"
                class="layer-name"
                @dblclick.stop="startEditingName(layer)"
                :title="'Double-click to rename'"
              >
                {{ getLayerName(layer) }}
              </div>
              <input
                v-else
                v-model="editingLayerName"
                class="layer-name-input"
                @blur="finishEditingName(layer)"
                @keydown.enter="finishEditingName(layer)"
                @keydown.escape="cancelEditingName"
                @click.stop
                ref="layerNameInput"
                type="text"
                maxlength="50"
              />
              <div class="layer-type">{{ getLayerType(layer) }}</div>

              <!-- Opacity Slider (shown on hover or when selected) -->
              <div v-if="isSelected(layer.id)" class="layer-opacity-control">
                <div class="flex items-center gap-2">
                  <q-icon name="opacity" size="14px" class="text-gray-500" />
                  <q-slider
                    :model-value="layer.opacity ?? 1"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    color="purple"
                    class="flex-1"
                    dense
                    @update:model-value="(val) => updateLayerOpacity(layer.id, val)"
                  />
                  <span class="text-xs text-gray-600 w-10">{{ Math.round((layer.opacity ?? 1) * 100) }}%</span>
                </div>
              </div>
            </div>

            <!-- Layer Actions -->
            <div class="layer-controls">
              <!-- Duplicate Button (always visible for text/monogram/emoji) -->
              <q-btn
                v-if="layer.type === 'text' || layer.type === 'monogram' || layer.type === 'emoji'"
                flat
                dense
                round
                size="xs"
                icon="content_copy"
                @click.stop="duplicateLayer(layer.id)"
              >
                <q-tooltip>Duplicate</q-tooltip>
              </q-btn>

              <!-- Visibility Toggle -->
              <q-btn
                flat
                dense
                round
                size="xs"
                :icon="isHidden(layer.id) ? 'visibility_off' : 'visibility'"
                @click.stop="toggleVisibility(layer.id)"
              >
                <q-tooltip>{{ isHidden(layer.id) ? 'Show' : 'Hide' }}</q-tooltip>
              </q-btn>

              <!-- Lock Toggle -->
              <q-btn
                flat
                dense
                round
                size="xs"
                :icon="isLocked(layer.id) ? 'lock' : 'lock_open'"
                @click.stop="toggleLock(layer.id)"
              >
                <q-tooltip>{{ isLocked(layer.id) ? 'Unlock' : 'Lock' }}</q-tooltip>
              </q-btn>

              <!-- More Options -->
              <q-btn flat dense round size="xs" icon="more_vert">
                <q-menu>
                  <q-list dense>
                    <q-item clickable v-close-popup @click="duplicateLayer(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="content_copy" size="xs" />
                      </q-item-section>
                      <q-item-section>Duplicate</q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable v-close-popup @click="moveToFront(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="flip_to_front" size="xs" />
                      </q-item-section>
                      <q-item-section>Bring to Front</q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="moveToBack(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="flip_to_back" size="xs" />
                      </q-item-section>
                      <q-item-section>Send to Back</q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="moveUp(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="arrow_upward" size="xs" />
                      </q-item-section>
                      <q-item-section>Move Up</q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="moveDown(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="arrow_downward" size="xs" />
                      </q-item-section>
                      <q-item-section>Move Down</q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable v-close-popup @click="deleteLayer(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="delete" size="xs" color="negative" />
                      </q-item-section>
                      <q-item-section class="text-negative">Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Empty State -->
    <div v-else class="layer-empty">
      <q-icon name="layers" size="48px" color="grey-5" />
      <p class="text-grey-6">No layers yet</p>
      <p class="text-caption text-grey-5">Add images or text to create layers</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useEditorStore } from '~/store/editor'
import draggable from 'vuedraggable'

const $q = useQuasar()
const editorStore = useEditorStore()

const editingLayerId = ref(null)
const editingLayerName = ref('')
const layerNameInput = ref(null)

const layers = computed({
  get: () => {
    return [...editorStore.elements]
      .sort((a, b) => {
        const aIndex = a.zIndex ?? editorStore.elements.indexOf(a)
        const bIndex = b.zIndex ?? editorStore.elements.indexOf(b)
        return bIndex - aIndex
      })
  },
  set: (value) => {
    const updatedElements = value.map((el, index) => ({
      ...el,
      zIndex: value.length - index - 1
    }))

    const sortedElements = [...updatedElements].sort((a, b) =>
      (a.zIndex ?? 0) - (b.zIndex ?? 0)
    )

    editorStore.$patch({
      elements: sortedElements
    })

    nextTick(() => {
      forceCanvasRefresh()
      emit('layer-update')
    })
  },
})

const getLayerIcon = (layer) => {
  switch (layer.type) {
    case 'image':
      return layer.isDrawing ? 'brush' : 'image'
    case 'text':
      return 'text_fields'
    case 'emoji':
      return 'emoji_emotions'
    case 'monogram':
      return 'mdi-alpha-m-circle'
    default:
      return 'layers'
  }
}

const getLayerName = (layer) => {
  if (layer.name && layer.name.trim()) {
    return layer.name
  }

  switch (layer.type) {
    case 'image':
      return layer.isDrawing ? 'Drawing' : layer.isSticker ? 'Sticker' : 'Image'
    case 'text':
      const content = layer.content?.replace(/<[^>]*>/g, '').trim()
      return content ? content.substring(0, 20) + (content.length > 20 ? '...' : '') : 'Text'
    case 'emoji':
      return layer.content || 'Emoji'
    case 'monogram':
      return `Monogram ${layer.content || ''}`
    default:
      return 'Layer'
  }
}

const getLayerType = (layer) => {
  switch (layer.type) {
    case 'image':
      return layer.isDrawing ? 'Drawing' : layer.isSticker ? 'Sticker' : 'Image'
    case 'text':
      return 'Text'
    case 'emoji':
      return 'Emoji'
    case 'monogram':
      return 'Monogram'
    default:
      return 'Unknown'
  }
}

const isSelected = (id) => editorStore.selectedElementId === id
const isLocked = (id) => editorStore.isElementLocked(id)
const isHidden = (id) => editorStore.isElementHidden(id)

const selectLayer = (id) => {
  if (!isLocked(id) && !isHidden(id)) {
    // Just select the element without opening sidebars
    editorStore.selectElement(id)
    
    // Emit event to prevent sidebar auto-opening
    emit('layer-select', id)
  }
}

const toggleVisibility = (id) => {
  editorStore.toggleVisibility(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const toggleLock = (id) => {
  editorStore.toggleLock(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const duplicateLayer = (id) => {
  if (isLocked(id)) {
    $q.notify({
      message: 'Cannot duplicate locked layer',
      color: 'warning',
      icon: 'lock',
      position: 'top',
    })
    return
  }

  editorStore.duplicateElement(id)
  forceCanvasRefresh()
  emit('layer-update')

  $q.notify({
    message: 'Layer duplicated',
    color: 'positive',
    icon: 'content_copy',
    position: 'top',
  })
}

const deleteLayer = (id) => {
  $q.dialog({
    title: 'Delete Layer',
    message: 'Are you sure you want to delete this layer?',
    cancel: true,
    persistent: false,
  }).onOk(() => {
    editorStore.deleteElement(id)
    forceCanvasRefresh()
    emit('layer-update')

    $q.notify({
      message: 'Layer deleted',
      color: 'positive',
      icon: 'delete',
      position: 'top',
    })
  })
}

const clearAllLayers = () => {
  if (layers.value.length === 0) return

  $q.dialog({
    title: 'Clear All Layers',
    message: 'Are you sure you want to delete all layers? This action cannot be undone.',
    cancel: true,
    persistent: false,
    ok: {
      label: 'Clear All',
      color: 'negative',
    },
  }).onOk(() => {
    editorStore.clearElements()
    forceCanvasRefresh()
    emit('layer-update')

    $q.notify({
      message: 'All layers cleared',
      color: 'positive',
      icon: 'delete_sweep',
      position: 'top',
    })
  })
}

const moveToFront = (id) => {
  editorStore.bringToFront(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const moveToBack = (id) => {
  editorStore.sendToBack(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const moveUp = (id) => {
  editorStore.moveUp(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const moveDown = (id) => {
  editorStore.moveDown(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const handleDragEnd = () => {
  forceCanvasRefresh()
  emit('layer-update')

  $q.notify({
    message: 'Layer order updated',
    color: 'positive',
    icon: 'swap_vert',
    position: 'top',
    timeout: 1000,
  })
}

const updateLayerOpacity = (id, opacity) => {
  editorStore.updateElement(id, { opacity })
  forceCanvasRefresh()
  emit('layer-update')
}

const startEditingName = (layer) => {
  editingLayerId.value = layer.id
  editingLayerName.value = layer.name || getLayerName(layer)
  nextTick(() => {
    layerNameInput.value?.focus()
    layerNameInput.value?.select()
  })
}

const finishEditingName = (layer) => {
  if (editingLayerName.value.trim()) {
    editorStore.updateElement(layer.id, { name: editingLayerName.value.trim() })
    forceCanvasRefresh()
    emit('layer-update')
  }
  editingLayerId.value = null
  editingLayerName.value = ''
}

const cancelEditingName = () => {
  editingLayerId.value = null
  editingLayerName.value = ''
}

const forceCanvasRefresh = () => {
  const currentElements = [...editorStore.elements]
  editorStore.$patch({
    elements: currentElements
  })
}

const emit = defineEmits(['layer-update', 'layer-select'])
</script>

<style scoped>
.layer-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  overflow: hidden;
}

.layer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.layer-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.layer-actions {
  display: flex;
  gap: 4px;
}

.layer-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.layer-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.layer-selected {
  background: #eff6ff !important;
  border-color: #3b82f6 !important;
}

.layer-locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.layer-hidden {
  opacity: 0.4;
}

.layer-drag-handle {
  cursor: grab;
  color: #9ca3af;
  display: flex;
  align-items: center;
}

.layer-drag-handle:active {
  cursor: grabbing;
}

.layer-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.layer-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.layer-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-type {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.layer-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.layer-item:hover .layer-controls,
.layer-selected .layer-controls {
  opacity: 1;
}

.layer-ghost {
  opacity: 0.5;
  background: #dbeafe;
  border: 2px dashed #3b82f6;
}

.layer-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
}

.layer-empty p {
  margin: 8px 0;
}

/* Scrollbar styling */
.layer-list::-webkit-scrollbar {
  width: 6px;
}

.layer-list::-webkit-scrollbar-track {
  background: transparent;
}

.layer-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.layer-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.layer-opacity-control {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.layer-name {
  cursor: text;
  user-select: none;
}

.layer-name:hover {
  text-decoration: underline;
  text-decoration-style: dotted;
}

.layer-name-input {
  width: 100%;
  padding: 2px 4px;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  outline: none;
  background: white;
}
</style>
