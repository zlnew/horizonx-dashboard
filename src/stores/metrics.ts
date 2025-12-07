import { defineStore } from 'pinia'
import { ref } from 'vue'

const useMetricsStore = defineStore('metrics', () => {
  const metrics = ref<Metrics>()
  const cpuUsageHistory = ref<CpuUsageHistory[]>([])
  const netHistory = ref<NetHistory[]>([])

  return {
    metrics,
    cpuUsageHistory,
    netHistory,
  }
})

export default useMetricsStore
