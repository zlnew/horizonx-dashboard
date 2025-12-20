import { defineStore } from 'pinia'
import { useLocalStorage, useTitle } from '@vueuse/core'

const useAppStore = defineStore('app', () => {
  const title = useTitle(null, {
    titleTemplate: '%s | HorizonX'
  })

  const serverID = useLocalStorage('horizonx_server_id', '')

  return {
    title,
    serverID
  }
})

export default useAppStore
