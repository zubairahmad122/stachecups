import { useEditorStore } from '~/store/editor'
import { useHistoryStore } from '~/store/history'

export function useHistory() {
  const editorStore = useEditorStore()
  const historyStore = useHistoryStore()

  const saveState = () => {
    const state = editorStore.getState()
    historyStore.saveState(state)
  }

  const undo = () => {
    const previousState = historyStore.undo()
    if (previousState) {
      editorStore.setState(previousState)
    }
  }

  const redo = () => {
    const nextState = historyStore.redo()
    if (nextState) {
      editorStore.setState(nextState)
    }
  }

  const canUndo = computed(() => historyStore.canUndo)
  const canRedo = computed(() => historyStore.canRedo)

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}


