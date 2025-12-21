<script setup lang="ts">
import { onMounted, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import DataNotFound from '@/components/DataNotFound.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useAppStore from '@/stores/app'
import useApplicationStore from '@/stores/application'

const appStore = useAppStore()
const applicationStore = useApplicationStore()

const { title, breadcrumb } = storeToRefs(appStore)
const { selectedApplication } = storeToRefs(applicationStore)

watchEffect((onCleanup) => {
  title.value = `${selectedApplication.value?.name} · Deploys`
  breadcrumb.value = [
    {
      label: 'Applications',
      to: { name: 'applications' }
    },
    {
      label: title.value,
      to: {
        name: 'applications.deploys',
        params: { id: String(selectedApplication.value?.id) }
      }
    }
  ]

  onCleanup(() => {
    title.value = null
    breadcrumb.value = []
  })
})

onMounted(() => {})
</script>

<template>
  <section>
    <Card>
      <CardHeader>
        <CardTitle>Deploys</CardTitle>
        <CardDescription>
          Manage deployments and view deployment history for this application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataNotFound />
      </CardContent>
    </Card>
  </section>
</template>
