import { defineStore } from 'pinia'
import { useTitle } from '@vueuse/core'

const useAppStore = defineStore('app', () => {
  const title = useTitle(null, {
    titleTemplate: '%s | HorizonX'
  })

  return {
    title
  }
})

export default useAppStore
