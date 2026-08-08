<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="table-container"
    role="region"
    aria-label="Scrollable table"
    tabindex="0"
    class="relative w-full overflow-auto focus-visible:ring-ring/40 focus-visible:outline-none focus-visible:ring-2"
  >
    <table
      data-slot="table"
      :class="cn('w-full caption-bottom text-sm', props.class)"
    >
      <slot />
    </table>
    <!-- right edge fade: signals scrollability on tablet widths (TK-0030 B6) -->
    <div
      class="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent"
      aria-hidden="true"
    ></div>
  </div>
</template>
