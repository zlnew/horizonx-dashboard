<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useDate } from '@/composables/date'
import LogLevel from '@/constants/log-level'
import { logLevelLabel } from '@/mapper/log'

const props = defineProps<{
  data: Log[] | undefined
}>()

const { formatDate } = useDate()

const logsContainer = ref<HTMLElement>()

const colors = {
  [LogLevel.DEBUG]: 'text-muted',
  [LogLevel.ERROR]: 'text-destructive',
  [LogLevel.FATAL]: 'text-destructive font-bold',
  [LogLevel.INFO]: 'text-background dark:text-foreground',
  [LogLevel.WARN]: 'text-yellow-200'
}

watch(
  () => props.data?.length,
  async () => {
    await nextTick()
    if (!logsContainer.value) return
    logsContainer.value.scrollTop = logsContainer.value.scrollHeight
  }
)
</script>

<template>
  <div
    ref="logsContainer"
    class="bg-foreground dark:bg-background h-84 space-y-1 overflow-auto rounded-lg p-4 font-mono text-xs"
  >
    <template v-if="data?.length">
      <div
        v-for="(log, i) in data"
        :key="i"
        class="flex gap-3"
      >
        <span class="text-muted-foreground min-w-4">{{ i + 1 }}</span>
        <span class="text-muted-foreground text-nowrap">
          {{ formatDate(new Date(log.timestamp), 'DD-MM-YYYY HH:mm:ss') }}
        </span>
        <span
          class="min-w-10 font-semibold text-nowrap"
          :class="colors[log.level]"
        >
          {{ logLevelLabel(log.level) }}
        </span>
        <span
          class="flex-1 text-nowrap wrap-break-word"
          :class="colors[log.level]"
        >
          {{ log.message }}
        </span>
      </div>
    </template>
    <template v-else>
      <div class="text-muted-foreground">no logs yet</div>
    </template>
  </div>
</template>
