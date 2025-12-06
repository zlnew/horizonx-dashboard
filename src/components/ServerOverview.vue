<script setup lang="ts">
import { useDate } from '@/composables/date'
import { useNumber } from '@/composables/number'
import useMetricsStore from '@/stores/metrics'
import { useTimestamp } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { Card, CardContent } from '@/components/ui/card'
import {
  ActivityIcon,
  Clock3Icon,
  CpuIcon,
  GpuIcon,
  MemoryStickIcon,
  NetworkIcon,
  ServerIcon,
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyHeader, EmptyMedia } from '@/components/ui/empty'

const metricsStore = useMetricsStore()

const timestamp = useTimestamp({ offset: 0 })
const { formatNumber, formatDuration } = useNumber()
const { formatDate } = useDate()

const { metrics } = storeToRefs(metricsStore)
</script>

<template>
  <section class="space-y-8">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="bg-accent rounded-lg p-3">
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

    <div v-if="metrics" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      <Card class="hover:border-foreground">
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent rounded-lg p-2">
                <CpuIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-sm text-neutral-400">CPU Usage</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">{{ formatNumber(metrics.cpu.usage, 0, 2) }}</span>
                <span class="text-lg text-neutral-400">%</span>
              </div>
              <Progress :model-value="metrics.cpu.usage" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card v-for="gpu in metrics.gpu" :key="gpu.model" class="hover:border-foreground">
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent rounded-lg p-2">
                <GpuIcon />
              </div>
              <div class="text-sm text-neutral-300">{{ gpu.vendor }} {{ gpu.model }}</div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-sm text-neutral-400">GPU Usage</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">
                  {{ formatNumber(gpu.core_usage_percent, 0, 2) }}
                </span>
                <span class="text-lg text-neutral-400">%</span>
              </div>
              <Progress :model-value="gpu.core_usage_percent" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:border-foreground">
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent rounded-lg p-2">
                <MemoryStickIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-sm text-neutral-400">Memory</div>
              <div class="flex items-center gap-1">
                <div class="flex items-center gap-1 text-2xl">
                  <span class="text-neutral-300">
                    {{ formatNumber(metrics.memory.used_gb, 0, 2) }}
                  </span>
                  /
                  <span>
                    {{ formatNumber(metrics.memory.total_gb, 0, 2) }}
                  </span>
                </div>
                <span class="text-lg text-neutral-400">GB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:border-foreground">
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent rounded-lg p-2">
                <NetworkIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-sm text-neutral-400">Network</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">{{ formatNumber(metrics.network.rx_speed, 0, 2) }}</span>
                <span class="text-lg text-neutral-400">Mbps</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="hover:border-foreground">
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent rounded-lg p-2">
                <ActivityIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-sm text-neutral-400">Uptime</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">{{ formatDuration(metrics.uptime_seconds) }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Empty v-else class="w-full">
      <EmptyHeader>
        <EmptyMedia>
          <Spinner class="size-8" />
        </EmptyMedia>
      </EmptyHeader>
    </Empty>
  </section>
</template>
