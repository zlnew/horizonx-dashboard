<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { EditIcon } from 'lucide-vue-next'
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

const { appID, selectedApplication, canUpdateApp } = storeToRefs(applicationStore)
const {
  recentDeployments,
  loading: dLoading,
  notFound: dNotFound
} = storeToRefs(applicationDeploymentStore)

const pageTitle = computed(() => `${selectedApplication.value?.name} · Overview`)

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
        params: { id: String(selectedApplication.value?.id) }
      }
    }
  ])
})

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
        <template v-if="selectedApplication">
          <ul class="space-y-4">
            <li class="grid grid-cols-4">
              <div class="text-neutral-400">Name:</div>
              <div class="col-span-3 font-bold">{{ selectedApplication.name }}</div>
            </li>
            <li class="grid grid-cols-4">
              <div class="text-neutral-400">Repository:</div>
              <div class="col-span-3 font-bold">{{ selectedApplication.repo_url }}</div>
            </li>
            <li class="grid grid-cols-4">
              <div class="text-neutral-400">Branch:</div>
              <div class="col-span-3 font-bold">{{ selectedApplication.branch }}</div>
            </li>
            <li class="grid grid-cols-4">
              <div class="text-neutral-400">Status:</div>
              <div class="col-span-3 font-bold">
                <AppStatusBadge :status="selectedApplication.status" />
              </div>
            </li>
            <li class="grid grid-cols-4">
              <div class="text-neutral-400">Last Deployed:</div>
              <div class="col-span-3 font-bold">
                {{
                  selectedApplication.last_deployment_at
                    ? formatDate(
                        new Date(selectedApplication.last_deployment_at),
                        'DD MMM, YYYY HH:MM'
                      )
                    : '-'
                }}
              </div>
            </li>
            <li class="grid grid-cols-4">
              <div class="text-neutral-400">Created:</div>
              <div class="col-span-3 font-bold">
                {{ formatDate(new Date(selectedApplication.created_at), 'DD MMM, YYYY HH:MM') }}
              </div>
            </li>
          </ul>
        </template>
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
