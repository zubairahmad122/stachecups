<template>
    <div
      v-if="visible && elementPosition"
      class="helper-buttons"
      :style="buttonsStyle"
    >
      <button
        class="helper-btn rotate-btn"
        @click="$emit('rotate')"
        title="Rotate"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      </button>
  
      <button
        class="helper-btn move-btn"
        :class="{ active: isDragging }"
        @mousedown="handleMoveStart"
        @mouseup="handleMoveEnd"
        @mouseleave="handleMoveEnd"
        title="Drag to move element"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="5,9 2,12 5,15"/>
          <polyline points="9,5 12,2 15,5"/>
          <polyline points="15,19 12,22 9,19"/>
          <polyline points="19,9 22,12 19,15"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="12" y1="2" x2="12" y2="22"/>
        </svg>
      </button>
    </div>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue'
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    elementPosition: {
      type: Object,
      default: null
    },
    elementSize: {
      type: Object,
      default: () => ({ width: 0, height: 0 })
    },
    isInMoveMode: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['rotate', 'move', 'drag-move'])
  
  const isDragging = ref(false)
  const dragStartPos = ref({ x: 0, y: 0 })
  const elementStartPos = ref({ x: 0, y: 0 })
  
  const handleMoveStart = (e) => {
    if (!props.elementPosition ||
        typeof props.elementPosition.x !== 'number' ||
        typeof props.elementPosition.y !== 'number') {
      return
    }
    
    isDragging.value = true
    dragStartPos.value = { x: e.clientX, y: e.clientY }
    elementStartPos.value = { ...props.elementPosition }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMoveEnd)
    
    e.preventDefault()
  }
  
  const handleMouseMove = (e) => {
    if (!isDragging.value) return
    
    const deltaX = e.clientX - dragStartPos.value.x
    const deltaY = e.clientY - dragStartPos.value.y
    
    const startX = elementStartPos.value.x || 0
    const startY = elementStartPos.value.y || 0
    
    const newPosition = {
      x: startX + deltaX,
      y: startY + deltaY
    }
    
    if (isNaN(newPosition.x) || isNaN(newPosition.y)) return;
    
    emit('drag-move', newPosition)
  }
  
  const handleMoveEnd = () => {
    isDragging.value = false
    
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMoveEnd)
  }
  
  const buttonsStyle = computed(() => {
    if (!props.elementPosition || !props.elementSize) return { display: 'none' }
    
    const isSmallElement = props.elementSize.height < 20;
    const offset = isSmallElement ? 8 : 15;
    const top = props.elementPosition.y + (props.elementSize.height / 2) + offset
    const left = props.elementPosition.x + (props.elementSize.width / 2)
    
    // Ensure buttons don't appear at the very top of the canvas
    const safeTop = Math.max(10, top)
    
    return {
      position: 'absolute',
      top: `${safeTop}px`,
      left: `${left}px`,
      transform: 'translateX(-50%)',
      zIndex: 10,
      pointerEvents: 'auto'
    }
  })
  </script>
  
  <style scoped>
  .helper-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .helper-btn {
    width: 44px;
    height: 44px;
    border: none;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s ease;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .helper-btn:hover {
    background: rgba(255, 255, 255, 1);
    color: #374151;
    transform: scale(1.08);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  .helper-btn.rotate-btn:hover {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }
  
  .helper-btn.move-btn:hover {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }
  
  .helper-btn.move-btn.active {
    background: #10b981;
    color: white;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  }
  
  .helper-btn:active {
    transform: scale(0.95);
  }
  
  .helper-btn svg {
    pointer-events: none;
  }
  </style>
  