<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { CpuIcon, GpuIcon, HardDriveIcon, MemoryStickIcon } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useNumber } from '@/composables/number'
import useMetricsStore from '@/stores/metrics'

const metricsStore = useMetricsStore()
const { formatNumber } = useNumber()
const { metrics } = storeToRefs(metricsStore)

const gpuUsageAvg = computed(() => {
  const gpus = metrics.value?.gpu
  if (!gpus?.length) return 0

  const total = gpus.reduce((sum, gpu) => sum + gpu.core_usage_percent.ema, 0)
  return total / gpus.length
})

const diskUsageAvg = computed(() => {
  if (!metrics.value) return 0
  const diskTotal = metrics.value.disk.length
  const utllTotal = metrics.value.disk.reduce((sum, d) => sum + d.util_pct.ema, 0)
  return utllTotal / diskTotal
})
</script>

<template>
  <section
    v-if="metrics"
    class="mt-8 space-y-8"
  >
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent rounded-lg p-2">
                <CpuIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-accent-foreground text-sm">CPU Usage</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">{{ formatNumber(metrics.cpu.usage.ema, 0, 2) }}</span>
                <span class="text-muted-foreground text-lg">%</span>
              </div>
              <Progress :model-value="metrics.cpu.usage.ema" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent rounded-lg p-2">
                <GpuIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-accent-foreground text-sm">GPU Usage</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">
                  {{ formatNumber(gpuUsageAvg, 0, 2) }}
                </span>
                <span class="text-muted-foreground text-lg">%</span>
              </div>
              <Progress :model-value="gpuUsageAvg" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent rounded-lg p-2">
                <MemoryStickIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-accent-foreground text-sm">Memory Usage</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">
                  {{ formatNumber(metrics.memory.usage_percent, 0, 2) }}
                </span>
                <span class="text-muted-foreground text-lg">%</span>
              </div>
              <Progress :model-value="metrics.memory.usage_percent" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent rounded-lg p-2">
                <HardDriveIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-accent-foreground text-sm">Disk Usage</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">{{ formatNumber(diskUsageAvg, 0, 2) }}</span>
                <span class="text-muted-foreground text-lg">%</span>
              </div>
              <Progress :model-value="diskUsageAvg" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
