<template>
  <div class="upload-compliance">
    <!-- Upload Button (if enabled) -->
    <q-btn
      v-if="collectionStore.canUpload"
      unelevated
      color="primary"
      icon="upload"
      label="Upload Image"
      @click="openUploadDialog"
      :disable="!canProceedWithUpload"
    >
      <q-tooltip v-if="!canProceedWithUpload">
        Please accept the terms of service first
      </q-tooltip>
    </q-btn>

    <!-- Disabled Upload Button (with explanation) -->
    <q-btn
      v-else
      unelevated
      color="grey"
      icon="upload"
      label="Upload Image"
      disable
    >
      <q-tooltip>
        {{ collectionStore.uploadDisabledMessage || 'Uploads disabled for this collection' }}
      </q-tooltip>
    </q-btn>

    <!-- Upload Dialog -->
    <q-dialog v-model="showUploadDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Upload Custom Image</div>
        </q-card-section>

        <q-card-section>
          <!-- TOS Requirement -->
          <div v-if="collectionStore.requiresTOS && !collectionStore.tosAccepted" class="q-mb-md">
            <q-banner class="bg-warning text-white" rounded>
              <template #avatar>
                <q-icon name="info" />
              </template>
              You must accept the terms of service before uploading images.
            </q-banner>

            <q-checkbox
              v-model="tosAcceptedLocal"
              class="q-mt-md"
              color="primary"
            >
              <div class="text-body2">
                {{ collectionStore.currentRules?.upload.legalText }}
              </div>
            </q-checkbox>
          </div>

          <!-- File Upload -->
          <q-file
            v-model="uploadFile"
            label="Choose Image File"
            outlined
            accept="image/*"
            :max-file-size="collectionStore.currentRules?.upload.maxFileSize || 10485760"
            @update:model-value="validateFile"
            :disable="needsTOSAcceptance"
          >
            <template #prepend>
              <q-icon name="attach_file" />
            </template>

            <template #hint>
              Max file size: {{ formatFileSize(collectionStore.currentRules?.upload.maxFileSize || 10485760) }}
              <br>
              Allowed types: {{ allowedTypesText }}
            </template>
          </q-file>

          <!-- Validation Error -->
          <div v-if="validationError" class="q-mt-sm">
            <q-banner class="bg-negative text-white" rounded dense>
              {{ validationError }}
            </q-banner>
          </div>

          <!-- Preview -->
          <div v-if="previewUrl" class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Preview:</div>
            <div class="image-preview">
              <img :src="previewUrl" alt="Upload preview" />
            </div>
          </div>

          <!-- Frame Selection (if required) -->
          <div v-if="collectionStore.currentRules?.upload.requireFrame && previewUrl" class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Select Frame:</div>
            <div class="frame-grid">
              <div
                v-for="frame in frames"
                :key="frame.id"
                :class="['frame-option', { 'selected': selectedFrame === frame.id }]"
                @click="selectedFrame = frame.id"
              >
                <q-icon :name="frame.icon" size="32px" />
                <div class="text-caption">{{ frame.name }}</div>
              </div>
            </div>
          </div>

          <!-- Watermark Warning -->
          <div v-if="collectionStore.currentRules?.upload.watermark" class="q-mt-md">
            <q-banner class="bg-info text-white" rounded dense>
              <template #avatar>
                <q-icon name="watermark" />
              </template>
              Uploaded images will include a watermark for compliance.
            </q-banner>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            @click="cancelUpload"
          />
          <q-btn
            unelevated
            color="primary"
            label="Upload & Add"
            :disable="!canUpload"
            :loading="uploading"
            @click="handleUpload"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { useCollectionStore } from '~/store/collection'
import { useEditorStore } from '~/store/editor'
import { useQuasar } from 'quasar'

const collectionStore = useCollectionStore()
const editorStore = useEditorStore()
const $q = useQuasar()

const showUploadDialog = ref(false)
const uploadFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const validationError = ref<string | null>(null)
const tosAcceptedLocal = ref(false)
const selectedFrame = ref<string>('none')
const uploading = ref(false)

const frames = [
  { id: 'none', name: 'No Frame', icon: 'crop_square' },
  { id: 'circle', name: 'Circle', icon: 'circle' },
  { id: 'square', name: 'Square', icon: 'crop_square' },
  { id: 'rounded', name: 'Rounded', icon: 'rounded_corner' },
]

const needsTOSAcceptance = computed(() => {
  return collectionStore.requiresTOS && !tosAcceptedLocal.value
})

const canProceedWithUpload = computed(() => {
  if (!collectionStore.canUpload) return false
  if (collectionStore.requiresTOS && !collectionStore.tosAccepted) return false
  return true
})

const canUpload = computed(() => {
  if (!uploadFile.value) return false
  if (validationError.value) return false
  if (needsTOSAcceptance.value) return false
  return !(collectionStore.currentRules?.upload.requireFrame && selectedFrame.value === 'none');

})

const allowedTypesText = computed(() => {
  const types = collectionStore.currentRules?.upload.allowedTypes || []
  return types.map(t => t.replace('image/', '')).join(', ')
})

const openUploadDialog = () => {
  if (!canProceedWithUpload.value) {
    $q.notify({
      message: 'Please accept terms of service first',
      color: 'warning',
      icon: 'warning'
    })
    return
  }
  showUploadDialog.value = true
}

const validateFile = (file: File | null) => {
  if (!file) {
    previewUrl.value = null
    validationError.value = null
    return
  }

  const rules = collectionStore.currentRules?.upload

  // Check file type
  if (rules?.allowedTypes && !rules.allowedTypes.includes(file.type)) {
    validationError.value = `Invalid file type. Allowed: ${allowedTypesText.value}`
    return
  }

  // Check file size
  if (rules?.maxFileSize && file.size > rules.maxFileSize) {
    validationError.value = `File too large. Max size: ${formatFileSize(rules.maxFileSize)}`
    return
  }

  // Clear error
  validationError.value = null

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const applyWatermark = async (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject('Canvas context not available')
      return
    }

    const userImage = new Image()
    userImage.crossOrigin = 'anonymous'

    userImage.onload = () => {
      canvas.width = userImage.width
      canvas.height = userImage.height
      ctx.drawImage(userImage, 0, 0)

      const watermark = new Image()
      watermark.crossOrigin = 'anonymous'
      watermark.src = '/water-mark.png'

      watermark.onload = () => {
        const watermarkWidth = canvas.width * 0.2
        const watermarkHeight = (watermark.height / watermark.width) * watermarkWidth
        const x = canvas.width - watermarkWidth - 20
        const y = canvas.height - watermarkHeight - 20

        ctx.globalAlpha = 0.6
        ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight)
        ctx.globalAlpha = 1.0

        resolve(canvas.toDataURL('image/png'))
      }

      watermark.onerror = () => {
        resolve(imageDataUrl)
      }
    }

    userImage.onerror = () => {
      reject('Failed to load uploaded image')
    }

    userImage.src = imageDataUrl
  })
}

const handleUpload = async () => {
  if (!uploadFile.value) return

  if (tosAcceptedLocal.value && !collectionStore.tosAccepted) {
    collectionStore.acceptTOS()
  }

  uploading.value = true

  try {
    const reader = new FileReader()

    reader.onload = async (e) => {
      let imageUrl = e.target?.result as string

      const needsWatermark = collectionStore.isRestrictedCollection &&
                            collectionStore.currentRules?.upload.watermark

      if (needsWatermark) {
        try {
          imageUrl = await applyWatermark(imageUrl)
          $q.notify({
            message: 'Watermark applied to uploaded image',
            color: 'info',
            icon: 'verified_user',
            position: 'top',
            timeout: 2000
          })
        } catch (error) {
          $q.notify({
            message: 'Warning: Could not apply watermark',
            color: 'warning',
            icon: 'warning'
          })
        }
      }

      // Add image element to editor
      const imageElement = {
        id: `image-${Date.now()}`,
        type: 'image' as const,
        src: imageUrl,
        position: { x: 400, y: 300 },
        width: 200,
        height: 200,
        scale: 1,
        rotation: 0,
        opacity: 1,
        zIndex: editorStore.elements.length,
        frame: selectedFrame.value !== 'none' ? selectedFrame.value : undefined,
        uploaded: true,
        uploadedAt: new Date().toISOString(),
        collection: collectionStore.activeCollection,
        watermarked: needsWatermark || false,
      }

      editorStore.addElement(imageElement)

      $q.notify({
        message: 'Image uploaded successfully!',
        color: 'positive',
        icon: 'check_circle'
      })

      // Close dialog
      closeDialog()
    }

    reader.readAsDataURL(uploadFile.value)
  } catch (error) {
    $q.notify({
      message: 'Failed to upload image',
      color: 'negative',
      icon: 'error'
    })
  } finally {
    uploading.value = false
  }
}

const cancelUpload = () => {
  closeDialog()
}

const closeDialog = () => {
  showUploadDialog.value = false
  uploadFile.value = null
  previewUrl.value = null
  validationError.value = null
  tosAcceptedLocal.value = false
  selectedFrame.value = 'none'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped lang="scss">
.image-preview {
  width: 100%;
  max-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
  }
}

.frame-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.frame-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--q-primary);
    background-color: rgba(var(--q-primary-rgb), 0.05);
  }

  &.selected {
    border-color: var(--q-primary);
    background-color: rgba(var(--q-primary-rgb), 0.1);
  }
}
</style>
