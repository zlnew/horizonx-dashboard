import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage, useTitle } from '@vueuse/core'

const useAppStore = defineStore('app', () => {
  const title = useTitle(null, { titleTemplate: '%s | HorizonX' })
  const breadcrumb = ref<Breadcrumb[]>([])
  const serverID = useLocalStorage('horizonx_server_id', '')

  return {
    title,
    breadcrumb,
    serverID
  }
})

export default useAppStore
