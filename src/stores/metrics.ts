import { defineStore } from 'pinia'
import { ref } from 'vue'

const useMetricsStore = defineStore('metrics', () => {
  const metrics = ref<Metrics>()

  return {
    metrics,
  }
})

export default useMetricsStore
