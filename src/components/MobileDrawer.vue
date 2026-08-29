<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { SettingsIcon } from 'lucide-vue-next'
import ServerSelector from '@/components/ServerSelector.vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import useApp from '@/composables/app'

const route = useRoute()
const { menu } = useApp()

const overviewMenu = computed(() => {
  return menu.find((m) => m.value === 'mobile_overview')
})

const settingsMenu = computed(() => {
  return menu.find((m) => m.value === 'settings')
})

const alertsMenu = computed(() => {
  return menu.find((m) => m.value === 'alerts')
})

const isActive = (to: { name?: string; path?: string }): boolean => {
  if (to.name && route.name === to.name) return true
  if (to.path && route.path.startsWith(to.path)) return true
  return false
}
</script>

<template>
  <div
    class="border-border/50 bg-background/60 fixed bottom-0 z-50 w-full border-t backdrop-blur-md sm:hidden"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <div class="grid h-16 grid-cols-4 items-center justify-evenly gap-1 px-2">
      <template
        v-for="m in overviewMenu?.items"
        :key="m.value"
      >
        <Button
          variant="ghost"
          as-child
          class="h-auto"
        >
          <RouterLink :to="m.to">
            <div
              class="flex flex-col items-center gap-1 transition-colors"
              :class="isActive(m.to) ? 'text-primary' : ''"
            >
              <component
                :is="m.icon"
                v-if="m.icon"
                :size="18"
              />
              <div
                class="text-[9px] font-black tracking-widest uppercase"
                :class="isActive(m.to) ? 'opacity-100' : 'opacity-60'"
              >
                {{ m.label }}
              </div>
            </div>
          </RouterLink>
        </Button>
      </template>
      <Popover #="{ close }">
        <PopoverTrigger as-child>
          <Button
            variant="ghost"
            class="h-auto"
          >
            <div class="flex flex-col items-center gap-1">
              <SettingsIcon :size="18" />
              <div class="text-[9px] font-black tracking-widest uppercase opacity-60">Settings</div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          class="border-border/50 bg-card/80 w-full backdrop-blur-xl"
          align="end"
          :side-offset="12"
        >
          <div class="flex flex-col items-start gap-1">
            <template
              v-for="m in alertsMenu?.items"
              :key="m.value"
            >
              <Button
                variant="ghost"
                as-child
                class="w-full justify-start px-0!"
                @click.capture="close"
              >
                <RouterLink :to="m.to">
                  <component
                    :is="m.icon"
                    v-if="m.icon"
                    :size="16"
                  />
                  <span class="text-xs font-bold tracking-tight uppercase">{{ m.label }}</span>
                </RouterLink>
              </Button>
              <Separator class="bg-border/50" />
            </template>
            <template
              v-for="m in settingsMenu?.items"
              :key="m.value"
            >
              <Button
                variant="ghost"
                as-child
                class="w-full justify-start px-0!"
                @click.capture="close"
              >
                <RouterLink :to="m.to">
                  <component
                    :is="m.icon"
                    v-if="m.icon"
                    :size="16"
                  />
                  <span class="text-xs font-bold tracking-tight uppercase">{{ m.label }}</span>
                </RouterLink>
              </Button>
              <Separator class="bg-border/50" />
            </template>
            <div class="mt-4 flex w-full flex-col gap-2">
              <div
                class="text-muted-foreground/60 text-[10px] font-black tracking-widest uppercase"
              >
                Current Server
              </div>
              <ServerSelector class="w-full" />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>
