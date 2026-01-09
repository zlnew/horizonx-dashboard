import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import Permission from '@/constants/permission'
import useAuthStore from '@/stores/auth'

const useMetricsStore = defineStore('metrics', () => {
  const metrics = ref<Metrics | null>(null)
  const cpuUsagePoint = ref<CpuUsagePoint[]>([])
  const netSpeedPoint = ref<NetSpeedPoint[]>([])

  const authStore = useAuthStore()
  const { can } = storeToRefs(authStore)

  const canReadMetrics = computed(() => can.value(Permission.METRICS_READ))

  const cleanupState = () => {
    metrics.value = null
  }

  return {
    metrics,
    cpuUsagePoint,
    netSpeedPoint,
    canReadMetrics,
    cleanupState
  }
})

export default useMetricsStore
