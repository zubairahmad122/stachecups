import { defineStore } from 'pinia'
import { getProductDimensions, getCameraPosition } from '~/config/products'

export interface Product {
  type: string 
  size: string 
  width: number 
  height: number 
}

export const useProductStore = defineStore('product', {
  state: () => ({
    currentProduct: {
      type: 'bandit',
      size: 'standard',
      width: 231.42,
      height: 134.37,
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
      const dimensions = getProductDimensions(type, size)

      if (!dimensions) {
        return false
      }

      this.previousProduct = { ...this.currentProduct }

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
        size: 'standard',
        width: 231.42,
        height: 134.37,
      }
      this.previousProduct = null
    },
  },
})
