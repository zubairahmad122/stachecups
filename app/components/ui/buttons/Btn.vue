<template>
  <q-btn 
    :no-caps="noCaps"
    :rounded="rounded"
    :unelevated="unelevated"
    :dense="dense"
    :flat="flat"
    :outline="outline"
    :color="color"
    :text-color="textColor"
    :size="size"
    :disable="disabled"
    :loading="loading"
    :icon="icon"
    :class="buttonClass"
    :style="buttonStyle"
    @click="handleClick"
  >
    <div v-if="$slots.default" class="button-content">
      <slot />
    </div>
  </q-btn>
</template>

<script setup>
const props = defineProps({
  noCaps: {
    type: Boolean,
    default: true
  },
  rounded: {
    type: Boolean,
    default: true
  },
  unelevated: {
    type: Boolean,
    default: true
  },
  dense: {
    type: Boolean,
    default: true
  },
  flat: {
    type: Boolean,
    default: true
  },
  outline: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'primary'
  },
  textColor: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  buttonClass: {
    type: String,
    default: ''
  },
  buttonStyle: {
    type: String,
    default: 'width: 100%; text-align: center'
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.q-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  letter-spacing: 0.025em;
}

.q-btn:hover:not(.q-btn--disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.q-btn:active:not(.q-btn--disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.q-btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
