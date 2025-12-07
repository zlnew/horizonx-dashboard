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

type ChartData = CpuUsageHistory

const metricsStore = useMetricsStore()
const { formatDate } = useDate()
const { metrics, cpuUsageHistory: chartData } = storeToRefs(metricsStore)

const chartConfig = {
  cpu: {
    label: 'CPU Usage',
    color: 'var(--color-foreground)',
  },
} satisfies ChartConfig

watch(
  () => metrics.value?.cpu?.usage,
  (val) => {
    if (val == null) return
    chartData.value.push({ timestamp: new Date(), usage: val })

    if (chartData.value.length > 60) {
      chartData.value.shift()
    }
  },
)
</script>

<template>
  <ChartContainer :config="chartConfig" class="min-h-[220px] w-full">
    <VisXYContainer :data="chartData">
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
        :num-ticks="3"
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
            indicator: 'dot',
          })
        "
        :color="chartConfig.cpu.color"
      />
    </VisXYContainer>
  </ChartContainer>
</template>
