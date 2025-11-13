<template>
  <header
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
           h-14 sm:h-16 md:h-[72px] px-3 sm:px-5 lg:px-8
           bg-gradient-to-r from-[#e0f2ff] via-[#c7f0ff] to-[#b3e5fc]
           backdrop-blur-xl border-b border-[#38bdf8]/30
           shadow-sm shadow-cyan-200/50 transition-all"
  >
    <!-- LEFT -->
    <div class="relative flex items-center min-w-0">
      <!-- Icon Box -->
      <div
          class="group flex items-center justify-center w-12 h-12 rounded-xl
               hover:border-sky-300 hover:shadow-md hover:shadow-sky-100 transition-all duration-300 cursor-pointer"
          @click="toggleNameBox"
      >
        <pen
            class="text-sky-600 group-hover:text-sky-700    size-[24px] group-hover:scale-110 transition-all duration-300"
            
        />
      </div>

      <!-- Popup Box -->
      <transition name="popup-fade">
        <div
            v-if="showNameBox"
            class="absolute top-12 left-0 w-72 p-4 bg-white/90 border border-sky-100 rounded-2xl
                 shadow-2xl backdrop-blur-lg z-50 origin-top animate-[popup_0.25s_ease-out]"
        >
          <div class="flex flex-col gap-3">
            <label class="text-sm text-sky-800 font-semibold">Design Name</label>
            <input
                v-model="designName"
                class="px-3 py-2 border border-sky-200 rounded-lg focus:outline-none focus:border-sky-400 text-sm"
                placeholder="Enter your design name"
            />
            <button
                class="mt-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2 rounded-lg font-semibold
                     hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:scale-[1.02]
                     active:scale-[0.98] transition-all duration-300"
                @click="saveName"
            >
              Save
            </button>
          </div>
        </div>
      </transition>

      <div class="flex items-center gap-2">
        <CollectionSwitcher @collection-changed="handleCollectionChange" />

        <button
          @click="$emit('switch-product')"
          class="flex items-center gap-2  sm:px-3 py-2 sm:bg-white/70  sm:border border-[#bae6fd]/60 rounded-xl
                 shadow-sm  sm:hover:shadow-lg sm:hover:bg-white hover:-translate-y-0.5 transition-all duration-300
                 backdrop-blur-md"
        >
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500">
            <q-icon name="mdi-cup" size="18px" color="white" />
          </div>
          <div class="flex flex-col gap-0.5 min-w-0 max-md:hidden">
            <span class="text-[10px] font-semibold text-[#0284c7]/80 uppercase tracking-wide">
              Product
            </span>
            <span class="text-[13px] font-semibold text-[#0c4a6e] truncate">
              {{ currentProductName }}
            </span>
          </div>
          <q-icon name="expand_more" size="20px" class="text-[#0284c7]/80 max-sm:hidden transition-transform" />
        </button>
      </div>
    </div>

    <!-- CENTER -->
    <div class="max-lg:hidden flex items-center justify-center">
      <div
          class="flex items-center  gap-2 sm:gap-4 bg-white/60 border border-[#bae6fd]/60
               sm:px-3 lg:px-4 py-2 rounded-xl backdrop-blur-lg shadow-sm"
      >
        <!-- Zoom -->
        <div class="flex items-center gap-2">
          <q-btn
              flat dense round icon="remove" size="sm"
              class="text-[#0284c7] hover:bg-[#bae6fd]/50 transition-all"
              :disable="zoom <= 0.25"
              @click="$emit('zoom-out')"
          />
          <div class="text-[#0284c7] font-semibold">{{ zoomPercentage }}%</div>
          <q-btn
              flat dense round icon="add" size="sm"
              class="text-[#0284c7] hover:bg-[#bae6fd]/50 transition-all"
              :disable="zoom >= 2"
              @click="$emit('zoom-in')"
          />
        </div>

        <!-- Undo / Redo -->
        <div class="flex items-center gap-1">
          <q-btn flat dense round icon="undo" size="sm"
                 class="text-[#0369a1] hover:text-[#0284c7] hover:bg-[#bae6fd]/40"
                 :disable="!canUndo" @click="$emit('undo')" />
          <q-btn flat dense round icon="redo" size="sm"
                 class="text-[#0369a1] hover:text-[#0284c7] hover:bg-[#bae6fd]/40"
                 :disable="!canRedo" @click="$emit('redo')" />
        </div>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="flex items-center justify-end gap-2 lg:gap-3">
      <!-- Share -->
      <q-btn
          flat no-caps icon="mdi-share-variant"
          class="text-[#0369a1] hover:text-[#0284c7] hover:bg-[#e0f2fe]
               px-2 sm:px-3 py-1.5 rounded-lg transition-all"
          @click="$emit('share-design')"
      >
        <span class="hidden md:inline ml-1">Share</span>
      </q-btn>

      <!-- Download -->
      <q-btn
          flat no-caps icon="mdi-download"
          class="text-[#0369a1] hover:text-[#0284c7] hover:bg-[#e0f2fe]
               px-2 sm:px-3 py-1.5 rounded-lg transition-all"
          @click="$emit('download')"
      />

      <!-- Done / Checkout -->
      <q-btn
          unelevated no-caps label="Done"
          class="relative overflow-hidden text-white font-semibold tracking-wide
               px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg
               bg-gradient-to-r from-[#38bdf8] via-[#0ea5e9] to-[#3b82f6]
               shadow-md shadow-cyan-400/50
               hover:shadow-lg hover:shadow-sky-400/60 hover:-translate-y-0.5 transition-all duration-300"
          @mouseenter="shine = true"
          @mouseleave="shine = false"
          @click="$emit('publish')"
      >
        <span
            v-if="shine"
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent
                 translate-x-[-100%] animate-[shine_1s_linear_infinite]"
        ></span>
      </q-btn>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import CollectionSwitcher from '~/components/collection/CollectionSwitcher.vue'
import { Pen } from 'lucide-vue-next'
import { useProductStore } from '~/store/product'

const productStore = useProductStore()

const props = defineProps({
  canUndo: Boolean,
  canRedo: Boolean,
  zoom: { type: Number, default: 1 },
  modelValue: { type: String, default: 'Untitled Design' }
})

const emit = defineEmits([
  'zoom-in', 'zoom-out', 'undo', 'redo',
  'download', 'publish', 'share-design',
  'update:modelValue', 'design-name-change', 'collection-changed',
  'switch-product'
])

const currentProductName = computed(() => {
  const product = productStore.currentProduct
  return `${product.type.charAt(0).toUpperCase() + product.type.slice(1)} ${product.size}`
})

const designName = ref(props.modelValue)
const zoomPercentage = computed(() => Math.round(props.zoom * 100))
const shine = ref(false)

const showNameBox = ref(false)

const toggleNameBox = () => {
  showNameBox.value = !showNameBox.value
}

const saveName = () => {
  showNameBox.value = false

}
const handleDesignNameChange = () => {
  const name = designName.value.trim() || 'Untitled Design'
  designName.value = name
  emit('update:modelValue', name)
  emit('design-name-change', name)
}

const handleCollectionChange = (collectionId) => {
  emit('collection-changed', collectionId)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shine {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}
</style>
