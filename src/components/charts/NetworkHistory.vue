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

type ChartData = NetSpeedPoint

const appStore = useAppStore()
const metricsStore = useMetricsStore()
const { metrics, netSpeedPoint: chartData, canReadMetrics } = storeToRefs(metricsStore)
const { formatDate } = useDate()

const chartConfig = {
  rx_mbs: {
    label: 'Download',
    color: 'var(--color-primary)'
  },
  tx_mbs: {
    label: 'Upload',
    color: 'var(--color-primary)'
  }
} satisfies ChartConfig

watch(
  () => metrics.value,
  (val) => {
    if (!val?.network || !val.recorded_at) return

    const recordedAt = new Date(val.recorded_at)
    const cutoff = recordedAt.getTime() - 15 * 60 * 1000

    chartData.value.push({
      at: recordedAt,
      rx_mbs: val.network.rx_speed_mbs.ema,
      tx_mbs: val.network.tx_speed_mbs.ema
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
  if (!canReadMetrics.value) {
    return
  }

  try {
    const res = await new ServerApi().getNetSpeedHistory<ApiResponse<NetSpeedPoint[]>>(
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
        :y="(d: ChartData) => d.rx_mbs"
        :color="chartConfig.rx_mbs.color"
        :opacity="0.4"
      />
      <VisLine
        :x="(d: ChartData) => d.at"
        :y="(d: ChartData) => d.rx_mbs"
        :color="chartConfig.rx_mbs.color"
        :stroke-width="2"
      />

      <VisArea
        :x="(d: ChartData) => d.at"
        :y="(d: ChartData) => d.tx_mbs"
        :color="chartConfig.tx_mbs.color"
        :opacity="0.2"
      />
      <VisLine
        :x="(d: ChartData) => d.at"
        :y="(d: ChartData) => d.tx_mbs"
        :color="chartConfig.tx_mbs.color"
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
            indicator: 'dot'
          })
        "
      />
    </VisXYContainer>
  </ChartContainer>
</template>
