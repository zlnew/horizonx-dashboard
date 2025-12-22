<script setup lang="ts">
import { useDialog } from '@/composables/dialog'

const { dialogs, closeDialogByID } = useDialog()
</script>

<template>
  <component
    v-for="dialog in dialogs"
    :key="dialog.id"
    :is="dialog.component"
    @close="closeDialogByID(dialog.id)"
  />
</template>
