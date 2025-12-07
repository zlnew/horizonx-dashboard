import { defineStore } from 'pinia'
import { ref } from 'vue'

const useMetricsStore = defineStore('metrics', () => {
  const metrics = ref<Metrics>()
  const cpuUsageHistory = ref<CpuUsageHistory[]>([])

  return {
    metrics,
    cpuUsageHistory,
  }
})

export default useMetricsStore
