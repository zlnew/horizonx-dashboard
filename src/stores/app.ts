import { useTitle } from '@vueuse/core'
import { defineStore } from 'pinia'

const useAppStore = defineStore('app', () => {
  const title = useTitle(null, {
    titleTemplate: '%s | HorizonX',
  })

  return {
    title,
  }
})

export default useAppStore
