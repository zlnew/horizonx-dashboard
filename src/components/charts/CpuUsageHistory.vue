<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { VisArea, VisAxis, VisLine, VisXYContainer } from '@unovis/vue'
import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString
} from '@/components/ui/chart'
import { useDate } from '@/composables/date'
import useMetricsStore from '@/stores/metrics'

type ChartData = CpuUsageHistory

const metricsStore = useMetricsStore()
const { formatDate } = useDate()
const { metrics, cpuUsageHistory: chartData } = storeToRefs(metricsStore)

const chartConfig = {
  cpu: {
    label: 'CPU Usage',
    color: 'var(--color-foreground)'
  }
} satisfies ChartConfig

watch(
  () => metrics.value,
  (val) => {
    if (!val?.cpu?.usage || !val.recorded_at) return

    const recordedAt = new Date(val.recorded_at)
    const cutoff = recordedAt.getTime() - 5 * 60 * 1000

    chartData.value.push({
      timestamp: recordedAt,
      usage: val.cpu.usage.ema
    })

    while (chartData.value.length > 0 && chartData.value[0]!.timestamp.getTime() < cutoff) {
      chartData.value.shift()
    }
  }
)
</script>

<template>
  <ChartContainer
    :config="chartConfig"
    class="min-h-[220px] w-full"
  >
    <VisXYContainer
      :data="chartData"
      :y-domain="[0, 100]"
    >
      <VisArea
        :x="(d: ChartData) => d.timestamp"
        :y="(d: ChartData) => d.usage"
        :color="chartConfig.cpu.color"
        :opacity="0.25"
      />

      <VisLine
        :x="(d: ChartData) => d.timestamp"
        :y="(d: ChartData) => d.usage"
        :color="chartConfig.cpu.color"
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
        :tick-line="false"
        :domain-line="false"
        :grid-line="true"
        :tick-format="(v: number) => `${v}%`"
      />

      <ChartTooltip />
      <ChartCrosshair
        :template="
          componentToString(chartConfig, ChartTooltipContent, {
            labelKey: 'usage',
            indicator: 'dot'
          })
        "
        :color="chartConfig.cpu.color"
      />
    </VisXYContainer>
  </ChartContainer>
</template>
