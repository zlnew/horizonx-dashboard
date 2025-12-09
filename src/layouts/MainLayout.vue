<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ChevronDownIcon,
  LayoutGridIcon,
  LogOutIcon,
  OrbitIcon,
  ServerIcon,
  UsersIcon
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import MetricsApi from '@/api/Metrics'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import useWebSocket from '@/composables/web-socket'
import WSChannel from '@/constants/ws-channel'
import WSEvent from '@/constants/ws-event'
import useAuthStore from '@/stores/auth'
import useMetricsStore from '@/stores/metrics'

const router = useRouter()
const authStore = useAuthStore()
const metricsStore = useMetricsStore()
const { subscribe } = useWebSocket()
const { user } = storeToRefs(authStore)

subscribe(WSChannel.METRICS, (incoming) => {
  if (incoming.event === WSEvent.METRICS_UPDATED) {
    metricsStore.metrics = incoming.payload as Metrics | undefined
  }
})

onMounted(async () => {
  fetchMetrics()
})

const fetchMetrics = async () => {
  try {
    metricsStore.metrics = await new MetricsApi().get<Metrics>()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const handleLogout = () => {
  authStore.logout().then(() => {
    router.push({ name: 'auth.login' })
  })
}
</script>

<template>
  <header>
    <div class="container mx-auto flex h-16 items-center justify-between">
      <div class="flex items-center gap-2">
        <OrbitIcon />
        <div class="text-lg font-bold">
          <span class="text-neutral-400">Horizon</span>
          <span>X</span>
        </div>
      </div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost">
              <LayoutGridIcon class="text-neutral-400" />
              {{ user.name }}
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-56"
            align="end"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Pages</DropdownMenuLabel>
            <DropdownMenuItem as-child>
              <RouterLink :to="{ name: 'dashboard' }">
                <ServerIcon />
                Server Monitor
              </RouterLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <RouterLink :to="{ name: 'team' }">
                <UsersIcon />
                Team
              </RouterLink>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              class="text-destructive"
              @click="handleLogout"
            >
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>

  <main class="container mx-auto my-4 min-h-dvh">
    <RouterView />
  </main>

  <footer>
    <div class="container mx-auto flex h-16 items-center justify-center">
      <div class="text-sm text-neutral-400">Copyright (c) 2025 HorizonX. All Rights Reserved.</div>
    </div>
  </footer>
</template>
