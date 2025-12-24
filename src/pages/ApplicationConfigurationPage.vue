<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { EditIcon, PlusIcon, Trash2Icon } from 'lucide-vue-next'
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
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { dialog } from '@/composables/dialog'
import { usePageMeta } from '@/composables/page-meta'
import useApplicationStore from '@/stores/application'
import useApplicationEnvStore from '@/stores/application-env'

const applicationStore = useApplicationStore()
const applicationEnvStore = useApplicationEnvStore()

const { selectedApplication, canDeleteApp } = storeToRefs(applicationStore)
const { selectedEnvironment } = storeToRefs(applicationEnvStore)

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

const showCreateEnvVarDialog = () => {
  dialog.open(
    defineAsyncComponent(() => import('@/components/dialogs/ApplicationCreateEnvVarDialog.vue'))
  )
}

const showUpdateEnvVarDialog = (env: EnvironmentVariable) => {
  selectedEnvironment.value = env
  dialog.open(
    defineAsyncComponent(() => import('@/components/dialogs/ApplicationUpdateEnvVarDialog.vue'))
  )
}

const showDeleteEnvVarDialog = (env: EnvironmentVariable) => {
  selectedEnvironment.value = env
  dialog.open(
    defineAsyncComponent(() => import('@/components/dialogs/ApplicationDeleteEnvVarDialog.vue'))
  )
}

const showDeleteDialog = () => {
  dialog.open(
    defineAsyncComponent(() => import('@/components/dialogs/ApplicationDeleteDialog.vue'))
  )
}
</script>

<template>
  <section class="mt-8">
    <Card>
      <CardHeader>
        <CardTitle>Environment Variables</CardTitle>
        <CardDescription>
          Key–value pairs injected into the application at runtime.
        </CardDescription>
        <CardAction>
          <Button @click="showCreateEnvVarDialog">
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
                <TableCell class="font-bold">{{ env.key }}</TableCell>
                <TableCell class="font-bold text-neutral-400">{{ env.value }}</TableCell>
                <TableCell>
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Edit env var"
                      class="text-neutral-400"
                      @click="showUpdateEnvVarDialog(env)"
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Delete env var"
                      class="text-neutral-400"
                      @click="showDeleteEnvVarDialog(env)"
                    >
                      <Trash2Icon />
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
          :disabled="!canDeleteApp"
          @click="showDeleteDialog"
        >
          Permanently delete application
        </Button>
      </CardContent>
    </Card>
  </section>
</template>
