<script setup lang="ts">
import { computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { ActivityIcon, ChartColumnBigIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import ServerApi from '@/api/Server'
import AgentIsOffline from '@/components/AgentIsOffline.vue'
import DataLoading from '@/components/DataLoading.vue'
import StorageResource from '@/components/StorageResource.vue'
import SystemHealth from '@/components/SystemHealth.vue'
import SystemPerformance from '@/components/SystemPerformance.vue'
import { Item, ItemContent } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import { useNumber } from '@/composables/number'
import useWebSocket from '@/composables/web-socket'
import WSEvent from '@/constants/ws-event'
import useAppStore from '@/stores/app'
import useMetricsStore from '@/stores/metrics'
import useServerStore from '@/stores/server'

const appStore = useAppStore()
const metricsStore = useMetricsStore()
const serverStore = useServerStore()
const { formatDuration } = useNumber()
const { title, breadcrumb } = storeToRefs(appStore)
const { metrics } = storeToRefs(metricsStore)
const { servers } = storeToRefs(serverStore)

const { subscribe } = useWebSocket()

let subServerStatus: { unsubscribe: () => void } | null = null
let subServerMetrics: { unsubscribe: () => void } | null = null

const selectedServer = computed(() => servers.value.find((s) => s.id === appStore.serverID))

watchEffect((onCleanup) => {
  title.value = 'Server Metrics'
  breadcrumb.value = [
    {
      label: 'Server Metrics',
      to: { name: 'server.metrics' }
    }
  ]

  onCleanup(() => {
    title.value = null
    breadcrumb.value = []
  })
})

onMounted(() => {
  subServerStatus = subscribe<ServerStatus>('server_status', (msg) => {
    if (msg.event === WSEvent.SERVER_STATUS_CHANGED) {
      serverStore.updateServerStatus(msg.payload)
    }
  })

  subServerMetrics = subscribe<Metrics>('server_metrics', (msg) => {
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
  try {
    await serverStore.getServers()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const fetchLatestMetrics = async () => {
  if (appStore.serverID === '') {
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
  <section class="space-y-8">
    <Item variant="outline">
      <ItemContent>
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="bg-accent rounded-lg p-3">
                <ChartColumnBigIcon :size="24" />
              </div>
              <div class="flex flex-col gap-0">
                <div class="text-xl">System Monitor</div>

                <template v-if="!selectedServer?.is_online">
                  <span class="text-sm text-neutral-400">Agent Unreachable</span>
                </template>

                <template v-else>
                  <div
                    v-if="metrics"
                    class="flex flex-wrap items-center gap-2 text-sm"
                  >
                    <span>@{{ metrics.os_info.hostname }}</span>
                    &middot;
                    <span class="text-neutral-400">
                      {{ metrics.os_info.name }}
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

            <template v-if="selectedServer?.is_online">
              <div
                v-if="metrics"
                class="flex items-center gap-2 text-lg text-neutral-400"
              >
                <ActivityIcon :size="24" />
                <span>{{ formatDuration(metrics.uptime_seconds) }}</span>
              </div>
              <Skeleton
                v-else
                class="h-8 w-32"
              />
            </template>
          </div>
        </div>
      </ItemContent>
    </Item>
  </section>

  <template v-if="!selectedServer?.is_online">
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
