import { defineStore } from 'pinia'
import { getProductDimensions, getCameraPosition } from '~/config/products'

export interface Product {
  type: string // 'bandit', 'general', 'magnum', etc.
  size: string // '16oz', '23oz', '32oz', etc.
  width: number // Print area width in mm
  height: number // Print area height in mm
}

export const useProductStore = defineStore('product', {
  state: () => ({
    currentProduct: {
      type: 'bandit',
      size: '23oz',
      width: 252.02,
      height: 189.02,
    } as Product,
    previousProduct: null as Product | null,
  }),

  getters: {
    printAreaWidth: (state) => state.currentProduct.width,
    printAreaHeight: (state) => state.currentProduct.height,
    aspectRatio: (state) => state.currentProduct.width / state.currentProduct.height,
    cameraPosition: (state) => getCameraPosition(state.currentProduct.size),
    productIdentifier: (state) => `${state.currentProduct.type}-${state.currentProduct.size}`,
  },

  actions: {
    switchProduct(type: string, size: string) {
      // Get dimensions for new product
      const dimensions = getProductDimensions(type, size)

      if (!dimensions) {
        return false
      }

      // Store previous product for scaling calculations
      this.previousProduct = { ...this.currentProduct }

      // Update to new product
      this.currentProduct = {
        type,
        size,
        width: dimensions.width,
        height: dimensions.height,
      }

      return true
    },

    setProduct(product: Product) {
      this.previousProduct = { ...this.currentProduct }
      this.currentProduct = { ...product }
    },

    getScaleFactor(): { scaleX: number; scaleY: number } {
      if (!this.previousProduct) {
        return { scaleX: 1, scaleY: 1 }
      }

      return {
        scaleX: this.currentProduct.width / this.previousProduct.width,
        scaleY: this.currentProduct.height / this.previousProduct.height,
      }
    },

    reset() {
      this.currentProduct = {
        type: 'bandit',
        size: '23oz',
        width: 252.02,
        height: 189.02,
      }
      this.previousProduct = null
    },
  },
})
