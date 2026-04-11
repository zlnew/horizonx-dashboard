<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { HardDriveIcon, MemoryStickIcon, ThermometerIcon } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
    class="space-y-6"
  >
    <div class="grid grid-cols-1 gap-6">
      <!-- Memory Module -->
      <Card class="border-border/50 bg-card/30 overflow-hidden backdrop-blur-md">
        <div
          class="border-border/50 bg-accent flex items-center justify-between border-b px-6 py-4"
        >
          <div class="flex items-center gap-3">
            <div class="bg-primary/10 text-primary rounded-lg p-1.5">
              <MemoryStickIcon :size="16" />
            </div>
            <div>
              <h3 class="text-sm font-black tracking-tight uppercase">Memory Stack</h3>
              <p class="text-[11px] font-medium tracking-widest uppercase opacity-40">
                RAM & Virtual Address Space
              </p>
            </div>
          </div>
        </div>

        <CardContent class="p-6">
          <div class="grid gap-8 md:grid-cols-2">
            <div class="space-y-3">
              <div class="flex flex-col items-start justify-between">
                <span class="text-xs font-black tracking-widest uppercase opacity-60"
                  >Physical_RAM</span
                >
                <div class="flex items-baseline gap-1.5">
                  <span class="font-mono text-sm font-bold">{{
                    formatNumber(metrics.memory.used_gb, 0, 2)
                  }}</span>
                  <span class="text-muted-foreground text-[11px] font-medium"
                    >/ {{ formatNumber(metrics.memory.available_gb, 0, 2) }} GB</span
                  >
                </div>
              </div>
              <Progress
                :model-value="memoryUsedPct()"
                class="h-1.5"
              />
            </div>

            <div class="space-y-3">
              <div class="flex flex-col items-start justify-between">
                <span class="text-xs font-black tracking-widest uppercase opacity-60"
                  >Swap_Vault</span
                >
                <div class="flex items-baseline gap-1.5">
                  <span class="font-mono text-sm font-bold">{{
                    formatNumber(metrics.memory.swap_used_gb, 0, 2)
                  }}</span>
                  <span class="text-muted-foreground text-[11px] font-medium"
                    >/ {{ formatNumber(metrics.memory.swap_total_gb, 0, 2) }} GB</span
                  >
                </div>
              </div>
              <Progress
                :model-value="swapUsedPct()"
                class="h-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Storage Devices Module -->
      <Card class="border-border/50 bg-card/30 overflow-hidden backdrop-blur-md">
        <div
          class="border-border/50 bg-accent flex items-center justify-between border-b px-6 py-4"
        >
          <div class="flex items-center gap-3">
            <div class="bg-primary/10 text-primary rounded-lg p-1.5">
              <HardDriveIcon :size="16" />
            </div>
            <div>
              <h3 class="text-sm font-black tracking-tight uppercase">Storage Array</h3>
              <p class="text-[11px] font-medium tracking-widest uppercase opacity-40">
                Physical Drives & Mountpoints
              </p>
            </div>
          </div>
        </div>

        <CardContent class="p-6">
          <div class="space-y-6">
            <div
              v-for="disk in metrics.disk"
              :key="disk.name"
              class="bg-card space-y-6 rounded-xl border border-white/5 p-6"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-primary text-sm font-black tracking-tight uppercase">{{
                    disk.name
                  }}</span>
                  <div
                    class="bg-accent/30 flex items-center gap-2 rounded px-2 py-0.5 font-mono text-[11px] font-bold"
                  >
                    <span>{{ formatNumber(disk.raw_size_gb, 0, 1) }} GB</span>
                  </div>
                </div>

                <div
                  v-if="disk.temperature"
                  class="flex items-center gap-1.5 rounded border border-orange-500/10 bg-orange-500/5 px-2 py-0.5 text-orange-500"
                >
                  <ThermometerIcon :size="12" />
                  <span class="font-mono text-[11px] font-bold"
                    >{{ formatNumber(disk.temperature.ema, 0, 0) }}°C</span
                  >
                </div>
              </div>

              <div class="border-border/20 grid grid-cols-2 gap-6 border-b pb-6 sm:grid-cols-4">
                <div class="space-y-1">
                  <span class="text-[10px] font-black tracking-widest uppercase opacity-40"
                    >OPS_Read</span
                  >
                  <div class="flex items-baseline gap-1">
                    <span class="font-mono text-sm font-bold">{{
                      formatNumber(disk.read_mbps.ema, 0, 1)
                    }}</span>
                    <span class="text-[11px] opacity-40">MB/s</span>
                  </div>
                </div>
                <div class="space-y-1">
                  <span class="text-[10px] font-black tracking-widest uppercase opacity-40"
                    >OPS_Write</span
                  >
                  <div class="flex items-baseline gap-1">
                    <span class="font-mono text-sm font-bold">{{
                      formatNumber(disk.write_mbps.ema, 0, 1)
                    }}</span>
                    <span class="text-[11px] opacity-40">MB/s</span>
                  </div>
                </div>
                <div class="col-span-2 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black tracking-widest uppercase opacity-40"
                      >Disk_Utilization</span
                    >
                    <span class="font-mono text-[11px] font-bold"
                      >{{ formatNumber(disk.util_pct.ema, 0, 1) }}%</span
                    >
                  </div>
                  <Progress
                    :model-value="disk.util_pct.ema"
                    class="h-1"
                  />
                </div>
              </div>

              <div
                v-if="disk.filesystems?.length"
                class="space-y-4"
              >
                <div class="flex items-center gap-2">
                  <span class="text-primary/60 text-xs font-black tracking-widest uppercase"
                    >Mounted Filesystems</span
                  >
                  <div class="bg-border/10 h-px flex-1"></div>
                </div>

                <div class="grid gap-6 md:grid-cols-2">
                  <div
                    v-for="fs in disk.filesystems"
                    :key="fs.mountpoint"
                    class="bg-accent space-y-2 rounded-lg border border-white/5 p-3"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-mono text-sm font-medium opacity-60">{{
                        fs.mountpoint
                      }}</span>
                      <span class="font-mono text-[11px] font-bold"
                        >{{ formatNumber(fs.used_gb, 0, 1) }} /
                        {{ formatNumber(fs.total_gb, 0, 1) }} GB</span
                      >
                    </div>
                    <Progress
                      :model-value="fs.percent"
                      class="bg-accent/10 h-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
