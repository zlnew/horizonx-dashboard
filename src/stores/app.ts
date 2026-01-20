import { ref, watchEffect } from 'vue'
import { defineStore } from 'pinia'
import { useDark, useLocalStorage, useTitle } from '@vueuse/core'

const useAppStore = defineStore('app', () => {
  const title = useTitle(null, { titleTemplate: '%s | HorizonX' })

  const serverID = useLocalStorage('horizonx_server_id', '')
  const isDark = useDark({ storageKey: 'horizonx_color_scheme' })

  // Update theme-color meta tag when theme changes
  watchEffect(() => {
    const color = isDark.value ? '#252525' : '#ffffff'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  })

  const servers = ref<Server[]>([])
  const breadcrumb = ref<Breadcrumb[]>([])
  const searchOpen = ref(false)

  return {
    title,
    serverID,
    isDark,
    servers,
    breadcrumb,
    searchOpen
  }
})

export default useAppStore
