import { defineStore } from 'pinia'
import { DEFAULT_TEXT_STYLES } from '~/config/fonts'

interface TextStroke {
  enabled: boolean
  color: string
  width: number
}

interface TextShadow {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
  opacity: number
}

interface TextEditState {
  content: string
  position: { x: number; y: number }
  fontSize: number
  fontFamily: string
  color: string
  width: number
  height: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  stroke?: TextStroke
  shadow?: TextShadow
  engrave?: boolean
  letterSpacing?: number
  lineHeight?: number
}

export const useTextEditorStore = defineStore('textEditor', {
  state: () => ({
    textToolActive: false,
    isEditingText: false,
    editingElementId: null as string | null,
    selectedFont: 'Roboto',
    selectedFontColor: '#000000',
    selectedFontSize: DEFAULT_TEXT_STYLES.fontSize,
    selectedBold: false,
    selectedItalic: false,
    selectedUnderline: false,

    // Advanced styling state
    selectedStroke: { ...DEFAULT_TEXT_STYLES.stroke },
    selectedShadow: { ...DEFAULT_TEXT_STYLES.shadow },
    selectedEngrave: false,
    selectedLetterSpacing: DEFAULT_TEXT_STYLES.letterSpacing,
    selectedLineHeight: DEFAULT_TEXT_STYLES.lineHeight,

    // Editing state
    editingTextContent: '',
    editingTextPosition: { x: 0, y: 0 },
    editingTextFontSize: 16,
    editingTextFontFamily: 'Roboto',
    editingTextColor: '#000000',
    editingTextWidth: 300,
    editingTextHeight: 150,
    nextTextId: 1,

    // UI state
    showAdvancedPanel: false,
    fontSearchQuery: '',
    selectedFontCategory: 'all',
  }),

  getters: {
    isActive: (state) => state.textToolActive || state.isEditingText,
    
    editingState: (state): TextEditState => ({
      content: state.editingTextContent,
      position: state.editingTextPosition,
      fontSize: state.editingTextFontSize,
      fontFamily: state.editingTextFontFamily,
      color: state.editingTextColor,
      width: state.editingTextWidth,
      height: state.editingTextHeight,
    }),
  },

  actions: {
    activateTextTool() {
      this.textToolActive = true
    },

    deactivateTextTool() {
      this.textToolActive = false
    },

    startEditing(options?: Partial<TextEditState & { elementId?: string }>) {
      this.isEditingText = true
      this.editingElementId = options?.elementId || null

      if (options) {
        this.editingTextContent = options.content || ''
        this.editingTextPosition = options.position || { x: 0, y: 0 }
        this.editingTextFontSize = options.fontSize || 16
        this.editingTextFontFamily = options.fontFamily || 'Roboto'
        this.editingTextColor = options.color || '#000000'
        this.editingTextWidth = options.width || 400
        this.editingTextHeight = options.height || 150
      }
    },

    finishEditing() {
      this.isEditingText = false
      this.editingElementId = null
    },

    cancelEditing() {
      this.isEditingText = false
      this.editingTextContent = ''
      this.editingElementId = null
    },

    setEditingContent(content: string) {
      this.editingTextContent = content
    },

    setEditingPosition(x: number, y: number) {
      this.editingTextPosition = { x, y }
    },

    setEditingFontSize(size: number) {
      this.editingTextFontSize = size
    },

    setEditingFontFamily(family: string) {
      this.editingTextFontFamily = family
    },

    setEditingColor(color: string) {
      this.editingTextColor = color
    },

    setEditingDimensions(width: number, height: number) {
      this.editingTextWidth = width
      this.editingTextHeight = height
    },

    setSelectedFont(font: string) {
      this.selectedFont = font
    },

    setSelectedFontColor(color: string) {
      this.selectedFontColor = color
    },

    getNextTextId(): string {
      return `txt-${this.nextTextId++}`
    },

    // Advanced styling actions
    setSelectedBold(bold: boolean) {
      this.selectedBold = bold
    },

    setSelectedItalic(italic: boolean) {
      this.selectedItalic = italic
    },

    setSelectedUnderline(underline: boolean) {
      this.selectedUnderline = underline
    },

    setSelectedFontSize(size: number) {
      this.selectedFontSize = size
    },

    // Stroke actions
    toggleStroke() {
      this.selectedStroke.enabled = !this.selectedStroke.enabled
    },

    setStrokeColor(color: string) {
      this.selectedStroke.color = color
    },

    setStrokeWidth(width: number) {
      this.selectedStroke.width = width
    },

    updateStroke(stroke: Partial<TextStroke>) {
      this.selectedStroke = { ...this.selectedStroke, ...stroke }
    },

    // Shadow actions
    toggleShadow() {
      this.selectedShadow.enabled = !this.selectedShadow.enabled
    },

    setShadowColor(color: string) {
      this.selectedShadow.color = color
    },

    setShadowBlur(blur: number) {
      this.selectedShadow.blur = blur
    },

    setShadowOffset(offsetX: number, offsetY: number) {
      this.selectedShadow.offsetX = offsetX
      this.selectedShadow.offsetY = offsetY
    },

    setShadowOpacity(opacity: number) {
      this.selectedShadow.opacity = opacity
    },

    updateShadow(shadow: Partial<TextShadow>) {
      this.selectedShadow = { ...this.selectedShadow, ...shadow }
    },

    // Engrave action
    toggleEngrave() {
      this.selectedEngrave = !this.selectedEngrave
    },

    setEngrave(engrave: boolean) {
      this.selectedEngrave = engrave
    },

    // Letter spacing
    setLetterSpacing(spacing: number) {
      this.selectedLetterSpacing = spacing
    },

    // Line height
    setLineHeight(height: number) {
      this.selectedLineHeight = height
    },

    // UI actions
    toggleAdvancedPanel() {
      this.showAdvancedPanel = !this.showAdvancedPanel
    },

    setFontSearchQuery(query: string) {
      this.fontSearchQuery = query
    },

    setFontCategory(category: string) {
      this.selectedFontCategory = category
    },

    // Get current text styles
    getCurrentTextStyles() {
      return {
        font: this.selectedFont,
        fontSize: this.selectedFontSize,
        color: this.selectedFontColor,
        bold: this.selectedBold,
        italic: this.selectedItalic,
        underline: this.selectedUnderline,
        stroke: { ...this.selectedStroke },
        shadow: { ...this.selectedShadow },
        engrave: this.selectedEngrave,
        letterSpacing: this.selectedLetterSpacing,
        lineHeight: this.selectedLineHeight,
      }
    },

    // Apply styles from element
    applyStylesFromElement(element: any) {
      // Always set values - use element values or defaults
      this.selectedFont = element.font || 'Roboto'
      this.selectedFontSize = element.fontSize || DEFAULT_TEXT_STYLES.fontSize
      this.selectedFontColor = element.color || '#000000'
      this.selectedBold = element.bold || false
      this.selectedItalic = element.italic || false
      this.selectedUnderline = element.underline || false

      // For stroke and shadow, always set full objects with defaults if missing
      if (element.stroke) {
        this.selectedStroke = {
          enabled: element.stroke.enabled || false,
          color: element.stroke.color || '#FFFFFF',
          width: element.stroke.width || 2
        }
      } else {
        // Reset to defaults if no stroke
        this.selectedStroke = { ...DEFAULT_TEXT_STYLES.stroke }
      }

      if (element.shadow) {
        this.selectedShadow = {
          enabled: element.shadow.enabled || false,
          color: element.shadow.color || '#000000',
          blur: element.shadow.blur || 5,
          offsetX: element.shadow.offsetX || 2,
          offsetY: element.shadow.offsetY || 2,
          opacity: element.shadow.opacity !== undefined ? element.shadow.opacity : 0.5
        }
      } else {
        // Reset to defaults if no shadow
        this.selectedShadow = { ...DEFAULT_TEXT_STYLES.shadow }
      }

      this.selectedEngrave = element.engrave || false
      this.selectedLetterSpacing = element.letterSpacing !== undefined ? element.letterSpacing : DEFAULT_TEXT_STYLES.letterSpacing
      this.selectedLineHeight = element.lineHeight !== undefined ? element.lineHeight : DEFAULT_TEXT_STYLES.lineHeight
    },

    reset() {
      this.textToolActive = false
      this.isEditingText = false
      this.editingTextContent = ''
      this.selectedFont = 'Roboto'
      this.selectedFontColor = '#000000'
      this.selectedFontSize = DEFAULT_TEXT_STYLES.fontSize
      this.selectedBold = false
      this.selectedItalic = false
      this.selectedUnderline = false
      this.selectedStroke = { ...DEFAULT_TEXT_STYLES.stroke }
      this.selectedShadow = { ...DEFAULT_TEXT_STYLES.shadow }
      this.selectedEngrave = false
      this.selectedLetterSpacing = DEFAULT_TEXT_STYLES.letterSpacing
      this.selectedLineHeight = DEFAULT_TEXT_STYLES.lineHeight
    },
  },
})

