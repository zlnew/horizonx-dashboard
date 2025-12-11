<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ActivityIcon, ServerIcon, Settings2Icon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import DataLoading from '@/components/DataLoading.vue'
import StorageResource from '@/components/StorageResource.vue'
import SystemHealth from '@/components/SystemHealth.vue'
import SystemPerformance from '@/components/SystemPerformance.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Item, ItemContent } from '@/components/ui/item'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
const { title } = storeToRefs(appStore)
const { metrics } = storeToRefs(metricsStore)
const { servers } = storeToRefs(serverStore)
const selectedServerId = ref<number | null>(null)

const { subscribe } = useWebSocket()
let sub: { unsubscribe: () => void }

watch(selectedServerId, (serverId) => {
  if (serverId) {
    metrics.value = null

    if (sub) {
      sub.unsubscribe()
    }

    sub = subscribe<Metrics>(`server:${serverId}:metrics`, (msg) => {
      if (msg.event === WSEvent.METRICS_UPDATED) {
        metrics.value = msg.payload
      }
    })
  }
})

onMounted(async () => {
  title.value = 'Dashboard'
  fetchServers()
})

onUnmounted(() => {
  sub?.unsubscribe()
  serverStore.cleanupState()
})

const fetchServers = async () => {
  try {
    await serverStore.getServers()
    if (servers.value.length && servers.value[0]) {
      selectedServerId.value = servers.value[0].id
    }
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <section>
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Server Monitor</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </section>

  <section class="mt-8 space-y-8">
    <Item variant="outline">
      <ItemContent>
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="bg-accent rounded-lg p-3">
                <ServerIcon :size="24" />
              </div>
              <div class="flex flex-col gap-0">
                <div class="text-xl">Server Monitor</div>
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
              </div>
            </div>

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
          </div>
          <div>
            <Select v-model="selectedServerId">
              <SelectTrigger class="w-full">
                <Settings2Icon />
                <SelectValue placeholder="Select server" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Server Name</SelectLabel>
                  <SelectItem
                    v-for="(srv, i) in servers"
                    :key="i"
                    :value="srv.id"
                  >
                    <div class="flex items-center gap-2">
                      <div class="font-bold">{{ srv.name }}</div>
                      &middot;
                      <div class="text-neutral-400">{{ srv.ip_address }}</div>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ItemContent>
    </Item>
  </section>

  <template v-if="metrics">
    <SystemHealth />
    <SystemPerformance />
    <StorageResource />
  </template>

  <DataLoading v-else />
</template>
