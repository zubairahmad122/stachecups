<template>
  <v-group
    :config="groupConfig"
    @click="handleClick"
    @tap="handleClick"
    @dblclick="handleDoubleClick"
    @dbltap="handleDoubleClick"
    @dragstart="handleDragStart"
    @dragmove="handleDragMove"
    @dragend="handleDragEnd"
    @transformstart="handleTransformStart"
    @transform="handleTransform"
    @transformend="handleTransformEnd"
  >
    <v-group v-if="elementType === 'image'" :config="{ clipFunc: hasFrame ? getClipFunc : undefined }">
      <v-image
        ref="konvaImageRef"
        :config="imageConfig"
      />
    </v-group>

    <!-- Circle monogram with three separate text elements -->
    <v-group v-else-if="props.element.type === 'monogram' && props.element.layoutStyle === 'circle' && !isEditing">
      <v-text
        v-for="(letterConfig, index) in circleMonogramConfigs"
        :key="`circle-letter-${props.element.id}-${index}`"
        ref="konvaTextRef"
        :config="letterConfig"
      />
    </v-group>

    <!-- Stacked monogram with three separate text elements (middle letter larger) -->
    <v-group v-else-if="props.element.type === 'monogram' && props.element.layoutStyle === 'stacked' && !isEditing">
      <v-text
        v-for="(letterConfig, index) in stackedMonogramConfigs"
        :key="`stacked-letter-${props.element.id}-${index}`"
        ref="konvaTextRef"
        :config="letterConfig"
      />
    </v-group>

    <v-text
      v-else-if="(props.element.type === 'text' || props.element.type === 'monogram') && !isEditing"
      ref="konvaTextRef"
      :key="`text-${props.element.id}-${props.element.font}-${props.element.fontSize}-${props.element.content?.length || 0}`"
      :config="textConfig"
    />

    <v-text
      v-else-if="props.element.type === 'emoji' && !isEditing"
      ref="konvaTextRef"
      :config="textConfig"
    />
  </v-group>

  
  <textarea
    v-if="isEditing && elementType === 'text' && !isLooped"
    ref="textInputRef"
    v-model="editingText"
    class="konva-text-editor"
    :style="konvaTextEditorStyle"
    @blur="finishEditing"
    @keydown.enter.prevent="finishEditing"
    @keydown.escape.prevent="cancelEditing"
    @input="updateTextWidth"
    @keydown.stop
  />

  
</template>

<script setup>
import Konva from 'konva';
import { ref, computed, watch, nextTick, onMounted, onUnmounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  element: {
    type: Object,
    required: true
  },
  elementType: {
    type: String,
    required: true,
    validator: (value) => ['image', 'text', 'emoji', 'monogram'].includes(value)
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isDragging: {
    type: Boolean,
    default: false
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  isLooped: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isDrawToolActive: {
    type: Boolean,
    default: false
  },
  canvasWidth: {
    type: Number,
    default: 952
  },
  canvasHeight: {
    type: Number,
    default: 550
  }
});

const emit = defineEmits([
  'select',
  'delete',
  'edit-start',
  'edit-finish',
  'edit-content',
  'update:element'
]);

const konvaImageRef = ref(null);
const konvaTextRef = ref(null);
const textInputRef = ref(null);

const loadedImage = ref(null);
const originalImageSize = ref({ width: 0, height: 0 });
const editingText = ref('');

let batchDrawScheduled = false;
let batchDrawFrameId = null;
let textUpdateTimeout = null;
let pendingTextUpdate = null;

const baseFontSize = 16;

const textMeasurementCache = new Map();

const getTextMeasurements = (text, fontSize, font, fontStyle, letterSpacing, lineHeight) => {
  const cacheKey = `${text}|${fontSize}|${font}|${fontStyle}|${letterSpacing}|${lineHeight}`;

  if (textMeasurementCache.has(cacheKey)) {
    return textMeasurementCache.get(cacheKey);
  }

  const tempText = new Konva.Text({
    text,
    fontSize,
    fontFamily: font,
    fontStyle,
    letterSpacing,
    lineHeight,
  });

  const measurements = {
    width: tempText.width(),
    height: tempText.height(),
  };

  tempText.destroy();

  if (textMeasurementCache.size > 100) {
    const firstKey = textMeasurementCache.keys().next().value;
    textMeasurementCache.delete(firstKey);
  }

  textMeasurementCache.set(cacheKey, measurements);
  return measurements;
};

const hasFrame = computed(() => {
  return props.element.frame && props.element.frame.shape && props.element.frame.shape !== 'none'
});

const getClipFunc = (ctx) => {
  if (!props.element.frame || !hasFrame.value) return;
  
  const shape = props.element.frame.shape;
  let width, height;
  
  if (props.element.isDrawing && props.element.originalWidth && props.element.originalHeight) {
    width = props.element.originalWidth;
    height = props.element.originalHeight;
  } else {
    width = originalImageSize.value.width;
    height = originalImageSize.value.height;
  }
  
  const centerX = 0;
  const centerY = 0;
  const radius = Math.min(width, height) / 2;
  
  ctx.beginPath();
  
  switch (shape) {
    case 'circle':
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      break;
      
    case 'square':
      ctx.rect(-width / 2, -height / 2, width, height);
      break;
      
    case 'rounded-square':
      const cornerRadius = Math.min(width, height) * 0.2;
      const x = -width / 2;
      const y = -height / 2;
      ctx.moveTo(x + cornerRadius, y);
      ctx.lineTo(x + width - cornerRadius, y);
      ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
      ctx.lineTo(x + width, y + height - cornerRadius);
      ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
      ctx.lineTo(x + cornerRadius, y + height);
      ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
      ctx.lineTo(x, y + cornerRadius);
      ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
      break;
      
    case 'heart':
      const heartScale = radius / 50;
      ctx.moveTo(0, -15 * heartScale);
      ctx.bezierCurveTo(-20 * heartScale, -35 * heartScale, -40 * heartScale, -15 * heartScale, 0, 20 * heartScale);
      ctx.bezierCurveTo(40 * heartScale, -15 * heartScale, 20 * heartScale, -35 * heartScale, 0, -15 * heartScale);
      break;
      
    case 'star':
      const starRadius = radius;
      const innerRadius = starRadius * 0.5;
      const points = 5;
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const r = i % 2 === 0 ? starRadius : innerRadius;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
      
    case 'hexagon':
      const hexRadius = radius;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = hexRadius * Math.cos(angle);
        const y = hexRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
      
    case 'octagon':
      const octRadius = radius;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x = octRadius * Math.cos(angle);
        const y = octRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
      
    case 'diamond':
      ctx.moveTo(0, -radius);
      ctx.lineTo(radius, 0);
      ctx.lineTo(0, radius);
      ctx.lineTo(-radius, 0);
      ctx.closePath();
      break;
      
    default:
      // No clipping
      ctx.rect(-width / 2, -height / 2, width, height);
  }
  
  ctx.closePath();
};

const getElementBounds = () => {
  const scale = props.element.scale || 1;
  const fontSize = props.element.fontSize || 16;

  if (props.elementType === 'text' || (props.element.type === 'text')) {
    const content = stripHtml(props.element.content) || 'Your text';
    const textWidth = Math.max(30, content.length * fontSize * 0.6) * scale;
    const textHeight = (fontSize * 1.5) * scale;
    return { width: textWidth, height: textHeight };
  } else if (props.element.type === 'monogram') {
    const layoutStyle = props.element.layoutStyle || 'horizontal';

    if (layoutStyle === 'circle') {
      // Circle monograms render with all three fonts overlapping
      const dimension = (fontSize * 3) * scale;
      return { width: dimension, height: dimension };
    } else if (layoutStyle === 'stacked' || layoutStyle === 'vertical') {
      // Vertical layouts are taller
      const spacing = props.element.spacing || 10;
      const width = (fontSize * 2) * scale;
      const height = ((fontSize * 3) + (spacing * 2) + 40) * scale;
      return { width: width, height: height };
    } else {
      // Horizontal and traditional layouts
      const width = (fontSize * 4) * scale;
      const height = (fontSize * 1.5) * scale;
      return { width: width, height: height };
    }
  } else if (props.elementType === 'image') {
    if (props.element.isDrawing && props.element.originalWidth && props.element.originalHeight) {
      return {
        width: props.element.originalWidth * scale,
        height: props.element.originalHeight * scale
      };
    }
    return { width: 200 * scale, height: 200 * scale };
  } else {
    return { width: 200 * scale, height: 200 * scale };
  }
};

const constrainPosition = (position) => {
  const bounds = getElementBounds();
  const halfWidth = bounds.width / 2;
  const halfHeight = bounds.height / 2;
  
  const constrainedX = Math.max(halfWidth, Math.min(position.x, props.canvasWidth - halfWidth));
  const constrainedY = Math.max(halfHeight, Math.min(position.y, props.canvasHeight - halfHeight));
  
  return { x: constrainedX, y: constrainedY };
};

const groupConfig = computed(() => {
  const baseOpacity = props.element.opacity ?? 1

  let finalOpacity = baseOpacity
  if (props.isLooped) {
    finalOpacity *= 0.6
  } else if (props.isLocked) {
    finalOpacity *= 0.7
  } else if (props.isEditing) {
    finalOpacity *= 0.3
  } else if (props.isDrawToolActive) {
    finalOpacity *= 0.5
  }

  return {
    x: props.element.position?.x || 0,
    y: props.element.position?.y || 0,
    rotation: props.element.rotation || 0,
    scaleX: props.element.scale || 1,
    scaleY: props.element.scale || 1,
    draggable: !props.isLooped && !props.isEditing && !props.isLocked && !props.isDrawToolActive,
    opacity: finalOpacity,
    listening: !props.isLooped && !props.isDrawToolActive,
    id: props.element.id,
    dragBoundFunc: (pos) => {
      return { x: pos.x, y: pos.y };
    }
  }
});
const imageConfig = computed(() => {
  if (props.elementType !== 'image' || !loadedImage.value) return {};
  
  let width, height;
  
  if (props.element.isDrawing && props.element.originalWidth && props.element.originalHeight) {
    width = props.element.originalWidth;
    height = props.element.originalHeight;
  } else {
    width = originalImageSize.value.width;
    height = originalImageSize.value.height;
  }
  
  return {
    image: loadedImage.value,
    width: width,
    height: height,
    offsetX: width / 2,
    offsetY: height / 2,
    perfectDrawEnabled: false,
    listening: !props.isLooped // Disable interaction for looped elements
  };
});


const stripHtml = (html) => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  let text = temp.textContent || temp.innerText || '';
  text = text.trim();
  text = text.replace(/\s+/g, ' ');
  return text;
};

const textConfig = computed(() => {
  const elementRealType = props.element?.type || 'text';

  if(elementRealType === 'emoji') {
    const fontSize = props.element.fontSize || baseFontSize;
  
    const config = {
      text: props.element.content, 
      fontSize: fontSize,
      fontFamily: 'Roboto',
      fill: props.element.color || '#000000',
      fontStyle: `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`,
      textDecoration: props.element.underline ? 'underline' : (props.element.transformation || ''),
      align: 'center',
      verticalAlign: 'middle',
      width: Math.max(20, props.element.content.length * fontSize * 0.7),
      height: fontSize * 1.5,
      offsetX: Math.max(20, props.element.content.length * fontSize * 0.7) / 2,
      offsetY: (fontSize * 1.7) / 2,
      padding: 1,
      listening: !props.isLooped,
      perfectDrawEnabled: false
    };
    
    return config
  }else if(elementRealType === 'monogram'){
    const fontSize = props.element.fontSize || baseFontSize;
    const text = props.element.content || 'ABC';
    const layoutStyle = props.element.layoutStyle || 'horizontal';
    const font = props.element.font || 'monogram_kk';
    const letterSpacing = props.element.letterSpacing || 0;
    const spacing = props.element.spacing || 10;

    let width, height, lineHeight;

    if (layoutStyle === 'stacked' || layoutStyle === 'vertical') {
      const letters = text.split('\n').filter(line => line.trim().length > 0);
      const letterCount = letters.length;

      lineHeight = (fontSize + spacing) / fontSize;
      height = (fontSize * letterCount) + (spacing * (letterCount - 1)) + 40;

      const fontStyle = `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`;
      const measurements = getTextMeasurements(letters.join(''), fontSize, font, fontStyle, 0, 1);
      width = Math.max(measurements.width + 40, fontSize * 2);

    } else if (layoutStyle === 'circle') {
      const fontStyle = `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`;
      const measurements = getTextMeasurements(
        text.replace(/\n/g, ''),
        fontSize,
        font,
        fontStyle,
        0,
        1.2
      );

      const maxDimension = Math.max(measurements.width, measurements.height);
      width = maxDimension + 60;
      height = maxDimension + 60;
      lineHeight = 1.2;

    } else {
      const displayText = layoutStyle === 'horizontal'
        ? text.replace(/\n/g, ' ')
        : text.replace(/\n/g, '');

      const fontStyle = `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`;
      const measurements = getTextMeasurements(
        displayText,
        fontSize,
        font,
        fontStyle,
        letterSpacing,
        1.2
      );

      width = Math.max(measurements.width + 40, fontSize * 3);
      height = Math.max(measurements.height + 30, fontSize * 1.5);
      lineHeight = 1.2;
    }

    const config = {
      text: text,
      fontSize: fontSize,
      fontFamily: font,
      fill: props.element.color || '#000000',
      fontStyle: `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`,
      textDecoration: props.element.underline ? 'underline' : (props.element.transformation || ''),
      align: 'center',
      verticalAlign: 'middle',
      width: width,
      height: height,
      offsetX: width / 2,
      offsetY: height / 2,
      padding: 10,
      listening: !props.isLooped,
      perfectDrawEnabled: false,
      letterSpacing: letterSpacing,
      lineHeight: lineHeight,
    };

    if (props.element.stroke?.enabled) {
      config.stroke = props.element.stroke.color || '#FFFFFF';
      config.strokeWidth = props.element.stroke.width || 2;
    }

    if (props.element.engrave) {
      config.shadowColor = '#000000';
      config.shadowBlur = 3;
      config.shadowOffsetX = -1;
      config.shadowOffsetY = -1;
      config.shadowOpacity = 0.8;

      config.stroke = 'rgba(255, 255, 255, 0.4)';
      config.strokeWidth = 1;

      const originalFill = config.fill || '#000000';
      if (originalFill.startsWith('#')) {
        const darkenColor = (hex) => {
          const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 30);
          const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 30);
          const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 30);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        };
        config.fill = darkenColor(originalFill);
      }
      config.opacity = 0.85;
    } else if (props.element.shadow?.enabled) {
      config.shadowColor = props.element.shadow.color || '#000000';
      config.shadowBlur = props.element.shadow.blur || 5;
      config.shadowOffsetX = props.element.shadow.offsetX || 2;
      config.shadowOffsetY = props.element.shadow.offsetY || 2;
      config.shadowOpacity = props.element.shadow.opacity || 0.5;
    }

    return config;
  }else{
    const fontSize = props.element.fontSize || baseFontSize;
    const text = stripHtml(props.element.content) || 'Your text';
    const font = props.element.font || 'Roboto';
    const letterSpacing = props.element.letterSpacing || 0;

    const fontStyle = `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`;
    const measurements = getTextMeasurements(
      text,
      fontSize,
      font,
      fontStyle,
      letterSpacing,
      props.element.lineHeight || 1.2
    );

    let width = measurements.width;
    let height = measurements.height;

    width = Math.max(width + 20, 100);
    height = Math.max(height + 10, fontSize * 1.2);

    const config = {
      text: text,
      fontSize: fontSize,
      fontFamily: font,
      fill: props.element.color || '#000000',
      fontStyle: `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`,
      textDecoration: props.element.underline ? 'underline' : (props.element.transformation || ''),
      align: 'center',
      verticalAlign: 'middle',
      width: width,
      height: height,
      offsetX: width / 2,
      offsetY: height / 2,
      padding: 10,
      listening: !props.isLooped,
      perfectDrawEnabled: false,
      letterSpacing: letterSpacing,
      lineHeight: props.element.lineHeight || 1.2,
    };

    if (props.element.stroke?.enabled) {
      config.stroke = props.element.stroke.color || '#FFFFFF';
      config.strokeWidth = props.element.stroke.width || 2;
    }

    if (props.element.engrave) {
      config.shadowColor = '#000000';
      config.shadowBlur = 3;
      config.shadowOffsetX = -1;
      config.shadowOffsetY = -1;
      config.shadowOpacity = 0.8;

      config.stroke = 'rgba(255, 255, 255, 0.4)';
      config.strokeWidth = 1;

      const originalFill = config.fill || '#000000';
      if (originalFill.startsWith('#')) {
        const darkenColor = (hex) => {
          const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 30);
          const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 30);
          const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 30);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        };
        config.fill = darkenColor(originalFill);
      }
      config.opacity = 0.85;
    } else if (props.element.shadow?.enabled) {
      config.shadowColor = props.element.shadow.color || '#000000';
      config.shadowBlur = props.element.shadow.blur || 5;
      config.shadowOffsetX = props.element.shadow.offsetX || 2;
      config.shadowOffsetY = props.element.shadow.offsetY || 2;
      config.shadowOpacity = props.element.shadow.opacity || 0.5;
    }

    return config;
  }

});

// Circle monogram with three separate positioned letters
const circleMonogramConfigs = computed(() => {
  if (props.element.type !== 'monogram' || props.element.layoutStyle !== 'circle') {
    return [];
  }

  const text = props.element.content || 'ABC';
  const letters = text.split('').filter(l => l.trim());
  
  if (letters.length !== 3) {
    return [];
  }

  const fontSize = props.element.fontSize || baseFontSize;
  const color = props.element.color || '#000000';
  const font = props.element.font || 'monogram_kk';
  
  // Circle dimensions
  const circleRadius = fontSize * 1.5;
  const letterWidth = fontSize * 1.2;
  const letterHeight = fontSize * 1.2;

  // Position the three letters around the circle
  // Left (top-left), Center (top), Right (top-right)
  const positions = [
    { x: -circleRadius * 0.7, y: -circleRadius * 0.5 },  // Left letter
    { x: 0, y: -circleRadius * 0.8 },                     // Center letter  
    { x: circleRadius * 0.7, y: -circleRadius * 0.5 }     // Right letter
  ];

  const configs = letters.map((letter, index) => {
    const pos = positions[index];
    
    const config = {
      text: letter,
      fontSize: fontSize,
      fontFamily: font,
      fill: color,
      align: 'center',
      verticalAlign: 'middle',
      width: letterWidth,
      height: letterHeight,
      x: pos.x,
      y: pos.y,
      offsetX: letterWidth / 2,
      offsetY: letterHeight / 2,
      listening: !props.isLooped,
      perfectDrawEnabled: false,
    };

    // Apply stroke if enabled
    if (props.element.stroke?.enabled) {
      config.stroke = props.element.stroke.color || '#FFFFFF';
      config.strokeWidth = props.element.stroke.width || 2;
    }

    // Apply engrave effect
    if (props.element.engrave) {
      config.shadowColor = '#000000';
      config.shadowBlur = 3;
      config.shadowOffsetX = -1;
      config.shadowOffsetY = -1;
      config.shadowOpacity = 0.8;
      config.stroke = 'rgba(255, 255, 255, 0.4)';
      config.strokeWidth = 1;

      const originalFill = config.fill || '#000000';
      if (originalFill.startsWith('#')) {
        const darkenColor = (hex) => {
          const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 30);
          const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 30);
          const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 30);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        };
        config.fill = darkenColor(originalFill);
      }
      config.opacity = 0.85;
    } else if (props.element.shadow?.enabled) {
      config.shadowColor = props.element.shadow.color || '#000000';
      config.shadowBlur = props.element.shadow.blur || 5;
      config.shadowOffsetX = props.element.shadow.offsetX || 2;
      config.shadowOffsetY = props.element.shadow.offsetY || 2;
      config.shadowOpacity = props.element.shadow.opacity || 0.5;
    }

    return config;
  });

  return configs;
});

// Stacked monogram with middle letter larger
const stackedMonogramConfigs = computed(() => {
  if (props.element.type !== 'monogram' || props.element.layoutStyle !== 'stacked') {
    return [];
  }

  const text = props.element.content || 'A\nB\nC';
  const letters = text.split('\n').filter(l => l.trim());
  const baseFontSize = props.element.fontSize || 48;
  const color = props.element.color || '#000000';
  const font = props.element.font || 'monogram_kk';
  const spacing = props.element.spacing || 10;

  if (letters.length !== 3) {
    // Fallback to regular rendering if not 3 letters
    return [];
  }

  const configs = [];
  
  // Letter sizes: normal, large (1.5x), normal
  const sizes = [baseFontSize, baseFontSize * 1.5, baseFontSize];
  const totalHeight = sizes[0] + sizes[1] + sizes[2] + (spacing * 2);
  
  let currentY = -totalHeight / 2;

  letters.forEach((letter, index) => {
    const letterFontSize = sizes[index];
    const letterHeight = letterFontSize;
    
    const config = {
      text: letter,
      fontSize: letterFontSize,
      fontFamily: font,
      fill: color,
      align: 'center',
      verticalAlign: 'middle',
      width: baseFontSize * 3,
      height: letterHeight,
      x: 0,
      y: currentY + letterHeight / 2,
      offsetX: (baseFontSize * 3) / 2,
      offsetY: letterHeight / 2,
      listening: !props.isLooped,
      perfectDrawEnabled: false,
    };

    // Apply stroke if enabled
    if (props.element.stroke?.enabled) {
      config.stroke = props.element.stroke.color || '#FFFFFF';
      config.strokeWidth = props.element.stroke.width || 2;
    }

    // Apply engrave effect
    if (props.element.engrave) {
      config.shadowColor = '#000000';
      config.shadowBlur = 3;
      config.shadowOffsetX = -1;
      config.shadowOffsetY = -1;
      config.shadowOpacity = 0.8;
      config.stroke = 'rgba(255, 255, 255, 0.4)';
      config.strokeWidth = 1;

      const originalFill = config.fill || '#000000';
      if (originalFill.startsWith('#')) {
        const darkenColor = (hex) => {
          const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 30);
          const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 30);
          const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 30);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        };
        config.fill = darkenColor(originalFill);
      }
      config.opacity = 0.85;
    } else if (props.element.shadow?.enabled) {
      config.shadowColor = props.element.shadow.color || '#000000';
      config.shadowBlur = props.element.shadow.blur || 5;
      config.shadowOffsetX = props.element.shadow.offsetX || 2;
      config.shadowOffsetY = props.element.shadow.offsetY || 2;
      config.shadowOpacity = props.element.shadow.opacity || 0.5;
    }

    configs.push(config);
    currentY += letterHeight + spacing;
  });

  return configs;
});

const konvaTextEditorStyle = computed(() => {
  // Handle array refs (v-for) or single ref
  let textRefElement = konvaTextRef.value;
  if (Array.isArray(textRefElement) && textRefElement.length > 0) {
    textRefElement = textRefElement[0];
  }
  
  if (!textRefElement || !textRefElement.getNode) return { display: 'none' };

  try {
    const textNode = textRefElement.getNode();
    const stage = textNode?.getStage();
    if (!stage || !textNode) return { display: 'none' };
  
  const container = stage.container();
  const containerRect = container.getBoundingClientRect();
  
  const textPosition = textNode.absolutePosition();
  const areaPosition = {
    x: containerRect.left + textPosition.x,
    y: containerRect.top + textPosition.y,
  };
  
  const textWidth = textNode.width();
  const textHeight = textNode.height();
  const fontSize = textNode.fontSize();
  
  return {
    position: 'fixed',
    left: `${areaPosition.x}px`,
    top: `${areaPosition.y}px`,
    width: `${textWidth}px`,
    height: `${textHeight}px`,
    fontSize: `${fontSize}px`,
    fontFamily: textNode.fontFamily(),
    color: textNode.fill(),
    transform: 'translateY(-2px)',
    transformOrigin: 'left top',
    zIndex: 2000,
    border: 'none',
    padding: '0px',
    margin: '0px',
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.95)',
    outline: 'none',
    resize: 'none',
    lineHeight: textNode.lineHeight(),
    textAlign: textNode.align()
  };
  } catch (error) {
    // Silently handle Konva ref errors
    return { display: 'none' };
  }
});

const handleClick = (e) => {
  e.cancelBubble = true;
  if (!props.isLooped && !props.isDrawToolActive) {
    emit('select')
    ;
  }
};


const handleDoubleClick = (e) => {
  e.cancelBubble = true;
  if (props.elementType === 'text' && !props.isLocked && !props.isLooped && !props.isDrawToolActive) {
    startTextEditing();
  }
};

const startTextEditing = () => {
  editingText.value = props.element.content || 'Your text';
  emit('edit-start');
  
  nextTick(() => {
    if (textInputRef.value) {
      textInputRef.value.focus();
      textInputRef.value.select();
      updateTextWidth();
    }
  });
};

const finishEditing = () => {
  if (textUpdateTimeout) {
    clearTimeout(textUpdateTimeout);
    textUpdateTimeout = null;
  }
  
  const content = editingText.value.trim() || 'Your text';
  const newElement = {
    ...props.element,
    content: content
  };
  emit('update:element', newElement);
  emit('edit-finish');
  
  pendingTextUpdate = null;
};

const cancelEditing = () => {
  if (textUpdateTimeout) {
    clearTimeout(textUpdateTimeout);
    textUpdateTimeout = null;
  }
  
  editingText.value = props.element.content || '';
  emit('edit-finish');
  
  pendingTextUpdate = null;
};

const throttledTextUpdate = () => {
  if (textUpdateTimeout) {
    clearTimeout(textUpdateTimeout);
  }
  
  textUpdateTimeout = setTimeout(() => {
    if (pendingTextUpdate) {
      const newElement = {
        ...props.element,
        content: pendingTextUpdate
      };
      emit('update:element', newElement);
      scheduleBatchDraw();
      pendingTextUpdate = null;
    }
    textUpdateTimeout = null;
  }, 100);
};

const updateTextWidth = () => {
  if (textInputRef.value) {
    const fontSize = props.element.fontSize || baseFontSize;
    const scale = props.element.scale || 1;
    const scaledFontSize = fontSize * scale;
    const content = editingText.value || 'Your text';
    const minWidth = 80;
    const contentWidth = Math.max(minWidth, content.length * scaledFontSize * 0.6);
    textInputRef.value.style.width = `${contentWidth}px`;
  }
  
  pendingTextUpdate = editingText.value;
  throttledTextUpdate();
};

const handleDragStart = () => {};

const scheduleBatchDraw = () => {
  if (batchDrawScheduled) return;
  
  batchDrawScheduled = true;
  batchDrawFrameId = requestAnimationFrame(() => {
    const imageNode = konvaImageRef.value?.getNode();
    
    // Handle array refs (v-for) or single ref
    let textNode = null;
    if (Array.isArray(konvaTextRef.value) && konvaTextRef.value.length > 0) {
      textNode = konvaTextRef.value[0]?.getNode();
    } else {
      textNode = konvaTextRef.value?.getNode();
    }
    
    const node = imageNode || textNode;
    
    if (node) {
      const layer = node.getLayer();
      if (layer) {
        layer.batchDraw();
      }
    }
    
    batchDrawScheduled = false;
    batchDrawFrameId = null;
  });
};

const handleDragMove = (e) => {
  const node = e.target;
  const newElement = {
    ...props.element,
    position: {
      x: node.x(),
      y: node.y()
    }
  };
  emit('update:element', newElement);
  
  scheduleBatchDraw();
};

const handleDragEnd = (e) => {
  const node = e.target;
  let x = node.x();
  let y = node.y();
  
  const bounds = getElementBounds();
  const elementWidth = bounds.width;
  const halfWidth = elementWidth / 2;
  
  const elementLeft = x - halfWidth;
  const elementRight = x + halfWidth;
  
  const visibleLeft = Math.max(0, Math.min(elementRight, props.canvasWidth)) - Math.max(0, elementLeft);
  const visibleRatio = visibleLeft / elementWidth;
  
  const isEmoji = props.element.type === 'emoji';
  const wrapThreshold = isEmoji ? 0.5 : 0.2;
  
  if (visibleRatio < wrapThreshold) {
    if (x < props.canvasWidth / 2) {
      x = props.canvasWidth - halfWidth - 20;
    } else {
      x = halfWidth + 20;
    }
  }
  
  const newElement = {
    ...props.element,
    position: {
      x: x,
      y: y
    }
  };
  emit('update:element', newElement);
};

const handleTransformStart = () => {};

const handleTransform = (e) => {
  const node = e.target;
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  const newScale = Math.max(scaleX, scaleY);
  
  if (props.elementType === 'image') {
    node.scaleX(newScale);
    node.scaleY(newScale);
  }
  
  scheduleBatchDraw();
};

const handleTransformEnd = (e) => {
  const node = e.target;
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  const newScale = props.elementType === 'image' 
    ? Math.max(scaleX, scaleY)
    : (scaleX + scaleY) / 2;
  
  const newElement = {
    ...props.element,
    position: { x: node.x(), y: node.y() },
    rotation: node.rotation(),
    scale: newScale
  };
  
  node.scaleX(1);
  node.scaleY(1);
  emit('update:element', newElement);
  
  nextTick(() => {
    node.getLayer()?.batchDraw();
  });
};
watch(() => props.element.src, (newSrc) => {
  if (props.elementType === 'image' && newSrc) {
    const img = new Image();
    img.onload = () => {
      loadedImage.value = img;
      
      if (props.element.isDrawing && props.element.originalWidth && props.element.originalHeight) {
        originalImageSize.value = {
          width: props.element.originalWidth,
          height: props.element.originalHeight
        };
      } else {
        const maxSize = 200;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        originalImageSize.value = {
          width: img.width * ratio,
          height: img.height * ratio
        };
      }
    };
    img.crossOrigin = 'anonymous';
    img.src = newSrc;
  }
}, { immediate: true });

watch(() => props.isEditing, (isEditing) => {
  if (isEditing && props.elementType === 'text') {
    editingText.value = props.element.content || 'Your text';
    nextTick(() => {
      if (textInputRef.value) {
        textInputRef.value.focus();
        textInputRef.value.select();
        updateTextWidth();
      }
    });
  }
});

watch(() => [props.element.fontSize, props.element.content, props.element.scale], () => {
  // No constraints - free dragging
}, { deep: true });

watch(
  () => [
    props.element.font,
    props.element.fontSize,
    props.element.layoutStyle,
    props.element.spacing,
    props.element.content,
    props.element.color,
    props.element.letterSpacing,
    props.element.lineHeight,
    props.element.engrave,
    props.element.stroke?.enabled,
    props.element.stroke?.color,
    props.element.stroke?.width,
    props.element.shadow?.enabled,
    props.element.shadow?.color,
    props.element.shadow?.blur,
    props.element.shadow?.offsetX,
    props.element.shadow?.offsetY,
    props.element.shadow?.opacity
  ],
  () => {
    if (props.elementType === 'text' || props.elementType === 'monogram') {
      nextTick(() => {
        scheduleBatchDraw();
      });
    }
  },
  { deep: true }
);

const transformer = ref(null);

watch(() => [props.isSelected, props.isLocked, loadedImage.value], ([selected, locked]) => {
  if (transformer.value) {
    transformer.value.destroy();
    transformer.value = null;
  }
  
  if (selected && !props.isLooped && !props.isEditing && !props.isDrawToolActive) {
    nextTick(() => {
      const imageNode = konvaImageRef.value?.getNode();
      
      // Handle textNode - it might be an array (v-for) or a single node
      let textNode = null;
      if (Array.isArray(konvaTextRef.value) && konvaTextRef.value.length > 0) {
        // For v-for refs (like circle monograms), get the first element
        textNode = konvaTextRef.value[0]?.getNode();
      } else {
        textNode = konvaTextRef.value?.getNode();
      }
      
      // For circle/stacked monograms, we need to go up 2 levels (textNode -> inner group -> main group)
      // For other elements, go up 1 level (node -> main group)
      let groupNode = imageNode?.getParent() || textNode?.getParent();
      
      // Check if this is a circle or stacked monogram with nested groups
      if (groupNode && props.element.type === 'monogram' && 
          (props.element.layoutStyle === 'circle' || props.element.layoutStyle === 'stacked')) {
        // Go up one more level to get the main group
        groupNode = groupNode.getParent();
      }
      
      if (groupNode && groupNode.getStage()) {
        groupNode.moveToTop();
        
        transformer.value = new Konva.Transformer({
          nodes: [groupNode],
          keepRatio: props.elementType === 'image',
          enabledAnchors: locked 
            ? [] 
            : ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
          rotateEnabled: !locked,
          borderEnabled: true,
          borderStroke: locked ? '#f59e0b' : '#3b82f6',
          borderStrokeWidth: 2,
          anchorFill: locked ? '#f59e0b' : '#3b82f6',
          anchorStroke: '#ffffff',
          anchorStrokeWidth: 2,
          anchorSize: 12,
          anchorCornerRadius: 2,
          rotateAnchorOffset: 40,
          rotateAnchorCursor: 'grab',
          boundBoxFunc: (oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }
        });
        
        const layer = groupNode.getLayer();
        layer.add(transformer.value);
        transformer.value.moveToTop();
        scheduleBatchDraw();
      }
    });
  }
}, { immediate: true, deep: true });

const cleanupBatchDraw = () => {
  if (batchDrawFrameId) {
    cancelAnimationFrame(batchDrawFrameId);
    batchDrawFrameId = null;
  }
  batchDrawScheduled = false;
};

const cleanupTextThrottling = () => {
  if (textUpdateTimeout) {
    clearTimeout(textUpdateTimeout);
    textUpdateTimeout = null;
  }
  pendingTextUpdate = null;
};

let fontsLoadedListener = null;

onMounted(() => {
  if (typeof window !== 'undefined') {
    fontsLoadedListener = () => {
      nextTick(() => {
        scheduleBatchDraw();
      });
    };
    window.addEventListener('fonts-loaded', fontsLoadedListener);
  }
});

onUnmounted(() => {
  if (transformer.value) {
    transformer.value.destroy();
    transformer.value = null;
  }
  cleanupBatchDraw();
  cleanupTextThrottling();

  if (fontsLoadedListener && typeof window !== 'undefined') {
    window.removeEventListener('fonts-loaded', fontsLoadedListener);
  }
});
</script>

<style scoped>
.konva-text-editor {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: 2px;

  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.konva-text-editor:focus {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>