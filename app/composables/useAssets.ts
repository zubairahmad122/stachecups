/**
 * Centralized Asset Management System
 *
 * This composable manages all app assets (colors, fonts, stickers)
 * from JSON files instead of hardcoded arrays.
 *
 * Benefits:
 * - Easy to add/remove/update assets
 * - No need to rebuild app for asset changes
 * - Can be loaded from API/CMS in future
 * - Better performance with lazy loading
 * - Centralized data management
 */

import type { Ref } from 'vue'
import axios from 'axios'

// Types
export interface ColorData {
  name: string
  hex: string
  category: string
}

export interface ColorPalette {
  id: string
  name: string
  description: string
  colors: ColorData[]
}

export interface ColorCategory {
  id: string
  name: string
  icon: string
}

export interface Font {
  id: string
  label: string
  value: string
  fontFamily: string
  category: string
  weight?: number
  popular?: boolean
  system?: boolean
  previewText?: string
}

export interface FontCategory {
  id: string
  label: string
  icon: string
}

export interface Sticker {
  id: string
  name: string
  path: string
  tags: string[]
}

export interface StickerCategory {
  id: string
  name: string
  description: string
  icon: string
  thumbnail: string | null
  stickers: Sticker[]
}

// Global state (cached)
const colorsData: Ref<{
  palettes: ColorPalette[]
  categories: ColorCategory[]
} | null> = ref(null)

const fontsData: Ref<{
  fonts: Font[]
  categories: FontCategory[]
  sizes: number[]
  sizePresets: { label: string; value: number }[]
  monogramFonts: any[]
} | null> = ref(null)

const stickersData: Ref<{
  categories: StickerCategory[]
  featured: string[]
} | null> = ref(null)

/**
 * Load and cache colors from JSON
 */
export const useColors = () => {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const loadColors = async () => {
    if (colorsData.value) return colorsData.value

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/data/colors.json')
      colorsData.value = data
      return data
    } catch (e) {
      error.value = e as Error
      return null
    } finally {
      loading.value = false
    }
  }

  const getColorsByCategory = (categoryId: string) => {
    if (!colorsData.value) return []

    const palette = colorsData.value.palettes[0]
    if (!palette) return []

    if (categoryId === 'all') return palette.colors

    return palette.colors.filter(c => c.category === categoryId)
  }

  const getAllColors = () => {
    if (!colorsData.value) return []
    return colorsData.value.palettes[0]?.colors || []
  }

  const getCategories = () => {
    return colorsData.value?.categories || []
  }

  return {
    loadColors,
    getColorsByCategory,
    getAllColors,
    getCategories,
    loading,
    error,
    data: colorsData
  }
}

/**
 * Load and cache fonts from JSON
 */
export const useFonts = () => {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const loadFonts = async () => {
    if (fontsData.value) return fontsData.value

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/data/fonts.json')
      fontsData.value = data
      return data
    } catch (e) {
      error.value = e as Error
      return null
    } finally{
      loading.value = false
    }
  }

  const getFontsByCategory = (categoryId: string) => {
    if (!fontsData.value) return []

    if (categoryId === 'all') return fontsData.value.fonts
    if (categoryId === 'popular') {
      return fontsData.value.fonts.filter(f => f.popular)
    }

    return fontsData.value.fonts.filter(f => f.category === categoryId)
  }

  const getAllFonts = () => {
    return fontsData.value?.fonts || []
  }

  const getCategories = () => {
    return fontsData.value?.categories || []
  }

  const getSizes = () => {
    return fontsData.value?.sizes || []
  }

  const getSizePresets = () => {
    return fontsData.value?.sizePresets || []
  }

  const getMonogramFonts = () => {
    return fontsData.value?.monogramFonts || []
  }

  const getFontById = (id: string) => {
    if (!fontsData.value) return null
    return fontsData.value.fonts.find(f => f.id === id)
  }

  const getFontFamily = (fontValue: string): string => {
    if (!fontsData.value) return 'Arial, sans-serif'
    const font = fontsData.value.fonts.find(f => f.value === fontValue)
    return font?.fontFamily || 'Arial, sans-serif'
  }

  return {
    loadFonts,
    getFontsByCategory,
    getAllFonts,
    getCategories,
    getSizes,
    getSizePresets,
    getMonogramFonts,
    getFontById,
    getFontFamily,
    loading,
    error,
    data: fontsData
  }
}

/**
 * Load and cache stickers from JSON
 */
export const useStickers = () => {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const loadStickers = async () => {
    if (stickersData.value) return stickersData.value

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/data/stickers.json')
      stickersData.value = data
      return data
    } catch (e) {
      error.value = e as Error
      return null
    } finally {
      loading.value = false
    }
  }

  const getCategories = () => {
    return stickersData.value?.categories || []
  }

  const getCategoryById = (categoryId: string) => {
    if (!stickersData.value) return null
    return stickersData.value.categories.find(c => c.id === categoryId)
  }

  const getStickersByCategory = (categoryId: string) => {
    const category = getCategoryById(categoryId)
    return category?.stickers || []
  }

  const getAllStickers = () => {
    if (!stickersData.value) return []
    return stickersData.value.categories.flatMap(c => c.stickers)
  }

  const searchStickers = (query: string) => {
    if (!query.trim()) return getAllStickers()

    const lowerQuery = query.toLowerCase()
    return getAllStickers().filter(sticker =>
      sticker.name.toLowerCase().includes(lowerQuery) ||
      sticker.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  const getFeaturedCategories = () => {
    if (!stickersData.value) return []
    return stickersData.value.featured
      .map(id => getCategoryById(id))
      .filter(Boolean) as StickerCategory[]
  }

  return {
    loadStickers,
    getCategories,
    getCategoryById,
    getStickersByCategory,
    getAllStickers,
    searchStickers,
    getFeaturedCategories,
    loading,
    error,
    data: stickersData
  }
}

/**
 * Preload all assets at once (call on app init)
 */
export const usePreloadAssets = () => {
  const loading = ref(false)
  const errors = ref<Error[]>([])

  const preloadAll = async () => {
    loading.value = true
    errors.value = []

    const results = await Promise.allSettled([
      useColors().loadColors(),
      useFonts().loadFonts(),
      useStickers().loadStickers()
    ])

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        errors.value.push(result.reason)
      }
    })

    loading.value = false
    return {
      success: errors.value.length === 0,
      errors: errors.value
    }
  }

  return {
    preloadAll,
    loading,
    errors
  }
}
