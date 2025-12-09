<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import Role from '@/constants/role'

const { roleName } = defineProps<{
  roleName: string
}>()

const variant = computed(() => {
  if (roleName === Role.ADMIN) {
    return 'secondary'
  }

  if (roleName === Role.VIEWER) {
    return 'outline'
  }

  return 'default'
})
</script>

<template>
  <Badge :variant="variant">{{ roleName }}</Badge>
</template>
