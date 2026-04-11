<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useClipboard } from '@vueuse/core'
import { CheckIcon, ClipboardIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AppDeployBadge from '@/components/AppDeployBadge.vue'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import LogResult from '@/components/LogResult.vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useDate } from '@/composables/date'
import { defineBreadcrumbs, usePageMeta } from '@/composables/page-meta'
import useWebSocket from '@/composables/web-socket'
import DeploymentStatus from '@/constants/deployment-status'
import WSEvent from '@/constants/ws-event'
import useApplicationStore from '@/stores/application'
import useApplicationDeploymentStore from '@/stores/application-deployment'

const { subscribe } = useWebSocket()
const { formatDate, formatDuration } = useDate()
const applicationStore = useApplicationStore()
const applicationDeploymentStore = useApplicationDeploymentStore()

const { selectedApplication: application, appID, canReadApp } = storeToRefs(applicationStore)
const { selectedDeployment: deployment, deploymentID } = storeToRefs(applicationDeploymentStore)
const loading = ref(false)

let deploymentSub: WSSubscribtion | null = null
let logSub: WSSubscribtion | null = null

usePageMeta({
  title: 'Details',
  breadcrumb: computed(() =>
    defineBreadcrumbs([
      {
        label: 'Applications',
        to: { name: 'applications' }
      },
      {
        label: `${application.value?.name} · Deploys`,
        to: {
          name: 'applications.deploys',
          params: { id: appID.value.toString() }
        }
      },
      {
        label: 'Details',
        to: {
          name: 'applications.deploys.show',
          params: { id: appID.value.toString(), deploymentID: deploymentID.value.toString() }
        }
      }
    ])
  )
})

const { copy: copyLogs, copied: copiedLogs } = useClipboard()

watch(copiedLogs, (copied) => {
  if (copied) {
    toast.success('Logs copied!')
  }
})

onMounted(() => {
  fetchDeployment(deploymentID.value)
})

onBeforeRouteUpdate((to) => {
  const deploymentID = Number(to.params.deploymentID)
  fetchDeployment(deploymentID)
})

onUnmounted(() => {
  deploymentSub?.unsubscribe()
  logSub?.unsubscribe()
  applicationDeploymentStore.selectedDeployment = null
})

const fetchDeployment = async (deploymentID: number) => {
  if (!canReadApp.value) {
    return
  }

  loading.value = true

  try {
    const res = await applicationDeploymentStore.showDeployment(appID.value, deploymentID)
    deployment.value = res ?? null
    listenDeploymentEvents()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    loading.value = false
  }
}

const listenDeploymentEvents = () => {
  const validStatus = [DeploymentStatus.PENDING, DeploymentStatus.DEPLOYING]
  if (!deployment.value?.id || !validStatus.includes(deployment.value.status)) {
    return
  }

  deploymentSub = subscribe(`deployment:${deployment.value.id}`, (msg) => {
    if (!deployment.value) {
      return
    }

    if (msg.event === WSEvent.DEPLOYMENT_STATUS_CHANGED) {
      const payload = msg.payload as EventDeploymentStatusChanged
      deployment.value.status = payload.status
      return
    }

    if (msg.event === WSEvent.DEPLOYMENT_COMMIT_INFO_RECEIVED) {
      const payload = msg.payload as EventDeploymentCommitInfoReceived
      deployment.value.commit_hash = payload.commit_hash
      deployment.value.commit_message = payload.commit_message
      return
    }

    if (msg.event === WSEvent.DEPLOYMENT_FINISHED) {
      const payload = msg.payload as EventDeploymentFinished
      fetchDeployment(payload.deployment_id)

      deploymentSub?.unsubscribe()
      logSub?.unsubscribe()

      return
    }
  })

  logSub = subscribe('logs', (msg) => {
    if (!deployment.value) {
      return
    }

    if (msg.event === WSEvent.LOG_RECEIVED) {
      const payload = msg.payload as EventLogReceived
      if (payload.deployment_id === deployment.value.id) {
        if (!deployment.value.logs?.length) {
          deployment.value.logs = []
        }
        deployment.value.logs.push(payload)
      }
      return
    }
  })
}

const handleLogsCopy = (copy: (text: string) => Promise<void>) => {
  const logs = deployment.value?.logs?.map((l) => l.context?.line ?? '') ?? []
  copy(logs.join('\n'))
}
</script>

<template>
  <div
    v-if="deployment"
    class="space-y-12"
  >
    <!-- Deployment Metadata Overview -->
    <section>
      <Card class="border-border/50 bg-card/30 overflow-hidden backdrop-blur-md">
        <CardHeader class="border-border/50 flex-row items-center justify-between border-b pb-6">
          <div class="flex items-center gap-4">
            <div class="bg-primary/10 text-primary rounded-xl p-2.5">
              <ClipboardIcon :size="20" />
            </div>
            <div>
              <CardTitle class="text-xl font-black tracking-tight uppercase"
                >Deployment Summary</CardTitle
              >
              <CardDescription class="text-xs font-medium tracking-widest uppercase opacity-60">
                Triggered on
                {{ formatDate(new Date(deployment.triggered_at), 'DD MMM, YYYY HH:mm') }} by
                {{ deployment.deployer?.name ?? '-' }}
              </CardDescription>
            </div>
          </div>
          <CardAction>
            <AppDeployBadge
              :status="deployment.status"
              class="px-3 py-1 text-[10px] font-black tracking-widest uppercase"
            />
          </CardAction>
        </CardHeader>
        <CardContent class="px-8 pt-8">
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <!-- Commit Info -->
            <div class="border-accent flex flex-col gap-2 border-l-2 pl-4 md:col-span-2">
              <span
                class="text-muted-foreground/60 text-[10px] leading-none font-black tracking-widest uppercase"
                >Version Source</span
              >
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span
                    class="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] font-black tracking-tighter uppercase"
                    >{{ deployment.branch }}</span
                  >
                  <code class="font-mono text-sm font-bold opacity-80">{{
                    deployment.commit_hash ?? 'FETCHING_HASH'
                  }}</code>
                </div>
                <div class="text-foreground/80 text-sm leading-relaxed font-medium italic">
                  "{{ deployment.commit_message ?? 'Awaiting commit metadata...' }}"
                </div>
              </div>
            </div>

            <!-- Timing Info -->
            <div class="border-accent flex flex-col gap-2 border-l-2 pl-4">
              <span
                class="text-muted-foreground/60 text-[10px] leading-none font-black tracking-widest uppercase"
                >Execution Metrics</span
              >
              <div class="flex flex-col gap-1">
                <div
                  v-if="
                    deployment.started_at &&
                    deployment.finished_at &&
                    deployment.status === DeploymentStatus.SUCCESS
                  "
                  class="text-sm font-bold tracking-tight uppercase"
                >
                  Deployed in
                  {{
                    formatDuration(
                      new Date(deployment.started_at),
                      new Date(deployment.finished_at)
                    )
                  }}
                </div>
                <div
                  v-else
                  class="text-sm font-bold tracking-tight uppercase opacity-40"
                >
                  {{ deployment.status }}
                </div>
                <div
                  class="text-muted-foreground font-mono text-[10px] tracking-tighter uppercase opacity-60"
                >
                  ID: #{{ deployment.id.toString().padStart(6, '0') }}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- Build Logs Section -->
    <section>
      <Card class="border-border/50 backdrop-blur-xl">
        <CardHeader class="border-border/50 flex-row items-center justify-between border-b pb-6">
          <div class="flex items-center gap-4">
            <div class="bg-accent/50 text-muted-foreground rounded-xl p-2.5">
              <CheckIcon
                v-if="copiedLogs"
                class="text-green-500"
              />
              <ClipboardIcon v-else />
            </div>
            <div>
              <CardTitle class="text-xl font-black tracking-tight uppercase">Active Logs</CardTitle>
              <CardDescription class="text-xs font-medium tracking-widest uppercase opacity-60"
                >Real-time stream from the build container</CardDescription
              >
            </div>
          </div>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              class="rounded-full text-[10px] font-black tracking-tight uppercase active:scale-95"
              @click="handleLogsCopy(copyLogs)"
            >
              <ClipboardIcon class="mr-2 size-3.5" />
              Copy All Logs
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent class="p-0">
          <div
            class="custom-scrollbar max-h-[600px] overflow-y-auto p-6 font-mono text-xs leading-relaxed"
          >
            <LogResult :data="deployment.logs" />
          </div>
        </CardContent>
      </Card>
    </section>
  </div>

  <DataLoading v-else-if="loading" />
  <DataNotFound v-else />
</template>
