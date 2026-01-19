<script setup lang="ts">
import AppLogo from '@/components/AppLogo.vue'
</script>

<template>
  <main class="container mx-auto flex min-h-dvh flex-col items-center justify-center">
    <!-- <div class="mb-4 text-xl select-none"> -->
    <!--   <span class="font-normal tracking-widest text-muted-foreground">Horizon</span> -->
    <!--   <span class="font-bold">X</span> -->
    <!-- </div> -->
    <AppLogo class="mb-4" />

    <RouterView />
  </main>
</template>
