import { defineStore } from 'pinia'
import type { AnyElement, ViewMode, DrawToolOptions, TextToolOptions } from '~/types/editor'
import { ELEMENT_CONFIG, DRAW_CONFIG } from '~/config/constants'
import { generateElementId } from '~/utils/idGenerator'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    // Elements
    elements: [] as AnyElement[],
    selectedElementId: null as string | null,
    lockedElements: new Set<string>(),
    hiddenElements: new Set<string>(),

    // Tools
    currentTool: null as 'select' | 'text' | 'draw' | null,
    drawMode: false,
    textToolActive: false,

    // Draw Tool Options
    drawOptions: {
      brushSize: DRAW_CONFIG.DEFAULT_BRUSH_SIZE,
      color: DRAW_CONFIG.DEFAULT_COLOR,
    } as DrawToolOptions,

    // Text Tool Options
    textOptions: {
      font: 'sans',
      fontSize: ELEMENT_CONFIG.TEXT_DEFAULT_SIZE,
      color: ELEMENT_CONFIG.TEXT_DEFAULT_COLOR,
      bold: false,
      italic: false,
      underline: false,
    } as TextToolOptions,

    // View
    viewMode: 'design' as ViewMode,

    // Product
    cupType: 'bandit',
    cupSize: 'standard',
    canvasWidth: 231.42,
    canvasHeight: 134.37,
  }),

  getters: {
    selectedElement: (state): AnyElement | undefined => {
      return state.elements.find((el) => el.id === state.selectedElementId)
    },

    isElementLocked: (state) => {
      return (id: string) => state.lockedElements.has(id)
    },

    isElementHidden: (state) => {
      return (id: string) => state.hiddenElements.has(id)
    },

    visibleElements: (state): AnyElement[] => {
      return state.elements.filter((el) => !state.hiddenElements.has(el.id))
    },

    unlockedElements: (state): AnyElement[] => {
      return state.elements.filter((el) => !state.lockedElements.has(el.id))
    },

    hasElements: (state): boolean => {
      return state.elements.length > 0
    },

    // Layer panel organized elements (bottom to top, reverse for display)
    layeredElements: (state): AnyElement[] => {
      return [...state.elements].reverse()
    },
  },

  actions: {
    addElement(element: AnyElement) {
      if (!element.position || typeof element.position.x !== 'number' || typeof element.position.y !== 'number') {
        element.position = { x: 100, y: 100 }
      }
      if (typeof element.scale !== 'number') {
        element.scale = 1
      }
      if (typeof element.rotation !== 'number') {
        element.rotation = 0
      }
      if (typeof element.zIndex !== 'number') {
        // Set zIndex to be higher than all existing elements
        const maxZIndex = this.elements.length > 0 
          ? Math.max(...this.elements.map(el => el.zIndex ?? 0), 0)
          : 0
        element.zIndex = maxZIndex + 1
      }
      if (typeof element.opacity !== 'number') {
        element.opacity = 1
      }

      this.elements.push(element)
      this.selectedElementId = element.id
    },

    updateElement(id: string, updates: Partial<AnyElement>) {
      const index = this.elements.findIndex((el) => el.id === id)
      if (index !== -1) {
        this.elements[index] = { ...this.elements[index], ...updates } as AnyElement
      }
    },

    deleteElement(id: string) {
      this.elements = this.elements.filter((el) => el.id !== id)
      if (this.selectedElementId === id) {
        this.selectedElementId = null
      }
      this.lockedElements.delete(id)
    },

    duplicateElement(id: string) {
      const element = this.elements.find((el) => el.id === id)
      if (!element) return

      if (this.lockedElements.has(id)) return

      const newElement: AnyElement = {
        ...element,
        id: generateElementId(element.type),
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20,
        },
      }

      this.addElement(newElement)
    },

    clearElements() {
      this.elements = []
      this.selectedElementId = null
      this.lockedElements.clear()
      this.hiddenElements.clear()
    },

    selectElement(id: string | null) {
      this.selectedElementId = id
    },

    deselectAll() {
      this.selectedElementId = null
    },

    toggleLock(id: string) {
      if (this.lockedElements.has(id)) {
        this.lockedElements.delete(id)
      } else {
        this.lockedElements.add(id)
      }
    },

    lockElement(id: string) {
      this.lockedElements.add(id)
    },

    unlockElement(id: string) {
      this.lockedElements.delete(id)
    },

    toggleVisibility(id: string) {
      if (this.hiddenElements.has(id)) {
        this.hiddenElements.delete(id)
      } else {
        this.hiddenElements.add(id)
      }
    },

    hideElement(id: string) {
      this.hiddenElements.add(id)
    },

    showElement(id: string) {
      this.hiddenElements.delete(id)
    },

    moveElementToIndex(id: string, newIndex: number) {
      const element = this.elements.find((el) => el.id === id)
      if (!element) return

      element.zIndex = newIndex
    },

    bringToFront(id: string) {
      const element = this.elements.find((el) => el.id === id)
      if (!element) return

      // Ensure all elements have zIndex
      this.elements.forEach((el, index) => {
        if (el.zIndex === undefined) {
          el.zIndex = index
        }
      })

      const maxZIndex = Math.max(...this.elements.map(el => el.zIndex ?? 0), 0)
      element.zIndex = maxZIndex + 1
    },

    sendToBack(id: string) {
      const element = this.elements.find((el) => el.id === id)
      if (!element) return

      // Ensure all elements have zIndex
      this.elements.forEach((el, index) => {
        if (el.zIndex === undefined) {
          el.zIndex = index
        }
      })

      const minZIndex = Math.min(...this.elements.map(el => el.zIndex ?? 0), 0)
      element.zIndex = minZIndex - 1
    },

    moveUp(id: string) {
      const element = this.elements.find((el) => el.id === id)
      if (!element) return

      // Ensure all elements have zIndex
      this.elements.forEach((el, index) => {
        if (el.zIndex === undefined) {
          el.zIndex = index
        }
      })

      const currentZ = element.zIndex ?? 0
      const higherElements = this.elements
        .filter(el => (el.zIndex ?? 0) > currentZ)
        .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))

      if (higherElements.length > 0) {
        const nextElement = higherElements[0]
        const tempZ = element.zIndex
        element.zIndex = nextElement.zIndex
        nextElement.zIndex = tempZ
      }
    },

    moveDown(id: string) {
      const element = this.elements.find((el) => el.id === id)
      if (!element) return

      // Ensure all elements have zIndex
      this.elements.forEach((el, index) => {
        if (el.zIndex === undefined) {
          el.zIndex = index
        }
      })

      const currentZ = element.zIndex ?? 0
      const lowerElements = this.elements
        .filter(el => (el.zIndex ?? 0) < currentZ)
        .sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0))

      if (lowerElements.length > 0) {
        const nextElement = lowerElements[0]
        const tempZ = element.zIndex
        element.zIndex = nextElement.zIndex
        nextElement.zIndex = tempZ
      }
    },

    alignElements(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
      const selectedId = this.selectedElementId
      if (!selectedId) return

      const elementIndex = this.elements.findIndex((el) => el.id === selectedId)
      if (elementIndex === -1) return

      const element = this.elements[elementIndex]
      const canvasWidth = this.canvasWidth
      const canvasHeight = this.canvasHeight
      const elementWidth = element.width * (element.scale || 1)
      const elementHeight = element.height * (element.scale || 1)

      let newX = element.position.x
      let newY = element.position.y

      switch (alignment) {
        case 'left':
          newX = elementWidth / 2
          break
        case 'center':
          newX = canvasWidth / 2
          break
        case 'right':
          newX = canvasWidth - (elementWidth / 2)
          break
        case 'top':
          newY = elementHeight / 2
          break
        case 'middle':
          newY = canvasHeight / 2
          break
        case 'bottom':
          newY = canvasHeight - (elementHeight / 2)
          break
      }

      this.updateElement(selectedId, {
        position: { x: newX, y: newY }
      })
    },

    setTool(tool: 'select' | 'text' | 'draw' | null) {
      this.currentTool = tool
      this.drawMode = tool === 'draw'
      this.textToolActive = tool === 'text'
    },

    activateDrawMode() {
      this.setTool('draw')
    },

    deactivateDrawMode() {
      if (this.currentTool === 'draw') {
        this.setTool('select')
      }
    },

    activateTextTool() {
      this.setTool('text')
    },

    deactivateTextTool() {
      if (this.currentTool === 'text') {
        this.setTool('select')
      }
    },

    updateDrawOptions(options: Partial<DrawToolOptions>) {
      this.drawOptions = { ...this.drawOptions, ...options }
    },

    updateTextOptions(options: Partial<TextToolOptions>) {
      this.textOptions = { ...this.textOptions, ...options }
    },

    setViewMode(mode: ViewMode) {
      this.viewMode = mode
    },

    setProduct(type: string, size: string, width: number, height: number) {
      this.cupType = type
      this.cupSize = size
      this.canvasWidth = width
      this.canvasHeight = height
    },

    setState(state: { elements: AnyElement[]; selectedElementId: string | null }) {
      this.elements = state.elements.map(el => {
        if (!el.position || typeof el.position.x !== 'number' || typeof el.position.y !== 'number') {
          el.position = { x: 100, y: 100 }
        }
        if (typeof el.scale !== 'number') {
          el.scale = 1
        }
        if (typeof el.rotation !== 'number') {
          el.rotation = 0
        }
        return el
      })
      this.selectedElementId = state.selectedElementId
    },

    getState(): { elements: AnyElement[]; selectedElementId: string | null } {
      return {
        elements: JSON.parse(JSON.stringify(this.elements)),
        selectedElementId: this.selectedElementId,
      }
    },
  },
})
