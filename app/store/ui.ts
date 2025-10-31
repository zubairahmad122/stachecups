import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    visualization: 'design' as 'design' | 'mockup' | 'checkout',
    previewZoom: false,
    render: true,
    hideControls: false,
    hideEverything: false,
  }),

  getters: {
    isDesignMode: (state) => state.visualization === 'design',
    isMockupMode: (state) => state.visualization === 'mockup',
    isCheckoutMode: (state) => state.visualization === 'checkout',
    shouldShowControls: (state) => !state.hideControls,
  },

  actions: {
    setVisualization(mode: 'design' | 'mockup' | 'checkout') {
      this.visualization = mode
    },

    togglePreviewZoom() {
      this.previewZoom = !this.previewZoom
    },

    setPreviewZoom(value: boolean) {
      this.previewZoom = value
    },

    setRender(value: boolean) {
      this.render = value
    },

    setHideControls(value: boolean) {
      this.hideControls = value
    },

    setHideEverything(value: boolean) {
      this.hideEverything = value
    },

    showCheckout() {
      this.visualization = 'checkout'
      this.hideEverything = false
    },

    returnToDesign() {
      this.visualization = 'design'
      this.hideEverything = false
    },

    prepareForExport() {
      this.hideControls = true
      this.hideEverything = true
    },

    restoreAfterExport() {
      this.hideControls = false
      this.hideEverything = false
    },
  },
})

