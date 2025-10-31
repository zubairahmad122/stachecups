<template>
  <div class="snap-guides-container">
    <!-- Vertical Guides -->
    <div
      v-for="guide in verticalGuides"
      :key="`v-${guide.position}`"
      class="snap-guide snap-guide-vertical"
      :class="{
        'snap-guide-edge': guide.type === 'edge',
        'snap-guide-element': guide.type === 'element',
        'snap-guide-center': guide.type === 'center'
      }"
      :style="{ left: `${guide.position}px` }"
    >
      <div class="guide-line"></div>
      <div v-if="guide.type !== 'center'" class="guide-label">{{ Math.round(guide.position) }}px</div>
    </div>

    <!-- Horizontal Guides -->
    <div
      v-for="guide in horizontalGuides"
      :key="`h-${guide.position}`"
      class="snap-guide snap-guide-horizontal"
      :class="{
        'snap-guide-edge': guide.type === 'edge',
        'snap-guide-element': guide.type === 'element',
        'snap-guide-center': guide.type === 'center'
      }"
      :style="{ top: `${guide.position}px` }"
    >
      <div class="guide-line"></div>
      <div v-if="guide.type !== 'center'" class="guide-label">{{ Math.round(guide.position) }}px</div>
    </div>

    <!-- Distance Measurements -->
    <div
      v-for="measurement in measurements"
      :key="`measure-${measurement.id}`"
      class="distance-measurement"
      :class="measurement.direction"
      :style="{
        left: `${measurement.x}px`,
        top: `${measurement.y}px`,
        width: measurement.direction === 'horizontal' ? `${measurement.length}px` : '2px',
        height: measurement.direction === 'vertical' ? `${measurement.length}px` : '2px'
      }"
    >
      <div class="measurement-line"></div>
      <div class="measurement-label">{{ Math.round(measurement.distance) }}px</div>
      <div class="measurement-cap measurement-cap-start"></div>
      <div class="measurement-cap measurement-cap-end"></div>
    </div>

    <!-- Element Size Tooltip -->
    <div
      v-if="selectedElement && showSizeTooltip"
      class="size-tooltip"
      :style="{
        left: `${sizeTooltipPosition.x}px`,
        top: `${sizeTooltipPosition.y}px`
      }"
    >
      <div class="size-info">
        <span class="size-dimension">W: {{ Math.round(selectedElement.width * (selectedElement.scale || 1)) }}</span>
        <span class="size-separator">×</span>
        <span class="size-dimension">H: {{ Math.round(selectedElement.height * (selectedElement.scale || 1)) }}</span>
      </div>
      <div class="position-info">
        <span class="position-coord">X: {{ Math.round(selectedElement.position.x) }}</span>
        <span class="position-coord">Y: {{ Math.round(selectedElement.position.y) }}</span>
      </div>
    </div>

    <!-- Center Guides (Canvas) - Always visible when element is selected -->
    <div
      v-if="showCenterGuides && selectedElement"
      class="snap-guide snap-guide-vertical snap-guide-center snap-guide-persistent"
      :style="{ left: `${canvasWidth / 2}px` }"
    >
      <div class="guide-line"></div>
    </div>

    <div
      v-if="showCenterGuides && selectedElement"
      class="snap-guide snap-guide-horizontal snap-guide-center snap-guide-persistent"
      :style="{ top: `${canvasHeight / 2}px` }"
    >
      <div class="guide-line"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  canvasWidth: {
    type: Number,
    required: true,
  },
  canvasHeight: {
    type: Number,
    required: true,
  },
  selectedElement: {
    type: Object,
    default: null,
  },
  showCenterGuides: {
    type: Boolean,
    default: true,
  },
  snapThreshold: {
    type: Number,
    default: 5, // pixels
  },
  otherElements: {
    type: Array,
    default: () => [],
  },
})

const verticalGuides = ref([])
const horizontalGuides = ref([])
const measurements = ref([])
const showSizeTooltip = ref(false)

// Calculate size tooltip position
const sizeTooltipPosition = computed(() => {
  if (!props.selectedElement) return { x: 0, y: 0 }

  const element = props.selectedElement
  const width = element.width * (element.scale || 1)
  const height = element.height * (element.scale || 1)

  // Position tooltip above element, centered
  return {
    x: element.position.x + width / 2,
    y: element.position.y - 60
  }
})

// Calculate distance measurements between elements
const calculateMeasurements = () => {
  if (!props.selectedElement) {
    measurements.value = []
    return
  }

  const newMeasurements = []
  const selectedPos = props.selectedElement.position
  const selectedWidth = props.selectedElement.width * (props.selectedElement.scale || 1)
  const selectedHeight = props.selectedElement.height * (props.selectedElement.scale || 1)

  const selectedLeft = selectedPos.x
  const selectedRight = selectedPos.x + selectedWidth
  const selectedTop = selectedPos.y
  const selectedBottom = selectedPos.y + selectedHeight

  // Find closest elements for distance measurement
  props.otherElements.forEach((element) => {
    if (element.id === props.selectedElement.id) return

    const elemWidth = element.width * (element.scale || 1)
    const elemHeight = element.height * (element.scale || 1)
    const elemLeft = element.position.x
    const elemRight = element.position.x + elemWidth
    const elemTop = element.position.y
    const elemBottom = element.position.y + elemHeight

    // Horizontal distance measurements
    // Selected element to the left of other element
    if (selectedRight < elemLeft && Math.abs(selectedTop - elemTop) < 50) {
      const distance = elemLeft - selectedRight
      if (distance < 200) {
        newMeasurements.push({
          id: `h-${element.id}`,
          direction: 'horizontal',
          x: selectedRight,
          y: (selectedTop + selectedBottom) / 2,
          length: distance,
          distance: distance
        })
      }
    }
    // Selected element to the right of other element
    else if (selectedLeft > elemRight && Math.abs(selectedTop - elemTop) < 50) {
      const distance = selectedLeft - elemRight
      if (distance < 200) {
        newMeasurements.push({
          id: `h-${element.id}`,
          direction: 'horizontal',
          x: elemRight,
          y: (selectedTop + selectedBottom) / 2,
          length: distance,
          distance: distance
        })
      }
    }

    // Vertical distance measurements
    // Selected element above other element
    if (selectedBottom < elemTop && Math.abs(selectedLeft - elemLeft) < 50) {
      const distance = elemTop - selectedBottom
      if (distance < 200) {
        newMeasurements.push({
          id: `v-${element.id}`,
          direction: 'vertical',
          x: (selectedLeft + selectedRight) / 2,
          y: selectedBottom,
          length: distance,
          distance: distance
        })
      }
    }
    // Selected element below other element
    else if (selectedTop > elemBottom && Math.abs(selectedLeft - elemLeft) < 50) {
      const distance = selectedTop - elemBottom
      if (distance < 200) {
        newMeasurements.push({
          id: `v-${element.id}`,
          direction: 'vertical',
          x: (selectedLeft + selectedRight) / 2,
          y: elemBottom,
          length: distance,
          distance: distance
        })
      }
    }
  })

  measurements.value = newMeasurements
}

// Calculate snap guide positions
const calculateGuides = () => {
  if (!props.selectedElement) {
    verticalGuides.value = []
    horizontalGuides.value = []
    return
  }

  const newVerticalGuides = []
  const newHorizontalGuides = []

  const selectedPos = props.selectedElement.position
  const selectedWidth = props.selectedElement.width * (props.selectedElement.scale || 1)
  const selectedHeight = props.selectedElement.height * (props.selectedElement.scale || 1)

  const selectedLeft = selectedPos.x
  const selectedRight = selectedPos.x + selectedWidth
  const selectedCenterX = selectedPos.x + selectedWidth / 2

  const selectedTop = selectedPos.y
  const selectedBottom = selectedPos.y + selectedHeight
  const selectedCenterY = selectedPos.y + selectedHeight / 2

  // Canvas edge guides
  const canvasEdges = {
    vertical: [0, props.canvasWidth / 2, props.canvasWidth],
    horizontal: [0, props.canvasHeight / 2, props.canvasHeight],
  }

  // Check canvas edge snapping
  canvasEdges.vertical.forEach((edgePos) => {
    if (Math.abs(selectedLeft - edgePos) <= props.snapThreshold) {
      newVerticalGuides.push({ position: edgePos, type: 'edge' })
    }
    if (Math.abs(selectedRight - edgePos) <= props.snapThreshold) {
      newVerticalGuides.push({ position: edgePos, type: 'edge' })
    }
    if (Math.abs(selectedCenterX - edgePos) <= props.snapThreshold) {
      newVerticalGuides.push({ position: edgePos, type: 'center' })
    }
  })

  canvasEdges.horizontal.forEach((edgePos) => {
    if (Math.abs(selectedTop - edgePos) <= props.snapThreshold) {
      newHorizontalGuides.push({ position: edgePos, type: 'edge' })
    }
    if (Math.abs(selectedBottom - edgePos) <= props.snapThreshold) {
      newHorizontalGuides.push({ position: edgePos, type: 'edge' })
    }
    if (Math.abs(selectedCenterY - edgePos) <= props.snapThreshold) {
      newHorizontalGuides.push({ position: edgePos, type: 'center' })
    }
  })

  // Check element-to-element snapping
  props.otherElements.forEach((element) => {
    if (element.id === props.selectedElement.id) return

    const elemWidth = element.width * (element.scale || 1)
    const elemHeight = element.height * (element.scale || 1)

    const elemLeft = element.position.x
    const elemRight = element.position.x + elemWidth
    const elemCenterX = element.position.x + elemWidth / 2

    const elemTop = element.position.y
    const elemBottom = element.position.y + elemHeight
    const elemCenterY = element.position.y + elemHeight / 2

    // Vertical alignment checks
    // Left to Left
    if (Math.abs(selectedLeft - elemLeft) <= props.snapThreshold) {
      newVerticalGuides.push({ position: elemLeft, type: 'element' })
    }
    // Right to Right
    if (Math.abs(selectedRight - elemRight) <= props.snapThreshold) {
      newVerticalGuides.push({ position: elemRight, type: 'element' })
    }
    // Left to Right
    if (Math.abs(selectedLeft - elemRight) <= props.snapThreshold) {
      newVerticalGuides.push({ position: elemRight, type: 'element' })
    }
    // Right to Left
    if (Math.abs(selectedRight - elemLeft) <= props.snapThreshold) {
      newVerticalGuides.push({ position: elemLeft, type: 'element' })
    }
    // Center to Center (X)
    if (Math.abs(selectedCenterX - elemCenterX) <= props.snapThreshold) {
      newVerticalGuides.push({ position: elemCenterX, type: 'center' })
    }

    // Horizontal alignment checks
    // Top to Top
    if (Math.abs(selectedTop - elemTop) <= props.snapThreshold) {
      newHorizontalGuides.push({ position: elemTop, type: 'element' })
    }
    // Bottom to Bottom
    if (Math.abs(selectedBottom - elemBottom) <= props.snapThreshold) {
      newHorizontalGuides.push({ position: elemBottom, type: 'element' })
    }
    // Top to Bottom
    if (Math.abs(selectedTop - elemBottom) <= props.snapThreshold) {
      newHorizontalGuides.push({ position: elemBottom, type: 'element' })
    }
    // Bottom to Top
    if (Math.abs(selectedBottom - elemTop) <= props.snapThreshold) {
      newHorizontalGuides.push({ position: elemTop, type: 'element' })
    }
    // Center to Center (Y)
    if (Math.abs(selectedCenterY - elemCenterY) <= props.snapThreshold) {
      newHorizontalGuides.push({ position: elemCenterY, type: 'center' })
    }
  })

  // Remove duplicates
  verticalGuides.value = Array.from(
    new Map(newVerticalGuides.map((g) => [g.position, g])).values()
  )
  horizontalGuides.value = Array.from(
    new Map(newHorizontalGuides.map((g) => [g.position, g])).values()
  )
}

// Watch for changes
watch(
  () => [props.selectedElement, props.otherElements],
  () => {
    calculateGuides()
    calculateMeasurements()
    showSizeTooltip.value = !!props.selectedElement
  },
  { deep: true, immediate: true }
)

// Export snap function
const getSnappedPosition = (x, y, width, height) => {
  let snappedX = x
  let snappedY = y

  const centerX = x + width / 2
  const centerY = y + height / 2
  const right = x + width
  const bottom = y + height

  // Canvas edge snapping - X axis
  const canvasVerticalEdges = [0, props.canvasWidth / 2, props.canvasWidth]
  canvasVerticalEdges.forEach((edgePos) => {
    if (Math.abs(x - edgePos) <= props.snapThreshold) {
      snappedX = edgePos
    } else if (Math.abs(right - edgePos) <= props.snapThreshold) {
      snappedX = edgePos - width
    } else if (Math.abs(centerX - edgePos) <= props.snapThreshold) {
      snappedX = edgePos - width / 2
    }
  })

  // Canvas edge snapping - Y axis
  const canvasHorizontalEdges = [0, props.canvasHeight / 2, props.canvasHeight]
  canvasHorizontalEdges.forEach((edgePos) => {
    if (Math.abs(y - edgePos) <= props.snapThreshold) {
      snappedY = edgePos
    } else if (Math.abs(bottom - edgePos) <= props.snapThreshold) {
      snappedY = edgePos - height
    } else if (Math.abs(centerY - edgePos) <= props.snapThreshold) {
      snappedY = edgePos - height / 2
    }
  })

  // Element-to-element snapping
  props.otherElements.forEach((element) => {
    if (props.selectedElement && element.id === props.selectedElement.id) return

    const elemWidth = element.width * (element.scale || 1)
    const elemHeight = element.height * (element.scale || 1)

    const elemLeft = element.position.x
    const elemRight = element.position.x + elemWidth
    const elemCenterX = element.position.x + elemWidth / 2

    const elemTop = element.position.y
    const elemBottom = element.position.y + elemHeight
    const elemCenterY = element.position.y + elemHeight / 2

    // X axis element snapping
    if (Math.abs(x - elemLeft) <= props.snapThreshold) {
      snappedX = elemLeft
    } else if (Math.abs(x - elemRight) <= props.snapThreshold) {
      snappedX = elemRight
    } else if (Math.abs(right - elemLeft) <= props.snapThreshold) {
      snappedX = elemLeft - width
    } else if (Math.abs(right - elemRight) <= props.snapThreshold) {
      snappedX = elemRight - width
    } else if (Math.abs(centerX - elemCenterX) <= props.snapThreshold) {
      snappedX = elemCenterX - width / 2
    }

    // Y axis element snapping
    if (Math.abs(y - elemTop) <= props.snapThreshold) {
      snappedY = elemTop
    } else if (Math.abs(y - elemBottom) <= props.snapThreshold) {
      snappedY = elemBottom
    } else if (Math.abs(bottom - elemTop) <= props.snapThreshold) {
      snappedY = elemTop - height
    } else if (Math.abs(bottom - elemBottom) <= props.snapThreshold) {
      snappedY = elemBottom - height
    } else if (Math.abs(centerY - elemCenterY) <= props.snapThreshold) {
      snappedY = elemCenterY - height / 2
    }
  })

  return { x: snappedX, y: snappedY }
}

defineExpose({
  getSnappedPosition,
})
</script>

<style scoped>
.snap-guides-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.snap-guide {
  position: absolute;
  pointer-events: none;
  animation: guideFadeIn 0.15s ease-out;
}

.snap-guide-vertical {
  top: 0;
  bottom: 0;
  width: 1px;
}

.snap-guide-horizontal {
  left: 0;
  right: 0;
  height: 1px;
}

.guide-line {
  width: 100%;
  height: 100%;
  background: #3b82f6;
  box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
}

/* Edge guides - Blue */
.snap-guide-edge .guide-line {
  background: #3b82f6;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
}

/* Element guides - Pink/Magenta */
.snap-guide-element .guide-line {
  background: #ec4899;
  box-shadow: 0 0 6px rgba(236, 72, 153, 0.6);
}

/* Center guides - Purple */
.snap-guide-center .guide-line {
  background: #8b5cf6;
  box-shadow: 0 0 4px rgba(139, 92, 246, 0.5);
}

/* Persistent center guides (slightly transparent) */
.snap-guide-persistent .guide-line {
  background: rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 2px rgba(139, 92, 246, 0.3);
}

.guide-label {
  position: absolute;
  background: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.snap-guide-vertical .guide-label {
  top: 4px;
  left: 4px;
}

.snap-guide-horizontal .guide-label {
  left: 4px;
  top: 4px;
}

.snap-guide-center .guide-label {
  background: #8b5cf6;
}

.snap-guide-element .guide-label {
  background: #ec4899;
}

/* Distance Measurements */
.distance-measurement {
  position: absolute;
  pointer-events: none;
  animation: guideFadeIn 0.2s ease-out;
}

.measurement-line {
  width: 100%;
  height: 100%;
  background: #f59e0b;
  position: relative;
}

.measurement-label {
  position: absolute;
  background: #f59e0b;
  color: white;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
  z-index: 10;
}

.distance-measurement.horizontal .measurement-label {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.distance-measurement.vertical .measurement-label {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(-90deg);
  transform-origin: center;
}

.measurement-cap {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.distance-measurement.horizontal .measurement-cap-start {
  left: 0;
  top: 50%;
}

.distance-measurement.horizontal .measurement-cap-end {
  left: 100%;
  top: 50%;
}

.distance-measurement.vertical .measurement-cap-start {
  left: 50%;
  top: 0;
}

.distance-measurement.vertical .measurement-cap-end {
  left: 50%;
  top: 100%;
}

/* Size and Position Tooltip */
.size-tooltip {
  position: absolute;
  background: rgba(17, 24, 39, 0.95);
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  animation: tooltipFadeIn 0.2s ease-out;
  transform: translateX(-50%);
  white-space: nowrap;
}

.size-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.size-dimension {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #60a5fa;
}

.size-separator {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
}

.position-info {
  display: flex;
  gap: 12px;
}

.position-coord {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #a78bfa;
}

@keyframes guideFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
