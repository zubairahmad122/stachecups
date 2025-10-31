<template>
  <q-dialog v-model="showDialog" persistent class="frame-dialog">
    <q-card class="frame-selection-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="mdi-frame" size="28px" />
          </div>
          <div class="header-text">
            <div class="text-h6">Choose a Frame</div>
            <div class="text-subtitle2 text-grey-7">Select a frame for your image, or choose "No Frame" for standard editing</div>
          </div>
        </div>
        <q-btn 
          flat 
          round 
          dense 
          icon="mdi-close" 
          class="close-btn"
          @click="handleCancel"
        />
      </q-card-section>

      <q-separator class="modal-separator" />

      <!-- Body -->
      <q-card-section class="modal-body">
        <FramePicker @select="handleFrameSelect" />
      </q-card-section>

      <q-separator class="modal-separator" />

      <!-- Footer -->
      <q-card-section class="modal-footer">
        <div class="footer-actions">
          <q-btn
            flat
            label="Cancel"
            color="grey-7"
            class="cancel-btn"
            @click="handleCancel"
          />
          <q-btn
            :label="selectedFrame?.name === 'No Frame' ? 'No Frame' : 'Select Frame'"
            color="primary"
            class="confirm-btn"
            :disable="!selectedFrame"
            @click="handleConfirmSelection"
          />
        </div>
      </q-card-section>
    </q-card> 
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import FramePicker from '~/components/editor/pickers/FramePicker.vue'
import { type Frame, type FrameShape } from '~/store/frames'

const props = defineProps<{
  visible: boolean
  imagePreview?: string | null
}>()

const emit = defineEmits(['select', 'cancel', 'update:visible'])

const showDialog = ref(props.visible)
const selectedFrame = ref<Frame | null>(null)

watch(() => props.visible, (newVal) => {
  showDialog.value = newVal
  if (newVal) {
    // Default to "No Frame" when modal opens
    selectedFrame.value = {
      id: "none",
      name: "No Frame", 
      shape: "none" as FrameShape,
      category: "basic" as const
    }
  }
})

watch(showDialog, (newVal) => {
  if (!newVal && props.visible) {
    emit('update:visible', false)
  }
})

const handleFrameSelect = (frame: Frame) => {
  selectedFrame.value = frame
}

const handleConfirmSelection = () => {
  if (selectedFrame.value) {
    emit('select', selectedFrame.value)
    showDialog.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
  showDialog.value = false
}
</script>

<style scoped lang="scss">
.frame-dialog {
  .q-dialog__inner {
    padding: 20px;
  }
}

.frame-selection-modal {
  min-width: 450px;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15),
              0 10px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-header {
  padding: 24px 28px 20px;
  background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
  color: white;
  position: relative;
  
  .header-content {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-icon {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .header-text {
    flex: 1;
    
    .text-h6 {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .text-subtitle2 {
      opacity: 0.9;
      line-height: 1.4;
    }
  }
  
  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    color: rgba(255, 255, 255, 0.8);
    
    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.modal-separator {
  margin: 0;
  background: rgba(0, 0, 0, 0.08);
}

.modal-body {
  padding: 24px 28px;
  max-height: 60vh;
  overflow-y: auto;
  background: #fafafa;
}

.modal-footer {
  padding: 20px 28px 24px;
  background: white;
  
  .footer-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .cancel-btn {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
  
  .confirm-btn {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
    box-shadow: 0 4px 12px rgba(30, 173, 176, 0.3);
    transition: all 0.2s ease;
    
    &:hover:not(.q-btn--disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(30, 173, 176, 0.4);
    }
    
    &:active:not(.q-btn--disabled) {
      transform: translateY(0);
    }
    
    &.q-btn--disabled {
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }
  }
}

@keyframes modalSlideIn {
  0% {
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .frame-selection-modal {
    min-width: 90vw;
    max-width: 95vw;
  }
  
  .modal-header {
    padding: 20px 20px 16px;
    
    .header-content {
      gap: 12px;
    }
    
    .header-icon {
      padding: 6px;
    }
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 16px 20px 20px;
    
    .footer-actions {
      flex-direction: column;
      gap: 8px;
    }
    
    .cancel-btn,
    .confirm-btn {
      width: 100%;
    }
  }
}
</style>

