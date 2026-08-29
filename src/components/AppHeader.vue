<script setup lang="ts">
import { computed } from 'vue'
import { BellIcon } from 'lucide-vue-next'
import AccountDropdown from '@/components/AccountDropdown.vue'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import AppLogo from '@/components/AppLogo.vue'
import ServerSelector from '@/components/ServerSelector.vue'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useActiveAlertCount from '@/composables/active-alert-count'
import useWebSocket from '@/composables/web-socket'

const { connected } = useWebSocket()
const { count } = useActiveAlertCount()

const showBadge = computed(() => count.value > 0)
</script>

<template>
  <header
    class="bg-background/80 sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b backdrop-blur-md"
  >
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
        <div
          class="mr-1 hidden items-center gap-1.5 sm:flex"
          :title="connected ? 'Live connection' : 'Reconnecting…'"
        >
          <span
            class="size-2 rounded-full transition-colors duration-300"
            :class="connected ? 'bg-emerald-500' : 'animate-pulse bg-amber-500'"
          />
          <span class="text-muted-foreground text-xs">{{
            connected ? 'Live' : 'Reconnecting'
          }}</span>
        </div>
        <ServerSelector class="hidden md:block" />
        <Button
          as-child
          variant="ghost"
          size="icon"
          class="relative rounded-full"
          aria-label="View alerts"
          :title="showBadge ? `${count} active alert${count > 1 ? 's' : ''}` : 'View alerts'"
        >
          <RouterLink :to="{ name: 'alerts.history' }">
            <BellIcon />
            <span
              v-if="showBadge"
              class="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
            >
              {{ count > 99 ? '99+' : count }}
            </span>
          </RouterLink>
        </Button>
        <AccountDropdown />
      </div>
    </div>
  </header>
</template>
