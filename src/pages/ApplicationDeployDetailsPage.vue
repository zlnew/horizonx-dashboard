<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useClipboard } from '@vueuse/core'
import { CheckIcon, ClipboardIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AppDeployBadge from '@/components/AppDeployBadge.vue'
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

const { selectedApplication: application, appID } = storeToRefs(applicationStore)
const { selectedDeployment: deployment, deploymentID } = storeToRefs(applicationDeploymentStore)
const logsContainer = ref<HTMLElement | null>(null)
const loading = ref(false)

let deploymentSub: { unsubscribe: () => void }

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

const { copy: copyBuildLogs, copied: copiedBuildLogs } = useClipboard()

watch(copiedBuildLogs, (copied) => {
  if (copied) {
    toast.success('Copied build logs')
  }
})

watch(
  () => deployment.value?.status,
  (status) => {
    const validStatus = [DeploymentStatus.SUCCESS, DeploymentStatus.FAILED]
    if (validStatus.includes(status ?? '')) {
      deploymentSub?.unsubscribe()
    }
  }
)

watch(
  () => deployment.value?.build_logs,
  async () => {
    await nextTick()
    if (!logsContainer.value) return

    logsContainer.value.scrollTop = logsContainer.value.scrollHeight
  }
)

onMounted(() => {
  fetchDeployment()
})

onUnmounted(() => {
  deploymentSub?.unsubscribe()
  applicationDeploymentStore.selectedDeployment = null
})

const fetchDeployment = async () => {
  loading.value = true

  try {
    const res = await applicationDeploymentStore.showDeployment(appID.value, deploymentID.value)
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

    if (msg.event === WSEvent.DEPLOYMENT_LOGS_UPDATED) {
      const payload = msg.payload as EventDeploymentLogsUpdated
      deployment.value.build_logs += payload.logs
      return
    }

    if (msg.event === WSEvent.DEPLOYMENT_COMMIT_INFO_RECEIVED) {
      const payload = msg.payload as EventDeploymentCommitInfoReceived
      deployment.value.commit_hash = payload.commit_hash
      deployment.value.commit_message = payload.commit_message
      return
    }
  })
}
</script>

<template>
  <template v-if="application && deployment">
    <section class="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Deployment Details</CardTitle>
          <CardDescription>
            <div class="flex items-center gap-2 text-neutral-400">
              <span>
                {{ formatDate(new Date(deployment.triggered_at), 'DD MMM, YYYY HH:mm') }}
              </span>
              &middot;
              <span>by {{ deployment.deployer?.name ?? '-' }}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <div class="flex flex-col gap-1">
              <div class="font-mono text-sm font-bold">
                {{ deployment.branch }}@{{ deployment.commit_hash ?? '-' }}
              </div>
              <div class="text-sm text-neutral-400">
                {{ deployment.commit_message ?? 'No deployment message' }}
              </div>
            </div>

            <div class="flex items-center gap-2">
              <AppDeployBadge :status="deployment.status" />
              <div
                v-if="
                  deployment.started_at &&
                  deployment.finished_at &&
                  deployment.status === DeploymentStatus.SUCCESS
                "
                class="text-sm text-neutral-400"
              >
                (Deployed in
                {{
                  formatDuration(new Date(deployment.started_at), new Date(deployment.finished_at))
                }})
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <section class="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Build Logs</CardTitle>
          <CardDescription>
            Detailed logs generated during the build and deployment process.
          </CardDescription>
          <CardAction>
            <Button
              variant="secondary"
              size="icon-lg"
              @click="copyBuildLogs"
            >
              <CheckIcon v-if="copiedBuildLogs" />
              <ClipboardIcon v-else />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div
            ref="logsContainer"
            class="bg-background h-84 overflow-auto rounded-lg p-4 font-mono text-xs"
          >
            <pre>{{ deployment.build_logs || 'Waiting for build logs…' }}</pre>
          </div>
        </CardContent>
      </Card>
    </section>
  </template>
</template>
