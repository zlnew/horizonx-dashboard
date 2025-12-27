<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  BanIcon,
  BoltIcon,
  ChevronDownIcon,
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
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Item, ItemContent, ItemGroup, ItemSeparator, ItemTitle } from '@/components/ui/item'
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
  canDeployApp,
  canStartApp,
  canStopApp,
  canRestartApp
} = storeToRefs(applicationStore)

let applicationSub: { unsubscribe: () => void }

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
  <div class="grid grid-cols-1 gap-8 xl:grid-cols-4">
    <div class="flex w-full max-w-md flex-col gap-6">
      <ItemGroup>
        <template
          v-for="(m, index) in menu"
          :key="index"
        >
          <RouterLink
            :to="m.to"
            #="{ isExactActive }"
          >
            <Item class="group px-0">
              <ItemContent>
                <ItemTitle
                  :class="isExactActive ? 'font-bold' : 'text-neutral-400'"
                  class="group-hover:text-foreground transition-colors"
                >
                  <component
                    v-if="m.icon"
                    :is="m.icon"
                    :size="16"
                  />
                  {{ m.label }}
                </ItemTitle>
              </ItemContent>
            </Item>
            <ItemSeparator v-if="index !== menu.length - 1" />
          </RouterLink>
        </template>
      </ItemGroup>
    </div>

    <template v-if="application">
      <div class="xl:col-span-3">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>{{ application.name }}</CardTitle>
              <CardAction>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="outline">
                      <span>Action</span>
                      <ChevronDownIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      :disabled="!canDeployApp"
                      @click="showDeployConfirmation"
                    >
                      <PackagePlusIcon />
                      <span>New Deploy</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      :disabled="!canRestartApp"
                      @click="showRestartConfirmation"
                    >
                      <RefreshCcwIcon />
                      <span>Restart</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      :disabled="!canStartApp"
                      @click="showStartConfirmation"
                    >
                      <PlayIcon />
                      <span>Start</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      :disabled="!canStopApp"
                      @click="showStopConfirmation"
                    >
                      <BanIcon />
                      <span>Stop</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div class="text-muted-foreground flex items-center gap-2 text-sm">
                <AppStatusBadge :status="application.status" />
                <span>&middot;</span>
                <span>{{ application.repo_url }}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <RouterView />
      </div>
    </template>

    <DataLoading v-else-if="loading" />
    <DataNotFound v-else />
  </div>
</template>
