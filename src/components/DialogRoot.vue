<script setup lang="ts">
import { Dialog } from '@/components/ui/dialog'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const onOpen = (open: boolean) => {
  if (!open) {
    emit('close')
  }
}
</script>

<template>
  <Dialog
    default-open
    @update:open="onOpen"
  >
    <slot />
  </Dialog>
</template>
