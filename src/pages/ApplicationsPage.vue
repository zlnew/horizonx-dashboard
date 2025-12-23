<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ChevronRightIcon, LayoutGridIcon, PlusIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AppStatusBadge from '@/components/AppStatusBadge.vue'
import DataLoading from '@/components/DataLoading.vue'
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
import { usePageMeta } from '@/composables/page-meta'
import useAppStore from '@/stores/app'
import useApplicationStore from '@/stores/application'

const { formatDate } = useDate()
const appStore = useAppStore()
const applicationStore = useApplicationStore()
const { applications, loading, notFound } = storeToRefs(applicationStore)

usePageMeta({
  title: 'Applications',
  breadcrumb: [
    {
      label: 'Applications',
      to: { name: 'applications' }
    }
  ]
})

onMounted(() => {
  fetchApplications()
})

onUnmounted(() => {
  applicationStore.cleanupState()
})

const fetchApplications = async () => {
  if (appStore.serverID === '') {
    return
  }

  try {
    await applicationStore.getApplications({ server_id: appStore.serverID })
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-8">
      <div class="flex items-center gap-4">
        <div class="bg-accent rounded-lg p-3">
          <LayoutGridIcon :size="24" />
        </div>
        <div class="flex flex-col gap-0">
          <div class="text-xl">Applications</div>
          <div class="text-sm text-neutral-400">Track and manage server-deployed applications.</div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button asChild>
          <RouterLink :to="{ name: 'applications.create' }">
            <PlusIcon />
            Create Application
          </RouterLink>
        </Button>
      </div>
    </div>
  </section>

  <section class="mt-8 space-y-4">
    <template v-if="applications.length">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card
          v-for="app in applications"
          :key="app.id"
          class="hover:bg-accent transition-colors"
        >
          <RouterLink :to="{ name: 'applications.overview', params: { id: app.id } }">
            <CardHeader>
              <CardTitle>{{ app.name }}</CardTitle>
              <CardDescription>
                <span>Last deployed: </span>
                <span class="text-neutral-200">
                  {{
                    app.last_deployment_at
                      ? formatDate(new Date(app.last_deployment_at), 'DD MMM, YYYY HH:mm')
                      : '-'
                  }}
                </span>
              </CardDescription>
              <CardAction>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                >
                  <ChevronRightIcon />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div class="mt-4">
                <AppStatusBadge :status="app.status" />
              </div>
            </CardContent>
          </RouterLink>
        </Card>
      </div>
    </template>

    <DataLoading v-else-if="loading" />
    <DataNotFound v-else-if="notFound" />
  </section>
</template>
