export interface FontOption {
  label: string
  value: string
  fontFamily: string
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace'
  weight?: number
}

// Categorized Google Fonts for better organization
export const AVAILABLE_FONTS: FontOption[] = [
  // Sans Serif Fonts
  { label: 'Roboto', value: 'Roboto', fontFamily: 'Roboto, sans-serif', category: 'sans-serif' },
  { label: 'Open Sans', value: 'Open Sans', fontFamily: 'Open Sans, sans-serif', category: 'sans-serif' },
  { label: 'Lato', value: 'Lato', fontFamily: 'Lato, sans-serif', category: 'sans-serif' },
  { label: 'Montserrat', value: 'Montserrat', fontFamily: 'Montserrat, sans-serif', category: 'sans-serif' },
  { label: 'Raleway', value: 'Raleway', fontFamily: 'Raleway, sans-serif', category: 'sans-serif' },
  { label: 'Poppins', value: 'Poppins', fontFamily: 'Poppins, sans-serif', category: 'sans-serif' },
  { label: 'Nunito', value: 'Nunito', fontFamily: 'Nunito, sans-serif', category: 'sans-serif' },
  { label: 'Inter', value: 'Inter', fontFamily: 'Inter, sans-serif', category: 'sans-serif' },
  { label: 'Work Sans', value: 'Work Sans', fontFamily: 'Work Sans, sans-serif', category: 'sans-serif' },
  { label: 'Arial', value: 'Arial', fontFamily: 'Arial, sans-serif', category: 'sans-serif' },

  // Serif Fonts
  { label: 'Playfair Display', value: 'Playfair Display', fontFamily: 'Playfair Display, serif', category: 'serif' },
  { label: 'Merriweather', value: 'Merriweather', fontFamily: 'Merriweather, serif', category: 'serif' },
  { label: 'Lora', value: 'Lora', fontFamily: 'Lora, serif', category: 'serif' },
  { label: 'Crimson Text', value: 'Crimson Text', fontFamily: 'Crimson Text, serif', category: 'serif' },
  { label: 'Georgia', value: 'Georgia', fontFamily: 'Georgia, serif', category: 'serif' },
  { label: 'Times New Roman', value: 'Times New Roman', fontFamily: 'Times New Roman, serif', category: 'serif' },

  // Handwriting Fonts
  { label: 'Dancing Script', value: 'Dancing Script', fontFamily: 'Dancing Script, cursive', category: 'handwriting' },
  { label: 'Pacifico', value: 'Pacifico', fontFamily: 'Pacifico, cursive', category: 'handwriting' },
  { label: 'Great Vibes', value: 'Great Vibes', fontFamily: 'Great Vibes, cursive', category: 'handwriting' },
  { label: 'Caveat', value: 'Caveat', fontFamily: 'Caveat, cursive', category: 'handwriting' },
  { label: 'Sacramento', value: 'Sacramento', fontFamily: 'Sacramento, cursive', category: 'handwriting' },
  { label: 'Satisfy', value: 'Satisfy', fontFamily: 'Satisfy, cursive', category: 'handwriting' },
  { label: 'Shadows Into Light', value: 'Shadows Into Light', fontFamily: 'Shadows Into Light, cursive', category: 'handwriting' },
  { label: 'Indie Flower', value: 'Indie Flower', fontFamily: 'Indie Flower, cursive', category: 'handwriting' },

  // Display Fonts
  { label: 'Bebas Neue', value: 'Bebas Neue', fontFamily: 'Bebas Neue, display', category: 'display' },
  { label: 'Permanent Marker', value: 'Permanent Marker', fontFamily: 'Permanent Marker, cursive', category: 'display' },
  { label: 'Archivo Black', value: 'Archivo Black', fontFamily: 'Archivo Black, sans-serif', category: 'display' },
  { label: 'Anton', value: 'Anton', fontFamily: 'Anton, sans-serif', category: 'display' },
  { label: 'Lobster', value: 'Lobster', fontFamily: 'Lobster, cursive', category: 'display' },
  { label: 'Righteous', value: 'Righteous', fontFamily: 'Righteous, cursive', category: 'display' },

  // Monospace
  { label: 'Courier New', value: 'Courier New', fontFamily: 'Courier New, monospace', category: 'monospace' },
  { label: 'Roboto Mono', value: 'Roboto Mono', fontFamily: 'Roboto Mono, monospace', category: 'monospace' },
]

export const FONT_CATEGORIES = [
  { id: 'all', label: 'All Fonts', icon: 'mdi-format-text' },
  { id: 'sans-serif', label: 'Sans Serif', icon: 'mdi-format-font' },
  { id: 'serif', label: 'Serif', icon: 'mdi-format-text-variant' },
  { id: 'handwriting', label: 'Handwriting', icon: 'mdi-script-text' },
  { id: 'display', label: 'Display', icon: 'mdi-format-title' },
  { id: 'monospace', label: 'Monospace', icon: 'mdi-code-tags' },
]

export const CUSTOM_MONOGRAM_FONTS = [
  { label: 'Monogram KK', value: 'monogram_kk', path: '/fonts/monogram_kk.woff2' },
  { label: 'Round Monogram Center', value: 'round_monogram_center', path: '/fonts/round_monogram_center.woff2' },
  { label: 'Round Monogram Left', value: 'round_monogram_left', path: '/fonts/round_monogram_left.woff2' },
  { label: 'Round Monogram Right', value: 'round_monogram_right', path: '/fonts/round_monogram_right.woff2' },
]

export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128, 156, 200]

export const FONT_SIZE_PRESETS = [
  { label: 'Small', value: 16 },
  { label: 'Medium', value: 24 },
  { label: 'Large', value: 32 },
  { label: 'X-Large', value: 48 },
  { label: 'XX-Large', value: 64 },
  { label: 'Huge', value: 96 },
]

export const STROKE_WIDTH_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10]
export const SHADOW_BLUR_OPTIONS = [0, 2, 4, 6, 8, 10, 15, 20]

// Default text styles configuration
export const DEFAULT_TEXT_STYLES = {
  fontSize: 32,
  color: '#000000',
  bold: false,
  italic: false,
  underline: false,
  stroke: {
    enabled: false,
    color: '#FFFFFF',
    width: 2,
  },
  shadow: {
    enabled: false,
    color: '#000000',
    blur: 5,
    offsetX: 2,
    offsetY: 2,
    opacity: 0.5,
  },
  engrave: false,
  letterSpacing: 0,
  lineHeight: 1.2,
}

// Monogram template configurations
export interface MonogramTemplate {
  id: string
  name: string
  layoutStyle: 'script' | 'circle'
  
  preview: string
  description: string
  letterCount: number
}

export const MONOGRAM_TEMPLATES: MonogramTemplate[] = [
  {
    id: 'script',
    name: 'Script Three-Letter Monogram',
    layoutStyle: 'script',
    preview: '/monograms/script-preview.svg',
    description: 'First name initial on left, last name initial in center (larger), middle name initial on right. Center letter uppercase, side letters lowercase.',
    letterCount: 3,
  },
  {
    id: 'circle',
    name: 'Circle Block Monogram',
    layoutStyle: 'circle',
    preview: '/monograms/circle-preview.svg',
    description: 'First name initial on left, last name initial in center, middle name initial on right. All caps with geometric circle styling.',
    letterCount: 3,
  },
]

export function getFontFamily(fontValue: string): string {
  const font = AVAILABLE_FONTS.find((f) => f.value === fontValue)
  return font?.fontFamily || 'Arial, sans-serif'
}

export function getFontsByCategory(category: string): FontOption[] {
  if (category === 'all') return AVAILABLE_FONTS
  return AVAILABLE_FONTS.filter((f) => f.category === category)
}
