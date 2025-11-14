<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 max-h-[100dvh]  flex items-end justify-center bg-black/40 backdrop-blur-sm"
  >
    <!-- Dialog -->
    <div
      class="w-[750px] overflow-y-auto max-h-full max-w-[95vw] bg-white rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.15),0_-4px_8px_rgba(0,0,0,0.1)] overflow-x-hidden animate-slide-up"
    >
      <!-- Header -->
      <div
        class="bg-gradient-to-br from-[#1EADB0] to-[#4B5574] text-white p-6 relative flex items-start gap-4"
      >
        <div class="bg-white/20 rounded-xl p-2 flex items-center justify-center">
          <i class="mdi mdi-cup text-2xl"></i>
        </div>

        <div class="flex-1">
          <h3 class="font-semibold text-lg mb-1">Switch Product</h3>
          <p class="text-sm opacity-90">Choose a different cup size or style</p>
        </div>

        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition"
        >
          <i class="mdi mdi-close text-xl"></i>
        </button>
      </div>

      <!-- Body -->
      <div class=" max-h-[65dvh] overflow-y-auto bg-[#fafafa] p-6">
        <!-- Current Product -->
        <div
          class="p-4 bg-white rounded-xl border border-black/10 shadow-sm mb-4"
        >
          <div class="text-sm text-gray-500 mb-1">Current Product</div>
          <div class="text-lg font-semibold text-purple-700 mb-1">
            {{ currentProductName }}
          </div>
          <div class="text-sm text-gray-600">
            Print Area: {{ currentProduct.width.toFixed(0) }} ×
            {{ currentProduct.height.toFixed(0) }} mm
          </div>
        </div>

        <!-- Info -->
        <div
          class="flex items-start gap-2 bg-blue-50 text-blue-900 p-3 rounded-lg mb-3 text-sm"
        >
          <i class="mdi mdi-information text-blue-600 text-lg"></i>
          <span>
            All products have standardized print areas. Your design will maintain its position and size when switching products.
          </span>
        </div>

        <!-- Product Selection -->
        <div class="mb-4">
          <div class="flex items-center gap-2 font-semibold text-gray-800 mb-3">
            <i class="mdi mdi-shape text-gray-700"></i>
            <span>Select Product</span>
          </div>

          <div
            class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3"
          >
            <div
              v-for="product in availableProducts"
              :key="product.type"
              @click="selectProduct(product.type)"
              :class="[
                'cursor-pointer text-center border-2 rounded-2xl bg-white p-4 relative overflow-hidden transition-all duration-300',
                selectedType === product.type
                  ? 'border-[#1EADB0] bg-gradient-to-br from-[#1EADB01A] to-[#4B55741A] shadow-md'
                  : 'border-gray-200 hover:border-[#1EADB0] hover:shadow-lg hover:-translate-y-1',
              ]"
            >
              <div class="font-semibold text-sm text-gray-800">
                {{ product.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="border-t border-black/10 max-sm:sticky bottom-0 bg-white p-5 flex flex-col sm:flex-row justify-end gap-3"
      >
        <button
          @click="$emit('close')"
          class="px-6 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          :disabled="!canSwitch || switching"
          @click="handleSwitch"
          :class="[
            'px-6 py-2.5 rounded-lg font-semibold text-white transition-all',
            canSwitch
              ? 'bg-gradient-to-br from-[#1EADB0] to-[#4B5574] shadow-md hover:-translate-y-0.5 hover:shadow-lg'
              : 'opacity-60 cursor-not-allowed bg-gradient-to-br from-[#1EADB0] to-[#4B5574]',
          ]"
        >
          <span v-if="!switching">Switch Product</span>
          <span v-else>Switching...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProductStore } from '~/store/product'
import { useProductSwitcher } from '~/composables/useProductSwitcher'

defineProps<{ show: boolean }>()
const emit = defineEmits<{
  close: []
  switched: [product: { type: string; size: string }]
}>()

const productStore = useProductStore()
const productSwitcher = useProductSwitcher()

const selectedType = ref(productStore.currentProduct.type)
const switching = ref(false)

const availableProducts = productSwitcher.getAvailableProducts()
const currentProduct = computed(() => productStore.currentProduct)

const currentProductName = computed(() => {
  const product = availableProducts.find(
    (p) => p.type === currentProduct.value.type
  )
  return product ? product.label : currentProduct.value.type
})

const canSwitch = computed(
  () =>
    selectedType.value &&
    selectedType.value !== currentProduct.value.type
)

const selectProduct = (type: string) => {
  selectedType.value = type
}

const handleSwitch = async () => {
  if (!canSwitch.value) return
  switching.value = true
  try {
    const result = await productSwitcher.switchProduct(
      selectedType.value,
      'standard'
    )
    if (result.success) {
      emit('switched', { type: selectedType.value, size: 'standard' })
      emit('close')
    } else {
      alert(result.error || 'Failed to switch product')
    }
  } catch {
    alert('An error occurred while switching products')
  } finally {
    switching.value = false
  }
}
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slide-up {
  animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
