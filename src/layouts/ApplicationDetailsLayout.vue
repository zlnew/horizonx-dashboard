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
  RefreshCcwIcon,
  TerminalSquareIcon
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

const { subscribe, connected } = useWebSocket()
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
    label: 'Logs',
    to: { name: 'applications.logs', params: { id: appID.value } },
    icon: TerminalSquareIcon
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
  <div class="grid grid-cols-1 gap-8 xl:grid-cols-4 xl:gap-12">
    <!-- Sidebar Navigation -->
    <div class="flex w-full flex-col gap-8 xl:gap-8">
      <div class="bg-accent/30 border-border/50 rounded-2xl border p-2 backdrop-blur-md xl:p-4">
        <nav class="flex flex-row gap-1 overflow-x-auto xl:flex-col">
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
                class="group relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-3 transition-all duration-300 xl:w-full xl:gap-3 xl:px-4"
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
                  class="absolute -left-1 hidden h-6 w-1 rounded-full bg-white shadow-[0_0_8px_#fff] xl:block"
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
          <div
            class="size-2 rounded-full transition-colors"
            :class="connected ? 'bg-primary animate-pulse' : 'bg-destructive'"
          ></div>
          <span class="font-mono text-xs font-medium tracking-tighter">
            {{ connected ? 'LIVE' : 'OFFLINE' }}
          </span>
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

            <CardHeader
              class="flex flex-col items-start justify-between gap-6 pb-2 sm:flex-row sm:items-center"
            >
              <div class="flex min-w-0 items-center gap-4 sm:gap-6">
                <!-- App Icon/Box -->
                <div
                  class="bg-primary/10 border-primary/20 rounded-2xl border p-3 shadow-inner sm:p-4"
                >
                  <GaugeIcon
                    :size="28"
                    class="text-primary sm:size-8"
                  />
                </div>
                <!-- Title Group -->
                <div class="border-border/50 flex min-w-0 flex-col gap-1 border-l pl-4 sm:pl-6">
                  <h1 class="text-2xl leading-none font-black tracking-tight uppercase sm:text-3xl">
                    {{ application.name }}
                  </h1>
                  <div class="flex min-w-0 items-center gap-3">
                    <AppStatusBadge
                      :status="application.status"
                      class="px-2.5 py-0.5 text-xs font-black tracking-wider uppercase"
                    />
                    <span class="text-muted-foreground/40 font-light italic">/</span>
                    <span
                      class="text-muted-foreground group-hover:text-foreground truncate font-mono text-sm font-medium tracking-widest uppercase opacity-70 transition-colors"
                    >
                      {{ application.repo_name }}
                    </span>
                  </div>
                </div>
              </div>

              <CardAction class="w-full shrink-0 sm:w-auto">
                <div
                  v-if="canReadApp || canWriteApp"
                  class="flex flex-wrap items-center gap-3"
                >
                  <div
                    v-if="canReadApp && application.site_url"
                    class="flex-1 sm:flex-none"
                  >
                    <Button
                      as-child
                      variant="outline"
                      class="hover:bg-primary hover:text-primary-foreground dark:hover:text-primary hover:border-primary w-full rounded-full px-6 transition-all active:scale-95 sm:w-auto"
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

                  <DropdownMenu
                    v-if="canWriteApp"
                    class="flex-1 sm:flex-none"
                  >
                    <DropdownMenuTrigger as-child>
                      <Button
                        class="shadow-primary/20 w-full rounded-full shadow-lg transition-all active:scale-95 sm:w-auto"
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
                        <span>Start</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        :disabled="!canStopApp"
                        class="text-destructive focus:text-destructive gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-tight uppercase"
                        @click="showStopConfirmation"
                      >
                        <BanIcon class="size-4" />
                        <span>Stop</span>
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
