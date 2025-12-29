<script setup lang="ts">
import useLoadingStore from '@/stores/loading'

const store = useLoadingStore()
</script>

<template>
  <div
    v-if="store.loading"
    class="bg-foreground fixed top-0 left-0 z-60 h-0.5 w-full origin-left transition-transform duration-200"
    :style="{ transform: `scaleX(${store.progress})` }"
  />
</template>

<style lang="css" scoped>
@keyframes progress {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
.animate-progress {
  animation: progress 1s linear forwards;
}
</style>
