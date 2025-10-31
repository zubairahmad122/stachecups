<template>
  <div
      class="relative w-full aspect-[1/1] flex flex-col items-center justify-center rounded-2xl overflow-hidden "
  >
    <!-- 3D Canvas -->
    <div id="threejs" ref="threejsContainer" class="w-full h-full"></div>



  </div>
</template>

<script setup>
const props = defineProps({
  canvasElement: {
    type: Object,
    default: null
  }
});

const threejsContainer = ref(null);
const rotationValue = ref(0);
const renderer = ref(null);
const scene = ref(null);
const camera = ref(null);
const cup = ref(null);
const cupMain = ref(null);
const textureCanvas = ref(null);
const textureContext = ref(null);
const texture = ref(null);
const animationId = ref(null);

const route = useRoute()

const cupType = route.query.type || 'bandit'
const cupSize = route.query.size || '23oz'

// Camera settings for different cup sizes
const cameraSettings = {
  '23oz': {
    positionY: 0.47,
    rotationX: -0.3,
    positionZ: 0.8
  },
  '32oz': {
    positionY: 0.52,
    rotationX: -0.28,
    positionZ: 0.9
  }
};

// Mouse interaction variables
const mouseDown = ref(false);
const mouseX = ref(0);
const mouseY = ref(0);
const isTouchDevice = 'ontouchstart' in document.documentElement;

// Initialize the ThreeJS scene
const initThreeJS = () => {
  // Create the texture canvas - will be sized dynamically based on source canvas
  textureCanvas.value = document.createElement('canvas');
  // Default size - will be updated in updateTexture based on actual canvas dimensions
  textureCanvas.value.width = 1024;
  textureCanvas.value.height = 512;
  textureContext.value = textureCanvas.value.getContext('2d');

  // Initialize scene (use markRaw to prevent Vue reactivity overhead)
  scene.value = markRaw(new THREE.Scene());

  const container = threejsContainer.value;
  if (!container) return;

  // Setup camera
  camera.value = markRaw(new THREE.PerspectiveCamera(
      35,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
  ));

  // Setup renderer with high quality settings
  renderer.value = markRaw(new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  }));

  renderer.value.setPixelRatio(window.devicePixelRatio * 2);
  renderer.value.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.value.domElement);

  // Add ambient lighting
  const ambientLight = markRaw(new THREE.AmbientLight(0x1f1f1f));
  scene.value.add(ambientLight);

  // Position camera based on cup size
  setCameraPosition();

  // Load the 3D model
  loadModel();

  // Add mouse handlers
  addMouseHandler(container);

  // Start animation
  animate();
};

// Load 3D cup model
const loadModel = () => {
  const loader = markRaw(new THREE.ColladaLoader());
  loader.options.convertUpAxis = true;

  loader.load(`models/${cupType}/${cupSize}.dae`, (collada) => {
    const model = markRaw(collada.scene);
    cup.value = markRaw(model.children.find(obj => obj.name === 'Cup'));

    if (cup.value) {
      cupMain.value = cup.value.children.find(obj => obj.name === 'CupMain');
      const lid = cup.value.children.find(obj => obj.name === 'Lid');

      // Make lid double-sided
      if (lid) {
        lid.material[0].side = THREE.DoubleSide;
      }

      // Apply existing texture if available
      if (texture.value && cupMain.value) {
        cupMain.value.material[0].map = texture.value;
      }

      scene.value.add(model);

      // Apply initial texture from canvas
      if (props.canvasElement) {
        updateTexture();
      }
    }
  });
};

// Update 3D texture from canvas
const updateTexture = () => {
  if (!textureContext.value || !props.canvasElement) return;

  // Match texture canvas dimensions to source canvas to preserve aspect ratio
  const sourceWidth = props.canvasElement.width;
  const sourceHeight = props.canvasElement.height;

  // Set texture canvas to match source dimensions (or scale proportionally)
  textureCanvas.value.width = sourceWidth;
  textureCanvas.value.height = sourceHeight;

  // Clear and redraw the texture canvas with white background
  textureContext.value.clearRect(0, 0, textureCanvas.value.width, textureCanvas.value.height);
  textureContext.value.fillStyle = "#ffffff";
  textureContext.value.fillRect(0, 0, textureCanvas.value.width, textureCanvas.value.height);

  // Draw the design canvas onto texture canvas at actual size
  textureContext.value.drawImage(props.canvasElement, 0, 0);

  if (!texture.value) {
    // First time: create new CanvasTexture
    texture.value = markRaw(new THREE.CanvasTexture(textureCanvas.value));
    texture.value.wrapS = THREE.RepeatWrapping;
    texture.value.wrapT = THREE.ClampToEdgeWrapping;
    texture.value.flipY = true;

    // Apply texture to cup material
    if (cupMain.value) {
      cupMain.value.material[0].map = texture.value;
      cupMain.value.material[0].needsUpdate = true;
    }
  } else {
    // Subsequent updates: flag texture for update
    texture.value.needsUpdate = true;

    if (cupMain.value && cupMain.value.material[0]) {
      cupMain.value.material[0].needsUpdate = true;
    }
  }
};


// Set camera position based on cup size
const setCameraPosition = () => {
  if (!camera.value) return;

  const settings = cameraSettings[cupSize] || cameraSettings['23oz'];
  if (!settings) return;

  camera.value.position.y = settings.positionY;
  camera.value.rotation.x = settings.rotationX;
  camera.value.position.z = settings.positionZ;
};

// Animation loop
const animate = () => {
  animationId.value = requestAnimationFrame(animate);

  if (cup.value && !mouseDown.value) {
    cup.value.rotation.z -= 0.003;
  }

  if (renderer.value && scene.value && camera.value) {
    renderer.value.render(scene.value, camera.value);
  }
};

// Mouse and touch event handlers
const onMouseMove = (evt) => {
  if (!mouseDown.value) return;
  evt.preventDefault();

  let x, y;
  if (evt.type === 'touchmove') {
    x = evt.touches[0].pageX;
    y = evt.touches[0].pageY;
  } else {
    x = evt.clientX;
    y = evt.clientY;
  }

  const deltaX = x - mouseX.value;
  mouseX.value = x;
  mouseY.value = y;

  rotateScene(deltaX);
};

const onMouseDown = (evt) => {
  evt.preventDefault();
  mouseDown.value = true;

  if (evt.type === 'touchstart') {
    mouseX.value = evt.touches[0].pageX;
    mouseY.value = evt.touches[0].pageY;
  } else {
    mouseX.value = evt.clientX;
    mouseY.value = evt.clientY;
  }
};

const onMouseUp = (evt) => {
  evt.preventDefault();
  mouseDown.value = false;
};

const addMouseHandler = (element) => {
  element.addEventListener('pointermove', onMouseMove);
  element.addEventListener('pointerdown', onMouseDown);
  element.addEventListener('pointerup', onMouseUp);
  element.addEventListener('pointercancel', onMouseUp);
};

const rotateScene = (deltaX) => {
  if (deltaX && cup.value) {
    cup.value.rotation.z += deltaX / 50;
  }
};

// Cleanup function
const cleanup = () => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }

  if (renderer.value) {
    renderer.value.dispose();
  }

  // Remove canvas update listener
  if (props.canvasElement && canvasUpdateHandler) {
    props.canvasElement.removeEventListener('update', canvasUpdateHandler);
    canvasUpdateHandler = null;
  }

  const container = threejsContainer.value;
  if (container) {
    // Remove event listeners
    if (isTouchDevice) {
      container.removeEventListener('touchmove', onMouseMove);
      container.removeEventListener('touchstart', onMouseDown);
      container.removeEventListener('touchend', onMouseUp);
      container.removeEventListener('touchcancel', onMouseUp);
    } else {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mouseleave', onMouseUp);
    }
  }

  // Clear three.js objects to release memory
  if (scene.value) {
    disposeSceneObjects(scene.value);
  }
};

const disposeSceneObjects = (obj) => {
  if (obj.children) {
    obj.children.forEach(child => {
      disposeSceneObjects(child);
    });
  }

  if (obj.geometry) {
    obj.geometry.dispose();
  }

  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach(material => {
        if (material.map) material.map.dispose();
        material.dispose();
      });
    } else {
      if (obj.material.map) obj.material.map.dispose();
      obj.material.dispose();
    }
  }
};

// Store reference to the update handler to properly clean it up
let canvasUpdateHandler = null;

// Watch for canvas changes to update texture
watch(() => props.canvasElement, (newCanvas, oldCanvas) => {
  // Remove old listener if it exists
  if (oldCanvas && canvasUpdateHandler) {
    oldCanvas.removeEventListener('update', canvasUpdateHandler);
  }

  if (newCanvas) {
    // Wait for next tick to ensure the canvas is fully ready
    nextTick(() => {
      // Initial texture update
      updateTexture();

      canvasUpdateHandler = () => {
        updateTexture();
      };

      // Add event listener for canvas updates
      newCanvas.addEventListener('update', canvasUpdateHandler);
    });
  }
}, { immediate: true });

// Watch for cup size changes to reload model
watch(() => cupSize, (newSize) => {
  if (scene.value) {
    // Remove old model
    scene.value.children.forEach(child => {
      if (child.isObject3D) {
        scene.value.remove(child);
      }
    });

    // Update camera position
    const settings = cameraSettings[newSize];
    camera.value.position.y = settings.positionY;
    camera.value.rotation.x = settings.rotationX;
    camera.value.position.z = settings.positionZ;

    // Load new model
    loadModel();
  }
});

// Lifecycle hooks
onMounted(() => {
  initThreeJS();

  // Handle window resize
  const handleResize = () => {
    if (camera.value && renderer.value && threejsContainer.value) {
      camera.value.aspect = threejsContainer.value.offsetWidth / threejsContainer.value.offsetHeight;
      camera.value.updateProjectionMatrix();
      renderer.value.setSize(threejsContainer.value.offsetWidth, threejsContainer.value.offsetHeight);
    }
  };

  window.addEventListener('resize', handleResize);

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
});

onUnmounted(() => {
  cleanup();
});
</script>

<style scoped>
.threejs-container {
  width: 100%;
  aspect-ratio: 1/1;
  position: relative;
}

#threejs {
  width: 100%;
  height: 100%;
  background-color: transparent;
}
</style>
