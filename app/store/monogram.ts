import { defineStore } from 'pinia'
import { MONOGRAM_TEMPLATES, type MonogramTemplate } from '~/config/fonts'

interface MonogramState {
  showMonogramPicker: boolean
  editingMonogram: any | null // Element being edited
  selectedTemplate: MonogramTemplate | null
  letters: {
    first: string
    middle: string
    last: string
  }
  font: string
  fontSize: number
  color: string
  spacing: number
}

export const useMonogramStore = defineStore('monogram', {
  state: (): MonogramState => ({
    showMonogramPicker: false,
    editingMonogram: null,
    selectedTemplate: null,
    letters: {
      first: '',
      middle: '',
      last: '',
    },
    font: 'monogram_kk',
    fontSize: 48,
    color: '#000000',
    spacing: 10,
  }),

  getters: {
    isValid: (state) => {
      if (!state.selectedTemplate) return false
      const letterCount = state.selectedTemplate.letterCount
      
      if (letterCount === 1) return state.letters.first.length > 0
      if (letterCount === 2) return state.letters.first.length > 0 && state.letters.last.length > 0
      if (letterCount === 3) {
        return state.letters.first.length > 0 && 
               state.letters.middle.length > 0 && 
               state.letters.last.length > 0
      }
      
      return false
    },

    monogramText: (state) => {
      if (!state.selectedTemplate) return ''

      const { first, middle, last } = state.letters
      const layout = state.selectedTemplate.layoutStyle
      const letterCount = state.selectedTemplate.letterCount

      if (letterCount === 1) {
        return first.toUpperCase()
      }

      if (letterCount === 2) {
        switch (layout) {
          case 'horizontal':
            return `${first} ${last}`.toUpperCase()
          case 'stacked':
          case 'vertical':
            return `${first}\n${last}`.toUpperCase()
          default:
            return `${first}${last}`.toUpperCase()
        }
      }

      switch (layout) {
        case 'script':
          // Script: first name (lowercase), last name (uppercase), middle name (lowercase)
          // Note: This is for display purposes only, actual rendering uses separate spans
          return `${first.toLowerCase()}${last.toUpperCase()}${middle.toLowerCase()}`
        case 'circle':
          // Circle: all uppercase, first-last-middle order
          return `${first}${last}${middle}`.toUpperCase()
        default:
          return `${first}${middle}${last}`.toUpperCase()
      }
    },
  },

  actions: {
    openMonogramPicker(editingElement: any = null) {
      this.editingMonogram = editingElement
      this.showMonogramPicker = true
    },

    closeMonogramPicker() {
      this.showMonogramPicker = false
      this.editingMonogram = null
    },

    selectTemplate(template: MonogramTemplate) {
      this.selectedTemplate = template
    },

    setLetters(first: string, middle: string, last: string) {
      this.letters = {
        first: first.charAt(0).toUpperCase(),
        middle: middle.charAt(0).toUpperCase(),
        last: last.charAt(0).toUpperCase(),
      }
    },

    setFirstLetter(letter: string) {
      this.letters.first = letter.charAt(0).toUpperCase()
    },

    setMiddleLetter(letter: string) {
      this.letters.middle = letter.charAt(0).toUpperCase()
    },

    setLastLetter(letter: string) {
      this.letters.last = letter.charAt(0).toUpperCase()
    },

    setFont(font: string) {
      this.font = font
    },

    setFontSize(size: number) {
      this.fontSize = size
    },

    setColor(color: string) {
      this.color = color
    },

    setSpacing(spacing: number) {
      this.spacing = spacing
    },

    getMonogramConfig() {
      return {
        template: this.selectedTemplate,
        letters: { ...this.letters },
        font: this.font,
        fontSize: this.fontSize,
        color: this.color,
        spacing: this.spacing,
        text: this.monogramText,
      }
    },

    reset() {
      this.selectedTemplate = null
      this.letters = {
        first: '',
        middle: '',
        last: '',
      }
      this.font = 'monogram_kk'
      this.fontSize = 48
      this.color = '#000000'
      this.spacing = 10
    },
  },
})

