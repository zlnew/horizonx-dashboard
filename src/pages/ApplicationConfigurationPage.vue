<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { EditIcon, PlusIcon, XIcon } from 'lucide-vue-next'
import DataNotFound from '@/components/DataNotFound.vue'
import DockerComposeCode from '@/components/DockerComposeCode.vue'
import ApplicationCreateEnvVarDialog from '@/components/dialogs/ApplicationCreateEnvVarDialog.vue'
import ApplicationDeleteDialog from '@/components/dialogs/ApplicationDeleteDialog.vue'
import ApplicationDeleteEnvVarDialog from '@/components/dialogs/ApplicationDeleteEnvVarDialog.vue'
import ApplicationUpdateDialog from '@/components/dialogs/ApplicationUpdateDialog.vue'
import ApplicationUpdateDockerComposeDialog from '@/components/dialogs/ApplicationUpdateDockerComposeDialog.vue'
import ApplicationUpdateEnvVarDialog from '@/components/dialogs/ApplicationUpdateEnvVarDialog.vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { usePageMeta } from '@/composables/page-meta'
import useApplicationStore from '@/stores/application'

const applicationStore = useApplicationStore()

const { selectedApplication } = storeToRefs(applicationStore)

const pageTitle = computed(() => `${selectedApplication.value?.name} · Configuration`)

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
        name: 'applications.configuration',
        params: { id: String(selectedApplication.value?.id) }
      }
    }
  ])
})

onMounted(() => {})

const showUpdateDockerComposeDialog = () => {
  applicationStore.dialogUpdateDockerComposeOpen = true
}

const showDeleteDialog = () => {
  applicationStore.dialogDeleteAppOpen = true
}
</script>

<template>
  <section>
    <Card>
      <CardHeader>
        <CardTitle>Docker Compose File</CardTitle>
        <CardDescription>
          The source of truth for how this application runs in production.
        </CardDescription>
        <CardAction>
          <Button
            type="button"
            size="icon-lg"
            variant="ghost"
            @click="showUpdateDockerComposeDialog"
          >
            <EditIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <template v-if="selectedApplication?.docker_compose_raw">
          <DockerComposeCode :code="selectedApplication?.docker_compose_raw" />
        </template>
      </CardContent>
    </Card>
  </section>

  <section class="mt-8">
    <Card>
      <CardHeader>
        <CardTitle>Environment Variables</CardTitle>
        <CardDescription>
          Key–value pairs injected into the application at runtime.
        </CardDescription>
        <CardAction>
          <Button>
            <PlusIcon />
            Add variable
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <template v-if="selectedApplication?.env_vars?.length">
          <Table>
            <TableBody>
              <TableRow
                v-for="(env, index) in selectedApplication.env_vars"
                :key="index"
              >
                <TableCell class="font-bold text-neutral-400">{{ env.key }}</TableCell>
                <TableCell class="font-bold">{{ env.value }}</TableCell>
                <TableCell>
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      aria-label="Edit env var"
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="destructive"
                      aria-label="Delete env var"
                    >
                      <XIcon />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </template>
        <DataNotFound v-else />
      </CardContent>
    </Card>
  </section>

  <section class="mt-8">
    <Card>
      <CardHeader>
        <CardTitle>Danger Zone</CardTitle>
        <CardDescription>This action is permanent and cannot be undone.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="destructive"
          @click="showDeleteDialog"
        >
          Permanently delete application
        </Button>
      </CardContent>
    </Card>
  </section>

  <Teleport to="body">
    <ApplicationUpdateDialog />
    <ApplicationUpdateDockerComposeDialog />
    <ApplicationCreateEnvVarDialog />
    <ApplicationUpdateEnvVarDialog />
    <ApplicationDeleteEnvVarDialog />
    <ApplicationDeleteDialog />
  </Teleport>
</template>
