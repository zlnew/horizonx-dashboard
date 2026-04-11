<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-auto w-full py-6">
    <div class="container mx-auto flex flex-col items-center gap-4 px-6">
      <div
        class="text-muted-foreground/60 flex items-center gap-4 text-xs font-medium tracking-widest uppercase"
      >
        <router-link
          :to="{ name: 'home' }"
          class="hover:text-primary transition-colors"
          >Home</router-link
        >
        <span class="bg-border size-1 rounded-full"></span>
        <a
          href="https://github.com/zlnew/horizonx"
          target="_blank"
          class="hover:text-primary transition-colors"
          >GitHub</a
        >
        <span class="bg-border size-1 rounded-full"></span>
        <router-link
          :to="{ name: 'privacy' }"
          class="hover:text-primary transition-colors"
          >Privacy</router-link
        >
      </div>
      <p class="text-muted-foreground/40 text-[10px] font-bold tracking-tighter uppercase">
        © {{ year }} HORIZONX PLATFORM. ALL RIGHTS RESERVED.
      </p>
    </div>
  </footer>
</template>
