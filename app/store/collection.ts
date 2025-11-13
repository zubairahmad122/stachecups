import { defineStore } from 'pinia'
import type { AnyElement } from '~/types/editor'
import axios from 'axios'

export interface CollectionRules {
  colorPicker: {
    cmyk: boolean
    custom: boolean
    presetOnly: boolean
    allowedColors: string[] | null
    tooltip: string | null
  }
  upload: {
    enabled: boolean
    requireTOS: boolean
    requireFrame: boolean
    maxFileSize: number
    allowedTypes: string[]
    watermark: boolean
    legalText: string | null
    disabledMessage: string | null
  }
  assets: {
    allowedTags: string[]
    restrictMixing: boolean
    mixingWarning: string | null
  }
  licensing: {
    required: boolean
    disclaimer: string | null
    watermark: string | null
    brandGuidelines: string | null
  }
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string
  active: boolean
  entryPoints: string[]
  rules: CollectionRules

  branding: {
    primaryColor: string
    secondaryColor?: string
    logo: string | null
    banner: string | null
    badgeText: string | null
  }
}

export interface CollectionsData {
  collections: Collection[]
  switchWarning: {
    title: string
    message: string
    confirmText: string
    cancelText: string
  }
}

export const useCollectionStore = defineStore('collection', {
    state: () => ({
        // Current active collection
        activeCollection: 'general' as string,

        // All available collections
        collections: [] as Collection[],

        // Loading state
        loading: false,

        // TOS acceptance
        tosAccepted: false,

        // Switch warning config
        switchWarning: null as CollectionsData['switchWarning'] | null,

        // Asset CDN base URL
        cdnBaseUrl: import.meta.env.VITE_CDN_URL || '',
    }),

    getters: {
        /**
         * Get the current active collection object
         */
        currentCollection: (state): Collection | null => {
            return state.collections.find(c => c.id === state.activeCollection) || null
        },

        /**
         * Get rules for current collection
         */
        currentRules: (state): CollectionRules | null => {
            const collection = state.collections.find(c => c.id === state.activeCollection)
            return collection?.rules || null
        },

        /**
         * Check if color picker should show CMYK
         */
        canUseCMYK(): boolean {
            return this.currentRules?.colorPicker.cmyk ?? false
        },

        /**
         * Check if custom colors are allowed
         */
        canUseCustomColors(): boolean {
            return this.currentRules?.colorPicker.custom ?? false
        },

        /**
         * Get allowed colors (null = all allowed)
         */
        allowedColors(): string[] | null {
            return this.currentRules?.colorPicker.allowedColors || null
        },

        /**
         * Check if uploads are enabled
         */
        canUpload(): boolean {
            return this.currentRules?.upload.enabled ?? false
        },

        /**
         * Check if TOS is required for upload
         */
        requiresTOS(): boolean {
            return this.currentRules?.upload.requireTOS ?? false
        },

        /**
         * Get upload disabled message
         */
        uploadDisabledMessage(): string | null {
            return this.currentRules?.upload.disabledMessage || null
        },

        /**
         * Get allowed asset tags
         */
        allowedAssetTags(): string[] {
            return this.currentRules?.assets.allowedTags || ['general', 'shared']
        },

        /**
         * Check if asset mixing is restricted
         */
        restrictAssetMixing(): boolean {
            return this.currentRules?.assets.restrictMixing ?? false
        },

        /**
         * Check if licensing is required
         */
        requiresLicensing(): boolean {
            return this.currentRules?.licensing.required ?? false
        },

        /**
         * Get licensing disclaimer
         */
        licensingDisclaimer(): string | null {
            return this.currentRules?.licensing.disclaimer || null
        },

        /**
         * Get brand guidelines URL
         */
        brandGuidelines(): string | null {
            return this.currentRules?.licensing.brandGuidelines || null
        },

        /**
         * Get collection branding
         */
        branding: (state): Collection['branding'] | null => {
            const collection = state.collections.find(c => c.id === state.activeCollection)
            return collection?.branding || null
        },

        /**
         * Check if collection is restricted (not general)
         */
        isRestrictedCollection(): boolean {
            return this.activeCollection !== 'general'
        },

        /**
         * Get all active collections
         */
        activeCollections(): Collection[] {
            return this.collections.filter(c => c.active)
        },
    },

    actions: {
    /**
     * Load collections from JSON
     */
    async loadCollections() {
      if (this.collections.length > 0) return

      this.loading = true

      try {
        const { data } = await axios.get<CollectionsData>('/data/collections.json')

        this.collections = data.collections
        this.switchWarning = data.switchWarning
      } catch (error) {
        this.activeCollection = 'general'
      } finally {
        this.loading = false
      }
    },

    /**
     * Set active collection
     * @param collectionId - ID of collection to activate
     * @param skipWarning - Skip warning dialog (for initial load)
     */
    async setCollection(collectionId: string, skipWarning = false): Promise<boolean> {
      const targetCollection = this.collections.find(c => c.id === collectionId)

      if (!targetCollection) {
        return false
      }

      if (!targetCollection.active) {
        return false
      }

      if (this.activeCollection === collectionId) {
        return true
      }

      if (!skipWarning && this.activeCollection) {
        return false
      }

      this.activeCollection = collectionId
      this.tosAccepted = false

      return true
    },

    confirmSwitchCollection(collectionId: string) {
      this.activeCollection = collectionId
      this.tosAccepted = false
    },

    /**
     * Set collection from URL parameter
     */
    async setCollectionFromURL(route: any) {
      const collectionParam = route.query.collection as string

      if (collectionParam) {
        await this.setCollection(collectionParam, true)
      }
    },

    /**
     * Accept TOS for uploads
     */
    acceptTOS() {
      this.tosAccepted = true
    },

    /**
     * Revoke TOS acceptance
     */
    revokeTOS() {
      this.tosAccepted = false
    },

    /**
     * Validate if element can be added based on collection rules
     */
    canAddElement(element: AnyElement): {
      allowed: boolean
      reason?: string
    } {
      // Check if element has tags
      const elementTags = (element as any).tags || []

      // If no restrictions, allow
      if (!this.restrictAssetMixing) {
        return { allowed: true }
      }

      // Check if element tags match allowed tags
      const hasAllowedTag = elementTags.some((tag: string) =>
        this.allowedAssetTags.includes(tag)
      )

      if (!hasAllowedTag && elementTags.length > 0) {
        return {
          allowed: false,
          reason: this.currentRules?.assets.mixingWarning || 'This asset is not allowed in the current collection'
        }
      }

      return { allowed: true }
    },

    /**
     * Validate color against collection rules
     */
    canUseColor(color: string): {
      allowed: boolean
      reason?: string
    } {
      // If no color restrictions, allow
      if (!this.allowedColors) {
        return { allowed: true }
      }

      // Check if color is in allowed list
      const isAllowed = this.allowedColors.includes(color.toUpperCase())

      if (!isAllowed) {
        return {
          allowed: false,
          reason: this.currentRules?.colorPicker.tooltip || 'This color is not allowed in the current collection'
        }
      }

      return { allowed: true }
    },

    /**
     * Get collection by slug
     */
    getCollectionBySlug(slug: string): Collection | null {
      return this.collections.find(c => c.slug === slug) || null
    },

    /**
     * Get collection by ID
     */
    getCollectionById(id: string): Collection | null {
      return this.collections.find(c => c.id === id) || null
    },

    /**
     * Build CDN URL for asset
     */
    getAssetUrl(path: string): string {
      if (!this.cdnBaseUrl) return path
      return `${this.cdnBaseUrl}${path}`
    },
  },
})
