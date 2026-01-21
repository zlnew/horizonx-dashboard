<script setup lang="ts">
import AppLogo from '@/components/AppLogo.vue'
</script>

<template>
  <main class="container mx-auto flex min-h-dvh flex-col items-center justify-center">
    <AppLogo class="mb-8" />
    <RouterView />
  </main>
</template>
