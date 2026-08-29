<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { AlertSeverity } from '@/constants/alert'
import { alertSeverityLabel } from '@/mapper/alert'

const props = defineProps<{
  severity: string
}>()

const classes = computed(() => {
  switch (props.severity) {
    case AlertSeverity.CRITICAL:
      return 'bg-red-500/10 text-red-500 border-red-500/30'
    case AlertSeverity.FATAL:
      return 'bg-purple-500/10 text-purple-500 border-purple-500/30'
    case AlertSeverity.WARNING:
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
    default:
      return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
  }
})
</script>

<template>
  <Badge
    variant="outline"
    :class="classes"
  >
    {{ alertSeverityLabel(props.severity) }}
  </Badge>
</template>
