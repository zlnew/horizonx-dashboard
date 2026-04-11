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
    class="space-y-6"
  >
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- CPU Usage Card -->
      <Card class="border-border/50 bg-card/30 group overflow-hidden backdrop-blur-md">
        <CardContent class="p-6">
          <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
              <div
                class="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-xl p-2.5 transition-colors"
              >
                <CpuIcon :size="20" />
              </div>
              <span class="text-xs font-black tracking-widest uppercase opacity-40"
                >CPU_CORE_LOAD</span
              >
            </div>

            <div class="space-y-1">
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-black tracking-tighter">{{
                  formatNumber(metrics.cpu.usage.ema, 0, 2)
                }}</span>
                <span class="text-muted-foreground/60 text-[11px] font-bold">%</span>
              </div>
              <Progress
                :model-value="metrics.cpu.usage.ema"
                class="h-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- GPU Usage Card -->
      <Card class="border-border/50 bg-card/30 group overflow-hidden backdrop-blur-md">
        <CardContent class="p-6">
          <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
              <div
                class="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-xl p-2.5 transition-colors"
              >
                <GpuIcon :size="20" />
              </div>
              <span class="text-xs font-black tracking-widest uppercase opacity-40"
                >GPU_MODULE_LOAD</span
              >
            </div>

            <div class="space-y-1">
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-black tracking-tighter">{{
                  formatNumber(gpuUsageAvg, 0, 2)
                }}</span>
                <span class="text-muted-foreground/60 text-[11px] font-bold">%</span>
              </div>
              <Progress
                :model-value="gpuUsageAvg"
                class="h-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Memory Usage Card -->
      <Card class="border-border/50 bg-card/30 group overflow-hidden backdrop-blur-md">
        <CardContent class="p-6">
          <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
              <div
                class="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-xl p-2.5 transition-colors"
              >
                <MemoryStickIcon :size="20" />
              </div>
              <span class="text-xs font-black tracking-widest uppercase opacity-40"
                >MEMORY_STACK_UTL</span
              >
            </div>

            <div class="space-y-1">
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-black tracking-tighter">{{
                  formatNumber(metrics.memory.usage_percent, 0, 2)
                }}</span>
                <span class="text-muted-foreground/60 text-[11px] font-bold">%</span>
              </div>
              <Progress
                :model-value="metrics.memory.usage_percent"
                class="h-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Disk Usage Card -->
      <Card class="border-border/50 bg-card/30 group overflow-hidden backdrop-blur-md">
        <CardContent class="p-6">
          <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
              <div
                class="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-xl p-2.5 transition-colors"
              >
                <HardDriveIcon :size="20" />
              </div>
              <span class="text-xs font-black tracking-widest uppercase opacity-40"
                >STORAGE_POOL_UTL</span
              >
            </div>

            <div class="space-y-1">
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-black tracking-tighter">{{
                  formatNumber(diskUsageAvg, 0, 2)
                }}</span>
                <span class="text-muted-foreground/60 text-[11px] font-bold">%</span>
              </div>
              <Progress
                :model-value="diskUsageAvg"
                class="h-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
