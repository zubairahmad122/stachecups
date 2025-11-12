// Element Types
export type ElementType = 'image' | 'text' | 'emoji' | 'drawing'

export interface Position {
  x: number
  y: number
}

export interface DesignElement {
  id: string
  type: ElementType
  position: Position
  scale: number
  rotation: number
  width: number
  height: number
  locked?: boolean
  opacity?: number
  zIndex?: number
  name?: string
}

export interface ImageElement extends DesignElement {
  type: 'image'
  src: string
  originalWidth: number
  originalHeight: number
  isSticker?: boolean
  isDrawing?: boolean
  drawingData?: string
  // Frame properties
  frame?: {
    id: string
    shape: string
  }
  // Crop/zoom properties for image within frame
  imageCrop?: {
    x: number
    y: number
    scale: number
  }
  // Flip properties
  flipX?: boolean
  flipY?: boolean
}

export interface TextElement extends DesignElement {
  type: 'text'
  content: string
  font: string
  fontSize: number
  color: string
  bold: boolean
  italic: boolean
  underline: boolean
}

export interface EmojiElement extends DesignElement {
  type: 'emoji'
  emoji: string
}

export type AnyElement = ImageElement | TextElement | EmojiElement

// Editor State
export interface EditorState {
  elements: AnyElement[]
  selectedElementId: string | null
  lockedElements: Set<string>
  drawMode: boolean
  textToolActive: boolean
  currentTool: 'select' | 'text' | 'draw' | null
}

// History
export interface HistoryState {
  elements: AnyElement[]
  selectedElementId: string | null
}

// Product Configuration
export interface ProductDimension {
  name: string
  style: string
  width: number
  height: number
}

export interface CupModel {
  type: string
  sizes: string[]
  modelPath: (size: string) => string
  uvRepeatY: number // UV texture repeat on Y axis
  uvOffsetY: number // UV texture offset on Y axis
  scale: number // 3D model scale in scene (80 for tall cups, 105 for short cups)
}

// View Mode
export type ViewMode = 'design' | 'mockup' | 'checkout'

// Tool Options
export interface DrawToolOptions {
  brushSize: number
  color: string
}

export interface TextToolOptions {
  font: string
  fontSize: number
  color: string
  bold: boolean
  italic: boolean
  underline: boolean
}

// Export Options
export interface ExportOptions {
  format: 'png' | 'jpg'
  quality: number
  includeBackground: boolean
}

// S3 Upload
export interface S3UploadResult {
  url: string
  fileName: string
}

// Component Instance Types
export interface KonvaCanvasInstance {
  exportTexture: () => string | null
  getStage: () => any
  getStaticLayer: () => any
  getDynamicLayer: () => any
  getDrawLayer: () => any
  getDrawTool: () => DrawToolInstance | null
  scheduleBatchDraw: () => void
  updateLoopedInstances: () => void
}

export interface DrawToolInstance {
  clearCanvas: () => void
  undoLastStroke: () => void
  downloadDrawing: () => DrawingData
}

export interface DrawingData {
  imageData: string
  left: number
  top: number
  width: number
  height: number
}

export interface CanvasSectionInstance {
  hiddenCanvas: HTMLCanvasElement | null
  konvaCanvasRef: KonvaCanvasInstance | null
  containerRef: HTMLElement | null
}

// Text Editor Types
export interface TextEditingConfig {
  elementId: string
  content: string
  position: Position
  fontSize: number
  fontFamily: string
  color: string
  width: number
  height: number
}

// Error Types
export interface AppError extends Error {
  code?: string
  statusCode?: number
}
