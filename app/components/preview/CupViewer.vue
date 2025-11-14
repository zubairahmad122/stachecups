<template>
  <div class="relative w-full aspect-[1/1] flex flex-col items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe]">
    <TCanvas class="w-full h-full" :antialias="true" :pixel-ratio="2" :alpha="true">
      <OrbitControls
        :enable-zoom="true"
        :enable-pan="false"
        :auto-rotate="true"
        :auto-rotate-speed="0.6"
        :target="[0, 3, 0]"
        :min-distance="1"
        :max-distance="24"
      />

      <TresAmbientLight :intensity="0.2" />
      <TresDirectionalLight :position="[5, 0, 5]" :intensity="0.2" :cast-shadow="true" />
      <TresDirectionalLight :position="[5, 0, 5]" :intensity="0.2" :cast-shadow="true" />
      <TresDirectionalLight :position="[5, 0, 5]" :intensity="0.2" :cast-shadow="true" />

      <Suspense>
        <Environment preset="city" :environment-intensity="1.8" :background="false" />
      </Suspense>

      <TresGroup :position="[0, -5, 0]" :scale="1">
        <primitive v-if="model && model.scene" :object="model.scene" :scale="modelScale" />
      </TresGroup>
    </TCanvas>
  </div>
</template>

<script setup>
import { useGLTF } from '@tresjs/cientos'
import { CanvasTexture, SRGBColorSpace, Mesh, MeshStandardMaterial, ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter } from 'three'
import { useProductStore } from '~/store/product'
import { CUP_MODELS } from '~/config/products'

const props = defineProps({
  canvasElement: {
    type: Object,
    default: null
  }
})

const route = useRoute()
const productStore = useProductStore()

const cupType = computed(() => {
  return productStore.currentProduct.type || route.query.type || 'bandit'
})

const cupSize = computed(() => {
  return productStore.currentProduct.size || route.query.size || 'standard'
})

const modelConfig = computed(() => {
  return CUP_MODELS[cupType.value] || Object.values(CUP_MODELS)[0]
})

const modelPath = computed(() => {
  return modelConfig.value?.modelPath(cupSize.value) || '/models/bandit.glb'
})

const modelScale = computed(() => modelConfig.value?.scale || 80)

const BODY_MATERIAL_MAP = {
  'general': 'Material__6279',
  'handlebar': 'Material__6295',
  'magnum': 'Material__6279',
  'sippy': 'Metal_Main',
  'walrus': 'Metal_01',
  'zappa-skinny': 'Material__6302',
  'zappa-wide': 'Material__6298',
  'bandit': 'Material__6273',
}

const bodyMaterialName = computed(() => {
  return BODY_MATERIAL_MAP[cupType.value] || 'Material__6273'
})

let canvasUpdateHandler = null
const canvasTexture = ref(null)
const appliedMaterials = new Map()
let retryCount = 0
const MAX_RETRIES = 20
const meshInfoList = ref([])

const { state: gltfState } = useGLTF(modelPath, { draco: true })
const model = gltfState

const getScene = () => {
  return (model && (model.scene || model.value?.scene)) ? (model.scene || model.value?.scene) : null
}

const getMeshByUUID = (uuid) => {
  const m = getScene()
  if (!m) return null
  
  let foundMesh = null
  m.traverse((child) => {
    if (child instanceof Mesh && child.uuid === uuid) {
      foundMesh = child
    }
  })
  return foundMesh
}

const getMeshByName = (name) => {
  const m = getScene()
  if (!m) return null
  
  let foundMesh = null
  m.traverse((child) => {
    if (child instanceof Mesh && child.name === name) {
      foundMesh = child
    }
  })
  return foundMesh
}

const findMaterialByName = (materialName) => {
  const m = getScene()
  if (!m) return null
  
  const foundMeshes = []
  m.traverse((child) => {
    if (child instanceof Mesh) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((mat, index) => {
        if (mat && mat.name === materialName) {
          foundMeshes.push({
            mesh: child,
            meshName: child.name,
            meshUUID: child.uuid,
            material: mat,
            materialIndex: index,
            materialUUID: mat.uuid
          })
        }
      })
    }
  })
  return foundMeshes
}

const getAllMaterials = () => {
  const m = getScene()
  if (!m) return []
  
  const materialsMap = new Map()
  m.traverse((child) => {
    if (child instanceof Mesh) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((mat, index) => {
        if (mat && mat.name) {
          if (!materialsMap.has(mat.name)) {
            materialsMap.set(mat.name, {
              name: mat.name,
              uuid: mat.uuid,
              type: mat.type,
              meshes: []
            })
          }
          materialsMap.get(mat.name).meshes.push({
            meshName: child.name,
            meshUUID: child.uuid,
            materialIndex: index
          })
        }
      })
    }
  })
  return Array.from(materialsMap.values())
}

defineExpose({
  getMeshByUUID,
  getMeshByName,
  findMaterialByName,
  getAllMaterials,
  meshInfoList
})

const isCanvasReady = () => {
  if (!props.canvasElement) return false

  const canvas = props.canvasElement
  if (canvas.width === 0 || canvas.height === 0) return false

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false

  const positions = [
    [Math.floor(canvas.width / 2), Math.floor(canvas.height / 2)],
    [Math.floor(canvas.width / 4), Math.floor(canvas.height / 4)],
    [Math.floor(canvas.width * 0.75), Math.floor(canvas.height * 0.75)]
  ]

  let hasContent = false
  for (const [x, y] of positions) {
    const imageData = ctx.getImageData(x, y, 1, 1)
    const pixel = imageData.data
    const isEmpty = pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 0
    if (!isEmpty) {
      hasContent = true
      break
    }
  }

  return hasContent
}

const createOrUpdateTexture = () => {
  if (!props.canvasElement) return null

  if (!canvasTexture.value) {
    if (!isCanvasReady()) return null

    canvasTexture.value = new CanvasTexture(props.canvasElement)
    canvasTexture.value.flipY = false
    canvasTexture.value.colorSpace = SRGBColorSpace
    canvasTexture.value.wrapS = ClampToEdgeWrapping
    canvasTexture.value.wrapT = ClampToEdgeWrapping
    canvasTexture.value.minFilter = LinearMipmapLinearFilter
    canvasTexture.value.magFilter = LinearFilter
    canvasTexture.value.generateMipmaps = true
    canvasTexture.value.anisotropy = 16

    const repeatY = modelConfig.value?.uvRepeatY || 1 / 0.58
    const offsetY = modelConfig.value?.uvOffsetY || -0.50
    canvasTexture.value.repeat.set(1, repeatY)
    canvasTexture.value.offset.set(0, offsetY)

    const useChannel1 = cupType.value === 'handlebar' || cupType.value === 'walrus'
    canvasTexture.value.channel = useChannel1 ? 1 : 0
  } else {
    canvasTexture.value.image = props.canvasElement
    canvasTexture.value.needsUpdate = true
  }

  return canvasTexture.value
}

const applyTextureToModel = () => {
  const m = getScene()
  if (!m) return

  const texture = createOrUpdateTexture()
  if (!texture) {
    if (retryCount < MAX_RETRIES) {
      retryCount++
      const delay = Math.min(100 + (retryCount * 50), 500)
      setTimeout(() => applyTextureToModel(), delay)
    }
    return
  }

  retryCount = 0

  const meshInfo = []
  const allMaterials = new Map()
  let textureAppliedCount = 0
  const expectedBodyMaterial = bodyMaterialName.value
  
  m.traverse((child) => {
    if (child instanceof Mesh) {
      const meshData = {
        uuid: child.uuid,
        name: child.name || 'unnamed',
        type: child.type,
        id: child.id,
        parent: child.parent?.name || child.parent?.uuid || 'root',
        position: { x: child.position.x, y: child.position.y, z: child.position.z },
        scale: { x: child.scale.x, y: child.scale.y, z: child.scale.z },
        rotation: { x: child.rotation.x, y: child.rotation.y, z: child.rotation.z },
        material: {
          uuid: child.material?.uuid,
          name: child.material?.name,
          type: child.material?.type
        },
        geometry: {
          uuid: child.geometry?.uuid,
          type: child.geometry?.type
        }
      }
      meshInfo.push(meshData)
      
      const meshMaterials = Array.isArray(child.material) ? child.material : [child.material]
      
      meshMaterials.forEach((mat) => {
        if (mat && mat.name) {
          if (!allMaterials.has(mat.name)) {
            allMaterials.set(mat.name, {
              name: mat.name,
              uuid: mat.uuid,
              type: mat.type,
              meshes: []
            })
          }
          allMaterials.get(mat.name).meshes.push({
            meshName: child.name,
            meshUUID: child.uuid
          })
        }
      })
      
      child.castShadow = false
      child.receiveShadow = false

      if (child.geometry) {
        child.geometry.computeVertexNormals()
        child.geometry.computeBoundingBox()
        child.geometry.computeBoundingSphere()
      }

      const materialsForTexture = Array.isArray(child.material) ? child.material : [child.material]
      
      materialsForTexture.forEach((originalMat, matIndex) => {
        if (!(originalMat instanceof MeshStandardMaterial)) return
        
        const materialName = originalMat.name
        const isBodyMaterial = materialName === expectedBodyMaterial
        
        if (!isBodyMaterial) {
          return
        }
        
        const materialKey = Array.isArray(child.material) 
          ? `${child.uuid}-${matIndex}` 
          : child.uuid
        let mat = appliedMaterials.get(materialKey)

        if (!mat) {
          mat = originalMat.clone()
          mat.color.setHex(0xffffff)
          mat.emissive.setHex(0x000000)
          mat.envMapIntensity = 0.5
          mat.roughness = 0.4
          mat.metalness = 0.4
          mat.opacity = 1.0
          mat.transparent = false
          mat.side = 0
          mat.flatShading = false
          mat.polygonOffset = true
          mat.polygonOffsetFactor = 1
          mat.polygonOffsetUnits = 1
          
          if (Array.isArray(child.material)) {
            child.material[matIndex] = mat
          } else {
            child.material = mat
          }
          
          appliedMaterials.set(materialKey, mat)
        }

        mat.map = texture
        mat.needsUpdate = true
        
        if (texture) {
          texture.needsUpdate = true
        }
        
        textureAppliedCount++
      })
    }
  })
  
  meshInfoList.value = meshInfo
  return meshInfo
}

const updateTextureFromCanvas = () => {
  if (!props.canvasElement || !canvasTexture.value) return

  canvasTexture.value.image = props.canvasElement
  canvasTexture.value.needsUpdate = true
  applyTextureToModel()
}

watch([model, () => cupType.value], () => {
  if (model && (model.scene || model.value?.scene)) {
    retryCount = 0

    if (canvasTexture.value) {
      canvasTexture.value.dispose()
      canvasTexture.value = null
    }

    nextTick(() => {
      if (props.canvasElement) {
        applyTextureToModel()
      }
    })
  }
}, { immediate: true })

watch(() => props.canvasElement, (newCanvas, oldCanvas) => {
  if (oldCanvas && canvasUpdateHandler) {
    oldCanvas.removeEventListener('update', canvasUpdateHandler)
  }

  retryCount = 0

  if (newCanvas) {
    const tryApplyTexture = () => {
      if (model && (model.scene || model.value?.scene)) {
        applyTextureToModel()
      }
    }

    nextTick(() => tryApplyTexture())
    setTimeout(() => tryApplyTexture(), 100)
    setTimeout(() => tryApplyTexture(), 300)
    setTimeout(() => tryApplyTexture(), 500)
    setTimeout(() => tryApplyTexture(), 1000)

    canvasUpdateHandler = () => updateTextureFromCanvas()
    newCanvas.addEventListener('update', canvasUpdateHandler)
  }
}, { immediate: true })

onUnmounted(() => {
  if (props.canvasElement && canvasUpdateHandler) {
    props.canvasElement.removeEventListener('update', canvasUpdateHandler)
    canvasUpdateHandler = null
  }

  if (canvasTexture.value) {
    canvasTexture.value.dispose()
    canvasTexture.value = null
  }
})
</script>
