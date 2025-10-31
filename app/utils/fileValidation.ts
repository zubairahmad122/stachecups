import { UPLOAD_CONFIG } from '~/config/constants'
import { StachecupsError, ErrorType, ERROR_MESSAGES } from './errorHandler'

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  error?: StachecupsError
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number = UPLOAD_CONFIG.MAX_FILE_SIZE): ValidationResult {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: new StachecupsError(
        ERROR_MESSAGES[ErrorType.FILE_SIZE](maxSize),
        ErrorType.FILE_SIZE,
        413
      ),
    }
  }
  return { valid: true }
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES
): ValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: new StachecupsError(
        ERROR_MESSAGES[ErrorType.FILE_TYPE](allowedTypes),
        ErrorType.FILE_TYPE,
        415
      ),
    }
  }
  return { valid: true }
}

/**
 * Validate image dimensions (optional)
 */
export async function validateImageDimensions(
  file: File,
  maxWidth?: number,
  maxHeight?: number
): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      if (maxWidth && img.width > maxWidth) {
        resolve({
          valid: false,
          error: new StachecupsError(
            `Image width exceeds maximum of ${maxWidth}px`,
            ErrorType.VALIDATION,
            400
          ),
        })
        return
      }

      if (maxHeight && img.height > maxHeight) {
        resolve({
          valid: false,
          error: new StachecupsError(
            `Image height exceeds maximum of ${maxHeight}px`,
            ErrorType.VALIDATION,
            400
          ),
        })
        return
      }

      resolve({ valid: true })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        valid: false,
        error: new StachecupsError(
          'Failed to load image. File may be corrupted.',
          ErrorType.VALIDATION,
          400
        ),
      })
    }

    img.src = url
  })
}

/**
 * Comprehensive file validation
 */
export async function validateImageFile(
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: string[]
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<ValidationResult> {
  // Validate file size
  const sizeResult = validateFileSize(file, options.maxSize)
  if (!sizeResult.valid) {
    return sizeResult
  }

  // Validate file type
  const typeResult = validateFileType(file, options.allowedTypes)
  if (!typeResult.valid) {
    return typeResult
  }

  // Validate dimensions if specified
  if (options.maxWidth || options.maxHeight) {
    const dimensionResult = await validateImageDimensions(
      file,
      options.maxWidth,
      options.maxHeight
    )
    if (!dimensionResult.valid) {
      return dimensionResult
    }
  }

  return { valid: true }
}

/**
 * Convert file to base64 data URL with validation
 */
export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string)
      } else {
        reject(new StachecupsError('Failed to read file', ErrorType.FILE_UPLOAD, 500))
      }
    }

    reader.onerror = () => {
      reject(new StachecupsError('Failed to read file', ErrorType.FILE_UPLOAD, 500))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
