<template>
  <div class="flex items-center">

    <button
        @click="showSwitcher = true"

        class="flex items-center sticky top -0 gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/70 border border-[#bae6fd]/60 rounded-xl
             shadow-sm hover:shadow-lg hover:bg-white hover:-translate-y-0.5 transition-all duration-300 ease-in-out
             backdrop-blur-md">

      <div
          class="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
          :style="{ backgroundColor: collectionStore.branding?.primaryColor || '#38bdf8' }"
      >
        <q-icon name="mdi-package-variant-closed" size="18px" color="white" />
      </div>

      <div class="flex flex-col gap-0.5 min-w-0 max-md:hidden">
        <span class="text-[10px] font-semibold text-[#0284c7]/80 uppercase tracking-wide">
          Collection
        </span>
        <span class="text-[13px] font-semibold text-[#0c4a6e] truncate">
          {{ collectionStore.branding?.badgeText || collectionStore.currentCollection?.name }}
        </span>
      </div>

      <!-- Dropdown Icon -->
      <q-icon name="expand_more" size="20px" class="text-[#0284c7]/80 transition-transform group-hover:translate-y-1" />
    </button>

    <!-- Dialog -->
    <q-dialog v-model="showSwitcher" transition-show="scale" transition-hide="scale">
      <q-card class="w-[92vw] sm:w-[95vw] max-w-[760px] rounded-2xl overflow-scroll border border-[#bae6fd]/60 shadow-xl">
        <div class="flex justify-between items-start bg-gradient-to-r from-[#e0f7ff] via-[#ccf0ff] to-[#b3e5fc] px-4 py-3 sm:px-6 sm:py-5 border-b border-[#bae6fd]/60">
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-[#0c4a6e] mb-1">Choose Your Collection</h2>
            <p class="text-xs sm:text-sm text-[#0369a1]/70">Each collection has unique products & styles</p>
          </div>
          <q-btn icon="close" flat round dense class="text-[#0369a1] hover:bg-white/60 transition" @click="showSwitcher = false" />
        </div>

        <div class="p-4 sm:p-6 bg-white/80 backdrop-blur-md ">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4  sm:gap-6">
            <div
                v-for="collection in collectionStore.activeCollections"
                :key="collection.id"
                @click="selectCollection(collection.id)"
                :style="{ '--card': collection.branding.primaryColor || '#38bdf8' }"
                :class="[
      'relative group bg-gradient-to-br from-white via-[#f0f9ff] to-[#e0f7ff] rounded-2xl border-2 border-transparent shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer',
      collection.id === collectionStore.activeCollection
        ? 'border-[color:var(--card)] shadow-[0_0_20px_var(--card)]'
        : 'hover:border-[color:var(--card)]'
    ]"
            >
              <!-- Active Glow Badge -->
              <div
                  v-if="collection.id === collectionStore.activeCollection"
                  class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md animate-[bounceIn_0.4s_ease-out]"
              >
                <q-icon name="check" size="18px" />
              </div>

              <div
                  class="h-20 sm:h-24 flex items-center justify-center bg-gradient-to-r from-sky-400 to-blue-500 text-white"
              >
                <q-icon name="mdi-shopping" size="34px" />
              </div>

              <div class="p-3 sm:p-4 flex flex-col gap-2">
                <div class="text-sm sm:text-base font-bold text-[#0c4a6e] truncate">
                  {{ collection.name }}
                </div>
                <div class="text-[11px] sm:text-xs text-gray-500 leading-snug">
                  {{ collection.description }}
                </div>

                <div class="flex flex-col gap-1.5 mt-2">
                  <div class="flex items-center gap-2 text-[11px] sm:text-xs text-[#0369a1]">
                    <q-icon
                        :name="collection.rules.colorPicker.cmyk ? 'palette' : 'palette-outline'"
                        size="14px"
                        :color="collection.rules.colorPicker.cmyk ? 'positive' : 'orange'"
                    />
                    <span>{{ collection.rules.colorPicker.cmyk ? 'Full Colors' : 'Limited Colors' }}</span>
                  </div>

                  <div class="flex items-center gap-2 text-[11px] sm:text-xs text-[#0369a1]">
                    <q-icon
                        :name="collection.rules.upload.enabled ? 'cloud_upload' : 'block'"
                        size="14px"
                        :color="collection.rules.upload.enabled ? 'positive' : 'negative'"
                    />
                    <span>{{ collection.rules.upload.enabled ? 'Uploads Allowed' : 'No Uploads' }}</span>
                  </div>

                  <div
                      v-if="collection.rules.licensing.required"
                      class="flex items-center gap-2 text-[11px] sm:text-xs text-[#0369a1]"
                  >
                    <q-icon name="verified_user" size="14px" color="warning" />
                    <span>Licensed Assets</span>
                  </div>
                </div>
              </div>

              <!-- Subtle Shine on Hover -->
              <div
                  class="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-transparent via-white/40 to-transparent rounded-2xl transition-opacity duration-300 pointer-events-none"
              ></div>
            </div>
          </div>

        </div>
      </q-card>
    </q-dialog>

    <!-- Warning Dialog -->
    <q-dialog v-model="showWarning" persistent>
      <q-card class="w-[92vw] max-w-[500px] rounded-2xl">
        <q-card-section class="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-200">
          <div class="flex items-start gap-3">
            <q-icon name="warning" size="32px" class="text-orange-500" />
            <div>
              <div class="text-lg font-bold text-gray-800">
                {{ collectionStore.switchWarning?.title || 'Switch Collection?' }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="py-4">
          <p class="text-gray-700 leading-relaxed">
            {{ warningMessage }}
          </p>
        </q-card-section>

        <q-card-actions align="right" class="px-4 pb-4">
          <q-btn
            flat
            :label="collectionStore.switchWarning?.cancelText || 'Cancel'"
            @click="cancelSwitch"
            class="text-gray-600 hover:bg-gray-100"
          />
          <q-btn
            unelevated
            :label="collectionStore.switchWarning?.confirmText || 'Switch Collection'"
            @click="confirmSwitch"
            class="bg-orange-500 text-white hover:bg-orange-600"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Licensing Disclaimer Dialog -->
    <q-dialog v-model="showDisclaimer" persistent>
      <q-card class="w-[92vw] max-w-[600px] rounded-2xl">
        <q-card-section class="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-sky-200">
          <div class="flex items-start gap-3">
            <q-icon name="verified_user" size="32px" class="text-sky-600" />
            <div>
              <div class="text-lg font-bold text-gray-800">Licensing Notice</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="py-4">
          <p class="text-gray-700 leading-relaxed">
            {{ collectionStore.licensingDisclaimer }}
          </p>
          <a
            v-if="collectionStore.brandGuidelines"
            :href="collectionStore.brandGuidelines"
            target="_blank"
            class="text-sky-600 hover:text-sky-700 text-sm font-medium mt-3 inline-flex items-center gap-1"
          >
            View Brand Guidelines
            <q-icon name="open_in_new" size="16px" />
          </a>
        </q-card-section>

        <q-card-actions align="right" class="px-4 pb-4">
          <q-btn
            unelevated
            label="I Understand"
            @click="showDisclaimer = false"
            class="bg-sky-600 text-white hover:bg-sky-700"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { useCollectionStore } from '~/store/collection'
import { useEditorStore } from '~/store/editor'
import { useBackgroundStore } from '~/store/background'
import { useMonogramStore } from '~/store/monogram'
import type { Collection } from '~/store/collection'

const collectionStore = useCollectionStore()
const editorStore = useEditorStore()
const backgroundStore = useBackgroundStore()
const monogramStore = useMonogramStore()

const showSwitcher = ref(false)
const showWarning = ref(false)
const showDisclaimer = ref(false)
const pendingCollectionId = ref<string | null>(null)
const targetCollection = ref<Collection | null>(null)

const warningMessage = computed(() => {
  if (!collectionStore.switchWarning || !targetCollection.value) return ''

  return collectionStore.switchWarning.message.replace(
    '{newCollection}',
    targetCollection.value.name
  )
})

const selectCollection = (collectionId: string) => {
  if (collectionId === collectionStore.activeCollection) {
    showSwitcher.value = false
    return
  }

  if (editorStore.hasElements) {
    pendingCollectionId.value = collectionId
    targetCollection.value = collectionStore.getCollectionById(collectionId)
    showSwitcher.value = false
    showWarning.value = true
  } else {
    switchToCollection(collectionId)
  }
}

const switchToCollection = (collectionId: string) => {
  collectionStore.confirmSwitchCollection(collectionId)

  // Clear all elements
  editorStore.clearElements()

  // Clear background
  backgroundStore.clearBackground()

  // Clear monogram/personalization
  monogramStore.reset()

  // Close dialogs
  showSwitcher.value = false
  showWarning.value = false

  if (collectionStore.requiresLicensing && collectionStore.licensingDisclaimer) {
    showDisclaimer.value = true
  }

  emits('collectionChanged', collectionId)
}

const confirmSwitch = () => {
  if (pendingCollectionId.value) {
    switchToCollection(pendingCollectionId.value)
    pendingCollectionId.value = null
    targetCollection.value = null
  }
}

const cancelSwitch = () => {
  showWarning.value = false
  pendingCollectionId.value = null
  targetCollection.value = null
}

const emits = defineEmits<{
  collectionChanged: [collectionId: string]
}>()

// Show disclaimer on mount if required
onMounted(() => {
  if (collectionStore.requiresLicensing && collectionStore.licensingDisclaimer) {
    showDisclaimer.value = true
  }
})
</script>

<style>
@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
