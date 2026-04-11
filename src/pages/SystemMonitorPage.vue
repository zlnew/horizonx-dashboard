<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ActivityIcon, ChartColumnBigIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import ServerApi from '@/api/Server'
import AgentIsOffline from '@/components/AgentIsOffline.vue'
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
  <div class="flex flex-col gap-10">
    <!-- Header Section -->
    <section>
      <div class="flex flex-wrap items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="bg-primary/10 border-primary/20 rounded-2xl border p-4 shadow-inner">
            <ChartColumnBigIcon
              :size="28"
              class="text-primary"
            />
          </div>
          <div class="border-border/50 flex flex-col gap-1 border-l pl-6">
            <h1 class="text-3xl leading-none font-black tracking-tight uppercase">
              System Monitor
            </h1>

            <template v-if="!server?.is_online">
              <span
                class="text-muted-foreground text-[11px] font-black tracking-widest uppercase opacity-50"
                >Agent is offline or unreachable</span
              >
            </template>

            <template v-else>
              <div
                v-if="server"
                class="flex flex-wrap items-center gap-3 text-xs font-bold tracking-tight uppercase"
              >
                <span class="text-primary truncate">@{{ server.os_info?.hostname ?? '-' }}</span>
                <span class="text-muted-foreground/30 font-light">/</span>
                <span
                  class="text-muted-foreground/70 font-mono text-[11px] tracking-normal lowercase italic"
                >
                  {{ server.os_info?.kernel_version ?? '-' }}
                </span>
              </div>
              <div
                v-else
                class="flex flex-wrap items-center gap-2"
              >
                <Skeleton class="h-4 w-20 rounded-full" />
                <Skeleton class="h-4 w-28 rounded-full" />
              </div>
            </template>
          </div>
        </div>

        <template v-if="server?.is_online">
          <div
            v-if="metrics"
            class="bg-accent/30 border-border/50 flex items-center gap-4 rounded-full border px-6 py-2 shadow-lg shadow-black/20 backdrop-blur-md"
          >
            <div
              class="bg-primary size-2.5 animate-pulse rounded-full shadow-[0_0_12px_rgba(var(--primary),0.6)]"
            ></div>
            <div
              class="flex items-center gap-2.5 text-sm font-black tracking-tight whitespace-nowrap uppercase"
            >
              <ActivityIcon
                :size="16"
                class="text-primary"
              />
              <span class="font-mono text-sm">{{ formatDuration(metrics.uptime_seconds) }}</span>
            </div>
          </div>
          <Skeleton
            v-else
            class="h-10 w-48 rounded-full"
          />
        </template>
      </div>
    </section>

    <!-- Main Dashboard Grid -->
    <div class="flex flex-col gap-8">
      <template v-if="!server?.is_online">
        <AgentIsOffline />
      </template>

      <template v-else>
        <!-- Level 1: Vital Signs -->
        <SystemHealth />

        <!-- Level 2: Detailed Insight Grid -->
        <div class="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <!-- Deep Performance Metrics (2/3 width) -->
          <div class="space-y-8 xl:col-span-2">
            <SystemPerformance />
          </div>

          <!-- Storage & Resources (1/3 width) -->
          <div class="space-y-8">
            <StorageResource />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
