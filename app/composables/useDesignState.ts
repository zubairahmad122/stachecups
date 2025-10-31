import { useDesignStateStore } from '~/store/designState'

/**
 * Composable for managing design state operations
 * This wraps the design state store for easier use in components
 */
export function useDesignState() {
  const designStateStore = useDesignStateStore()

  /**
   * Initialize autosave and check for existing designs
   */
  const initialize = () => {
    // Start autosave
    designStateStore.startAutosave()

    // Check for design in URL first
    const loadedFromUrl = designStateStore.loadFromUrl()

    // Return info about what was loaded
    return {
      loadedFromUrl,
      hasAutosave: !loadedFromUrl && !!designStateStore.loadFromLocalStorage(),
    }
  }

  /**
   * Save current design to localStorage
   */
  const save = () => {
    return designStateStore.saveToLocalStorage()
  }

  /**
   * Load saved design from localStorage
   */
  const load = () => {
    const savedState = designStateStore.loadFromLocalStorage()
    if (savedState) {
      return designStateStore.restoreState(savedState)
    }
    return false
  }

  /**
   * Restore a specific design state
   */
  const restore = (state: any) => {
    return designStateStore.restoreState(state)
  }

  /**
   * Clear saved design
   */
  const clear = () => {
    designStateStore.clearLocalStorage()
  }

  /**
   * Generate shareable link
   */
  const generateShareLink = () => {
    return designStateStore.generateShareableLink()
  }

  /**
   * Export design as JSON
   */
  const exportJson = () => {
    designStateStore.exportAsJson()
  }

  /**
   * Import design from JSON file
   */
  const importJson = async (file: File) => {
    return await designStateStore.importFromJson(file)
  }

  /**
   * Create new design
   */
  const createNew = () => {
    designStateStore.createNewDesign()
  }

  /**
   * Get saved design without restoring
   */
  const getSaved = () => {
    return designStateStore.loadFromLocalStorage()
  }

  /**
   * Stop autosave
   */
  const stopAutosave = () => {
    designStateStore.stopAutosave()
  }

  /**
   * Start autosave
   */
  const startAutosave = () => {
    designStateStore.startAutosave()
  }

  /**
   * Capture current state
   */
  const captureState = () => {
    return designStateStore.captureCurrentState()
  }

  return {
    // State
    lastSaveTime: computed(() => designStateStore.lastSaveTime),
    isSaving: computed(() => designStateStore.isSaving),
    hasUnsavedChanges: computed(() => designStateStore.hasUnsavedChanges),
    timeSinceLastSave: computed(() => designStateStore.timeSinceLastSave),

    // Methods
    initialize,
    save,
    load,
    restore,
    clear,
    generateShareLink,
    exportJson,
    importJson,
    createNew,
    getSaved,
    stopAutosave,
    startAutosave,
    captureState,
  }
}
