<script setup lang="ts">
import AccountDropdown from '@/components/AccountDropdown.vue'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import AppLogo from '@/components/AppLogo.vue'
import ServerSelector from '@/components/ServerSelector.vue'
import { SidebarTrigger } from '@/components/ui/sidebar'
</script>

<template>
  <header class="bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b">
    <div class="flex w-full items-center justify-between gap-8 px-4 sm:px-8">
      <div class="flex items-center gap-2">
        <AppLogo
          hide-text
          class="sm:hidden"
        />
        <SidebarTrigger class="-ml-1 hidden sm:inline-flex" />
        <AppBreadcrumb />
      </div>

      <div class="flex items-center gap-2">
        <ServerSelector class="hidden sm:block" />
        <AccountDropdown />
      </div>
    </div>
  </header>
</template>
