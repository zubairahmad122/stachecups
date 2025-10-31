import { useQuasar } from 'quasar'

export function useNotifications() {
  const $q = useQuasar()

  const success = (message: string, options: any = {}) => {
    $q.notify({
      type: 'positive',
      message,
      position: 'top',
      timeout: 2500,
      icon: 'check_circle',
      color: 'positive',
      textColor: 'white',
      classes: 'notification-success',
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          flat: true,
        },
      ],
      ...options,
    })
  }

  const error = (message: string, options: any = {}) => {
    $q.notify({
      type: 'negative',
      message,
      position: 'top',
      timeout: 3500,
      icon: 'error',
      color: 'negative',
      textColor: 'white',
      classes: 'notification-error',
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          flat: true,
        },
      ],
      ...options,
    })
  }

  const warning = (message: string, options: any = {}) => {
    $q.notify({
      type: 'warning',
      message,
      position: 'top',
      timeout: 3000,
      icon: 'warning',
      color: 'warning',
      textColor: 'white',
      classes: 'notification-warning',
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          flat: true,
        },
      ],
      ...options,
    })
  }

  const info = (message: string, options: any = {}) => {
    $q.notify({
      type: 'info',
      message,
      position: 'top',
      timeout: 2500,
      icon: 'info',
      color: 'info',
      textColor: 'white',
      classes: 'notification-info',
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          flat: true,
        },
      ],
      ...options,
    })
  }

  const loading = (message: string = 'Loading...') => {
    $q.notify({
      type: 'ongoing',
      message,
      position: 'top',
      spinner: true,
      timeout: 0,
      color: 'primary',
      textColor: 'white',
      classes: 'notification-loading',
    })
  }

  return {
    success,
    error,
    warning,
    info,
    loading,
  }
}
