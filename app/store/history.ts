import { defineStore } from 'pinia'
import type { HistoryState } from '~/types/editor'
import { HISTORY_CONFIG } from '~/config/constants'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    history: [] as HistoryState[],
    historyIndex: -1,
    maxHistorySize: HISTORY_CONFIG.MAX_HISTORY_SIZE,
  }),

  getters: {
    canUndo: (state): boolean => {
      return state.historyIndex > 0
    },

    canRedo: (state): boolean => {
      return state.historyIndex < state.history.length - 1
    },

    currentHistoryLength: (state): number => {
      return state.history.length
    },
  },

  actions: {
    saveState(state: HistoryState) {
      // Remove any states after the current index (when undoing then making new changes)
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1)
      }

      // Add new state
      this.history.push(JSON.parse(JSON.stringify(state)))
      this.historyIndex++

      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift()
        this.historyIndex--
      }
    },

    undo(): HistoryState | null {
      if (!this.canUndo) return null

      this.historyIndex--
      return JSON.parse(JSON.stringify(this.history[this.historyIndex]))
    },

    redo(): HistoryState | null {
      if (!this.canRedo) return null

      this.historyIndex++
      return JSON.parse(JSON.stringify(this.history[this.historyIndex]))
    },

    clear() {
      this.history = []
      this.historyIndex = -1
    },

    getCurrentState(): HistoryState | null {
      if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
        return JSON.parse(JSON.stringify(this.history[this.historyIndex]))
      }
      return null
    },
  },
})
