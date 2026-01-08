<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDocumentVisibility, useIdle } from '@vueuse/core'
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
import type { AcceptableValue } from 'reka-ui'
import { toast } from 'vue-sonner'
import ServerApi from '@/api/Server'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
const { connect: connectWs, disconnect: disconnectWs } = useWebSocket()
const { breadcrumb, serverID } = storeToRefs(appStore)
const { user } = storeToRefs(authStore)

const servers = ref<Server[]>([])
const commandOpen = ref(false)

const menu = [
  {
    label: 'System Monitor',
    to: { name: 'system-monitor' },
    icon: ChartColumnBigIcon
  },
  {
    label: 'Applications',
    to: { name: 'applications' },
    icon: LayoutGridIcon
  }
]

const { idle } = useIdle(3 * 60 * 1000)
const visibility = useDocumentVisibility()

watchEffect(() => {
  if (idle.value || visibility.value === 'hidden') {
    disconnectWs()
  } else {
    connectWs()
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleSearchCommand)
  redirectToServerSelection()
  fetchServers()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleSearchCommand)
})

const redirectToServerSelection = () => {
  if (serverID.value === '') {
    router.replace({ name: 'servers.select' })
  }
}

const handleSearchCommand = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    commandOpen.value = !commandOpen.value
  }
}

const fetchServers = async () => {
  try {
    const res = await new ServerApi().get<ApiResponse<Server[]>>()
    servers.value = res.data ?? []
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const handleServerSelect = (serverID: AcceptableValue) => {
  appStore.serverID = serverID?.toString() ?? ''
  window.location.reload()
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
              <SidebarMenuItem
                v-for="(m, i) in menu"
                :key="i"
              >
                <SidebarMenuButton
                  as-child
                  :is-active="route.name === m.to.name"
                >
                  <RouterLink :to="m.to">
                    <component :is="m.icon" />
                    <span>{{ m.label }}</span>
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
                <DropdownMenuItem as-child>
                  <RouterLink :to="{ name: 'servers' }">
                    <ServerIcon />
                    <span>Servers</span>
                  </RouterLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <RouterLink :to="{ name: 'members' }">
                    <UsersIcon />
                    <span>Members</span>
                  </RouterLink>
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
        <div class="flex w-full items-center justify-between gap-8 px-4 sm:px-8">
          <div class="flex items-center gap-2">
            <SidebarTrigger class="-ml-1" />
            <Breadcrumb class="hidden lg:block">
              <BreadcrumbList>
                <template
                  v-for="(br, index) in breadcrumb"
                  :key="index"
                >
                  <BreadcrumbItem>
                    <template v-if="index === breadcrumb.length - 1">
                      <BreadcrumbPage>{{ br.label }}</BreadcrumbPage>
                    </template>
                    <template v-else>
                      <BreadcrumbLink as-child>
                        <RouterLink :to="br.to">
                          {{ br.label }}
                        </RouterLink>
                      </BreadcrumbLink>
                    </template>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator v-if="index < breadcrumb.length - 1" />
                </template>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div>
            <Select
              v-model="serverID"
              @update:model-value="handleServerSelect"
            >
              <SelectTrigger>
                <ServerIcon class="text-neutral-400" />
                <SelectValue placeholder="Choose a server" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="(srv, index) in servers"
                    :key="index"
                    :value="srv.id"
                  >
                    {{ srv.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
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
            value="system monitor"
            as-child
          >
            <RouterLink
              :to="{ name: 'system-monitor' }"
              @click.capture="close"
            >
              <ChartColumnBigIcon />
              <span>System Monitor</span>
            </RouterLink>
          </CommandItem>
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
