<template>
  <div
    @click="handleClick"
    class="flex items-center gap-3 p-3 mb-2 bg-gray-50 border border-gray-200 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 relative group"
  >
    <!-- Thumbnail -->
    <div class="w-12 h-12 flex-shrink-0 overflow-hidden rounded bg-white">
      <img
        :src="design.thumbnail"
        :alt="design.name"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Design Info -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-900 truncate">
        {{ design.name }}
      </p>
      <p class="text-xs text-gray-500">
        {{ formattedDate }}
      </p>
    </div>

    <!-- Delete Button -->
    <button
      @click.stop="handleDelete"
      class="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 border-none rounded text-lg transition-all duration-200 hover:bg-red-200 opacity-0 group-hover:opacity-100"
      title="Delete design"
    >
      ×
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  design: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click', 'delete']);

const formattedDate = computed(() => {
  return new Date(props.design.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const handleClick = () => {
  emit('click', props.design);
};

const handleDelete = () => {
  emit('delete', props.design.id);
};
</script>

