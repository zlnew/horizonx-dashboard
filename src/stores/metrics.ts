import { ref } from 'vue'
import { defineStore } from 'pinia'

const useMetricsStore = defineStore('metrics', () => {
  const metrics = ref<Metrics | null>(null)
  const cpuUsageHistory = ref<CpuUsageHistory[]>([])
  const netHistory = ref<NetHistory[]>([])

  const cleanupState = () => {
    metrics.value = null
  }

  return {
    metrics,
    cpuUsageHistory,
    netHistory,
    cleanupState
  }
})

export default useMetricsStore
