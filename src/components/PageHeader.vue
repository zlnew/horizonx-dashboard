<script setup lang="ts">
// Shared page header — Pattern A (the dominant app-wide pattern).
// Props: icon (lucide component), title, description.
// Slot: right-hand actions (buttons, chips) rendered in a flex-wrap row.
// Adopted app-wide in B1; SystemMonitor (Pattern B) and AuditLogs (Pattern C)
// were converted to this as part of the sweep.
import type { Component } from 'vue'

defineProps<{
  icon: Component
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 sm:gap-8">
    <div class="flex items-center gap-4">
      <div class="bg-accent/50 border-border/50 rounded-xl border p-3">
        <component
          :is="icon"
          :size="24"
          class="text-primary"
        />
      </div>
      <div class="border-border/50 flex flex-col gap-0 border-l pl-4">
        <h1 class="text-2xl font-black tracking-tight uppercase">{{ title }}</h1>
        <p
          v-if="!$slots.description && description"
          class="text-muted-foreground text-sm font-medium italic"
        >
          {{ description }}
        </p>
        <slot
          v-else-if="$slots.description"
          name="description"
        />
      </div>
    </div>

    <div
      v-if="$slots.actions"
      class="flex items-center gap-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
