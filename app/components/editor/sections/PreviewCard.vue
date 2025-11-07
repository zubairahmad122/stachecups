<template>
  <div
    v-if="$q.screen.gt.sm && !isCheckout"
    class="absolute top-5 right-0 z-[25] shadow-lg bg-gradient-to-b from-[#e8f2ff] to-[#c9e3ff] p-0 m-0 transition-all duration-300"
    :class="{
      'w-[230px] h-[260px] rounded-lg overflow-hidden': !zoom,
      'w-[400px] h-[300px]  sm:h-[420px] rounded-lg overflow-hidden': zoom,
    }"
  >
    <div class="relative w-full h-full">
      <button
        class="absolute top-2 right-2 bg-black/20 hover:bg-black/30 size-8 flex items-center justify-center rounded-md text-white z-10 cursor-pointer"
        @click="emit('toggle-zoom')"
      >
        <ZoomInIcon class="size-6 text-white" />
      </button>

      <cup-viewer
        :canvas-element="canvasElement"
        :key="`preview-${zoom}`"
        class="w-full h-full"
      />
    </div>
  </div>
</template>

<script setup>
import CupViewer from '~/components/preview/CupViewer.vue'
import { ZoomInIcon } from 'lucide-vue-next'

const props = defineProps({
  zoom: Boolean,
  canvasElement: Object,
  isCheckout: Boolean,
})

const emit = defineEmits(['toggle-zoom'])
</script>
