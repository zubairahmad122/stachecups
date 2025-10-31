<template>
  <q-dialog v-model="showDialog" persistent class="restore-dialog">
    <q-card class="restore-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="mdi-backup-restore" size="28px" />
          </div>
          <div class="header-text">
            <div class="text-h6">Restore Previous Design?</div>
        
          </div>
        </div>
      </q-card-section>

      <q-separator class="modal-separator" />

      <!-- Body -->
      <q-card-section class="modal-body">
        <div class="restore-info">
          <div class="info-card">
            <div class="info-icon">
              <q-icon name="mdi-clock-outline" size="24px" />
            </div>
            <div class="info-content">
              <div class="info-title">Autosaved Design</div>
              
            </div>
          </div>
        </div>

        <div class="restore-message">
          <p>Would you like to restore your previous design or start with a fresh canvas?</p>
        </div>
      </q-card-section>

      <q-separator class="modal-separator" />

      <!-- Footer -->
      <q-card-section class="modal-footer">
        <div class="footer-actions">
          <q-btn
            flat
            label="Discard & Start Fresh"
            color="grey-7"
            class="discard-btn"
            @click="handleDiscard"
          />
          <q-btn
            label="Restore Design"
            color="primary"
            class="restore-btn"
            @click="handleRestore"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  timestamp: number
}>()

const emit = defineEmits(['restore', 'discard', 'update:visible'])

const showDialog = ref(props.visible)

watch(() => props.visible, (newVal) => {
  showDialog.value = newVal
})

watch(showDialog, (newVal) => {
  if (!newVal && props.visible) {
    emit('update:visible', false)
  }
})

const formattedDate = computed(() => {
  const date = new Date(props.timestamp)
  return date.toLocaleDateString()
})

const formattedTime = computed(() => {
  const date = new Date(props.timestamp)
  return date.toLocaleTimeString()
})

const handleRestore = () => {
  emit('restore')
  showDialog.value = false
}

const handleDiscard = () => {
  emit('discard')
  showDialog.value = false
}
</script>

<style scoped lang="scss">
.restore-dialog {
  .q-dialog__inner {
    padding: 20px;
  }
}

.restore-modal {
  min-width: 450px;
  max-width: 500px;
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
}

.modal-separator {
  margin: 0;
  background: rgba(0, 0, 0, 0.08);
}

.modal-body {
  padding: 24px 28px;
  background: #fafafa;
}

.restore-info {
  margin-bottom: 20px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.info-icon {
  background: rgba(30, 173, 176, 0.1);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1EADB0;
}

.info-content {
  flex: 1;
}

.info-title {
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 8px;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.detail-label {
  color: #718096;
  font-weight: 500;
}

.detail-value {
  color: #2d3748;
  font-weight: 600;
}

.restore-message {
  padding: 16px;
  background: rgba(30, 173, 176, 0.05);
  border-radius: 12px;
  border-left: 4px solid #1EADB0;
  
  p {
    margin: 0;
    color: #2d3748;
    line-height: 1.5;
    font-size: 15px;
  }
}

.modal-footer {
  padding: 20px 28px 24px;
  background: white;
  
  .footer-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .discard-btn {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
  
  .restore-btn {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
    box-shadow: 0 4px 12px rgba(30, 173, 176, 0.3);
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(30, 173, 176, 0.4);
    }
    
    &:active {
      transform: translateY(0);
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
  .restore-modal {
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
    
    .discard-btn,
    .restore-btn {
      width: 100%;
    }
  }
}
</style>
