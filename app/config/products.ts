import type { ProductDimension, CupModel } from '~/types/editor'



// Canvas dimensions: All products use same canvas size for consistent design transfer
const CANVAS_WIDTH = 231.42 
const CANVAS_HEIGHT = 134.37 

export const PRODUCT_DIMENSIONS: ProductDimension[] = [
  { name: 'bandit', style: 'standard', width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  
  { name: 'general', style: 'standard', width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  { name: 'magnum', style: 'standard', width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  { name: 'handlebar', style: 'standard', width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  { name: 'walrus', style: 'standard', width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  { name: 'sippy', style: 'standard', width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  { name: 'zappa-wide', style: 'standard', width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  { name: 'zappa-skinny', style: 'standard', width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
]

export const CUP_MODELS: Record<string, CupModel> = {
  bandit: {
    type: 'bandit',
    sizes: ['standard'],
    modelPath: () => `/models/bandit.glb`,
    uvRepeatY: 1 / 0.62,
    uvOffsetY: -0.50,
    scale: 90,
  },

  general: {
    type: 'general',
    sizes: ['standard'],
    modelPath: () => `/models/General- v3.glb`,
    uvRepeatY: 1.72,
    uvOffsetY: -0.21,
    scale: 75,
  },
  magnum: {
    type: 'magnum',
    sizes: ['standard'],
    modelPath: () => `/models/Magnum- v3.glb`,
    uvRepeatY: 1.72,
    uvOffsetY: -0.25,
    scale: 75,
  },
  handlebar: {
    type: 'handlebar',
    sizes: ['standard'],
    modelPath: () => `/models/Handlebar- v3.glb`,
    uvRepeatY: 1 / 0.62,
    uvOffsetY: -0.50,
    scale: 75,
  },

  walrus: {
    type: 'walrus',
    sizes: ['standard'],
    modelPath: () => `/models/Walrus- v3.glb`,
    uvRepeatY: 1.72,
    uvOffsetY: -0.50,
    scale: 70,
  },
  sippy: {
    type: 'sippy',
    sizes: ['standard'],
    modelPath: () => `/models/Sippy- v3.glb`,
    uvRepeatY: 1.72, 
    uvOffsetY: -0.75,
    scale: 100,
  },
  'zappa-wide': {
    type: 'zappa-wide',
    sizes: ['standard'],
    modelPath: () => `/models/Zappa Wide- v3.glb`,
    uvRepeatY: 1.72,  
    uvOffsetY: -0.85,
    scale: 110,
  },
  'zappa-skinny': {
    type: 'zappa-skinny',
    sizes: ['standard'],
    modelPath: () => `/models/Zappa Skinny- v3.glb`,
    uvRepeatY: 1.72,  
    uvOffsetY: -0.65,
    scale: 100,
  },
}

export const CAMERA_POSITIONS: Record<string, { x: number; y: number; z: number }> = {
  'standard': { x: 0, y: 0, z: 420 },
}

export function getProductDimensions(type: string, size: string): ProductDimension | undefined {
  return PRODUCT_DIMENSIONS.find(
    (p) => p.name === type && p.style === size
  )
}

export function getCupModel(type: string): CupModel | undefined {
  return CUP_MODELS[type]
}

export function getCameraPosition(size: string): { x: number; y: number; z: number } {
  return CAMERA_POSITIONS[size] ?? CAMERA_POSITIONS['standard'] ?? { x: 0, y: 0, z: 420 }
}
