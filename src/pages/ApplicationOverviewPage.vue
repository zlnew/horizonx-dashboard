<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { EditIcon } from 'lucide-vue-next'
import AppStatusBadge from '@/components/AppStatusBadge.vue'
import DataNotFound from '@/components/DataNotFound.vue'
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
import { dialog } from '@/composables/dialog'
import { usePageMeta } from '@/composables/page-meta'
import useApplicationStore from '@/stores/application'

const { formatDate } = useDate()
const applicationStore = useApplicationStore()

const { selectedApplication } = storeToRefs(applicationStore)

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

onMounted(() => {})

const showUpdateDialog = () => {
  dialog.open(
    defineAsyncComponent(() => import('@/components/dialogs/ApplicationUpdateDialog.vue'))
  )
}
</script>

<template>
  <section>
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
            <RouterLink
              :to="{ name: 'applications.deploys', params: { id: selectedApplication?.id } }"
            >
              View all deployments
            </RouterLink>
          </Button>
        </CardAction>
        <CardContent>
          <DataNotFound />
        </CardContent>
      </CardHeader>
    </Card>
  </section>
</template>
