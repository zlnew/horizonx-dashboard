import { registerSW } from 'virtual:pwa-register'
import { toast } from 'vue-sonner'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    toast.info('New content available', {
      description: 'Click to reload the application',
      action: {
        label: 'Reload',
        onClick: () => updateSW(true)
      }
    })
  },
  onOfflineReady() {
    toast.success('App ready to work offline')
  }
})
