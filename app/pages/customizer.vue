<template>
  <!-- Loading State -->
  <div v-if="loading" class="loading-container">
    <div class="loading-content">
      <div class="spinner"></div>
      <p class="loading-text">Loading {{ collectionStore.currentCollection?.name || 'Collection' }}...</p>
    </div>
  </div>

  <!-- Editor -->
  <EditorLayout v-else>
    <!-- Collection Indicator -->
    <template #header-extra v-if="collectionStore.isRestrictedCollection">
      <div class="collection-indicator">
        <q-icon name="info_outline" size="16px" />
        <span>{{ collectionStore.currentCollection?.name }} Collection - Restricted Mode</span>
      </div>
    </template>

    <!-- Main content slot -->
    <template #main-content>
      <ImageEditor />
    </template>
  </EditorLayout>
</template>

<script setup lang="ts">
import ImageEditor from '~/components/editor/ImageEditor.vue'
import EditorLayout from '~/components/layouts/EditorLayout.vue'
import { useCollectionStore } from '~/store/collection'
import 'quill/dist/quill.snow.css'

const collectionStore = useCollectionStore()
const route = useRoute()
const loading = ref(true)

onMounted(async () => {
  await collectionStore.loadCollections()

  const collectionParam = route.query.collection as string

  if (collectionParam) {
    await collectionStore.setCollection(collectionParam, true)
  } else {
    await collectionStore.setCollection('general', true)
  }

  loading.value = false
})

watch(() => route.query.collection, async (newCollection) => {
  if (newCollection && typeof newCollection === 'string' && newCollection !== collectionStore.activeCollection) {
    await collectionStore.setCollection(newCollection, false)
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
}

.collection-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  color: #ff9800;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
