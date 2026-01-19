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
    <DropdownMenuTrigger asChild>
      <SidebarMenuButton
        size="lg"
        class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <Avatar class="h-8 w-8 rounded">
          <AvatarFallback class="rounded">{{ user.name.slice(0, 2) }}</AvatarFallback>
        </Avatar>
        <div class="hidden flex-1 text-left text-sm leading-tight lg:grid">
          <span class="truncate font-medium">{{ user.name }}</span>
          <span class="truncate text-xs">{{ user.email }}</span>
        </div>
        <ChevronDownIcon class="ml-auto size-4" />
      </SidebarMenuButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded"
      side="bottom"
      align="end"
      :sideOffset="4"
    >
      <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar class="h-8 w-8 rounded">
            <AvatarFallback class="rounded">{{ user.name.slice(0, 2) }}</AvatarFallback>
          </Avatar>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-medium">{{ user.name }}</span>
            <span class="truncate text-xs">{{ user.email }}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <RouterLink :to="{ name: 'account' }">
            <UserCircleIcon />
            Account
          </RouterLink>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="isDark = !isDark">
        <SunIcon v-if="isDark" />
        <MoonIcon v-else />
        <span>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        @click="handleLogout"
      >
        <LogOutIcon />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
