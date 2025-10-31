import type { ProductDimension, CupModel } from '~/types/editor'

export const PRODUCT_DIMENSIONS: ProductDimension[] = [
  { name: 'bandit', style: '16oz', width: 252.02, height: 145.63 },
  { name: 'bandit', style: '23oz', width: 252.02, height: 189.02 },
  { name: 'bandit', style: '32oz', width: 252.02, height: 232.41 },
  { name: 'general', style: '16oz', width: 248.99, height: 145.63 },
  { name: 'general', style: '24oz', width: 248.99, height: 189.02 },
  { name: 'general', style: '32oz', width: 248.99, height: 232.41 },
  { name: 'magnum', style: '16oz', width: 272.2, height: 145.63 },
  { name: 'magnum', style: '23oz', width: 272.2, height: 189.02 },
  { name: 'magnum', style: '32oz', width: 272.2, height: 208 },
  { name: 'handlebar', style: '18oz', width: 231.42, height: 161.01 },
  { name: 'walrus', style: '24oz', width: 231.56, height: 200.03 },
  { name: 'imperial', style: '12oz', width: 254.78, height: 81.99 },
  { name: 'lil stache', style: '10oz', width: 231.78, height: 110 },
  { name: 'hudson', style: '40oz', width: 303.97, height: 124.97 },
]

export const CUP_MODELS: Record<string, CupModel> = {
  bandit: {
    type: 'bandit',
    sizes: ['16oz', '23oz', '32oz'],
    modelPath: (size: string) => `/models/bandit/${size}.dae`,
  },
  general: {
    type: 'general',
    sizes: ['16oz', '24oz', '32oz'],
    modelPath: (size: string) => `/models/general/${size}.dae`,
  },
  magnum: {
    type: 'magnum',
    sizes: ['16oz', '23oz', '32oz'],
    modelPath: (size: string) => `/models/magnum/${size}.dae`,
  },
}

export const CAMERA_POSITIONS: Record<string, { x: number; y: number; z: number }> = {
  '16oz': { x: 0, y: 0, z: 400 },
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
  return CAMERA_POSITIONS[size] || CAMERA_POSITIONS['23oz']
}
