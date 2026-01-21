<script setup lang="ts">
import { useDialog } from '@/composables/dialog'

const { dialogs, closeDialogByID } = useDialog()
</script>

<template>
  <component
    :is="dialog.component"
    v-for="dialog in dialogs"
    :key="dialog.id"
    @close="closeDialogByID(dialog.id)"
  />
</template>
