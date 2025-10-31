<template>
  <q-card
    v-if="$q.screen.gt.sm && !isCheckout"
    class="absolute-top-right  bg-gradient-to-b from-[#e8f2ff] to-[#c9e3ff] shadow-lg z-index-20 q-ma-md"
    :class="{
      'preview-card': !zoom,
      'rounded-lg  w-[400px] h-[420px] overflow-hidden': zoom,
    }"
  >
    <q-card-section class="relative-position h-full">
      <button class="absolute-top-right bg-black/20  size-8 flex items-center justify-center  rounded-md top-2 right-2 z-10 cursor-pointer text-white">
        
        <ZoomInIcon
        icon="zoom-in"
        class="size-6  text-white"
        @click="emit('toggle-zoom')"
        />
      </button>
      <cup-viewer
        :canvas-element="canvasElement"
        :key="`preview-${zoom}`"
      />
    </q-card-section>
  </q-card>
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

<style scoped>
.z-index-20 {
  z-index: 25 !important;
}

.preview-card {
  width: 200px;
  height: 210px;
  z-index: 1;
}

.preview-card-zoom {
  width: 400px;
  height: 400px;
  z-index: 10;
  top: 80px;
  position: fixed;
}
</style>

