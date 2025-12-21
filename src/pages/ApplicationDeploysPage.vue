<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import DataNotFound from '@/components/DataNotFound.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePageMeta } from '@/composables/page-meta'
import useApplicationStore from '@/stores/application'

const applicationStore = useApplicationStore()

const { selectedApplication } = storeToRefs(applicationStore)

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
