import { ref } from 'vue'
import { defineStore } from 'pinia'

const useLoadingStore = defineStore('loading', () => {
  const loading = ref(false)
  const progress = ref(0)

  let timer: number | null = null

  const start = () => {
    if (loading.value) return

    loading.value = true
    progress.value = 0.1

    timer = window.setInterval(() => {
      if (progress.value < 0.9) {
        progress.value += Math.random() * 0.05
      }
    }, 200)
  }

  const done = () => {
    progress.value = 1

    window.setTimeout(() => {
      loading.value = false
      progress.value = 0
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }, 200)
  }

  return {
    loading,
    progress,
    start,
    done
  }
})

export default useLoadingStore
