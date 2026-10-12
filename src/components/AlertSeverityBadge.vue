<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { alertSeverityClasses, alertSeverityLabel } from '@/mapper/alert'

const props = defineProps<{
  severity: string
}>()
</script>

<template>
  <Badge
    variant="outline"
    :class="alertSeverityClasses(props.severity)"
  >
    {{ alertSeverityLabel(props.severity) }}
  </Badge>
</template>
