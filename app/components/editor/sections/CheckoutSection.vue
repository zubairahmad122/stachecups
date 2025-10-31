<template>
  <div class="row items-center mx-auto max-w-screen-2xl justify-center">
    <!-- Left Side (Cup Preview Card) -->
    <div
        class="col-xs-12 mt-20 q-pa-lg"
        :class="{ 'col-md-6': isCheckout }"
    >
      <div
          v-if="!$q.screen.gt.sm && isCheckout"
          class="text-h5 q-pb-md text-center text-[#0f172a] font-semibold"
      >
        🎉 Congrats! Your custom cup is ready!
      </div>

      <q-card
          class="rounded-[32px] overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.08)]
         border border-[#e5e7eb] bg-gradient-to-b from-[#f9fbff] to-[#e7f0ff]
         transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0,0,0,0.12)]"
      >
        <q-card-section class="flex justify-center items-center p-4">
          <cup-viewer
              :canvas-element="canvasElement"
              style="max-height: 60vh"
              class="q-pb-md rounded-2xl overflow-hidden"
          />
        </q-card-section>

        <div class="text-center pb-4">
          <div class="text-[#0284c7] font-semibold text-lg">
            🛍 Preview Your Design
          </div>
          <div class="text-[#64748b] text-sm mt-1">
            Rotate, zoom, and review before adding to cart.
          </div>
        </div>
      </q-card>
    </div>

    <!-- Right Side (Checkout Info) -->
    <div
        v-if="isCheckout"
        class=" q-pa-lg flex flex-col justify-center"
    >
      <div>
        <div
            v-if="$q.screen.gt.sm"
            class="text-3xl font-bold text-[#0f172a] flex items-center gap-2"
        >
          <PartyPopper class="w-6 h-6 text-[#0284c7]" />
        <span class="text-blue-600">  Congrats! </span>
          Your custom cup is ready!
        </div>

        <div
            class="text-[#475569] mt-3 leading-relaxed space-y-2"
        >
          <div class="flex items-center gap-2">
            <CheckCircle class="w-5 h-5 text-[#22c55e]" />
            <span>Check placement and details</span>
          </div>
          <div class="flex items-center gap-2">
            <RefreshCw class="w-5 h-5 text-[#3b82f6]" />
            <span>Rotate to view all angles</span>
          </div>
          <div class="flex items-center gap-2">
            <Heart class="w-5 h-5 text-[#ef4444]" />
            <span>Love it? Add to cart and make it yours!</span>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <q-btn
              label="Add to Cart"
              no-caps
              rounded
              class="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-base font-medium py-2.5 px-6 shadow-md hover:shadow-lg transition-all duration-300"
              @click="$emit('add-to-cart')"
          />
          <q-btn
              label="Go Back"
              no-caps
              rounded
              class="bg-white text-[#2563eb] border border-[#cbd5e1] text-base font-medium py-2.5 px-6 hover:bg-[#f8fafc] transition-all duration-300"
              @click="$emit('go-back')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CupViewer from '~/components/preview/CupViewer.vue'

// ✅ Lucide Vue imports
import { CheckCircle, RefreshCw, Heart, PartyPopper } from 'lucide-vue-next'

defineProps({
  canvasElement: {
    type: Object,
    default: undefined,
  },
  isCheckout: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['add-to-cart', 'go-back'])
</script>
