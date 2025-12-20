<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ChartColumnBigIcon,
  ChevronUpIcon,
  LayoutGridIcon,
  LogOutIcon,
  OrbitIcon,
  SearchIcon,
  ServerIcon,
  SettingsIcon,
  User2Icon,
  UserIcon,
  UsersIcon
} from 'lucide-vue-next'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Kbd } from '@/components/ui/kbd'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar'
import useWebSocket from '@/composables/web-socket'
import useAppStore from '@/stores/app'
import useAuthStore from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const { connect: connectWs } = useWebSocket()
const { title } = storeToRefs(appStore)
const { user } = storeToRefs(authStore)

const commandOpen = ref(false)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  connectWs()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

const onKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    commandOpen.value = !commandOpen.value
  }
}

const handleLogout = () => {
  authStore.logout().then(() => {
    router.push({ name: 'auth.login' })
  })
}
</script>

<template>
  <SidebarProvider>
    <Sidebar
      variant="floating"
      collapsible="icon"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div class="flex aspect-square size-8 items-center justify-center">
                <OrbitIcon class="size-6" />
              </div>
              <div class="grid flex-1 text-left text-base leading-tight">
                <div>
                  <span class="font-normal tracking-widest text-neutral-300">Horizon</span>
                  <span class="font-bold">X</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem class="mt-4">
            <SidebarMenuButton as-child>
              <div
                class="flex h-8 items-center justify-between border"
                role="button"
                @click="commandOpen = true"
              >
                <div class="flex items-center gap-2">
                  <SearchIcon :size="16" />
                  <span class="text-neutral-400">Search&hellip;</span>
                </div>

                <div class="flex items-center justify-end gap-1">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>K</Kbd>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarMenuItem>
                <SidebarMenuButton
                  as-child
                  :is-active="route.name === 'applications'"
                >
                  <RouterLink :to="{ name: 'applications' }">
                    <LayoutGridIcon />
                    <span>Applications</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  as-child
                  :is-active="route.name === 'servers'"
                >
                  <RouterLink :to="{ name: 'servers' }">
                    <ServerIcon />
                    <span>Servers</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  as-child
                  :is-active="route.name === 'server.metrics'"
                >
                  <RouterLink :to="{ name: 'server.metrics' }">
                    <ChartColumnBigIcon />
                    <span>Server Metrics</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  as-child
                  :is-active="route.name === 'members'"
                >
                  <RouterLink :to="{ name: 'members' }">
                    <UsersIcon />
                    <span>Members</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton>
                  <User2Icon /> {{ user.name }}
                  <ChevronUpIcon class="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                class="w-(--reka-popper-anchor-width)"
              >
                <DropdownMenuItem>
                  <UserIcon />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  @click="handleLogout"
                >
                  <LogOutIcon />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4 sm:px-8">
          <SidebarTrigger class="-ml-1" />
          <span class="font-bold">{{ title }}</span>
        </div>
      </header>

      <main class="min-h-screen p-4 sm:p-8">
        <RouterView />
      </main>

      <footer>
        <div class="container mx-auto flex h-16 items-center justify-center">
          <div class="text-sm text-neutral-400">
            Copyright (c) 2025 HorizonX. All Rights Reserved.
          </div>
        </div>
      </footer>
    </SidebarInset>
  </SidebarProvider>

  <Teleport to="body">
    <CommandDialog
      v-model:open="commandOpen"
      #="{ close }"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem
            value="applications"
            as-child
          >
            <RouterLink
              :to="{ name: 'applications' }"
              @click.capture="close"
            >
              <LayoutGridIcon />
              <span>Applications</span>
            </RouterLink>
          </CommandItem>
          <CommandItem
            value="servers"
            as-child
          >
            <RouterLink
              :to="{ name: 'servers' }"
              @click.capture="close"
            >
              <ServerIcon />
              <span>Servers</span>
            </RouterLink>
          </CommandItem>
          <CommandItem
            value="server metrics"
            as-child
          >
            <RouterLink
              :to="{ name: 'server.metrics' }"
              @click.capture="close"
            >
              <ChartColumnBigIcon />
              <span>Server Metrics</span>
            </RouterLink>
          </CommandItem>
          <CommandItem
            value="members"
            as-child
          >
            <RouterLink
              :to="{ name: 'members' }"
              @click.capture="close"
            >
              <UsersIcon />
              <span>Members</span>
            </RouterLink>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem value="profile">
            <User2Icon />
            <span>Profile</span>
          </CommandItem>
          <CommandItem value="settings">
            <SettingsIcon />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  </Teleport>
</template>
