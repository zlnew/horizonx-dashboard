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
const { applications, loading, notFound, canReadApp, canWriteApp } = storeToRefs(applicationStore)

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
  if (appStore.serverID === '' || !canReadApp.value) {
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
        <div class="bg-accent/50 border-border/50 rounded-xl border p-3">
          <LayoutGridIcon
            :size="24"
            class="text-primary"
          />
        </div>
        <div class="border-border/50 flex flex-col gap-0 border-l pl-4">
          <h1 class="text-2xl font-black tracking-tight uppercase">Applications</h1>
          <p class="text-muted-foreground text-sm font-medium italic">
            Track and manage server-deployed applications.
          </p>
        </div>
      </div>

      <div
        v-if="canWriteApp"
        class="flex items-center gap-2"
      >
        <Button
          as-child
          class="shadow-primary/10 rounded-full shadow-lg transition-transform active:scale-95"
        >
          <RouterLink :to="{ name: 'applications.create' }">
            <PlusIcon />
            Create Application
          </RouterLink>
        </Button>
      </div>
    </div>
  </section>

  <section class="mt-12 space-y-4">
    <template v-if="applications.length">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <template
          v-for="app in applications"
          :key="app.id"
        >
          <RouterLink :to="{ name: 'applications.overview', params: { id: app.id } }">
            <Card
              class="hover:border-primary/30 hover:bg-accent/30 transition-all hover:-translate-y-1"
            >
              <CardHeader>
                <CardTitle class="text-lg font-bold tracking-tight">{{ app.name }}</CardTitle>
                <CardDescription>
                  <span class="text-xs font-semibold tracking-wider uppercase opacity-60"
                    >Last deployed</span
                  >
                  <p class="text-muted-foreground font-medium">
                    {{
                      app.last_deployment_at
                        ? formatDate(new Date(app.last_deployment_at), 'DD MMM, YYYY HH:mm')
                        : 'Never'
                    }}
                  </p>
                </CardDescription>
                <CardAction>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                  >
                    <ChevronRightIcon />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div class="flex flex-col gap-3">
                  <div class="flex flex-wrap items-center gap-3">
                    <AppStatusBadge
                      :status="app.status"
                      class="px-2.5 py-0.5 text-[10px] font-bold"
                    />
                    <span
                      class="text-muted-foreground bg-accent/50 rounded-md px-2 py-0.5 text-xs font-medium"
                      >{{ app.repo_name }}</span
                    >
                  </div>
                  <div
                    v-if="app.site_url"
                    class="border-border/50 mt-1 border-t pt-3"
                  >
                    <a
                      class="text-primary flex items-center gap-1.5 text-xs font-semibold underline-offset-4 hover:underline"
                      :href="app.site_url"
                      target="_blank"
                      rel="noreferrer"
                      @click.stop
                    >
                      <span class="truncate">{{ app.site_url.replace(/^https?:\/\//, '') }}</span>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RouterLink>
        </template>
      </div>
    </template>

    <DataLoading v-else-if="loading" />
    <DataNotFound v-else-if="notFound" />
  </section>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
