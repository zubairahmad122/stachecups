import { v4 as uuidv4 } from 'uuid'

/**
 * Generate a unique ID for design elements
 * Uses UUID v4 for guaranteed uniqueness
 */
export function generateElementId(prefix?: string): string {
  const uuid = uuidv4()
  return prefix ? `${prefix}-${uuid}` : uuid
}

/**
 * Generate ID for image elements
 */
export function generateImageId(): string {
  return generateElementId('img')
}

/**
 * Generate ID for text elements
 */
export function generateTextId(): string {
  return generateElementId('txt')
}

/**
 * Generate ID for emoji elements
 */
export function generateEmojiId(): string {
  return generateElementId('emoji')
}

/**
 * Generate ID for drawing elements
 */
export function generateDrawingId(): string {
  return generateElementId('draw')
}

/**
 * Generate ID for sticker elements
 */
export function generateStickerId(): string {
  return generateElementId('sticker')
}

/**
 * Validate if a string is a valid UUID
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id) || uuidRegex.test(id.split('-').slice(-5).join('-'))
}
