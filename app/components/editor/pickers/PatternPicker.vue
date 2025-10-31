<template>
  <div class="bg-white rounded-lg h-full overflow-x-hidden">


    <div>

      <!-- Search Bar -->
      <div class="px-4 flex flex-col pt-1 pb-2">
        <q-input
            v-model="searchQuery"
            outlined
            dense
            placeholder="Search patterns..."
            clearable
            borderless
            class="bg-gray-100 rounded-md [&_.q-field__control]:bg-gray-100 [&_.q-field__control]:h-9 [&_.q-field__native]:text-sm"
        />
      </div>

      <!-- Category Tabs -->
      <q-tabs
          v-model="selectedCategory"
          dense
          class="text-gray-500 px-4 flex flex-wrap  w-full lg:max-w-[300px] overflow-x-auto"
          active-color="primary"
          indicator-color="primary"
          align="left"
          no-caps
          scrollable="true"
      >
        <q-tab
            v-for="category in backgroundStore.patternCategories"
            :key="category"
            :name="category"
            :label="category"
        />
      </q-tabs>

      <q-separator />
    </div>


    <!-- Pattern Grid (scrollable) -->
    <div class="overflow-x-hidden  px-3 py-2">

      <div class="overflow-x-hidden overflow-scroll ">
        <div v-if="filteredPatterns.length === 0" class="text-center text-gray-500 py-8">
          <q-icon name="sentiment_dissatisfied" size="36px" />
          <div class="mt-1 text-xs">No patterns found</div>
        </div>

        <div v-else class=" grid grid-cols-2 sm:grid-cols-3 overflow-y-scroll md:grid-cols-4 lg:grid-cols-2 gap-3 pb-2  w-full">
          <div
              v-for="pattern in filteredPatterns"
              :key="pattern.id"
              @click="selectPattern(pattern)"
              :class="[
            'cursor-pointer rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md',
            isSelected(pattern)
              ? 'border-primary shadow-[0_0_0_2px_rgba(124,58,237,0.15)]'
              : ''
          ]"
          >
            <div
                class="w-full aspect-square bg-center bg-repeat flex items-center justify-center relative"

            >

                <img
                    :src="pattern.preview"
                    alt="pattern preview"
                    class="w-full h-full object-cover"
                />

              <q-icon
                  v-if="isSelected(pattern)"
                  name="check_circle"
                  color="primary"
                  size="18px"
                  class="bg-white rounded-full p-[2px]"
              />
            </div>
            <div
                :class="[
              'px-1.5 py-1 text-center text-[10px] leading-3 border-t border-gray-100 truncate',
              isSelected(pattern)
                ? 'text-primary font-semibold bg-purple-50'
                : 'text-gray-500 bg-white'
            ]"
            >
              {{ pattern.name }}
            </div>
          </div>
        </div>
      </div>



      <!-- Custom Pattern Options -->
      <div
          v-if="backgroundStore.selectedPattern"
          class="px-4 py-2 border-t border-gray-100"
      >
        <div class="text-[11px] text-gray-600 font-semibold mb-1">
          Customize Pattern
        </div>

        <div>
          <div class="text-[11px] text-gray-600 mb-1">
            Opacity:
            <span class="text-primary font-medium">{{
                Math.round(opacity * 100)
              }}%</span>
          </div>
          <q-slider
              v-model="opacity"
              :min="0.1"
              :max="1"
              :step="0.1"
              color="primary"
              @update:model-value="updateOpacity"
          />
        </div>
      </div>



      <!-- Remove Pattern -->
      <div
          v-if="backgroundStore.selectedPattern"
          class="px-4 pb-3 pt-1 border-t border-gray-100"
      >
        <q-btn
            flat
            color="negative"
            label="Remove Pattern"
            class="w-full"
            icon="close"
            size="sm"
            no-caps
            @click="clearPattern"
        />
      </div>
    </div>

  </div>
</template>


<script setup lang="ts">
import { useBackgroundStore } from '~/store/background'
import type { Pattern } from '~/store/background'
import { initializePatterns } from '~/utils/patternGenerator'
import { useQuasar } from 'quasar'

const backgroundStore = useBackgroundStore()
const $q = useQuasar()

const patterns = ref<Pattern[]>([])
const selectedCategory = ref('All')
const searchQuery = ref('')
const opacity = ref(1)

const filteredPatterns = computed(() => {
  let filtered = patterns.value

  if (selectedCategory.value !== 'All') {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }

  if (searchQuery.value?.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    )
  }

  return filtered
})

const isSelected = (pattern: Pattern) => {
  return backgroundStore.selectedPattern?.id === pattern.id
}

const selectPattern = async (pattern: Pattern) => {
  backgroundStore.setPattern(pattern)
  await nextTick()
  setTimeout(() => {
    const event = new CustomEvent('background-changed')
    window.dispatchEvent(event)
  }, 50)
}

const updateOpacity = (value: number) => {
  backgroundStore.setOpacity(value)
  setTimeout(() => {
    const event = new CustomEvent('background-changed')
    window.dispatchEvent(event)
  }, 10)
}

const clearPattern = () => {
  backgroundStore.clearPattern()
  $q.notify({
    message: 'Pattern removed',
    color: 'info',
    position: 'top',
    timeout: 800,
    icon: 'check_circle'
  })
}

watch(selectedCategory, (newCategory) => {
  backgroundStore.setPatternCategory(newCategory)
})

watch(searchQuery, (newQuery) => {
  backgroundStore.setSearchQuery(newQuery || '')
})

watch(() => backgroundStore.opacity, (newOpacity) => {
  if (newOpacity !== opacity.value) {
    opacity.value = newOpacity
  }
})

onMounted(() => {
  patterns.value = initializePatterns()
  opacity.value = backgroundStore.opacity
  selectedCategory.value = backgroundStore.selectedCategory
})
</script>


