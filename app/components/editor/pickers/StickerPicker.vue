<template>
  <div class="w-full px-4 overflow-y-scroll py-2">
    <!-- Collection Info Banner -->
    <div v-if="collectionStore.isRestrictedCollection" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-start gap-2">
        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div>
          <div class="text-sm font-medium text-blue-900">
            {{ collectionStore.currentCollection?.name }} Collection
          </div>
          <div class="text-xs text-blue-700 mt-1">
            Only {{ collectionStore.currentCollection?.name }} and shared stickers are available
          </div>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-4">
      <div class="relative">
        <input
          v-model="search"
          type="text"
          placeholder="Search stickers"
          class="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none text-sm"
        />
        <svg
          class="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
        </svg>
      </div>
    </div>

    <!-- Category Tabs - Horizontal Scroll -->
    <div v-if="categories.length > 0 && !loading" class="mb-4">
      <q-scroll-area
        :thumb-style="{ width: '4px', opacity: 0.5, background: '#8b5cf6' }"
        :bar-style="{ width: '4px', opacity: 0.2 }"
        style="height: 50px"
        horizontal
      >
        <div class="flex gap-2 q-px-sm" style="width: max-content">
          <q-chip
            clickable
            @click="selectedCategory = 'all'"
            :color="selectedCategory === 'all' ? 'purple' : 'grey-3'"
            :text-color="selectedCategory === 'all' ? 'white' : 'grey-8'"
            class="text-sm font-medium"
            style="min-width: fit-content"
          >
            All
          </q-chip>
          <q-chip
            v-for="category in categories"
            :key="category.id"
            clickable
            @click="selectedCategory = category.name"
            :color="selectedCategory === category.name ? 'purple' : 'grey-3'"
            :text-color="selectedCategory === category.name ? 'white' : 'grey-8'"
            class="text-sm font-medium"
            style="min-width: fit-content"
          >
            {{ category.name }}
          </q-chip>
        </div>
      </q-scroll-area>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>

    <!-- Helper Text -->
    <div v-else-if="filteredStickers.length > 0" class="text-xs text-gray-500 mb-4 text-center sm:text-left">
      Click on a sticker to add it to your design ({{ filteredStickers.length }} available)
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-8">
      <div class="text-gray-400 text-sm">No stickers found</div>
    </div>

    <!-- Stickers Grid -->
    <div
      class="grid grid-cols-2 sm:grid-cols-3 overflow-y-scroll md:grid-cols-4 lg:grid-cols-2 gap-3 pb-2"
    >
      <div
        v-for="sticker in filteredStickers"
        :key="sticker.id"
        @click="selectSticker(sticker)"
        class="bg-white border border-gray-200 rounded-xl p-3  gap-2 cursor-pointer transition-all hover:border-purple-500 hover:bg-purple-50 hover:shadow-md active:scale-95"
      >
        <div
          class="w-full aspect-square flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden"
        >
          <img
            :src="sticker.path"
            :alt="sticker.name"
            class="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
        <div class="text-xs font-medium text-gray-700 text-center hover:text-purple-600 line-clamp-2">
          {{ sticker.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useCollectionStore } from '~/store/collection'
import { useQuasar } from 'quasar'
import axios from 'axios'

const collectionStore = useCollectionStore()
const $q = useQuasar()
const search = ref('')
const loading = ref(true)
const allStickers = ref<any[]>([])
const categories = ref<any[]>([])
const selectedCategory = ref<string>('all')

const emit = defineEmits(['select'])

interface Sticker {
  id: string
  path: string
  name: string
  tags: string[]
  category?: string
  collection?: string
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/data/stickers.json')

    // Get current collection filter
    const allowedTags = collectionStore.allowedAssetTags

    // Filter collections by current collection tags
    const filteredCollections = data.collections.filter((cat: any) => {
      if (!allowedTags || allowedTags.length === 0) return true
      // Check if category has any stickers with allowed tags
      return cat.stickers.some((sticker: any) =>
        sticker.tags?.some((tag: string) => allowedTags.includes(tag))
      )
    })

    // Store only non-empty categories
    categories.value = filteredCollections
      .filter((cat: any) => cat.stickers.length > 0)
      .map((cat: any) => ({
        id: cat.id || cat.name,
        name: cat.name,
        count: cat.stickers.length,
        collection: cat.collection
      }))

    // Flatten all stickers from filtered categories
    const allStickersFlat: Sticker[] = []
    filteredCollections.forEach((category: any) => {
      category.stickers.forEach((sticker: any) => {
        allStickersFlat.push({
          id: sticker.id,
          path: sticker.path,
          name: sticker.name,
          tags: sticker.tags || [],
          category: category.name || category.id,
          collection: category.collection
        })
      })
    })

    allStickers.value = allStickersFlat
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to load stickers',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
})

// Filter stickers based on collection and search
const filteredStickers = computed(() => {
  let filtered = allStickers.value

  // Filter by selected category
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    filtered = filtered.filter((sticker) => sticker.category === selectedCategory.value)
  }

  // Filter by collection tags
  const allowedTags = collectionStore.allowedAssetTags
  if (allowedTags && allowedTags.length > 0) {
    filtered = filtered.filter((sticker) => {
      // Check if sticker has any of the allowed tags
      return sticker.tags.some((tag: string) => allowedTags.includes(tag))
    })
  }

  // Filter by search query
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    filtered = filtered.filter((sticker) =>
      sticker.name.toLowerCase().includes(searchLower) ||
      sticker.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
    )
  }

  return filtered
})

// Watch for collection changes and reload categories
watch(() => collectionStore.allowedAssetTags, async () => {
  // Reset category selection when collection changes
  selectedCategory.value = 'all'

  // Reload stickers data
  loading.value = true
  try {
    const { data } = await axios.get('/data/stickers.json')

    // Get current collection filter
    const allowedTags = collectionStore.allowedAssetTags

    // Filter collections by current collection tags
    const filteredCollections = data.collections.filter((cat: any) => {
      if (!allowedTags || allowedTags.length === 0) return true
      return cat.stickers.some((sticker: any) =>
        sticker.tags?.some((tag: string) => allowedTags.includes(tag))
      )
    })

    // Update categories
    categories.value = filteredCollections
      .filter((cat: any) => cat.stickers.length > 0)
      .map((cat: any) => ({
        id: cat.id || cat.name,
        name: cat.name,
        count: cat.stickers.length,
        collection: cat.collection
      }))

    // Update stickers
    const allStickersFlat: Sticker[] = []
    filteredCollections.forEach((category: any) => {
      category.stickers.forEach((sticker: any) => {
        allStickersFlat.push({
          id: sticker.id,
          path: sticker.path,
          name: sticker.name,
          tags: sticker.tags || [],
          category: category.name || category.id,
          collection: category.collection
        })
      })
    })

    allStickers.value = allStickersFlat
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to reload stickers',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}, { deep: true })

// Handle sticker selection with validation
const selectSticker = (sticker: Sticker) => {
  // Validate sticker tags against collection rules
  const validation = collectionStore.canAddElement({ tags: sticker.tags } as any)

  if (!validation.allowed) {
    $q.notify({
      type: 'warning',
      message: validation.reason || 'This sticker is not allowed in the current collection',
      position: 'top',
      timeout: 3000
    })
    return
  }

  // Emit selection event
  emit('select', sticker.path)
}
</script>

<style scoped>
/* optional small enhancement for smoother tap on mobile */
button, div {
  -webkit-tap-highlight-color: transparent;
}
</style>
