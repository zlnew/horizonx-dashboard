<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { CheckIcon, ServerIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import useAppStore from '@/stores/app'

const appStore = useAppStore()
const { serverID, servers } = storeToRefs(appStore)

const currentServer = computed(() => servers.value.find((s) => s.id === serverID.value))

const handleServerSelect = (id: string) => {
  if (id === serverID.value) return
  appStore.serverID = id
  window.location.reload()
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        class="border-border/50 bg-accent/30 hover:bg-accent/50 flex items-center gap-2 border px-3 font-black tracking-tight uppercase"
      >
        <ServerIcon
          :size="16"
          class="text-primary"
        />
        <span class="line-clamp-1 max-w-[120px]">{{ currentServer?.name || 'Select Server' }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent
      class="border-border/50 bg-card/80 w-72 p-2 backdrop-blur-xl"
      align="start"
      :side-offset="8"
    >
      <div class="mb-2 px-2 pt-2">
        <div class="text-muted-foreground/60 text-[10px] font-black tracking-widest uppercase">
          Available Fleet
        </div>
      </div>
      <div class="space-y-1">
        <div
          v-for="srv in servers"
          :key="srv.id"
          role="button"
          class="hover:bg-accent/50 group relative flex cursor-pointer flex-col gap-1 rounded-lg border border-transparent p-3 transition-all"
          :class="{ 'border-primary/20 bg-primary/5': srv.id === serverID }"
          @click="handleServerSelect(srv.id)"
        >
          <div class="flex items-center justify-between">
            <span class="font-black tracking-tight uppercase">{{ srv.name }}</span>
            <div class="flex items-center gap-2">
              <div class="relative flex h-2 w-2">
                <span
                  v-if="srv.is_online"
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"
                ></span>
                <span
                  class="relative inline-flex h-2 w-2 rounded-full"
                  :class="srv.is_online ? 'bg-green-500' : 'bg-muted-foreground/30'"
                ></span>
              </div>
              <CheckIcon
                v-if="srv.id === serverID"
                :size="14"
                class="text-primary"
              />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <code class="text-muted-foreground/40 font-mono text-[10px]">{{ srv.ip_address }}</code>
            <span class="text-[9px] font-bold tracking-widest uppercase opacity-30">
              {{ srv.is_online ? 'Operational' : 'Disconnected' }}
            </span>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
