import { onUnmounted, ref } from 'vue'
import AlertsApi from '@/api/Alerts'

type ActiveAlertCountOptions = {
  interval?: number
}

// Polls the active alerts endpoint and exposes the firing count for nav
// badges. Auto-starts on mount, stops on unmount; refetch() forces an
// immediate refresh (e.g. after an ack action).
const useActiveAlertCount = (options: ActiveAlertCountOptions = {}) => {
  const intervalMs = options.interval ?? 30_000
  const api = new AlertsApi()

  const count = ref(0)
  const loading = ref(false)

  let timer: ReturnType<typeof setInterval> | null = null

  const refetch = async () => {
    loading.value = true

    try {
      const res = await api.activeAlerts<ApiResponse<Alert[]>>()
      count.value = res.data?.length ?? 0
    } catch {
      // Keep the last known count on failure; the next tick retries.
    } finally {
      loading.value = false
    }
  }

  const start = () => {
    if (timer) {
      return
    }

    refetch()
    timer = setInterval(refetch, intervalMs)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  start()
  onUnmounted(stop)

  return {
    count,
    loading,
    refetch,
    start,
    stop
  }
}

export default useActiveAlertCount
