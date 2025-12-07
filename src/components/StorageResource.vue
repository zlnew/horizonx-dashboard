<script setup lang="ts">
import { useNumber } from '@/composables/number'
import useMetricsStore from '@/stores/metrics'
import { storeToRefs } from 'pinia'
import { Empty, EmptyHeader, EmptyMedia } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from './ui/progress'
import { ThermometerIcon } from 'lucide-vue-next'
import { Separator } from './ui/separator'

const metricsStore = useMetricsStore()
const { formatNumber } = useNumber()
const { metrics } = storeToRefs(metricsStore)

const memoryUsedPct = () => {
  if (!metrics.value?.memory) return 0
  return (metrics.value.memory.used_gb / metrics.value.memory.total_gb) * 100
}

const swapUsedPct = () => {
  if (!metrics.value?.memory) return 0
  return (metrics.value.memory.swap_used_gb / metrics.value.memory.swap_total_gb) * 100
}
</script>

<template>
  <section v-if="metrics?.memory" class="mt-8 space-y-8">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardContent class="space-y-4">
          <div>
            <div class="text-lg font-bold">Memory</div>
            <div class="text-sm text-neutral-400">RAM and Swap Usage Overview</div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Used / Available</span>
              <div class="flex items-center gap-1 font-bold">
                <span class="text-neutral-300">
                  {{ formatNumber(metrics.memory.used_gb, 0, 2) }}
                </span>
                /
                <span>
                  {{ formatNumber(metrics.memory.available_gb, 0, 2) }}
                </span>
                <span class="text-neutral-400">GB</span>
              </div>
            </div>
            <Progress :model-value="memoryUsedPct()" />
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Swap Used / Free</span>
              <div class="flex items-center gap-1 font-bold">
                <span class="text-neutral-300">
                  {{ formatNumber(metrics.memory.swap_used_gb, 0, 2) }}
                </span>
                /
                <span>
                  {{ formatNumber(metrics.memory.swap_free_gb, 0, 2) }}
                </span>
                <span class="text-neutral-400">GB</span>
              </div>
            </div>
            <Progress :model-value="swapUsedPct()" />
          </div>
        </CardContent>
      </Card>

      <!-- Disks Card -->
      <Card>
        <CardContent class="space-y-4">
          <div>
            <div class="text-lg font-bold">Disks</div>
            <div class="text-sm text-neutral-400">Storage Overview</div>
          </div>

          <div v-for="disk in metrics.disk" :key="disk.name" class="bg-accent rounded-lg p-4">
            <div class="space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="font-bold">{{ disk.name }}</div>

                <div class="flex flex-wrap items-center justify-end gap-2">
                  <div class="bg-foreground/10 flex items-center gap-1 rounded-lg px-2 py-1">
                    <span>{{ formatNumber(disk.raw_size_gb, 0, 2) }}</span>
                    <span class="text-sm text-neutral-400">GB</span>
                  </div>

                  <div
                    v-if="disk.temperature"
                    class="bg-foreground/10 flex items-center gap-1 rounded-lg px-2 py-1"
                  >
                    <ThermometerIcon :size="16" />
                    <span>{{ formatNumber(disk.temperature, 0, 0) }}</span>
                    <span class="text-sm text-neutral-400">°C</span>
                  </div>
                </div>
              </div>

              <template v-if="disk.filesystems?.length">
                <Separator />

                <div v-for="fs in disk.filesystems" :key="fs.mountpoint" class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>{{ fs.mountpoint }}</span>
                    <div class="flex items-center gap-1 font-bold">
                      <span class="text-neutral-300">
                        {{ formatNumber(fs.used_gb, 0, 2) }}
                      </span>
                      /
                      <span>
                        {{ formatNumber(fs.total_gb, 0, 2) }}
                      </span>
                      <span class="text-neutral-400">GB</span>
                    </div>
                  </div>
                  <Progress :model-value="fs.percent" />
                </div>
              </template>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>

  <Empty v-else class="w-full">
    <EmptyHeader>
      <EmptyMedia>
        <Spinner class="size-8" />
      </EmptyMedia>
    </EmptyHeader>
  </Empty>
</template>
