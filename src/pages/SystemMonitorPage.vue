<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ActivityIcon, ChartColumnBigIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import ServerApi from '@/api/Server'
import AgentIsOffline from '@/components/AgentIsOffline.vue'
import DataLoading from '@/components/DataLoading.vue'
import StorageResource from '@/components/StorageResource.vue'
import SystemHealth from '@/components/SystemHealth.vue'
import SystemPerformance from '@/components/SystemPerformance.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { useNumber } from '@/composables/number'
import { usePageMeta } from '@/composables/page-meta'
import useWebSocket from '@/composables/web-socket'
import WSEvent from '@/constants/ws-event'
import useAppStore from '@/stores/app'
import useMetricsStore from '@/stores/metrics'
import useServerStore from '@/stores/server'

const appStore = useAppStore()
const metricsStore = useMetricsStore()
const serverStore = useServerStore()
const { formatDuration } = useNumber()
const { metrics, canReadMetrics } = storeToRefs(metricsStore)
const { servers } = storeToRefs(serverStore)

const { subscribe } = useWebSocket()

let subServerStatus: WSSubscribtion | null = null
let subServerMetrics: WSSubscribtion | null = null

const server = computed(() => servers.value.find((s) => s.id === appStore.serverID))

usePageMeta({
  title: 'System Monitor',
  breadcrumb: [
    {
      label: 'System Monitor',
      to: { name: 'system-monitor' }
    }
  ]
})

onMounted(() => {
  subServerStatus = subscribe<EventServerStatusChanged>('server_status', (msg) => {
    if (msg.event === WSEvent.SERVER_STATUS_CHANGED) {
      serverStore.updateServerStatus(msg.payload)
    }
  })

  subServerMetrics = subscribe<Metrics>(`server_metrics:${appStore.serverID}`, (msg) => {
    if (msg.event === WSEvent.SERVER_METRICS_RECEIVED) {
      metrics.value = msg.payload
    }
  })

  fetchServers()
  fetchLatestMetrics()
})

onUnmounted(() => {
  subServerStatus?.unsubscribe()
  subServerMetrics?.unsubscribe()
  metricsStore.cleanupState()
  serverStore.cleanupState()
})

const fetchServers = async () => {
  if (!canReadMetrics.value) {
    return
  }

  try {
    await serverStore.getServers()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const fetchLatestMetrics = async () => {
  if (appStore.serverID === '' || !canReadMetrics.value) {
    return
  }

  try {
    const res = await new ServerApi().getLatestMetrics<ApiResponse<Metrics>>(appStore.serverID)

    if (res.data) {
      metrics.value = res.data
    }
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="bg-accent rounded-lg p-3">
          <ChartColumnBigIcon :size="24" />
        </div>
        <div class="flex flex-col gap-0">
          <div class="text-xl">System Monitor</div>

          <template v-if="!server?.is_online">
            <span class="text-muted-foreground text-sm">-</span>
          </template>

          <template v-else>
            <div
              v-if="server"
              class="flex flex-wrap items-center gap-2 text-sm"
            >
              <span>@{{ server.os_info?.hostname ?? '-' }}</span>
              &middot;
              <span class="text-muted-foreground">
                {{ server.os_info?.kernel_version ?? '-' }}
              </span>
            </div>
            <div
              v-else
              class="flex flex-wrap items-center gap-2"
            >
              <Skeleton class="h-5 w-20" />
              <Skeleton class="h-5 w-28" />
            </div>
          </template>
        </div>
      </div>

      <template v-if="server?.is_online">
        <div
          v-if="metrics"
          class="text-accent-foreground flex items-center gap-2 text-lg"
        >
          <ActivityIcon :size="16" />
          <span>{{ formatDuration(metrics.uptime_seconds) }}</span>
        </div>
        <Skeleton
          v-else
          class="h-8 w-32"
        />
      </template>
    </div>
  </section>

  <template v-if="!server?.is_online">
    <AgentIsOffline />
  </template>

  <template v-else>
    <template v-if="metrics">
      <SystemHealth />
      <SystemPerformance />
      <StorageResource />
    </template>

    <DataLoading v-else />
  </template>
</template>
