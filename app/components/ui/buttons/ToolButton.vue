<template>
  <button
    :disabled="disabled"
    @click="handleClick"
    :class="[
      'tool-button',
      'flex items-center gap-3 w-full px-4 py-3 mb-2',
      'bg-white border border-gray-200 rounded-lg',
      'text-sm text-gray-700 transition-all duration-300',
      'hover:bg-gray-50 hover:border-gray-300 hover:shadow-md',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
      'active:scale-95',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      variant === 'primary' && 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700',
      variant === 'secondary' && 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200',
      variant === 'danger' && 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300',
      size === 'sm' && 'px-3 py-2 text-xs',
      size === 'lg' && 'px-5 py-4 text-base',
      buttonClass
    ]"
  >
    <span v-if="icon" class="button-icon text-lg">{{ icon }}</span>
    <span v-if="$slots.default" class="button-text">
      <slot></slot>
    </span>
    <span v-if="loading" class="loading-spinner">
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
  </button>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'secondary', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  buttonClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  if (!props.disabled && !props.loading) {
    emit('click');
  }
};
</script>

<style scoped>
.tool-button {
  position: relative;
  overflow: hidden;
  font-weight: 500;
  letter-spacing: 0.025em;
}

.tool-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.tool-button:hover::before {
  left: 100%;
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.tool-button:hover .button-icon {
  transform: scale(1.1);
}

.button-text {
  flex: 1;
  text-align: left;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-button:active {
  transform: scale(0.98);
}

.tool-button:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>

