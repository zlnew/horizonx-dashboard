import { registerSW } from 'virtual:pwa-register'
import { toast } from 'vue-sonner'

const intervalMS = 60 * 60 * 1000

const updateSW = registerSW({
  immediate: true,
  onRegistered(r) {
    if (r) {
      r.update()
      setInterval(() => {
        r.update()
      }, intervalMS)
    }
  },
  onRegisterError(error) {
    console.error('SW Registration Error:', error)
  },
  onNeedRefresh() {
    toast.info('New content available', {
      description: 'Click to reload the application',
      duration: Infinity,
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
