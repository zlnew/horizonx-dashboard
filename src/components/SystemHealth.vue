<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  ActivityIcon,
  CpuIcon,
  GpuIcon,
  HardDriveIcon,
  MemoryStickIcon,
  ServerIcon
} from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useNumber } from '@/composables/number'
import useMetricsStore from '@/stores/metrics'

const metricsStore = useMetricsStore()
const { formatNumber, formatDuration } = useNumber()
const { metrics } = storeToRefs(metricsStore)

const gpuUsageAvg = computed(() => {
  const gpus = metrics.value?.gpu
  if (!gpus?.length) return 0

  const total = gpus.reduce((sum, gpu) => sum + gpu.core_usage_percent, 0)
  return total / gpus.length
})

const memoryUsagePercentage = computed(() => {
  const memory = metrics.value?.memory
  if (!memory) return 0

  return (memory.used_gb / memory.total_gb) * 100
})

const diskUsageAvg = computed(() => {
  const fss = metrics.value?.disk.filter((d) => d.filesystems?.length).flatMap((d) => d.filesystems)
  if (!fss?.length) return 0

  const total = fss.reduce((sum, fs) => sum + (fs?.percent ?? 0), 0)
  return total / fss.length
})
</script>

<template>
  <section
    v-if="metrics"
    class="mt-8 space-y-8"
  >
    <div class="flex flex-wrap items-center justify-between gap-8">
      <div class="flex items-center gap-4">
        <div class="bg-accent rounded-lg p-3">
          <ServerIcon :size="24" />
        </div>
        <div class="flex flex-col gap-0">
          <div class="text-xl">Server Monitor</div>
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span>@{{ metrics.os_info.hostname }}</span>
            &middot;
            <span class="text-neutral-400">
              {{ metrics.os_info.name }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 text-lg text-neutral-400">
        <ActivityIcon :size="24" />
        <span>{{ formatDuration(metrics?.uptime_seconds) }}</span>
      </div>
    </div>

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

      <Card
        v-for="gpu in metrics.gpu"
        :key="gpu.model"
      >
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="bg-accent rounded-lg p-2">
                <GpuIcon />
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-sm text-neutral-400">GPU Usage</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">
                  {{ formatNumber(gpuUsageAvg, 0, 2) }}
                </span>
                <span class="text-lg text-neutral-400">%</span>
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
              <Progress :model-value="memoryUsagePercentage" />
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
              <div class="text-sm text-neutral-400">Disk Usage</div>
              <div class="flex items-center gap-1">
                <span class="text-2xl">{{ formatNumber(diskUsageAvg, 0, 2) }}</span>
                <span class="text-lg text-neutral-400">%</span>
              </div>
              <Progress :model-value="diskUsageAvg" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
