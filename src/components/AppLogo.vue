<script setup lang="ts">
defineProps<{
  hideText?: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-2 font-sans text-base select-none">
    <div class="flex aspect-square size-8 items-center justify-center">
      <img
        src="/logo.png"
        alt="Horizon X Logo"
        class="size-8 rounded-full object-cover"
      />
    </div>
    <div
      v-if="!hideText"
      class="grid flex-1 text-left text-lg leading-tight"
    >
      <div>
        <span class="text-accent-foreground font-normal tracking-widest">Horizon</span>
        <span class="font-bold">X</span>
      </div>
    </div>
  </div>
</template>
