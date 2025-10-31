// Canvas Settings
export const CANVAS_CONFIG = {
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  MIN_SCALE: 0.1,
  MAX_SCALE: 10,
  ROTATION_SNAP_ANGLE: 90,
}

// Element Settings
export const ELEMENT_CONFIG = {
  MIN_SIZE: 20,
  MAX_SIZE: 1000,
  DEFAULT_SCALE: 1,
  DEFAULT_ROTATION: 0,
  IMAGE_MAX_WIDTH: 400,
  IMAGE_MAX_HEIGHT: 400,
  TEXT_DEFAULT_SIZE: 32,
  TEXT_DEFAULT_COLOR: '#000000',
}

// Drawing Settings
export const DRAW_CONFIG = {
  BRUSH_SIZES: [2, 5, 10, 15],
  DEFAULT_BRUSH_SIZE: 5,
  DEFAULT_COLOR: '#000000',
  STROKE_LINECAP: 'round' as const,
  STROKE_LINEJOIN: 'round' as const,
}

// History Settings
export const HISTORY_CONFIG = {
  MAX_HISTORY_SIZE: 50,
  DEBOUNCE_DELAY: 150,
}

// Editor Settings
export const EDITOR_CONFIG = {
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  TEXTURE_UPDATE_DEBOUNCE: 150,
  DOUBLE_CLICK_THRESHOLD: 300,
}

// Sticker Categories
export const STICKER_CATEGORIES = [
  { name: 'Astrology', image: '/stickers/astrology.png' },
  { name: 'Book Lovers', image: '/stickers/book lovers.png' },
  { name: 'Coffee and Tea', image: '/stickers/coffee and tea.png' },
  { name: 'Music', image: '/stickers/music.png' },
  { name: 'Outdoors', image: '/stickers/outdoors.png' },
  { name: 'Pet Lovers', image: '/stickers/pet lovers.png' },
  { name: 'Plants', image: '/stickers/plants.png' },
  { name: 'Positive Vibes', image: '/stickers/positive vibes.png' },
  { name: 'Travel', image: '/stickers/travel.png' },
]

// Colors
export const COLORS = {
  PRIMARY: '#1EADB0',
  DARKEST: '#100F30',
  SECONDARY: '#4B5574',
  DARK_BORDER: '#868DAA',
  LIGHT_BORDER: '#DADEED',
  LIGHT_BG: '#F4F4F7',
}

// API Endpoints
export const API_ENDPOINTS = {
  S3_UPLOAD: '/api/s3',
}

// File Upload Settings
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  EXPORT_FORMAT: 'image/png',
  EXPORT_QUALITY: 1.0,
}
