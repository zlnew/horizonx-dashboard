<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { EditIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AppStatusBadge from '@/components/AppStatusBadge.vue'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import DeploymentItem from '@/components/DeploymentItem.vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ItemGroup, ItemSeparator } from '@/components/ui/item'
import { useDate } from '@/composables/date'
import { dialog } from '@/composables/dialog'
import { usePageMeta } from '@/composables/page-meta'
import useApplicationStore from '@/stores/application'
import useApplicationDeploymentStore from '@/stores/application-deployment'

const { formatDate } = useDate()
const applicationStore = useApplicationStore()
const applicationDeploymentStore = useApplicationDeploymentStore()

const {
  selectedApplication: application,
  loading,
  appID,
  canUpdateApp
} = storeToRefs(applicationStore)
const { loading: dLoading, notFound: dNotFound } = storeToRefs(applicationDeploymentStore)
const recentDeployments = ref<Deployment[]>([])

const pageTitle = computed(() => `${application.value?.name} · Overview`)

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
        name: 'applications.overview',
        params: { id: String(application.value?.id) }
      }
    }
  ])
})

onMounted(() => {
  fetchRecentDeployments()
})

const fetchRecentDeployments = async () => {
  try {
    const res = await applicationDeploymentStore.getRecentDeployments(appID.value)
    recentDeployments.value = res ?? []
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const showUpdateDialog = () => {
  dialog.open(
    defineAsyncComponent(() => import('@/components/dialogs/ApplicationUpdateDialog.vue'))
  )
}
</script>

<template>
  <section class="mt-8">
    <Card>
      <CardHeader>
        <CardTitle>Application Details</CardTitle>
        <CardDescription>
          Key information about the application, its source, and current state.
        </CardDescription>
        <CardAction>
          <Button
            type="button"
            size="icon-lg"
            variant="ghost"
            :disabled="!canUpdateApp"
            @click="showUpdateDialog"
          >
            <EditIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <template v-if="application">
          <ul class="space-y-4">
            <li class="grid md:grid-cols-4">
              <div class="text-sm text-neutral-400 md:text-base">Name:</div>
              <div class="text-sm font-bold md:col-span-3 md:text-base">
                {{ application.name }}
              </div>
            </li>
            <li class="grid md:grid-cols-4">
              <div class="text-sm text-neutral-400 md:text-base">Repository:</div>
              <div class="text-sm font-bold md:col-span-3 md:text-base">
                {{ application.repo_url }}
              </div>
            </li>
            <li class="grid md:grid-cols-4">
              <div class="text-sm text-neutral-400 md:text-base">Branch:</div>
              <div class="text-sm font-bold md:col-span-3 md:text-base">
                {{ application.branch }}
              </div>
            </li>
            <li class="grid md:grid-cols-4">
              <div class="text-sm text-neutral-400 md:text-base">Status:</div>
              <div class="text-sm font-bold md:col-span-3 md:text-base">
                <AppStatusBadge :status="application.status" />
              </div>
            </li>
            <li class="grid md:grid-cols-4">
              <div class="text-sm text-neutral-400 md:text-base">Last Deployed:</div>
              <div class="text-sm font-bold md:col-span-3 md:text-base">
                {{
                  application.last_deployment_at
                    ? formatDate(new Date(application.last_deployment_at), 'DD MMM, YYYY HH:MM')
                    : '-'
                }}
              </div>
            </li>
            <li class="grid md:grid-cols-4">
              <div class="text-sm text-neutral-400 md:text-base">Created:</div>
              <div class="text-sm font-bold md:col-span-3 md:text-base">
                {{ formatDate(new Date(application.created_at), 'DD MMM, YYYY HH:MM') }}
              </div>
            </li>
          </ul>
        </template>
        <DataLoading v-else-if="loading" />
        <DataNotFound v-else />
      </CardContent>
    </Card>
  </section>

  <section class="mt-8">
    <Card>
      <CardHeader>
        <CardTitle>Recent Deployments</CardTitle>
        <CardDescription>Latest deployment activity for this application.</CardDescription>
        <CardAction>
          <Button variant="link">
            <RouterLink :to="{ name: 'applications.deploys', params: { id: appID } }">
              View all deployments
            </RouterLink>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div v-if="recentDeployments.length">
          <ItemGroup>
            <template
              v-for="(deploy, index) in recentDeployments"
              :key="index"
            >
              <DeploymentItem :data="deploy" />
              <ItemSeparator v-if="index !== recentDeployments.length - 1" />
            </template>
          </ItemGroup>
        </div>
        <DataLoading v-else-if="dLoading" />
        <DataNotFound v-else-if="dNotFound" />
      </CardContent>
    </Card>
  </section>
</template>
