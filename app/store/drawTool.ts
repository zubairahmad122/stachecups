import { defineStore } from 'pinia'

export const useDrawToolStore = defineStore('drawTool', {
  state: () => ({
    isActive: false,
    brushSize: 5,
    brushColor: '#000000',
    currentDrawing: null as any,
    nextDrawingId: 1,
    toolMode: 'brush' as 'brush' | 'eraser' | 'bucket',
    eraserSize: 10,
    bucketColor: '#000000',
  }),

  getters: {
    brushSettings: (state) => ({
      size: state.brushSize,
      color: state.brushColor,
    }),
    eraserSettings: (state) => ({
      size: state.eraserSize,
    }),
    bucketSettings: (state) => ({
      color: state.bucketColor,
    }),
  },

  actions: {
    activate() {
      this.isActive = true
    },

    deactivate() {
      this.isActive = false
      this.currentDrawing = null
    },

    toggle() {
      this.isActive = !this.isActive
      if (!this.isActive) {
        this.currentDrawing = null
      }
    },

    setBrushSize(size: number) {
      this.brushSize = Math.max(1, Math.min(50, size))
    },

    setBrushColor(color: string) {
      this.brushColor = color
    },

    setToolMode(mode: 'brush' | 'eraser' | 'bucket') {
      this.toolMode = mode
    },

    setEraserSize(size: number) {
      this.eraserSize = Math.max(1, Math.min(50, size))
    },

    setBucketColor(color: string) {
      this.bucketColor = color
    },

    setCurrentDrawing(drawing: any) {
      this.currentDrawing = drawing
    },

    clearCurrentDrawing() {
      this.currentDrawing = null
    },

    getNextDrawingId(): string {
      return `draw-${this.nextDrawingId++}`
    },

    reset() {
      this.isActive = false
      this.brushSize = 5
      this.brushColor = '#000000'
      this.currentDrawing = null
      this.toolMode = 'brush'
      this.eraserSize = 10
      this.bucketColor = '#000000'
    },
  },
})

