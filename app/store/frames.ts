import { defineStore } from 'pinia'

export type FrameShape = 'circle' | 'square' | 'rounded-square' | 'heart' | 'star' | 'hexagon' | 'octagon' | 'diamond' | 'none'

export interface Frame {
  id: string
  name: string
  shape: FrameShape
  category: 'basic' | 'geometric' | 'organic' | 'decorative'
  preview?: string
  // For custom SVG paths
  path?: string
  // For standard shapes
  borderRadius?: number
  // Optional border styling
  border?: {
    width: number
    color: string
  }
}

export const useFramesStore = defineStore('frames', {
  state: () => ({
    frames: [
      // Basic Shapes
      {
        id: 'none',
        name: 'No Frame',
        shape: 'none' as FrameShape,
        category: 'basic' as const,
      },
      {
        id: 'circle',
        name: 'Circle',
        shape: 'circle' as FrameShape,
        category: 'basic' as const,
      },
      {
        id: 'square',
        name: 'Square',
        shape: 'square' as FrameShape,
        category: 'basic' as const,
        borderRadius: 0,
      },
      {
        id: 'rounded-square',
        name: 'Rounded Square',
        shape: 'rounded-square' as FrameShape,
        category: 'basic' as const,
        borderRadius: 20,
      },
      // Geometric Shapes
      {
        id: 'hexagon',
        name: 'Hexagon',
        shape: 'hexagon' as FrameShape,
        category: 'geometric' as const,
      },
      {
        id: 'octagon',
        name: 'Octagon',
        shape: 'octagon' as FrameShape,
        category: 'geometric' as const,
      },
      {
        id: 'diamond',
        name: 'Diamond',
        shape: 'diamond' as FrameShape,
        category: 'geometric' as const,
      },
      // Organic Shapes
      {
        id: 'heart',
        name: 'Heart',
        shape: 'heart' as FrameShape,
        category: 'organic' as const,
      },
      {
        id: 'star',
        name: 'Star',
        shape: 'star' as FrameShape,
        category: 'organic' as const,
      },
    ] as Frame[],
    selectedFrame: null as Frame | null,
  }),

  getters: {
    getFrameById: (state) => (id: string) => {
      return state.frames.find(frame => frame.id === id)
    },
    
    getFramesByCategory: (state) => (category: string) => {
      if (category === 'all') return state.frames
      return state.frames.filter(frame => frame.category === category)
    },
    
    basicFrames: (state) => state.frames.filter(f => f.category === 'basic'),
    geometricFrames: (state) => state.frames.filter(f => f.category === 'geometric'),
    organicFrames: (state) => state.frames.filter(f => f.category === 'organic'),
  },

  actions: {
    selectFrame(frame: Frame | null) {
      this.selectedFrame = frame
    },

    addCustomFrame(frame: Frame) {
      this.frames.push(frame)
    },
  },
})

