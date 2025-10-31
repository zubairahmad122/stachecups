import type { AppError } from '~/types/editor'
import { Notify } from 'quasar'

/**
 * Custom error class for application-specific errors
 */
export class StachecupsError extends Error implements AppError {
  code?: string
  statusCode?: number

  constructor(message: string, code?: string, statusCode?: number) {
    super(message)
    this.name = 'StachecupsError'
    this.code = code
    this.statusCode = statusCode
  }
}

/**
 * Error types for better categorization
 */
export enum ErrorType {
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_SIZE = 'FILE_SIZE',
  FILE_TYPE = 'FILE_TYPE',
  CANVAS_OPERATION = 'CANVAS_OPERATION',
  STATE_MANAGEMENT = 'STATE_MANAGEMENT',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error messages mapping
 */
export const ERROR_MESSAGES = {
  [ErrorType.FILE_SIZE]: (maxSize: number) =>
    `File too large. Maximum size allowed is ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
  [ErrorType.FILE_TYPE]: (allowedTypes: string[]) =>
    `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
  [ErrorType.FILE_UPLOAD]: 'Failed to upload file. Please try again.',
  [ErrorType.CANVAS_OPERATION]: 'Canvas operation failed. Please try again.',
  [ErrorType.STATE_MANAGEMENT]: 'Failed to save state. Your changes may not be preserved.',
  [ErrorType.NETWORK]: 'Network error. Please check your connection and try again.',
  [ErrorType.VALIDATION]: 'Validation failed. Please check your input.',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
}

/**
 * Show error notification to user
 */
export function showErrorNotification(
  error: Error | string,
  type: ErrorType = ErrorType.UNKNOWN
): void {
  const message = typeof error === 'string' ? error : error.message

  Notify.create({
    message,
    color: 'negative',
    icon: 'error',
    position: 'top',
    timeout: 5000,
    actions: [
      {
        label: 'Dismiss',
        color: 'white',
      },
    ],
  })
}

/**
 * Show success notification to user
 */
export function showSuccessNotification(message: string): void {
  Notify.create({
    message,
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
    timeout: 3000,
  })
}

/**
 * Show warning notification to user
 */
export function showWarningNotification(message: string): void {
  Notify.create({
    message,
    color: 'warning',
    icon: 'warning',
    position: 'top',
    timeout: 4000,
  })
}

/**
 * Log error for debugging/monitoring
 */
export function logError(error: Error | string, context?: Record<string, any>): void {
  // In production, send to logging service like Sentry
  // Example:
  // if (process.client && window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context })
  // }
}

/**
 * Handle error with logging and user notification
 */
export function handleError(
  error: Error | string,
  type: ErrorType = ErrorType.UNKNOWN,
  context?: Record<string, any>
): void {
  logError(error, context)
  showErrorNotification(error, type)
}
