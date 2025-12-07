<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { AudioLinesIcon, ThermometerIcon, ZapIcon } from 'lucide-vue-next'
import CpuUsageHistory from '@/components/charts/CpuUsageHistory.vue'
import NetworkHistory from '@/components/charts/NetworkHistory.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyMedia } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useNumber } from '@/composables/number'
import useMetricsStore from '@/stores/metrics'

const metricsStore = useMetricsStore()
const { formatNumber } = useNumber()
const { metrics } = storeToRefs(metricsStore)
</script>

<template>
  <section
    v-if="metrics"
    class="mt-8 space-y-8"
  >
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardContent>
          <div class="space-y-4">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="space-y-1">
                <div class="text-lg font-bold">Central Processing Unit</div>
                <div class="text-sm text-neutral-400">
                  Real-time overview of processor workload and thermal performance.
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-end gap-2">
                <div class="bg-accent flex items-center gap-1 rounded-lg px-2 py-1">
                  <AudioLinesIcon :size="16" />
                  <span>{{ formatNumber(metrics.cpu.frequency, 0, 0) }}</span>
                  <span class="text-sm text-neutral-400">Mhz</span>
                </div>

                <div class="bg-accent flex items-center gap-1 rounded-lg px-2 py-1">
                  <ThermometerIcon :size="16" />
                  <span>{{ formatNumber(metrics.cpu.temperature, 0, 0) }}</span>
                  <span class="text-sm text-neutral-400">°C</span>
                </div>

                <div class="bg-accent flex items-center gap-1 rounded-lg px-2 py-1">
                  <ZapIcon :size="16" />
                  <span>{{ formatNumber(metrics.cpu.power_watt, 0, 1) }}</span>
                  <span class="text-sm text-neutral-400">W</span>
                </div>
              </div>
            </div>

            <div class="columns-2 gap-4">
              <div
                v-for="(usage, index) in metrics.cpu.per_core"
                :key="index"
                class="flex items-center justify-between gap-2"
              >
                <div class="w-8 text-sm text-neutral-400">{{ `C${index}` }}</div>
                <Progress :model-value="usage" />
              </div>
            </div>

            <Separator />

            <div class="flex items-center justify-between gap-4">
              <div class="font-bold">Usage Over Time</div>
              <div class="text-sm text-neutral-400">Past 5 minutes</div>
            </div>

            <CpuUsageHistory />
          </div>
        </CardContent>
      </Card>

      <div class="grid grid-cols-1 gap-4">
        <Card>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-1">
                  <div class="text-lg font-bold">Graphics Processing Unit</div>
                  <div class="text-sm text-neutral-400">
                    Live monitoring of graphics load, temperature, and power draw.
                  </div>
                </div>
              </div>

              <div
                v-for="card in metrics.gpu"
                :key="card.id"
                class="border-accent bg-accent space-y-4 rounded-lg border p-4"
              >
                <div class="flex flex-wrap items-center justify-between gap-4">
                  <div class="space-y-1">
                    <div class="font-bold">{{ card.vendor }}</div>
                    <div class="text-neutral-400">{{ card.model }}</div>
                  </div>

                  <div class="flex flex-wrap items-center justify-end gap-2">
                    <div class="bg-foreground/10 flex items-center gap-1 rounded-lg px-2 py-1">
                      <AudioLinesIcon :size="16" />
                      <span>{{ formatNumber(card.core_usage_percent, 0, 0) }}</span>
                      <span class="text-sm text-neutral-400">%</span>
                    </div>

                    <div class="bg-foreground/10 flex items-center gap-1 rounded-lg px-2 py-1">
                      <ThermometerIcon :size="16" />
                      <span>{{ formatNumber(card.temperature, 0, 0) }}</span>
                      <span class="text-sm text-neutral-400">°C</span>
                    </div>

                    <div class="bg-foreground/10 flex items-center gap-1 rounded-lg px-2 py-1">
                      <ZapIcon :size="16" />
                      <span>{{ formatNumber(card.power_watt, 0, 1) }}</span>
                      <span class="text-sm text-neutral-400">W</span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="bg-foreground/10 gap-4 rounded-lg p-4">
                    <div class="space-y-2">
                      <div class="text-sm text-neutral-400">VRAM</div>
                      <div class="flex items-center gap-1">
                        <span class="text-neutral-300">{{
                          formatNumber(card.vram_used_gb, 0, 2)
                        }}</span>
                        /
                        <span>{{ formatNumber(card.vram_total_gb, 0, 2) }}</span>
                        <span class="text-sm text-neutral-400">GB</span>
                      </div>
                      <Progress :model-value="card.vram_percent" />
                    </div>
                  </div>

                  <div class="bg-foreground/10 gap-4 rounded-lg p-4">
                    <div class="space-y-2">
                      <div class="text-sm text-neutral-400">Fan Speed</div>
                      <div class="flex items-center gap-1">
                        <span>{{ formatNumber(card.fan_speed_percent, 0, 0) }}</span>
                        <span class="text-sm text-neutral-400">%</span>
                      </div>
                      <Progress :model-value="card.fan_speed_percent" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div class="space-y-4">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="space-y-1">
                  <div class="text-lg font-bold">Network Activity</div>
                  <div class="text-sm text-neutral-400">
                    Upload and download speeds over the past 5 minutes.
                  </div>
                </div>

                <NetworkHistory />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>

  <Empty
    v-else
    class="w-full"
  >
    <EmptyHeader>
      <EmptyMedia>
        <Spinner class="size-8" />
      </EmptyMedia>
    </EmptyHeader>
  </Empty>
</template>
