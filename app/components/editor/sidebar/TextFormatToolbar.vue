<template>
  <div
    v-if="visible && elementPosition && !isMobile"
    :style="toolbarStyle"
    class="fixed bg-white/95 backdrop-blur-lg rounded-lg shadow-lg flex items-center p-1.5 gap-1 border border-white/20 z-[1000]"
  >
    <!-- Action Buttons Group -->
    <div class="flex items-center gap-1.5 px-1 border-r border-gray-200 pr-2">
      <button
        class="w-8 h-8 b-0 bg-white/90 rounded-md flex items-center justify-center cursor-pointer text-gray-600 transition-all duration-150 hover:bg-blue-500 hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/30 border border-gray-200"
        @click="$emit('edit-text')"
        title="Edit text"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>

      <button
        class="w-8 h-8 b-0 rounded-md flex items-center justify-center cursor-pointer transition-all duration-150 border border-gray-200"
        :class="isLocked ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-blue-500 hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/30'"
        @click="$emit('toggle-lock')"
        :title="isLocked ? 'Unlock' : 'Lock'"
      >
        <svg v-if="!isLocked" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
        </svg>
      </button>

      <button
        class="w-8 h-8 b-0 bg-white/90 rounded-md flex items-center justify-center cursor-pointer text-gray-600 transition-all duration-150 hover:bg-blue-500 hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/30 border border-gray-200"
        @click="$emit('duplicate')"
        title="Duplicate"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </button>

      <button
        class="w-8 h-8 b-0 bg-white/90 rounded-md flex items-center justify-center cursor-pointer text-gray-600 transition-all duration-150 hover:bg-red-500 hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-red-500/30 border border-gray-200"
        @click="$emit('delete')"
        title="Delete"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none">
          <polyline points="3,6 5,6 21,6"/>
          <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>
    </div>

    <!-- Formatting Group -->
    <div class="flex items-center gap-1.5 px-1">
      <!-- Text Formatting Buttons -->
      <div class="flex items-center gap-0.5 bg-white/90 rounded-md p-0.5 border border-gray-200">
        <button
          class="w-8 h-8 b-0 bg-transparent rounded flex items-center justify-center cursor-pointer transition-all duration-150"
          :class="isBold ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-blue-50'"
          @click="toggleBold"
          title="Bold"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
          </svg>
        </button>

        <button
          class="w-8 h-8 b-0 bg-transparent rounded flex items-center justify-center cursor-pointer transition-all duration-150"
          :class="isItalic ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-blue-50'"
          @click="toggleItalic"
          title="Italic"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none">
            <line x1="19" y1="4" x2="10" y2="4"/>
            <line x1="14" y1="20" x2="5" y2="20"/>
            <line x1="15" y1="4" x2="9" y2="20"/>
          </svg>
        </button>

        <button
          class="w-8 h-8 b-0 bg-transparent rounded flex items-center justify-center cursor-pointer transition-all duration-150"
          :class="isUnderline ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-blue-50'"
          @click="toggleUnderline"
          title="Underline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none">
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
            <line x1="4" y1="21" x2="20" y2="21"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  elementPosition: {
    type: Object,
    default: null
  },
  elementSize: {
    type: Object,
    default: () => ({ width: 0, height: 0 })
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isBold: {
    type: Boolean,
    default: false
  },
  isItalic: {
    type: Boolean,
    default: false
  },
  isUnderline: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'edit-text',
  'toggle-lock',
  'duplicate',
  'delete',
  'bold-change',
  'italic-change',
  'underline-change'
])

const isMobile = computed(() => $q.screen.lt.md)

const toolbarStyle = computed(() => {
  // Static toolbar at top of canvas
  return {
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)'
  }
})

const toggleBold = () => {
  emit('bold-change', !props.isBold)
}

const toggleItalic = () => {
  emit('italic-change', !props.isItalic)
}

const toggleUnderline = () => {
  emit('underline-change', !props.isUnderline)
}
</script>