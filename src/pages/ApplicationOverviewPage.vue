<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { EditIcon, ExternalLinkIcon, FolderIcon, PackageIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
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
  canReadApp,
  canWriteApp,
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
  if (!canReadApp.value) {
    return
  }

  dLoading.value = true
  dNotFound.value = false

  try {
    const res = await applicationDeploymentStore.getRecentDeployments(appID.value)
    recentDeployments.value = res ?? []

    if (!recentDeployments.value.length) {
      dNotFound.value = true
    }
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    dLoading.value = false
  }
}

const showUpdateDialog = () => {
  dialog.open(
    defineAsyncComponent(() => import('@/components/dialogs/ApplicationUpdateDialog.vue'))
  )
}
</script>

<template>
  <div class="space-y-12">
    <!-- Basic Information Grid -->
    <section>
      <Card class="border-border/50 bg-card/30 backdrop-blur-md">
        <CardHeader class="border-border/50 flex-row items-center justify-between border-b pb-6">
          <div class="flex items-center gap-4">
            <div class="bg-accent/50 rounded-xl p-2.5">
              <FolderIcon
                :size="20"
                class="text-primary"
              />
            </div>
            <div>
              <CardTitle class="text-xl font-black tracking-tight uppercase"
                >Project Metadata</CardTitle
              >
              <CardDescription class="text-xs font-medium tracking-widest uppercase opacity-60"
                >Technical source and instance details</CardDescription
              >
            </div>
          </div>
          <CardAction>
            <Button
              v-if="canWriteApp"
              type="button"
              variant="outline"
              size="sm"
              class="rounded-full text-xs font-bold tracking-tight uppercase"
              :disabled="!canUpdateApp"
              @click="showUpdateDialog"
            >
              <EditIcon class="mr-2 size-3.5" />
              Edit Details
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent class="pt-8">
          <template v-if="application">
            <div class="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
              <div class="border-accent flex flex-col gap-1.5 border-l-2 pl-4">
                <span
                  class="text-muted-foreground/60 text-xs leading-none font-black tracking-widest uppercase"
                  >Application Name</span
                >
                <span class="text-sm leading-none font-bold tracking-tight uppercase">{{
                  application.name
                }}</span>
              </div>

              <div class="border-accent flex flex-col gap-1.5 border-l-2 pl-4">
                <span
                  class="text-muted-foreground/60 text-xs leading-none font-black tracking-widest uppercase"
                  >Repository Node</span
                >
                <span
                  class="font-mono text-sm leading-none font-medium tracking-tighter uppercase opacity-80"
                  >{{ application.repo_name }}</span
                >
              </div>

              <div class="border-accent flex flex-col gap-1.5 border-l-2 pl-4">
                <span
                  class="text-muted-foreground/60 text-xs leading-none font-black tracking-widest uppercase"
                  >Branch Strategy</span
                >
                <div class="flex items-center gap-2 leading-none">
                  <div class="bg-primary/40 size-1.5 rounded-full"></div>
                  <span class="text-sm font-bold tracking-tight uppercase">{{
                    application.branch
                  }}</span>
                </div>
              </div>

              <div
                class="border-accent flex flex-col gap-1.5 border-l-2 pl-4 md:col-span-2 lg:col-span-1"
              >
                <span
                  class="text-muted-foreground/60 text-xs leading-none font-black tracking-widest uppercase"
                  >Upstream Source</span
                >
                <div class="group flex cursor-pointer items-center gap-2 leading-none">
                  <span
                    class="truncate font-mono text-xs font-medium opacity-60 transition-opacity group-hover:opacity-100"
                    >{{ application.repo_url }}</span
                  >
                </div>
              </div>

              <div
                v-if="application.site_url"
                class="border-accent flex flex-col gap-1.5 border-l-2 pl-4 md:col-span-2"
              >
                <span
                  class="text-muted-foreground/60 text-xs leading-none font-black tracking-widest uppercase"
                  >Live Endpoint</span
                >
                <a
                  :href="application.site_url"
                  target="_blank"
                  rel="noreferrer"
                  class="text-primary hover:text-primary/80 flex items-center gap-2 leading-none transition-colors"
                >
                  <ExternalLinkIcon class="size-3.5" />
                  <span class="text-sm font-bold tracking-tight underline underline-offset-4">{{
                    application.site_url
                  }}</span>
                </a>
              </div>

              <div class="border-accent flex flex-col gap-1.5 border-l-2 pl-4">
                <span
                  class="text-muted-foreground/60 text-xs leading-none font-black tracking-widest uppercase"
                  >Creation Date</span
                >
                <span class="text-sm leading-none font-medium tracking-tight opacity-60">
                  {{ formatDate(new Date(application.created_at), 'DD MMM, YYYY HH:mm') }}
                </span>
              </div>

              <div class="border-accent flex flex-col gap-1.5 border-l-2 pl-4">
                <span
                  class="text-muted-foreground/60 text-xs leading-none font-black tracking-widest uppercase"
                  >Last Synchronization</span
                >
                <span class="text-sm leading-none font-medium tracking-tight opacity-60">
                  {{
                    application.last_deployment_at
                      ? formatDate(new Date(application.last_deployment_at), 'DD MMM, YYYY HH:mm')
                      : 'NEVER_DEPLOYED'
                  }}
                </span>
              </div>
            </div>
          </template>
          <DataLoading v-else-if="loading" />
          <DataNotFound v-else />
        </CardContent>
      </Card>
    </section>

    <!-- Recent Deploys Section -->
    <section>
      <Card class="border-border/50 bg-card/20 backdrop-blur-sm">
        <CardHeader class="flex-row items-center justify-between pb-4">
          <div class="flex items-center gap-4">
            <div class="bg-primary/10 rounded-xl p-2.5">
              <PackageIcon
                :size="20"
                class="text-primary"
              />
            </div>
            <div>
              <CardTitle class="text-xl font-black tracking-tight uppercase"
                >Recent Activity</CardTitle
              >
              <CardDescription class="text-xs font-medium tracking-widest uppercase opacity-60"
                >Latest deployment lifecycle events</CardDescription
              >
            </div>
          </div>
          <CardAction v-if="canReadApp">
            <Button
              variant="link"
              class="decoration-primary/40 h-auto p-0 text-sm font-black tracking-widest uppercase underline-offset-8 opacity-60 hover:opacity-100"
            >
              <RouterLink :to="{ name: 'applications.deploys', params: { id: appID } }">
                Full Log Center
              </RouterLink>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent class="px-0 pt-4">
          <div
            v-if="recentDeployments.length"
            class="divide-border/20 divide-y"
          >
            <template
              v-for="(deploy, index) in recentDeployments"
              :key="index"
            >
              <div class="group transition-colors hover:bg-white/5">
                <DeploymentItem
                  :data="deploy"
                  class="px-8 py-5"
                />
              </div>
            </template>
          </div>
          <DataLoading v-else-if="dLoading" />
          <DataNotFound v-else-if="dNotFound" />
        </CardContent>
      </Card>
    </section>
  </div>
</template>
