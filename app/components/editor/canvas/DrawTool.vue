<template>
  <v-layer ref="fillsLayer">
    <template v-for="(fill, index) in bucketFills" :key="`fill-${index}`">
      <v-rect :config="getBucketFillConfig(fill)" />
    </template>
  </v-layer>

  <v-layer ref="linesLayer">
    <template v-for="(line, index) in lines" :key="`line-${index}`">
      <v-line :config="getLineConfig(line)" />
    </template>

    <v-line v-if="isDrawing && currentLine.length > 0" :config="getCurrentLineConfig()" />
  </v-layer>
</template>

<script setup>
import Konva from 'konva';

const props = defineProps({
  width: {
    type: Number,
    default: 300
  },
  height: {
    type: Number,
    default: 150
  },
  lineWidth: {
    type: Number,
    default: 5
  },
  lineColor: {
    type: String,
    default: '#000000'
  },
  active: {
    type: Boolean,
    default: false
  },
  stage: {
    type: Object,
    default: null
  },
  selectedElementId: {
    type: String,
    default: null
  },
  toolMode: {
    type: String,
    default: 'brush'
  },
  eraserSize: {
    type: Number,
    default: 10
  },
  bucketColor: {
    type: String,
    default: '#000000'
  }
});

const emit = defineEmits(['update:drawing', 'draw-end']);

const lines = ref([]);
const currentLine = ref([]);
const isDrawing = ref(false);
const bucketFills = ref([]);
const fillsLayer = ref(null);
const linesLayer = ref(null);

const getLineConfig = (line) => ({
  points: line.points,
  stroke: line.isEraser ? '#FFFFFF' : line.color,
  strokeWidth: line.width,
  tension: 0.5,
  lineCap: 'round',
  lineJoin: 'round',
  globalCompositeOperation: line.isEraser ? 'destination-out' : 'source-over',
});

const getCurrentLineConfig = () => ({
  points: currentLine.value,
  stroke: props.toolMode === 'eraser' ? '#FFFFFF' : props.lineColor,
  strokeWidth: props.toolMode === 'eraser' ? props.eraserSize : props.lineWidth,
  tension: 0.5,
  lineCap: 'round',
  lineJoin: 'round',
  globalCompositeOperation: props.toolMode === 'eraser' ? 'destination-out' : 'source-over',
});

const getBucketFillConfig = (fill) => ({
  x: 0,
  y: 0,
  width: props.width,
  height: props.height,
  fill: fill.color,
  listening: false,
  opacity: 1
});

const handleMouseDown = (e) => {
  if (!props.active || !props.stage || props.selectedElementId) return;

  const pos = props.stage.getPointerPosition();

  if (props.toolMode === 'bucket') {
    handleBucketFill(pos.x, pos.y);
    return;
  }

  isDrawing.value = true;
  currentLine.value = [pos.x, pos.y];
};

const handleMouseMove = (e) => {
  if (!isDrawing.value || !props.active || !props.stage) return;

  const pos = props.stage.getPointerPosition();

  if (pos.x < 0 || pos.x > props.width || pos.y < 0 || pos.y > props.height) return;

  currentLine.value = currentLine.value.concat([pos.x, pos.y]);
};

const handleMouseUp = () => {
  if (!isDrawing.value) return;

  isDrawing.value = false;

  if (currentLine.value.length > 4) {
    lines.value.push({
      points: [...currentLine.value],
      color: props.toolMode === 'eraser' ? '#FFFFFF' : props.lineColor,
      width: props.toolMode === 'eraser' ? props.eraserSize : props.lineWidth,
      isEraser: props.toolMode === 'eraser'
    });
  }

  currentLine.value = [];
  emit('update:drawing', { lines: lines.value, fills: bucketFills.value });
};

const handleBucketFill = (x, y) => {
  bucketFills.value = [{ color: props.bucketColor }];
  emit('update:drawing', { lines: lines.value, fills: bucketFills.value });
};

const clearCanvas = () => {
  lines.value = [];
  bucketFills.value = [];
  currentLine.value = [];
  isDrawing.value = false;
  emit('update:drawing', null);
};

const undoLastStroke = () => {
  if (bucketFills.value.length > 0) {
    bucketFills.value.pop();
  } else if (lines.value.length > 0) {
    lines.value.pop();
  }
  emit('update:drawing', { lines: lines.value, fills: bucketFills.value });
};

const getDrawingBounds = () => {
  if (lines.value.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  lines.value.forEach(line => {
    for (let i = 0; i < line.points.length; i += 2) {
      minX = Math.min(minX, line.points[i]);
      minY = Math.min(minY, line.points[i + 1]);
      maxX = Math.max(maxX, line.points[i]);
      maxY = Math.max(maxY, line.points[i + 1]);
    }
  });

  const padding = 10;
  return {
    left: Math.max(0, minX - padding),
    top: Math.max(0, minY - padding),
    width: Math.min(props.width, maxX + padding) - Math.max(0, minX - padding),
    height: Math.min(props.height, maxY + padding) - Math.max(0, minY - padding),
    isEmpty: false
  };
};

const downloadDrawing = () => {
  const boundingBox = getDrawingBounds();
  if (!boundingBox || boundingBox.isEmpty || (lines.value.length === 0 && bucketFills.value.length === 0)) {
    return { imageData: null };
  }

  const tempStage = new Konva.Stage({
    container: document.createElement('div'),
    width: boundingBox.width,
    height: boundingBox.height
  });

  const tempFillLayer = new Konva.Layer();
  const tempLineLayer = new Konva.Layer();
  tempStage.add(tempFillLayer);
  tempStage.add(tempLineLayer);

  bucketFills.value.forEach(fill => {
    tempFillLayer.add(new Konva.Rect({
      x: 0, y: 0,
      width: boundingBox.width,
      height: boundingBox.height,
      fill: fill.color
    }));
  });

  lines.value.forEach(line => {
    const adjustedPoints = [];
    for (let i = 0; i < line.points.length; i += 2) {
      adjustedPoints.push(line.points[i] - boundingBox.left, line.points[i + 1] - boundingBox.top);
    }

    tempLineLayer.add(new Konva.Line({
      points: adjustedPoints,
      stroke: line.color,
      strokeWidth: line.width,
      tension: 0.5,
      lineCap: 'round',
      lineJoin: 'round',
      globalCompositeOperation: line.isEraser ? 'destination-out' : 'source-over'
    }));
  });

  const imageData = tempStage.toDataURL({ mimeType: 'image/png' });
  tempStage.destroy();

  return { imageData, ...boundingBox };
};

watch(() => [props.active, props.stage], ([active, stage]) => {
  if (active && stage) {
    stage.on('mousedown touchstart', handleMouseDown);
    stage.on('mousemove touchmove', handleMouseMove);
    stage.on('mouseup touchend', handleMouseUp);
  } else if (stage) {
    stage.off('mousedown touchstart', handleMouseDown);
    stage.off('mousemove touchmove', handleMouseMove);
    stage.off('mouseup touchend', handleMouseUp);
  }
}, { immediate: true });

onUnmounted(() => {
  if (props.stage) {
    props.stage.off('mousedown touchstart', handleMouseDown);
    props.stage.off('mousemove touchmove', handleMouseMove);
    props.stage.off('mouseup touchend', handleMouseUp);
  }
});

defineExpose({ clearCanvas, undoLastStroke, downloadDrawing });
</script>

<style scoped>
</style>
