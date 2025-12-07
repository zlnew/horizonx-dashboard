<script setup lang="ts">
import useMetricsStore from '@/stores/metrics'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
  type ChartConfig,
} from '@/components/ui/chart'
import { VisArea, VisAxis, VisLine, VisXYContainer } from '@unovis/vue'
import { useDate } from '@/composables/date'

type ChartData = NetHistory

const metricsStore = useMetricsStore()
const { metrics, netHistory: chartData } = storeToRefs(metricsStore)
const { formatDate } = useDate()

const chartConfig = {
  download: {
    label: 'Download',
    color: 'var(--color-primary)',
  },
  upload: {
    label: 'Upload',
    color: 'var(--color-accent)',
  },
} satisfies ChartConfig

watch(
  () => metrics.value?.network,
  (val) => {
    if (!val) return

    const now = new Date()
    const cutoff = now.getTime() - 5 * 60 * 1000 // 5 menit

    chartData.value.push({
      timestamp: now,
      download: val.rx_speed,
      upload: val.tx_speed,
    })

    while (chartData.value.length > 0 && chartData.value[0]!.timestamp.getTime() < cutoff) {
      chartData.value.shift()
    }
  },
  { deep: true },
)
</script>

<template>
  <ChartContainer :config="chartConfig" class="min-h-[220px] w-full">
    <VisXYContainer :data="chartData" :y-domain="[0, 200]">
      <VisArea
        :x="(d: ChartData) => d.timestamp"
        :y="(d: ChartData) => d.download"
        :color="chartConfig.download.color"
        :opacity="0.2"
      />
      <VisLine
        :x="(d: ChartData) => d.timestamp"
        :y="(d: ChartData) => d.download"
        :color="chartConfig.download.color"
        :stroke-width="2"
      />

      <VisArea
        :x="(d: ChartData) => d.timestamp"
        :y="(d: ChartData) => d.upload"
        :color="chartConfig.upload.color"
        :opacity="0.2"
      />
      <VisLine
        :x="(d: ChartData) => d.timestamp"
        :y="(d: ChartData) => d.upload"
        :color="chartConfig.upload.color"
        :stroke-width="2"
      />

      <VisAxis
        type="x"
        :tick-line="false"
        :domain-line="false"
        :grid-line="false"
        :tick-format="(d: Date) => formatDate(d, 'hh:mm A')"
      />

      <VisAxis
        type="y"
        :num-ticks="3"
        :tick-line="false"
        :domain-line="false"
        :grid-line="true"
        :tick-format="(v: number) => `${v.toFixed(1)} MB/s`"
      />

      <ChartTooltip />
      <ChartCrosshair
        :template="
          componentToString(chartConfig, ChartTooltipContent, {
            labelFormatter(d) {
              return formatDate(d as Date, 'hh:mm A')
            },
            indicator: 'dot',
          })
        "
      />
    </VisXYContainer>
  </ChartContainer>
</template>
