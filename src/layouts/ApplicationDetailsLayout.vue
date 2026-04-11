<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  BanIcon,
  BoltIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  FileClockIcon,
  GaugeIcon,
  LogsIcon,
  PackagePlusIcon,
  PlayIcon,
  RefreshCcwIcon
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AppStatusBadge from '@/components/AppStatusBadge.vue'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { dialog } from '@/composables/dialog'
import useWebSocket from '@/composables/web-socket'
import WSEvent from '@/constants/ws-event'
import useApplicationStore from '@/stores/application'

const { subscribe } = useWebSocket()
const applicationStore = useApplicationStore()

const {
  appID,
  selectedApplication: application,
  refetch,
  loading,
  canReadApp,
  canWriteApp,
  canDeployApp,
  canStartApp,
  canStopApp,
  canRestartApp
} = storeToRefs(applicationStore)

let applicationSub: WSSubscribtion | null = null

const menu = [
  {
    label: 'Application Overview',
    to: { name: 'applications.overview', params: { id: appID.value } },
    icon: GaugeIcon
  },
  {
    label: 'Configuration',
    to: { name: 'applications.configuration', params: { id: appID.value } },
    icon: BoltIcon
  },
  {
    label: 'Deploys',
    to: { name: 'applications.deploys', params: { id: appID.value } },
    icon: FileClockIcon
  },
  {
    label: 'Activities',
    to: { name: 'applications.activities', params: { id: appID.value } },
    icon: LogsIcon
  }
]

watch(refetch, (refetched) => {
  if (refetched) {
    fetchApplication()
  }
})

onMounted(() => {
  fetchApplication()
})

onUnmounted(() => {
  applicationSub?.unsubscribe()
  applicationStore.cleanupState()
})

const fetchApplication = async () => {
  if (!canReadApp.value) {
    return
  }

  refetch.value = false
  loading.value = true

  try {
    const res = await applicationStore.showApplication(appID.value)
    if (res) {
      application.value = res
    }
    listenApplicationEvents()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    loading.value = false
  }
}

const listenApplicationEvents = () => {
  if (!application.value?.id) {
    return
  }

  applicationSub = subscribe(`application:${application.value.id}`, (msg) => {
    if (!application.value) {
      return
    }

    if (msg.event === WSEvent.APPLICATION_STATUS_CHANGED) {
      const payload = msg.payload as EventApplicationStatusChanged
      application.value.status = payload.status
    }
  })
}

const showDeployConfirmation = () => {
  dialog.open(
    defineAsyncComponent(
      () => import('@/components/dialogs/ApplicationDeployConfirmationDialog.vue')
    )
  )
}

const showStartConfirmation = () => {
  dialog.open(
    defineAsyncComponent(
      () => import('@/components/dialogs/ApplicationStartConfirmationDialog.vue')
    )
  )
}

const showStopConfirmation = () => {
  dialog.open(
    defineAsyncComponent(() => import('@/components/dialogs/ApplicationStopConfirmationDialog.vue'))
  )
}

const showRestartConfirmation = () => {
  dialog.open(
    defineAsyncComponent(
      () => import('@/components/dialogs/ApplicationRestartConfirmationDialog.vue')
    )
  )
}
</script>

<template>
  <div class="grid grid-cols-1 gap-12 xl:grid-cols-4">
    <!-- Sidebar Navigation -->
    <div class="flex w-full flex-col gap-8">
      <div class="bg-accent/30 border-border/50 rounded-2xl border p-4 backdrop-blur-md">
        <nav class="flex flex-col gap-1">
          <template
            v-for="(m, index) in menu"
            :key="index"
          >
            <RouterLink
              v-slot="{ isExactActive, navigate }"
              :to="m.to"
              custom
            >
              <a
                href="javascript:void(0)"
                class="group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300"
                :class="[
                  isExactActive
                    ? 'bg-primary text-primary-foreground shadow-primary/20 shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/20'
                ]"
                @click="navigate"
              >
                <div
                  class="flex size-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                  :class="isExactActive ? 'bg-white/20' : 'bg-accent/50'"
                >
                  <component
                    :is="m.icon"
                    v-if="m.icon"
                    :size="18"
                  />
                </div>
                <span class="text-sm font-black tracking-tight uppercase">{{ m.label }}</span>

                <!-- Active Indicator -->
                <div
                  v-if="isExactActive"
                  class="absolute -left-1 h-6 w-1 rounded-full bg-white shadow-[0_0_8px_#fff]"
                ></div>
              </a>
            </RouterLink>
          </template>
        </nav>
      </div>

      <!-- Quick Info / Status Summary (Optional refinement point) -->
      <div class="border-primary/20 ml-4 border-l-2 px-4 py-2">
        <p class="text-muted-foreground/60 text-xs font-black tracking-widest uppercase">
          Node Status
        </p>
        <div class="mt-1 flex items-center gap-2">
          <div class="bg-primary size-2 animate-pulse rounded-full"></div>
          <span class="font-mono text-xs font-medium tracking-tighter">AGENT_READY</span>
        </div>
      </div>
    </div>

    <!-- Main Content Shell -->
    <template v-if="application">
      <div class="xl:col-span-3">
        <section class="mb-12">
          <Card class="border-border/50 bg-card/50 overflow-hidden border-2 backdrop-blur-xl">
            <div class="pointer-events-none absolute top-0 right-0 p-1 opacity-10">
              <RefreshCcwIcon
                :size="120"
                class="rotate-12"
              />
            </div>

            <CardHeader class="flex-row items-center justify-between gap-6 pb-2">
              <div class="flex items-center gap-6">
                <!-- App Icon/Box -->
                <div class="bg-primary/10 border-primary/20 rounded-2xl border p-4 shadow-inner">
                  <GaugeIcon
                    :size="32"
                    class="text-primary"
                  />
                </div>
                <!-- Title Group -->
                <div class="border-border/50 flex flex-col gap-1 border-l pl-6">
                  <h1 class="text-3xl leading-none font-black tracking-tight uppercase">
                    {{ application.name }}
                  </h1>
                  <div class="flex items-center gap-3">
                    <AppStatusBadge
                      :status="application.status"
                      class="px-2.5 py-0.5 text-xs font-black tracking-wider uppercase"
                    />
                    <span class="text-muted-foreground/40 font-light italic">/</span>
                    <span
                      class="text-muted-foreground group-hover:text-foreground font-mono text-sm font-medium tracking-widest uppercase opacity-70 transition-colors"
                    >
                      {{ application.repo_name }}
                    </span>
                  </div>
                </div>
              </div>

              <CardAction class="shrink-0">
                <div
                  v-if="canReadApp || canWriteApp"
                  class="flex items-center gap-3"
                >
                  <div v-if="canReadApp && application.site_url">
                    <Button
                      as-child
                      variant="outline"
                      class="hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-full px-6 transition-all active:scale-95"
                    >
                      <a
                        :href="application.site_url"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLinkIcon class="size-4" />
                        <span class="text-sm font-bold tracking-tight uppercase">Visit Site</span>
                      </a>
                    </Button>
                  </div>

                  <DropdownMenu v-if="canWriteApp">
                    <DropdownMenuTrigger as-child>
                      <Button
                        class="shadow-primary/20 rounded-full shadow-lg transition-all active:scale-95"
                      >
                        <span class="text-sm font-bold tracking-tight uppercase"
                          >Service Controls</span
                        >
                        <ChevronDownIcon class="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      class="bg-background/80 border-border/50 w-56 rounded-xl p-2 backdrop-blur-xl"
                    >
                      <DropdownMenuItem
                        :disabled="!canDeployApp"
                        class="gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-tight uppercase"
                        @click="showDeployConfirmation"
                      >
                        <PackagePlusIcon class="text-primary size-4" />
                        <span>Force New Deploy</span>
                      </DropdownMenuItem>
                      <div class="border-border/50 my-1 border-t opacity-20"></div>
                      <DropdownMenuItem
                        :disabled="!canRestartApp"
                        class="gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-tight uppercase"
                        @click="showRestartConfirmation"
                      >
                        <RefreshCcwIcon class="size-4" />
                        <span>Soft Restart</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        :disabled="!canStartApp"
                        class="gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-tight uppercase"
                        @click="showStartConfirmation"
                      >
                        <PlayIcon class="size-4 text-green-500" />
                        <span>Start Engine</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        :disabled="!canStopApp"
                        class="text-destructive focus:text-destructive gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-tight uppercase"
                        @click="showStopConfirmation"
                      >
                        <BanIcon class="size-4" />
                        <span>Kill Process</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardAction>
            </CardHeader>
            <!-- Progress Bar Decor -->
            <div class="bg-accent/20 h-1.5 w-full">
              <div
                class="bg-primary h-full transition-all duration-1000"
                :style="{ width: application.status === 'RUNNING' ? '100%' : '0%' }"
              ></div>
            </div>
          </Card>
        </section>

        <RouterView />
      </div>
    </template>

    <DataLoading v-else-if="loading" />
    <DataNotFound v-else />
  </div>
</template>
