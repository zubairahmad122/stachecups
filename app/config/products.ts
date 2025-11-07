import type { ProductDimension, CupModel } from '~/types/editor'

export const PRODUCT_DIMENSIONS: ProductDimension[] = [
  { name: 'bandit', style: '16oz', width: 252.02, height: 145.63 },
  { name: 'bandit', style: '23oz', width: 252.02, height: 189.02 },
  { name: 'bandit', style: '32oz', width: 252.02, height: 232.41 },
  { name: 'imperial', style: '12oz', width: 254.78, height: 81.99 },
  { name: 'lil stache', style: '10oz', width: 231.78, height: 110 },
  { name: 'hudson', style: '40oz', width: 303.97, height: 124.97 },
  { name: 'handlebar', style: '18oz', width: 231.42, height: 161.01 },
  { name: 'walrus', style: '24oz', width: 231.56, height: 200.03 },
  { name: 'magnum', style: '16oz', width: 272.2, height: 145.63 },
  { name: 'magnum', style: '23oz', width: 272.2, height: 189.02 },
  { name: 'magnum', style: '32oz', width: 272.2, height: 208 },
  { name: 'general', style: '16oz', width: 248.99, height: 145.63 },
  { name: 'general', style: '24oz', width: 248.99, height: 189.02 },
  { name: 'general', style: '32oz', width: 248.99, height: 232.41 },
  { name: 'sippy', style: '12oz', width: 190, height: 100 },
  { name: 'zappa-wide', style: '12oz', width: 200, height: 100 },
  { name: 'zappa-skinny', style: '12oz', width: 180, height: 100 },
]

export const CUP_MODELS: Record<string, CupModel> = {
  magnum: {
    type: 'magnum',
    sizes: ['16oz', '23oz', '32oz'],
    modelPath: () => `/models/magnum.glb`,
    uvRepeatY: 1 / 0.58,
    uvOffsetY: -0.50,
    scale: 75,
  },
  general: {
    type: 'general',
    sizes: ['16oz', '24oz', '32oz'],
    modelPath: () => `/models/general.glb`,
    uvRepeatY: 1 / 0.58,
    uvOffsetY: -0.50,
    scale: 80,
  },
  sippy: {
    type: 'sippy',
    sizes: ['12oz'],
    modelPath: () => `/models/Sippy.glb`,
    uvRepeatY: 1 / 1.15,
    uvOffsetY: -0.30,
    scale: 100,
  },
  'zappa-wide': {
    type: 'zappa-wide',
    sizes: ['12oz'],
    modelPath: () => `/models/zappa-wide.glb`,
    uvRepeatY: 1 / 1.15,
    uvOffsetY: -0.30,
    scale: 105,
  },
  'zappa-skinny': {
    type: 'zappa-skinny',
    sizes: ['12oz'],
    modelPath: () => `/models/zappa-skinny.glb`,
    uvRepeatY: 1 / 1.15,
    uvOffsetY: -0.30,
    scale: 105,
  },
}

export const CAMERA_POSITIONS: Record<string, { x: number; y: number; z: number }> = {
  '12oz': { x: 0, y: 0, z: 380 },
  '16oz': { x: 0, y: 0, z: 400 },
  '18oz': { x: 0, y: 0, z: 420 },
  '23oz': { x: 0, y: 0, z: 450 },
  '24oz': { x: 0, y: 0, z: 450 },
  '32oz': { x: 0, y: 0, z: 500 },
  '40oz': { x: 0, y: 0, z: 550 },
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
  return CAMERA_POSITIONS[size] ?? CAMERA_POSITIONS['23oz'] ?? { x: 0, y: 0, z: 450 }
}
