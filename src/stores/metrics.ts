import { ref } from 'vue'
import { defineStore } from 'pinia'

const useMetricsStore = defineStore('metrics', () => {
  const metrics = ref<Metrics | null>(null)
  const cpuUsagePoint = ref<CpuUsagePoint[]>([])
  const netSpeedPoint = ref<NetSpeedPoint[]>([])

  const cleanupState = () => {
    metrics.value = null
  }

  return {
    metrics,
    cpuUsagePoint,
    netSpeedPoint,
    cleanupState
  }
})

export default useMetricsStore
