<script setup lang="ts">
import { onMounted, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { EditIcon, PlusIcon, XIcon } from 'lucide-vue-next'
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
import useAppStore from '@/stores/app'
import useApplicationStore from '@/stores/application'

const appStore = useAppStore()
const applicationStore = useApplicationStore()

const { title } = storeToRefs(appStore)
const { selectedApplication } = storeToRefs(applicationStore)

watchEffect((onCleanup) => {
  title.value = `${selectedApplication.value?.name} · Configuration`

  onCleanup(() => {
    title.value = null
  })
})

onMounted(() => {})
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
            size="icon-lg"
            variant="ghost"
          >
            <EditIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div class="bg-background text-foreground h-84 overflow-auto rounded-lg p-4 text-sm">
          <pre>{{ selectedApplication?.docker_compose_raw }}</pre>
        </div>
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
                      variant="secondary"
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
        >
          Permanently delete application
        </Button>
      </CardContent>
    </Card>
  </section>
</template>
