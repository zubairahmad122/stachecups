import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash-es'
import { z } from 'zod'
import { useEditorStore } from './editor'
import { useProductStore } from './product'
import { useBackgroundStore } from './background'
import { useCollectionStore } from './collection'

// Zod validation schemas
const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

const ElementSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'emoji', 'monogram']),
  position: PositionSchema,
  scale: z.number(),
  rotation: z.number(),
  // Allow any additional properties
}).passthrough()

const BackgroundSchema = z.object({
  type: z.enum(['none', 'solid', 'pattern', 'image']),
  solidColor: z.string().optional(),
  pattern: z.any().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  opacity: z.number(),
}).passthrough()

const ProductSchema = z.object({
  type: z.string(),
  size: z.string(),
  width: z.number(),
  height: z.number(),
})

const DesignStateSchema = z.object({
  version: z.string(),
  timestamp: z.number(),
  collection: z.string().optional(), // Add collection ID to track which collection the design belongs to
  product: ProductSchema,
  elements: z.array(ElementSchema),
  background: BackgroundSchema.nullable(),
  selectedElementId: z.string().nullable(),
  lockedElements: z.array(z.string()),
  hiddenElements: z.array(z.string()),
})

export type DesignState = z.infer<typeof DesignStateSchema>

const AUTOSAVE_KEY = 'stachecups_design_autosave'
const AUTOSAVE_INTERVAL = 3000 // 3 seconds
const DESIGN_VERSION = '2.0' // Increment version for breaking changes

export const useDesignStateStore = defineStore('designState', {
  state: () => ({
    lastSaveTime: null as Date | null,
    isSaving: false,
    hasUnsavedChanges: false,
    autosaveEnabled: true,
    autosaveTimer: null as ReturnType<typeof setTimeout> | null,
    lastSaveHash: '',
    isInitialized: false,
  }),

  getters: {
    timeSinceLastSave: (state): string | null => {
      if (!state.lastSaveTime) return null

      const now = new Date()
      const diff = now.getTime() - state.lastSaveTime.getTime()
      const seconds = Math.floor(diff / 1000)

      if (seconds < 60) return 'Just now'
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      return `${Math.floor(seconds / 3600)}h ago`
    },
  },

  actions: {
    /**
     * Capture current design state from all stores with deep cloning
     */
    captureCurrentState(): DesignState {
      const editorStore = useEditorStore()
      const productStore = useProductStore()
      const backgroundStore = useBackgroundStore()
      const collectionStore = useCollectionStore()

      // Deep clone to avoid reference issues
      const elements = cloneDeep(editorStore.elements)
      const background = cloneDeep(backgroundStore.currentBackground)

      const state: DesignState = {
        version: DESIGN_VERSION,
        timestamp: Date.now(),
        collection: collectionStore.activeCollection, // Save current collection ID
        product: {
          type: productStore.currentProduct.type,
          size: productStore.currentProduct.size,
          width: productStore.currentProduct.width,
          height: productStore.currentProduct.height,
        },
        elements: elements,
        background: background || null,
        selectedElementId: editorStore.selectedElementId,
        lockedElements: Array.from(editorStore.lockedElements),
        hiddenElements: Array.from(editorStore.hiddenElements),
      }

      return state
    },

    /**
     * Validate design state structure
     */
    validateState(state: any): state is DesignState {
      try {
        DesignStateSchema.parse(state)
        return true
      } catch (error) {
        return false
      }
    },

    /**
     * Restore design state to all stores with validation
     */
    async restoreState(designState: DesignState): Promise<boolean> {
      try {
        // Validate state structure
        if (!this.validateState(designState)) {
          return false
        }

        const editorStore = useEditorStore()
        const productStore = useProductStore()
        const backgroundStore = useBackgroundStore()

        // Step 1: Restore product first (affects canvas dimensions)
        productStore.setProduct({
          type: designState.product.type,
          size: designState.product.size,
          width: designState.product.width,
          height: designState.product.height,
        })

        // Step 2: Clear existing elements
        editorStore.clearElements()

        // Step 3: Restore background
        if (designState.background && designState.background.type !== 'none') {
          const bg = designState.background

          if (bg.type === 'solid' && bg.solidColor) {
            backgroundStore.setSolidColor(bg.solidColor, false)
          } else if (bg.type === 'pattern' && bg.pattern) {
            backgroundStore.setPattern(bg.pattern)
          } else if (bg.type === 'image' && bg.imageUrl) {
            backgroundStore.setImageBackground(bg.imageUrl)
          }

          if (bg.opacity !== undefined && bg.opacity !== 1) {
            backgroundStore.setOpacity(bg.opacity)
          }
        } else {
          backgroundStore.clearBackground()
        }

        // Step 4: Restore elements with deep clone
        const elementsToRestore = cloneDeep(designState.elements)

        for (const element of elementsToRestore) {
          // Ensure required properties
          element.position = element.position || { x: 100, y: 100 }
          element.scale = element.scale ?? 1
          element.rotation = element.rotation ?? 0

          // Add to store
          editorStore.addElement(element)
        }

        // Step 5: Restore selection
        editorStore.selectElement(designState.selectedElementId)

        // Step 6: Restore locked/hidden states
        editorStore.lockedElements.clear()
        if (designState.lockedElements) {
          designState.lockedElements.forEach(id => {
            editorStore.lockedElements.add(id)
          })
        }

        editorStore.hiddenElements.clear()
        if (designState.hiddenElements) {
          designState.hiddenElements.forEach(id => {
            editorStore.hiddenElements.add(id)
          })
        }

        // Update hash
        this.lastSaveHash = this.getStateHash()
        this.hasUnsavedChanges = false

        return true
      } catch (error) {
        return false
      }
    },

    /**
     * Generate hash of current state to detect changes
     */
    getStateHash(): string {
      const state = this.captureCurrentState()
      const { timestamp, ...stateWithoutTime } = state
      return JSON.stringify(stateWithoutTime)
    },

    /**
     * Check if state has changed since last save
     */
    hasStateChanged(): boolean {
      const editorStore = useEditorStore()

      // Don't save if no elements and no background
      if (editorStore.elements.length === 0) {
        return false
      }

      const currentHash = this.getStateHash()
      return currentHash !== this.lastSaveHash
    },

    /**
     * Save to localStorage with validation
     */
    saveToLocalStorage(): boolean {
      try {
        const editorStore = useEditorStore()

        // Don't save empty designs
        if (editorStore.elements.length === 0) {
          return true
        }

        // Only save if state has changed
        if (!this.hasStateChanged()) {
          return true
        }

        this.isSaving = true
        const state = this.captureCurrentState()

        // Validate before saving
        if (!this.validateState(state)) {
          this.isSaving = false
          return false
        }

        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state))

        this.lastSaveTime = new Date()
        this.lastSaveHash = this.getStateHash()
        this.hasUnsavedChanges = false
        this.isSaving = false

        return true
      } catch (error) {
        this.isSaving = false
        return false
      }
    },

    /**
     * Load from localStorage with validation
     */
    loadFromLocalStorage(): DesignState | null {
      try {
        const saved = localStorage.getItem(AUTOSAVE_KEY)
        if (!saved) {
          return null
        }

        const state = JSON.parse(saved)

        // Validate structure
        if (!this.validateState(state)) {
          this.clearLocalStorage()
          return null
        }

        // Check version compatibility
        if (state.version !== DESIGN_VERSION) {
          // Could add migration logic here
        }

        return state
      } catch (error) {
        this.clearLocalStorage()
        return null
      }
    },

    /**
     * Clear localStorage
     */
    clearLocalStorage() {
      localStorage.removeItem(AUTOSAVE_KEY)
      this.lastSaveHash = ''
      this.hasUnsavedChanges = false
    },

    /**
     * Generate shareable link with validation
     */
    generateShareableLink(): string {
      try {
        const state = this.captureCurrentState()

        // Validate before encoding
        if (!this.validateState(state)) {
          return ''
        }

        const json = JSON.stringify(state)
        const encoded = btoa(unescape(encodeURIComponent(json)))

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const path = typeof window !== 'undefined' ? window.location.pathname : ''

        const link = `${baseUrl}${path}?design=${encoded}`

        return link
      } catch (error) {
        return ''
      }
    },

    /**
     * Load from URL parameter with validation
     */
    loadFromUrl(): boolean {
      try {
        if (typeof window === 'undefined') return false

        const urlParams = new URLSearchParams(window.location.search)
        const designParam = urlParams.get('design')

        if (!designParam) return false

        // Decode
        const json = decodeURIComponent(escape(atob(designParam)))
        const state = JSON.parse(json)

        // Validate
        if (!this.validateState(state)) {
          return false
        }

        // Restore
        return this.restoreState(state) as unknown as boolean
      } catch (error) {
        return false
      }
    },

    /**
     * Start autosave with validation
     */
    startAutosave() {
      if (!this.autosaveEnabled) return

      // Clear any existing timer
      this.stopAutosave()

      // Setup interval
      this.autosaveTimer = setInterval(() => {
        if (this.hasStateChanged()) {
          this.saveToLocalStorage()
        }
      }, AUTOSAVE_INTERVAL)

      this.isInitialized = true
    },

    /**
     * Stop autosave
     */
    stopAutosave() {
      if (this.autosaveTimer) {
        clearInterval(this.autosaveTimer)
        this.autosaveTimer = null
      }
    },

    /**
     * Export design as JSON file
     */
    exportAsJson() {
      const state = this.captureCurrentState()
      const json = JSON.stringify(state, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `stachecups-design-${Date.now()}.json`
      link.click()

      URL.revokeObjectURL(url)
    },

    /**
     * Import design from JSON file with validation
     */
    async importFromJson(file: File): Promise<boolean> {
      try {
        const text = await file.text()
        const state = JSON.parse(text)

        if (!this.validateState(state)) {
          throw new Error('Invalid design file structure')
        }

        return this.restoreState(state)
      } catch (error) {
        return false
      }
    },

    /**
     * Create a new blank design
     */
    createNewDesign() {
      const editorStore = useEditorStore()
      const backgroundStore = useBackgroundStore()

      editorStore.clearElements()
      editorStore.deselectAll()
      backgroundStore.clearBackground()

      this.clearLocalStorage()
      this.lastSaveHash = this.getStateHash()
      this.hasUnsavedChanges = false
    },
  },
})
