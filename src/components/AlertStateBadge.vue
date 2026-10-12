<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { alertStateClasses, alertStateLabel } from '@/mapper/alert'

const props = defineProps<{
  state: string
}>()
</script>

<template>
  <Badge
    variant="outline"
    :class="alertStateClasses(props.state)"
  >
    {{ alertStateLabel(props.state) }}
  </Badge>
</template>
