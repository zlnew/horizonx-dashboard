<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { PackagePlusIcon } from 'lucide-vue-next'
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
import { dialog } from '@/composables/dialog'
import { usePageMeta } from '@/composables/page-meta'
import useApplicationStore from '@/stores/application'
import useApplicationDeploymentStore from '@/stores/application-deployment'

const applicationStore = useApplicationStore()
const applicationDeploymentStore = useApplicationDeploymentStore()

const { selectedApplication } = storeToRefs(applicationStore)
const { deployments, loading, notFound } = storeToRefs(applicationDeploymentStore)

const pageTitle = computed(() => `${selectedApplication.value?.name} · Deploys`)

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

const showDeployConfirmation = () => {
  dialog.open(
    defineAsyncComponent(
      () => import('@/components/dialogs/ApplicationDeployConfirmationDialog.vue')
    )
  )
}
</script>

<template>
  <section>
    <Card>
      <CardHeader>
        <CardTitle>Deploys</CardTitle>
        <CardDescription>
          Manage deployments and view deployment history for this application.
        </CardDescription>
        <CardAction>
          <Button
            type="button"
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
    </Card>
  </section>
</template>
