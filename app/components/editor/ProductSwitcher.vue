<template>
  <q-dialog :model-value="show" @update:model-value="$emit('close')" position="bottom" class="product-switcher-dialog">
    <q-card class="product-switcher">
      <!-- Header -->
      <q-card-section class="switcher-header">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="mdi-cup" size="28px" />
          </div>
          <div class="header-text">
            <span class="text-h6">Switch Product</span>
            <span class="text-caption">Choose a different cup size or style</span>
          </div>
          <q-btn 
            flat 
            round 
            dense 
            icon="mdi-close" 
            class="close-btn"
            @click="$emit('close')" 
          />
        </div>
      </q-card-section>

      <q-separator class="modal-separator" />

      <q-card-section class="switcher-content">
        <!-- Current Product Info -->
        <div class="current-product">
          <div class="text-caption text-grey-7 mb-2">Current Product</div>
          <div class="text-h6 text-purple-700">
            {{ currentProductLabel }}
          </div>
          <div class="text-caption text-grey-6">
            Print Area: {{ currentProduct.width.toFixed(0) }} × {{ currentProduct.height.toFixed(0) }} mm
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Info message -->
        <q-banner rounded class="bg-blue-1 text-blue-9 q-mb-md">
          <template #avatar>
            <q-icon name="info" color="blue" />
          </template>
          <div class="text-sm">
            Your current design will be preserved and scaled to fit the new product's print area.
          </div>
        </q-banner>

        <!-- Warning if design will be scaled down -->
        <q-banner v-if="willScaleDesign" rounded class="bg-orange-1 text-orange-9 q-mb-md">
          <template #avatar>
            <q-icon name="warning" color="orange" />
          </template>
          <div class="text-sm">
            Your design will be scaled to fit the new product's print area.
            Elements will be resized proportionally.
          </div>
        </q-banner>

        <!-- Product Selection -->
        <div class="section">
          <div class="section-title">
            <q-icon name="mdi-shape" />
            <span>Select Product</span>
          </div>

          <div class="products-grid">
            <div
              v-for="product in availableProducts"
              :key="product.type"
              class="product-card"
              :class="{ selected: selectedType === product.type }"
              @click="selectProduct(product.type)"
            >
              <div class="product-name">{{ product.label }}</div>
              <div class="product-sizes">
                {{ product.sizes.join(', ') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Size Selection -->
        <div v-if="selectedType" class="section">
          <div class="section-title">
            <q-icon name="mdi-ruler" />
            <span>Select Size</span>
          </div>

          <div class="sizes-grid">
            <button
              v-for="size in selectedProductSizes"
              :key="size"
              class="size-btn"
              :class="{ selected: selectedSize === size }"
              @click="selectedSize = size"
            >
              {{ size }}
            </button>
          </div>
        </div>
      </q-card-section>

      <!-- Footer -->
      <q-card-section class="switcher-footer">
        <div class="footer-actions">
          <q-btn 
            flat 
            label="Cancel" 
            color="grey-7"
            class="cancel-btn"
            @click="$emit('close')" 
          />
          <q-btn
            color="primary"
            label="Switch Product"
            class="switch-btn"
            :disable="!canSwitch"
            :loading="switching"
            @click="handleSwitch"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useProductStore } from '~/store/product'
import { useProductSwitcher } from '~/composables/useProductSwitcher'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'close': []
  'switched': [product: { type: string; size: string }]
}>()

const $q = useQuasar()
const productStore = useProductStore()
const productSwitcher = useProductSwitcher()

const selectedType = ref(productStore.currentProduct.type)
const selectedSize = ref(productStore.currentProduct.size)
const switching = ref(false)

const availableProducts = productSwitcher.getAvailableProducts()

const currentProduct = computed(() => productStore.currentProduct)

const currentProductLabel = computed(() => {
  const product = availableProducts.find(p => p.type === currentProduct.value.type)
  return product
    ? `${product.label} ${currentProduct.value.size}`
    : `${currentProduct.value.type} ${currentProduct.value.size}`
})

const selectedProductSizes = computed(() => {
  const product = availableProducts.find(p => p.type === selectedType.value)
  return product?.sizes || []
})

const canSwitch = computed(() => {
  return selectedType.value &&
         selectedSize.value &&
         (selectedType.value !== currentProduct.value.type ||
          selectedSize.value !== currentProduct.value.size)
})

const willScaleDesign = computed(() => {
  if (!selectedType.value || !selectedSize.value) return false
  return selectedType.value !== currentProduct.value.type ||
         selectedSize.value !== currentProduct.value.size
})

const selectProduct = (type: string) => {
  selectedType.value = type
  // Auto-select first size
  const product = availableProducts.find(p => p.type === type)
  if (product && product.sizes.length > 0) {
    selectedSize.value = product.sizes[0]
  }
}

const handleSwitch = async () => {
  if (!canSwitch.value) return

  switching.value = true

  try {
    const result = await productSwitcher.switchProduct(selectedType.value, selectedSize.value)

    if (result.success) {
      $q.notify({
        message: `Switched to ${selectedType.value} ${selectedSize.value}`,
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
      })

      emit('switched', { type: selectedType.value, size: selectedSize.value })
      emit('close')
    } else {
      $q.notify({
        message: result.error || 'Failed to switch product',
        color: 'negative',
        icon: 'error',
        position: 'top',
      })
    }
  } catch (error) {
    $q.notify({
      message: 'An error occurred while switching products',
      color: 'negative',
      icon: 'error',
      position: 'top',
    })
  } finally {
    switching.value = false
  }
}
</script>

<style scoped lang="scss">
.product-switcher-dialog {
  .q-dialog__inner {
    padding: 20px;
  }
}

.product-switcher {
  width: 750px;
  max-width: 95vw;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15),
              0 -4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideUpIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.switcher-header {
  background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
  color: white;
  padding: 24px 28px 20px;
  position: relative;
  
  .header-content {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-icon {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .header-text {
    flex: 1;
    
    .text-h6 {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .text-caption {
      opacity: 0.9;
      font-size: 13px;
    }
  }
  
  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    color: rgba(255, 255, 255, 0.8);
    
    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.modal-separator {
  margin: 0;
  background: rgba(0, 0, 0, 0.08);
}

.switcher-content {
  max-height: 70vh;
  overflow-y: auto;
  background: #fafafa;
  padding: 24px 28px;
}

.switcher-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
  padding: 20px 28px 24px;
  
  .footer-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .cancel-btn {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
  
  .switch-btn {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
    box-shadow: 0 4px 12px rgba(30, 173, 176, 0.3);
    transition: all 0.2s ease;
    
    &:hover:not(.q-btn--disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(30, 173, 176, 0.4);
    }
    
    &:active:not(.q-btn--disabled) {
      transform: translateY(0);
    }
    
    &.q-btn--disabled {
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }
  }
}

@keyframes slideUpIn {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.current-product {
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.product-card {
  padding: 20px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  background: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(30, 173, 176, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover {
    border-color: #1EADB0;
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(30, 173, 176, 0.15);
    
    &::before {
      left: 100%;
    }
  }

  &.selected {
    border-color: #1EADB0;
    background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
    box-shadow: 0 4px 15px rgba(30, 173, 176, 0.2);
  }
}

.product-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
}

.product-sizes {
  font-size: 11px;
  color: #666;
}

.sizes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-btn {
  padding: 12px 24px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 14px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(30, 173, 176, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover {
    border-color: #1EADB0;
    background: rgba(30, 173, 176, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 173, 176, 0.15);
    
    &::before {
      left: 100%;
    }
  }

  &.selected {
    border-color: #1EADB0;
    background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(30, 173, 176, 0.3);
    transform: translateY(-1px);
  }
}

@media (max-width: 600px) {
  .product-switcher {
    width: 100vw;
    max-width: 100vw;
    border-radius: 16px 16px 0 0;
  }
  
  .switcher-header {
    padding: 20px 20px 16px;
    
    .header-content {
      gap: 12px;
    }
    
    .header-icon {
      padding: 6px;
    }
  }
  
  .switcher-content {
    padding: 20px;
  }
  
  .switcher-footer {
    padding: 16px 20px 20px;
    
    .footer-actions {
      flex-direction: column;
      gap: 8px;
    }
    
    .cancel-btn,
    .switch-btn {
      width: 100%;
    }
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }
  
  .product-card {
    padding: 16px 12px;
  }
  
  .sizes-grid {
    gap: 6px;
  }
  
  .size-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>
