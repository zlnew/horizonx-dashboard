<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { PackagePlusIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import DeploymentItem from '@/components/DeploymentItem.vue'
import RoutePagination from '@/components/RoutePagination.vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ItemGroup, ItemSeparator } from '@/components/ui/item'
import { dialog } from '@/composables/dialog'
import { usePageMeta } from '@/composables/page-meta'
import useWebSocket from '@/composables/web-socket'
import WSEvent from '@/constants/ws-event'
import useApplicationStore from '@/stores/application'
import useApplicationDeploymentStore from '@/stores/application-deployment'

type Criteria = DeploymentCriteria

const route = useRoute()
const { subscribe } = useWebSocket()
const applicationStore = useApplicationStore()
const applicationDeploymentStore = useApplicationDeploymentStore()

const { selectedApplication, appID, canReadApp, canWriteApp, canDeployApp } =
  storeToRefs(applicationStore)
const { deployments, meta, loading, notFound } = storeToRefs(applicationDeploymentStore)

let deploymentSub: WSSubscribtion | null = null

const pageTitle = computed(() => `${selectedApplication.value?.name} · Deploys`)
const criteria = computed(() => route.query as Criteria)

usePageMeta({
  title: pageTitle,
  breadcrumb: computed(() => [
    {
      label: 'Applications',
      to: { name: 'applications' }
    },
    {
      label: pageTitle.value,
      to: {
        name: 'applications.deploys',
        params: { id: String(selectedApplication.value?.id) }
      }
    }
  ])
})

onMounted(() => {
  fetchDeployments(criteria.value)
})

onBeforeRouteUpdate((to) => {
  const criteria = to.query as Criteria
  fetchDeployments(criteria)
})

onUnmounted(() => {
  deploymentSub?.unsubscribe()
})

const fetchDeployments = async (criteria: Criteria) => {
  if (!canReadApp.value) {
    return
  }

  try {
    await applicationDeploymentStore.getDeployments(appID.value, {
      ...criteria,
      paginate: true,
      limit: 5
    })
    listenDeploymentEvents()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const listenDeploymentEvents = () => {
  deploymentSub = subscribe('deployments', (msg) => {
    if (msg.event === WSEvent.DEPLOYMENT_CREATED) {
      fetchDeployments(criteria.value)
      return
    }

    if (msg.event === WSEvent.DEPLOYMENT_FINISHED) {
      fetchDeployments(criteria.value)
      return
    }

    if (msg.event === WSEvent.DEPLOYMENT_STATUS_CHANGED) {
      const payload = msg.payload as EventDeploymentStatusChanged
      const idx = deployments.value.findIndex((j) => j.id === payload.deployment_id)
      if (idx != -1 && deployments.value[idx]) {
        deployments.value[idx].status = payload.status
      }
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
</script>

<template>
  <section class="mt-8">
    <Card>
      <CardHeader>
        <CardTitle>Deploys</CardTitle>
        <CardDescription>
          Manage deployments and view deployment history for this application.
        </CardDescription>
        <CardAction v-if="canWriteApp">
          <Button
            type="button"
            :disabled="!canDeployApp"
            @click="showDeployConfirmation"
          >
            <PackagePlusIcon />
            New Deploy
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div v-if="deployments.length">
          <ItemGroup>
            <template
              v-for="(deploy, index) in deployments"
              :key="index"
            >
              <DeploymentItem :data="deploy" />
              <ItemSeparator v-if="index !== deployments.length - 1" />
            </template>
          </ItemGroup>
        </div>
        <DataLoading v-else-if="loading" />
        <DataNotFound v-else-if="notFound" />
      </CardContent>
      <CardFooter>
        <RoutePagination
          v-if="meta"
          :meta="meta"
        />
      </CardFooter>
    </Card>
  </section>
</template>
