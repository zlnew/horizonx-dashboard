<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ChevronDownIcon, LogOutIcon, MoonIcon, SunIcon, UserCircleIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import useAppStore from '@/stores/app'
import useAuthStore from '@/stores/auth'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const { isDark } = storeToRefs(appStore)
const { user } = storeToRefs(authStore)

const handleLogout = async () => {
  try {
    await authStore.logout()
    await router.push({ name: 'auth.login' })
  } catch (err) {
    const error = err as Error
    toast.error(error.message)
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <SidebarMenuButton
        size="lg"
        class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group"
      >
        <Avatar
          class="border-border/50 group-hover:border-primary/50 h-8 w-8 rounded-full border transition-colors"
        >
          <AvatarFallback class="bg-primary/10 text-[10px] font-black uppercase">
            {{ user.name.slice(0, 2) }}
          </AvatarFallback>
        </Avatar>
        <div class="hidden flex-1 text-left text-sm leading-tight lg:grid">
          <span class="truncate font-black tracking-tight uppercase">{{ user.name }}</span>
          <span
            class="text-muted-foreground/60 truncate text-[10px] font-bold tracking-widest uppercase"
          >
            {{ user.role.name }}
          </span>
        </div>
        <ChevronDownIcon class="ml-auto size-4 opacity-40" />
      </SidebarMenuButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="border-border/50 bg-card/80 w-[--reka-dropdown-menu-trigger-width] min-w-64 rounded-xl backdrop-blur-xl"
      side="bottom"
      align="end"
      :side-offset="8"
    >
      <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-3 px-3 py-3 text-left">
          <Avatar class="border-primary/10 h-10 w-10 rounded-full border-2">
            <AvatarFallback class="bg-primary/5 text-xs font-black uppercase">
              {{ user.name.slice(0, 2) }}
            </AvatarFallback>
          </Avatar>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <div class="flex items-center gap-2">
              <span class="truncate font-black tracking-tight uppercase">{{ user.name }}</span>
              <span
                class="bg-primary/10 border-primary/20 text-primary rounded-full border px-1.5 py-0.5 text-[8px] font-black tracking-widest uppercase"
              >
                {{ user.role.name }}
              </span>
            </div>
            <span
              class="text-muted-foreground/60 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase"
            >
              <span class="size-1.5 animate-pulse rounded-full bg-green-500"></span>
              Session Active
            </span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator class="bg-border/50" />
      <DropdownMenuGroup class="p-1">
        <DropdownMenuItem
          as-child
          class="rounded-lg px-3 py-2"
        >
          <RouterLink :to="{ name: 'account' }">
            <UserCircleIcon class="size-4 opacity-60" />
            <span class="text-xs font-bold tracking-wider uppercase">Account Settings</span>
          </RouterLink>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator class="bg-border/50" />
      <div class="p-1">
        <DropdownMenuItem
          class="rounded-lg px-3 py-2"
          @click="isDark = !isDark"
        >
          <SunIcon
            v-if="isDark"
            class="size-4 opacity-60"
          />
          <MoonIcon
            v-else
            class="size-4 opacity-60"
          />
          <span class="text-xs font-bold tracking-wider uppercase">{{
            isDark ? 'Switch to Light' : 'Switch to Dark'
          }}</span>
        </DropdownMenuItem>
      </div>
      <DropdownMenuSeparator class="bg-border/50" />
      <div class="p-1">
        <DropdownMenuItem
          variant="destructive"
          class="focus:bg-destructive/10 rounded-lg px-3 py-2"
          @click="handleLogout"
        >
          <LogOutIcon class="size-4" />
          <span class="text-xs font-black tracking-widest uppercase">Terminate Session</span>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
