<script setup lang="ts">
import MetricsApi from '@/api/Metrics'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useDate } from '@/composables/date'
import { useNumber } from '@/composables/number'
import useAppStore from '@/stores/app'
import { useTimestamp } from '@vueuse/core'
import {
  ActivityIcon,
  Clock3Icon,
  CpuIcon,
  GpuIcon,
  MemoryStickIcon,
  NetworkIcon,
  ServerIcon,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'

const appStore = useAppStore()
const timestamp = useTimestamp({ offset: 0 })
const { formatNumber } = useNumber()
const { formatDate } = useDate()

let metricsPool: number

const { title } = storeToRefs(appStore)
const metrics = ref<Metrics>()

onMounted(() => {
  title.value = 'Dashboard'

  fetchMetrics()

  metricsPool = setInterval(() => {
    fetchMetrics()
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(metricsPool)
})

const fetchMetrics = async () => {
  try {
    metrics.value = await new MetricsApi().get<Metrics>()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <section class="space-y-8">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="bg-accent p-3 rounded-lg">
          <ServerIcon :size="24" />
        </div>
        <div class="flex flex-col gap-0">
          <div class="text-xl">Server Monitor</div>
          <div class="text-sm text-neutral-400">@hostname</div>
        </div>
      </div>

      <div class="flex flex-col items-end gap-2">
        <Badge>Online</Badge>
        <div class="flex items-center gap-2 text-sm text-neutral-400">
          <Clock3Icon :size="14" />
          <span>{{ formatDate(new Date(timestamp), 'hh:mm:ss A') }}</span>
        </div>
      </div>
    </div>

    <div v-if="metrics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <Card class="hover:border-foreground">
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent p-2 rounded-lg">
                <CpuIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-neutral-400 text-sm">CPU Usage</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">{{ formatNumber(metrics.cpu.usage, 0, 2) }}</span>
                <span class="text-neutral-400 text-lg">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card v-for="gpu in metrics.gpu" :key="gpu.model" class="hover:border-foreground">
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent p-2 rounded-lg">
                <GpuIcon />
              </div>
              <div class="text-neutral-300 text-sm">{{ gpu.vendor }} {{ gpu.model }}</div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-neutral-400 text-sm">GPU Usage</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">
                  {{ formatNumber(gpu.core_usage_percent, 0, 2) }}
                </span>
                <span class="text-neutral-400 text-lg">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:border-foreground">
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent p-2 rounded-lg">
                <MemoryStickIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-neutral-400 text-sm">Memory</div>
              <div class="flex items-center gap-1">
                <div class="text-2xl flex items-center gap-1">
                  <span class="text-neutral-300">
                    {{ formatNumber(metrics.memory.used_gb, 0, 2) }}
                  </span>
                  /
                  <span>
                    {{ formatNumber(metrics.memory.total_gb, 0, 2) }}
                  </span>
                </div>
                <span class="text-neutral-400 text-lg">GB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:border-foreground">
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent p-2 rounded-lg">
                <NetworkIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-neutral-400 text-sm">Network</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">{{ formatNumber(metrics.network.rx_speed, 0, 2) }}</span>
                <span class="text-neutral-400 text-lg">Mbps</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:border-foreground">
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent p-2 rounded-lg">
                <ActivityIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-neutral-400 text-sm">Activity</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">23d 14h 32m</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
