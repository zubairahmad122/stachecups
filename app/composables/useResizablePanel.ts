import { ref, computed, onMounted, onUnmounted } from 'vue';

type ResizeDirection = 'vertical' | 'horizontal';

interface ResizablePanelOptions {
  minHeight?: number;
  maxHeight?: number;
  defaultHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  direction?: ResizeDirection;
  storageKey?: string;
  onResize?: (size: number) => void;
}

export function useResizablePanel(options: ResizablePanelOptions = {}) {
  const {
    minHeight = 200,
    maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.9 : 600,
    defaultHeight = typeof window !== 'undefined' ? window.innerHeight * 0.45 : 400,
    minWidth = 280,
    maxWidth = 600,
    defaultWidth = 320,
    direction = 'vertical',
    storageKey,
    onResize,
  } = options;

  const panelHeight = ref(defaultHeight);
  const panelWidth = ref(defaultWidth);
  const isDragging = ref(false);
  const startY = ref(0);
  const startX = ref(0);
  const startHeight = ref(0);
  const startWidth = ref(0);

  const panelStyle = computed(() => {
    if (direction === 'horizontal') {
      return {
        width: `${panelWidth.value}px`,
        maxWidth: `${maxWidth}px`,
        minWidth: `${minWidth}px`,
      };
    }
    return {
      height: `${panelHeight.value}px`,
      maxHeight: `${maxHeight}px`,
    };
  });

  const loadSavedSize = () => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const size = parseInt(saved, 10);
        if (direction === 'horizontal') {
          if (size >= minWidth && size <= maxWidth) {
            panelWidth.value = size;
          }
        } else {
          if (size >= minHeight && size <= maxHeight) {
            panelHeight.value = size;
          }
        }
      }
    }
  };

  const saveSize = (size: number) => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, size.toString());
    }
  };

  const handleDragStart = (event: MouseEvent | TouchEvent) => {
    isDragging.value = true;

    if (direction === 'horizontal') {
      startX.value = 'touches' in event ? event.touches[0].clientX : event.clientX;
      startWidth.value = panelWidth.value;
    } else {
      startY.value = 'touches' in event ? event.touches[0].clientY : event.clientY;
      startHeight.value = panelHeight.value;
    }

    event.preventDefault();
  };

  const handleDragMove = (event: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return;

    if (direction === 'horizontal') {
      const currentX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const deltaX = currentX - startX.value;
      let newWidth = startWidth.value + deltaX;

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      panelWidth.value = newWidth;

      if (onResize) {
        onResize(newWidth);
      }
    } else {
      const currentY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      const deltaY = startY.value - currentY;
      let newHeight = startHeight.value + deltaY;

      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      panelHeight.value = newHeight;

      if (onResize) {
        onResize(newHeight);
      }
    }
  };

  const handleDragEnd = () => {
    if (!isDragging.value) return;

    isDragging.value = false;
    const size = direction === 'horizontal' ? panelWidth.value : panelHeight.value;
    saveSize(size);
  };

  const setSize = (size: number) => {
    if (direction === 'horizontal') {
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, size));
      panelWidth.value = constrainedWidth;
      saveSize(constrainedWidth);

      if (onResize) {
        onResize(constrainedWidth);
      }
    } else {
      const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, size));
      panelHeight.value = constrainedHeight;
      saveSize(constrainedHeight);

      if (onResize) {
        onResize(constrainedHeight);
      }
    }
  };

  const resetSize = () => {
    const defaultSize = direction === 'horizontal' ? defaultWidth : defaultHeight;
    setSize(defaultSize);
  };

  onMounted(() => {
    loadSavedSize();

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  });

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  });

  return {
    panelHeight,
    panelWidth,
    panelStyle,
    isDragging,
    handleDragStart,
    setSize,
    resetSize,
    setHeight: setSize,
    resetHeight: resetSize,
  };
}
