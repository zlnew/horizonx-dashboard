<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { SearchIcon, SettingsIcon } from 'lucide-vue-next'
import ServerSelector from '@/components/ServerSelector.vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import useApp from '@/composables/app'
import useAppStore from '@/stores/app'

const { menu } = useApp()
const appStore = useAppStore()
const { searchOpen } = storeToRefs(appStore)

const overviewMenu = computed(() => {
  return menu.find((m) => m.value === 'overview')
})

const settingsMenu = computed(() => {
  return menu.find((m) => m.value === 'settings')
})

const openSearch = () => {
  searchOpen.value = true
}
</script>

<template>
  <div class="bg-background sticky bottom-0 h-16 w-full border-t sm:hidden">
    <div class="grid h-full w-full grid-cols-4 items-center justify-evenly gap-2 px-4">
      <template
        v-for="m in overviewMenu?.items"
        :key="m.value"
      >
        <Button
          variant="ghost"
          as-child
        >
          <RouterLink :to="m.to">
            <div class="flex flex-col items-center gap-1">
              <component
                :is="m.icon"
                v-if="m.icon"
              />
              <div class="text-muted-foreground text-[10px]">{{ m.label }}</div>
            </div>
          </RouterLink>
        </Button>
      </template>
      <Button
        variant="ghost"
        @click="openSearch"
      >
        <div class="flex flex-col items-center gap-1">
          <SearchIcon />
          <div class="text-muted-foreground text-[10px]">Search</div>
        </div>
      </Button>
      <Popover #="{ close }">
        <PopoverTrigger as-child>
          <Button variant="ghost">
            <div class="flex flex-col items-center gap-1">
              <SettingsIcon />
              <div class="text-muted-foreground text-[10px]">Settings</div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          class="w-full"
          align="end"
        >
          <div class="flex flex-col items-start gap-1">
            <template
              v-for="m in settingsMenu?.items"
              :key="m.value"
            >
              <Button
                variant="ghost"
                as-child
                class="px-0!"
                @click.capture="close"
              >
                <RouterLink :to="m.to">
                  <component
                    :is="m.icon"
                    v-if="m.icon"
                  />
                  <span>{{ m.label }}</span>
                </RouterLink>
              </Button>
              <Separator />
            </template>
            <div class="mt-4 flex flex-col gap-1">
              <div class="text-muted-foreground text-xs">Current Server:</div>
              <ServerSelector />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>
