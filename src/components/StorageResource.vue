<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ThermometerIcon } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useNumber } from '@/composables/number'
import useMetricsStore from '@/stores/metrics'

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
  <section
    v-if="metrics?.memory"
    class="mt-8 space-y-8"
  >
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-1">
      <Card>
        <CardContent class="space-y-4">
          <div>
            <div class="text-lg font-bold">Memory</div>
            <div class="text-muted-foreground text-sm">RAM and Swap Usage Overview</div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Used / Available</span>
              <div class="flex items-center gap-1 font-bold">
                <span>
                  {{ formatNumber(metrics.memory.used_gb, 0, 2) }}
                </span>
                /
                <span class="text-muted-foreground">
                  {{ formatNumber(metrics.memory.available_gb, 0, 2) }}
                </span>
                <span class="text-muted-foreground">GB</span>
              </div>
            </div>
            <Progress :model-value="memoryUsedPct()" />
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Swap Used / Free</span>
              <div class="flex items-center gap-1 font-bold">
                <span>
                  {{ formatNumber(metrics.memory.swap_used_gb, 0, 2) }}
                </span>
                /
                <span class="text-muted-foreground">
                  {{ formatNumber(metrics.memory.swap_free_gb, 0, 2) }}
                </span>
                <span class="text-muted-foreground">GB</span>
              </div>
            </div>
            <Progress :model-value="swapUsedPct()" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-4">
          <div>
            <div class="text-lg font-bold">Disks</div>
            <div class="text-muted-foreground text-sm">Storage Overview</div>
          </div>

          <div
            v-for="disk in metrics.disk"
            :key="disk.name"
            class="bg-foreground/5 rounded-lg p-4"
          >
            <div class="space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="font-bold">{{ disk.name }}</div>

                <div class="flex flex-wrap items-center justify-end gap-2">
                  <div class="bg-foreground/10 flex items-center gap-1 rounded-lg px-2 py-1">
                    <span>{{ formatNumber(disk.raw_size_gb, 0, 2) }}</span>
                    <span class="text-muted-foreground text-sm">GB</span>
                  </div>

                  <div
                    v-if="disk.temperature"
                    class="bg-foreground/10 flex items-center gap-1 rounded-lg px-2 py-1"
                  >
                    <ThermometerIcon :size="16" />
                    <span>{{ formatNumber(disk.temperature.ema, 0, 0) }}</span>
                    <span class="text-muted-foreground text-sm">°C</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div class="mt-4 grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                <div class="flex flex-col justify-center gap-1">
                  <span class="text-muted-foreground text-xs font-medium uppercase">Read</span>
                  <div class="flex items-end gap-1">
                    <span class="font-mono text-lg font-bold">{{
                      formatNumber(disk.read_mbps.ema, 0, 1)
                    }}</span>
                    <span class="text-muted-foreground mb-1 text-xs">MB/s</span>
                  </div>
                </div>
                <div class="flex flex-col justify-center gap-1">
                  <span class="text-muted-foreground text-xs font-medium uppercase">Write</span>
                  <div class="flex items-end gap-1">
                    <span class="font-mono text-lg font-bold">{{
                      formatNumber(disk.write_mbps.ema, 0, 1)
                    }}</span>
                    <span class="text-muted-foreground mb-1 text-xs">MB/s</span>
                  </div>
                </div>
                <div
                  class="col-span-2 flex flex-col items-center justify-center gap-1 lg:col-span-2"
                >
                  <div class="flex w-full items-center justify-between">
                    <span class="text-muted-foreground text-xs font-medium uppercase"
                      >Utilization</span
                    >
                    <span class="font-mono font-bold"
                      >{{ formatNumber(disk.util_pct.ema, 0, 1) }}%</span
                    >
                  </div>
                  <Progress
                    :model-value="disk.util_pct.ema"
                    class="mt-2 h-2 w-full"
                  />
                </div>
              </div>

              <template v-if="disk.filesystems?.length">
                <Separator />

                <div class="space-y-4 sm:columns-2">
                  <div
                    v-for="fs in disk.filesystems"
                    :key="fs.mountpoint"
                    class="space-y-2"
                  >
                    <div class="flex justify-between text-sm">
                      <span class="text-accent-foreground">{{ fs.mountpoint }}</span>
                      <div class="flex items-center gap-1 font-bold">
                        <span class="text-muted-foreground">
                          {{ formatNumber(fs.used_gb, 0, 2) }}
                        </span>
                        /
                        <span>
                          {{ formatNumber(fs.total_gb, 0, 2) }}
                        </span>
                        <span class="text-muted-foreground">GB</span>
                      </div>
                    </div>
                    <Progress :model-value="fs.percent" />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
