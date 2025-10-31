<template>
  <div
    v-if="visible && elementPosition && !isMobile"
    :style="toolbarStyle"
    class="fixed bg-white/95 backdrop-blur-lg rounded-xl shadow-lg flex items-center p-1.5 gap-1 border border-white/20 z-[1000]"
  >
    <button
      v-if="elementType === 'image' && isDrawing"
      class="w-8 h-8 border-0 bg-transparent rounded-md flex items-center justify-center cursor-pointer text-gray-500 transition-all duration-200 hover:bg-black/5 hover:text-gray-700"
      @click="$emit('edit-drawing')"
      title="Edit drawing"
    >
      <Edit3 class="w-5 h-5" />
    </button>

    <button
      v-if="elementType === 'image' && !isDrawing && !isSticker"
      class="w-8 h-8 border-0 bg-transparent rounded-md flex items-center justify-center cursor-pointer text-gray-500 transition-all duration-200 hover:bg-black/5 hover:text-gray-700"
      @click="$emit('change-image')"
      title="Change image"
    >
      <Image class="w-5 h-5" />
    </button>

    <button
      v-if="elementType === 'image' && !isDrawing && !isSticker && !hasFrame"
      class="w-8 h-8 border-0 bg-transparent rounded-md flex items-center justify-center cursor-pointer text-purple-500 transition-all duration-200 hover:bg-purple-50 hover:text-purple-600"
      @click="$emit('add-frame')"
      title="Add frame"
    >
      <CirclePlus class="w-5 h-5" />
    </button>

    <button
      v-if="elementType === 'image' && !isDrawing && !isSticker && hasFrame"
      class="w-8 h-8 border-0 bg-transparent rounded-md flex items-center justify-center cursor-pointer text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
      @click="$emit('remove-frame')"
      title="Remove frame"
    >
      <CircleMinus class="w-5 h-5" />
    </button>

    <button
      v-if="elementType === 'text' || elementType === 'monogram'"
      class="w-8 h-8 border-0 bg-transparent rounded-md flex items-center justify-center cursor-pointer text-gray-500 transition-all duration-200 hover:bg-black/5 hover:text-gray-700"
      @click="$emit('format-text')"
      :title="elementType === 'monogram' ? 'Edit monogram' : 'Edit text'"
    >
      <Type class="w-5 h-5" />
    </button>

    <button
      class="w-8 h-8 border-0 bg-transparent rounded-md flex items-center justify-center cursor-pointer text-gray-500 transition-all duration-200 hover:bg-black/5 hover:text-gray-700"
      :class="{ 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700': isLocked }"
      @click="$emit('toggle-lock')"
      :title="isLocked ? 'Unlock' : 'Lock'"
    >
      <Lock v-if="!isLocked" class="w-5 h-5" />
      <Unlock v-else class="w-5 h-5" />
    </button>

    <button
      class="w-8 h-8 border-0 bg-transparent rounded-md flex items-center justify-center cursor-pointer text-gray-500 transition-all duration-200 hover:text-gray-500 hover:bg-gray-50"
      @click="$emit('duplicate')"
      title="Duplicate"
    >
      <Copy class="w-5 h-5" />
    </button>

    <button
      class="w-8 h-8 border-0 bg-transparent rounded-md flex items-center justify-center cursor-pointer text-red-500 transition-all duration-200 hover:text-red-500 "
      @click="$emit('delete')"
      title="Delete"
    >
      <Trash2 class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { Edit3, Image, CirclePlus, CircleMinus, Type, Lock, Unlock, Copy, Trash2 } from 'lucide-vue-next'

const $q = useQuasar()

const props = defineProps({
  visible: { type: Boolean, default: false },
  elementPosition: { type: Object, default: null },
  elementSize: { type: Object, default: () => ({ width: 0, height: 0 }) },
  elementType: {
    type: String,
    default: 'image',
    validator: (value) => !value || ['image', 'text', 'emoji', 'monogram'].includes(value)
  },
  isLocked: { type: Boolean, default: false },
  isDrawing: { type: Boolean, default: false },
  isSticker: { type: Boolean, default: false },
  hasFrame: { type: Boolean, default: false }
})

const emit = defineEmits([
  'change-image',
  'edit-drawing',
  'format-text',
  'toggle-lock',
  'duplicate',
  'delete',
  'add-frame',
  'remove-frame'
])

const isMobile = computed(() => $q.screen.lt.md)

const toolbarStyle = computed(() => {
  // Static toolbar at top of canvas
  return {
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)'
  }
})
</script>
