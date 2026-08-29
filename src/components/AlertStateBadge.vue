<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { AlertState } from '@/constants/alert'
import { alertStateLabel } from '@/mapper/alert'

const props = defineProps<{
  state: string
}>()

const classes = computed(() => {
  switch (props.state) {
    case AlertState.FIRING:
      return 'bg-red-500/10 text-red-500 border-red-500/30'
    default:
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
  }
})
</script>

<template>
  <Badge
    variant="outline"
    :class="classes"
  >
    {{ alertStateLabel(props.state) }}
  </Badge>
</template>
