<script setup lang="ts">
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { SearchIcon } from 'lucide-vue-next'
import AppLogo from '@/components/AppLogo.vue'
import { Kbd } from '@/components/ui/kbd'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar'
import useApp from '@/composables/app'
import useAppStore from '@/stores/app'

const route = useRoute()
const { menu } = useApp()
const appStore = useAppStore()

const { searchOpen } = storeToRefs(appStore)

const { isMobile, openMobile } = useSidebar()

const onMobileMenuClickCapture = () => {
  if (!isMobile.value) {
    return
  }

  openMobile.value = false
}
</script>

<template>
  <Sidebar
    variant="floating"
    collapsible="icon"
  >
    <SidebarHeader>
      <SidebarMenuButton size="lg">
        <AppLogo />
      </SidebarMenuButton>
      <SidebarMenuButton as-child>
        <div
          class="flex h-8 items-center justify-between border"
          role="button"
          @click="searchOpen = true"
        >
          <div class="flex items-center gap-2">
            <SearchIcon :size="16" />
            <span class="text-accent-foreground">Search&hellip;</span>
          </div>

          <div class="flex items-center justify-end gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup
        v-for="(parent, pi) in menu"
        :key="pi"
      >
        <template v-if="parent.items?.length">
          <SidebarGroupLabel>{{ parent.label }}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem
                v-for="(item, ii) in parent.items"
                :key="ii"
              >
                <SidebarMenuButton
                  asChild
                  :isActive="route.name === item.to.name"
                  @click.capture="onMobileMenuClickCapture"
                >
                  <RouterLink :to="item.to">
                    <component
                      v-if="item.icon"
                      :is="item.icon"
                    />
                    <span>{{ item.label }}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </template>
        <template v-else-if="parent.to">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                :isActive="route.name === parent.to.name"
                @click.capture="onMobileMenuClickCapture"
              >
                <RouterLink :to="parent.to">
                  <component
                    v-if="parent.icon"
                    :is="parent.icon"
                  />
                  <span>{{ parent.label }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </template>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
