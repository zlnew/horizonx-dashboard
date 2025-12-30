<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { VisArea, VisAxis, VisLine, VisXYContainer } from '@unovis/vue'
import { toast } from 'vue-sonner'
import ServerApi from '@/api/Server'
import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString
} from '@/components/ui/chart'
import { useDate } from '@/composables/date'
import useAppStore from '@/stores/app'
import useMetricsStore from '@/stores/metrics'

type ChartData = CpuUsagePoint

const appStore = useAppStore()
const metricsStore = useMetricsStore()
const { formatDate } = useDate()
const { metrics, cpuUsagePoint: chartData } = storeToRefs(metricsStore)

const chartConfig = {
  usage_percent: {
    label: 'Usage',
    color: 'var(--color-primary)'
  }
} satisfies ChartConfig

watch(
  () => metrics.value,
  (val) => {
    if (!val?.cpu?.usage || !val.recorded_at) return

    const recordedAt = new Date(val.recorded_at)
    const cutoff = recordedAt.getTime() - 15 * 60 * 1000

    chartData.value.push({
      at: recordedAt,
      usage_percent: val.cpu.usage.ema
    })

    while (chartData.value.length > 0 && chartData.value[0]!.at.getTime() < cutoff) {
      chartData.value.shift()
    }
  },
  { deep: true }
)

onMounted(() => {
  fetchHistory()
})

const fetchHistory = async () => {
  try {
    const res = await new ServerApi().getCPUUsageHistory<ApiResponse<CpuUsagePoint[]>>(
      appStore.serverID
    )

    chartData.value =
      res.data?.map((d) => ({
        ...d,
        at: new Date(d.at)
      })) ?? []
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
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
        :x="(d: ChartData) => d.at"
        :y="(d: ChartData) => d.usage_percent"
        :color="chartConfig.usage_percent.color"
        :opacity="0.25"
      />
      <VisLine
        :x="(d: ChartData) => d.at"
        :y="(d: ChartData) => d.usage_percent"
        :color="chartConfig.usage_percent.color"
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
            labelFormatter(d) {
              return formatDate(d as Date, 'hh:mm A')
            },
            indicator: 'dot'
          })
        "
      />
    </VisXYContainer>
  </ChartContainer>
</template>
