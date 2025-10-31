import { defineStore } from 'pinia'
import chroma from 'chroma-js'

export interface Pattern {
  id: string
  name: string
  category: string
  type: 'stripes' | 'dots' | 'chevron' | 'grid' | 'waves' | 'geometric' | 'image'
  preview: string // base64 or url
  config?: any
}

export interface BackgroundState {
  type: 'none' | 'solid' | 'pattern' | 'image'
  solidColor: string
  pattern: Pattern | null
  imageUrl: string | null
  opacity: number
}

export const useBackgroundStore = defineStore('background', {
  state: () => ({
    backgroundType: 'none' as 'none' | 'solid' | 'pattern' | 'image',
    solidColor: '#FFFFFF',
    selectedPattern: null as Pattern | null,
    imageUrl: null as string | null,
    opacity: 1,
    colorFormat: 'hex' as 'hex' | 'rgb' | 'cmyk',
    recentColors: [] as string[],
    patternCategories: [
      'All',
      'Abstract',
      'Nature'
    ],
    selectedCategory: 'All',
    searchQuery: '',
    showColorPicker: false,
    showPatternPicker: false,
    showVarianceDisclaimer: false,
    isUserInitiated: false,
  }),

  getters: {
    currentBackground: (state): BackgroundState => ({
      type: state.backgroundType,
      solidColor: state.solidColor,
      pattern: state.selectedPattern,
      imageUrl: state.imageUrl,
      opacity: state.opacity,
    }),

    hasBackground: (state): boolean => {
      return state.backgroundType !== 'none'
    },
    colorAsHex: (state): string => {
      try {
        return chroma(state.solidColor).hex()
      } catch {
        return '#FFFFFF'
      }
    },

    colorAsRgb: (state): { r: number; g: number; b: number } => {
      try {
        const [r, g, b] = chroma(state.solidColor).rgb()
        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
      } catch {
        return { r: 255, g: 255, b: 255 }
      }
    },

    colorAsCmyk: (state): { c: number; m: number; y: number; k: number } => {
      try {
        const [c, m, y, k] = chroma(state.solidColor).cmyk()
        return { 
          c: Math.round(c * 100), 
          m: Math.round(m * 100), 
          y: Math.round(y * 100), 
          k: Math.round(k * 100) 
        }
      } catch {
        return { c: 0, m: 0, y: 0, k: 0 }
      }
    },

    filteredPatterns: (state) => (patterns: Pattern[]) => {
      let filtered = patterns

      if (state.selectedCategory !== 'All') {
        filtered = filtered.filter(p => p.category === state.selectedCategory)
      }

      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        )
      }

      return filtered
    },
  },

  actions: {
    setBackgroundType(type: 'none' | 'solid' | 'pattern' | 'image', userInitiated = false) {
      const isChangingToBackground = this.backgroundType === 'none' && type !== 'none'
      
      this.backgroundType = type
      this.isUserInitiated = userInitiated
      
      if (isChangingToBackground && userInitiated && !sessionStorage.getItem('background-disclaimer-shown')) {
        this.showVarianceDisclaimer = true
        sessionStorage.setItem('background-disclaimer-shown', 'true')
      }
    },

    clearBackground() {
      this.backgroundType = 'none'
      this.selectedPattern = null
      this.imageUrl = null
    },

    setSolidColor(color: string, userInitiated = false) {
      try {
        this.solidColor = chroma(color).hex()
        this.setBackgroundType('solid', userInitiated)
        this.addToRecentColors(this.solidColor)
      } catch (error) {
        // Invalid color
      }
    },

    setColorFromRgb(r: number, g: number, b: number) {
      this.solidColor = chroma.rgb(r, g, b).hex()
      this.setBackgroundType('solid', true)
      this.addToRecentColors(this.solidColor)
    },

    setColorFromCmyk(c: number, m: number, y: number, k: number) {
      this.solidColor = chroma.cmyk(c/100, m/100, y/100, k/100).hex()
      this.setBackgroundType('solid', true)
      this.addToRecentColors(this.solidColor)
    },

    setColorFormat(format: 'hex' | 'rgb' | 'cmyk') {
      this.colorFormat = format
    },

    addToRecentColors(color: string) {
      this.recentColors = this.recentColors.filter(c => c !== color)
      this.recentColors.unshift(color)
      this.recentColors = this.recentColors.slice(0, 12)
    },

    setPattern(pattern: Pattern) {
      this.selectedPattern = pattern
      this.setBackgroundType('pattern', true)
    },

    clearPattern() {
      this.selectedPattern = null
      if (this.backgroundType === 'pattern') {
        this.backgroundType = 'none'
      }
    },

    setPatternCategory(category: string) {
      this.selectedCategory = category
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    setImageBackground(url: string) {
      this.imageUrl = url
      this.backgroundType = 'image'
    },

    setOpacity(opacity: number) {
      this.opacity = Math.max(0, Math.min(1, opacity))
    },

    toggleColorPicker() {
      this.showColorPicker = !this.showColorPicker
      if (this.showColorPicker) {
        this.showPatternPicker = false
      }
    },

    togglePatternPicker() {
      this.showPatternPicker = !this.showPatternPicker
      if (this.showPatternPicker) {
        this.showColorPicker = false
      }
    },

    closeAllPickers() {
      this.showColorPicker = false
      this.showPatternPicker = false
    },

    dismissDisclaimer() {
      this.showVarianceDisclaimer = false
    },
  },
})

