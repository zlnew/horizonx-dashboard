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
      <SidebarMenuButton
        size="lg"
        as-child
      >
        <div
          class="border-border/50 bg-accent/30 hover:bg-accent/50 flex h-10 items-center justify-between rounded-lg border px-3 transition-colors"
          role="button"
          @click="searchOpen = true"
        >
          <div class="flex items-center gap-2">
            <SearchIcon
              :size="16"
              class="text-muted-foreground"
            />
            <span class="text-muted-foreground text-sm font-medium">Search&hellip;</span>
          </div>

          <div class="flex items-center justify-end gap-1">
            <Kbd class="px-1 py-0 text-[10px]">Ctrl</Kbd>
            <Kbd class="px-1 py-0 text-[10px]">K</Kbd>
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
                  as-child
                  :is-active="route.name === item.to.name"
                  @click.capture="onMobileMenuClickCapture"
                >
                  <RouterLink :to="item.to">
                    <component
                      :is="item.icon"
                      v-if="item.icon"
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
                as-child
                :is-active="route.name === parent.to.name"
                @click.capture="onMobileMenuClickCapture"
              >
                <RouterLink :to="parent.to">
                  <component
                    :is="parent.icon"
                    v-if="parent.icon"
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
