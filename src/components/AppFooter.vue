<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer>
    <div class="container mx-auto flex h-16 items-center justify-center">
      <div class="text-muted-foreground text-sm">
        Copyright (c) {{ currentYear }} <span class="font-bold">HorizonX</span>. All Rights
        Reserved.
      </div>
    </div>
  </footer>
</template>
