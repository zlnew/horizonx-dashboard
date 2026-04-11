<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  AudioLinesIcon,
  ThermometerIcon,
  ZapIcon
} from 'lucide-vue-next'
import CpuUsageHistory from '@/components/charts/CpuUsageHistory.vue'
import NetworkHistory from '@/components/charts/NetworkHistory.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useNumber } from '@/composables/number'
import useMetricsStore from '@/stores/metrics'

const metricsStore = useMetricsStore()
const { formatNumber, formatBytes } = useNumber()
const { metrics } = storeToRefs(metricsStore)
</script>

<template>
  <section
    v-if="metrics"
    class="space-y-6"
  >
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- CPU Detailed Module -->
      <Card class="border-border/50 bg-card/30 flex flex-col overflow-hidden backdrop-blur-md">
        <div
          class="border-border/50 bg-accent flex items-center justify-between border-b px-6 py-4"
        >
          <div class="flex items-center gap-3">
            <div class="bg-primary/10 text-primary rounded-lg p-1.5">
              <AudioLinesIcon :size="16" />
            </div>
            <div>
              <h3 class="text-sm font-black tracking-tight uppercase">Processor Pipeline</h3>
              <p class="text-[11px] font-medium tracking-widest uppercase opacity-40">
                Frequency & Thermal State
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="bg-accent/30 flex items-center gap-1.5 rounded border border-white/5 px-2 py-1"
            >
              <ThermometerIcon
                :size="12"
                class="text-orange-500"
              />
              <span class="font-mono text-sm font-bold"
                >{{ formatNumber(metrics.cpu.temperature.ema, 0, 0) }}°C</span
              >
            </div>
            <div
              class="bg-accent/30 flex items-center gap-1.5 rounded border border-white/5 px-2 py-1"
            >
              <ZapIcon
                :size="12"
                class="text-yellow-500"
              />
              <span class="font-mono text-sm font-bold"
                >{{ formatNumber(metrics.cpu.power_watt.ema, 0, 1) }}W</span
              >
            </div>
          </div>
        </div>

        <CardContent class="flex-1 space-y-6 p-6">
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div
              v-for="(usage, index) in metrics.cpu.per_core"
              :key="index"
              class="flex flex-col gap-1.5"
            >
              <div class="flex items-center justify-between px-1">
                <span class="text-[10px] font-black tracking-tighter uppercase opacity-40"
                  >C_{{ index.toString().padStart(2, '0') }}</span
                >
                <span class="font-mono text-[11px] font-bold"
                  >{{ formatNumber(usage.ema, 0, 0) }}%</span
                >
              </div>
              <Progress
                :model-value="usage.ema"
                class="bg-accent/20 h-1 rounded-none"
              />
            </div>
          </div>

          <div class="border-border/20 border-t pt-4">
            <div class="mb-4 flex items-center justify-between">
              <span class="text-primary text-xs font-black tracking-widest uppercase"
                >Load Distribution History</span
              >
              <span class="text-[10px] font-medium tracking-widest uppercase opacity-30"
                >Real-time sampling</span
              >
            </div>
            <CpuUsageHistory />
          </div>
        </CardContent>
      </Card>

      <div class="flex flex-col gap-6">
        <!-- GPU Detailed Module -->
        <Card class="border-border/50 bg-card/30 overflow-hidden backdrop-blur-md">
          <div
            class="border-border/50 bg-accent flex items-center justify-between border-b px-6 py-4"
          >
            <div class="flex items-center gap-3">
              <div class="bg-primary/10 text-primary rounded-lg p-1.5">
                <ZapIcon :size="16" />
              </div>
              <div>
                <h3 class="text-sm font-black tracking-tight uppercase">Graphics Array</h3>
                <p class="text-[11px] font-medium tracking-widest uppercase opacity-40">
                  Acceleration & VRAM Ops
                </p>
              </div>
            </div>
          </div>

          <CardContent class="p-6">
            <div class="space-y-4">
              <div
                v-for="card in metrics.gpu"
                :key="card.card"
                class="bg-card space-y-4 rounded-xl border border-white/5 p-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-baseline gap-2">
                    <span class="text-primary text-sm font-black tracking-tight uppercase">{{
                      card.vendor
                    }}</span>
                    <span class="font-mono text-[11px] font-medium opacity-60">{{
                      card.card
                    }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="bg-accent/30 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold"
                      >{{ formatNumber(card.frequency_mhz.ema, 0, 0) }} MHz</span
                    >
                    <span class="bg-accent/30 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold"
                      >{{ formatNumber(card.temperature.ema, 0, 0) }}°C</span
                    >
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-black tracking-widest uppercase opacity-40"
                        >Core_Load</span
                      >
                      <span class="font-mono text-[11px] font-bold"
                        >{{ formatNumber(card.core_usage_percent.ema, 0, 1) }}%</span
                      >
                    </div>
                    <Progress
                      :model-value="card.core_usage_percent.ema"
                      class="h-1"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-black tracking-widest uppercase opacity-40"
                        >VRAM_Used</span
                      >
                      <span class="font-mono text-[11px] font-bold"
                        >{{ formatNumber(card.vram_used_gb, 0, 1) }} /
                        {{ formatNumber(card.vram_total_gb, 0, 1) }}GB</span
                      >
                    </div>
                    <Progress
                      :model-value="card.vram_percent"
                      class="h-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Network activity Module -->
        <Card
          class="border-border/50 bg-card/30 flex flex-1 flex-col overflow-hidden backdrop-blur-md"
        >
          <div
            class="border-border/50 bg-accent flex items-center justify-between border-b px-6 py-4"
          >
            <div class="flex items-center gap-3">
              <div class="bg-primary/10 text-primary rounded-lg p-1.5">
                <ArrowUpFromLineIcon :size="16" />
              </div>
              <div>
                <h3 class="text-sm font-black tracking-tight uppercase">I/O Throughput</h3>
                <p class="text-[11px] font-medium tracking-widest uppercase opacity-40">
                  Packet flow & Bandwidth
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="group flex items-center gap-2">
                <ArrowDownToLineIcon
                  :size="12"
                  class="text-green-500"
                />
                <span class="font-mono text-[11px] font-bold">{{
                  formatBytes(metrics.network.rx_bytes)
                }}</span>
              </div>
              <div class="group flex items-center gap-2">
                <ArrowUpFromLineIcon
                  :size="12"
                  class="text-blue-500"
                />
                <span class="font-mono text-[11px] font-bold">{{
                  formatBytes(metrics.network.tx_bytes)
                }}</span>
              </div>
            </div>
          </div>

          <CardContent class="flex flex-1 flex-col p-6">
            <div class="min-h-[140px] flex-1">
              <NetworkHistory />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
