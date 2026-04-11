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

const { selectedApplication, canWriteApp, canDeleteApp } = storeToRefs(applicationStore)
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
  <div class="space-y-12">
    <!-- Environment Variables Section -->
    <section>
      <Card class="border-border/50 bg-card/30 overflow-hidden backdrop-blur-md">
        <CardHeader class="border-border/50 flex-row items-center justify-between border-b pb-6">
          <div class="flex items-center gap-4">
            <div class="bg-primary/10 text-primary rounded-xl p-2.5">
              <PlusIcon :size="20" />
            </div>
            <div>
              <CardTitle class="text-xl font-black tracking-tight uppercase"
                >Environment Config</CardTitle
              >
              <CardDescription class="text-xs font-medium tracking-widest uppercase opacity-60"
                >Runtime variables injected into the process</CardDescription
              >
            </div>
          </div>
          <CardAction v-if="canWriteApp">
            <Button
              size="sm"
              class="shadow-primary/20 rounded-full text-[10px] font-black tracking-tight uppercase shadow-lg transition-all active:scale-95"
              @click="showCreateEnvVarDialog"
            >
              <PlusIcon class="mr-2 size-3.5" />
              Add Variable
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent class="p-0">
          <template v-if="selectedApplication?.env_vars?.length">
            <Table>
              <TableBody>
                <TableRow
                  v-for="(env, index) in selectedApplication.env_vars"
                  :key="index"
                  class="group border-border/40 transition-colors hover:bg-white/5"
                >
                  <TableCell class="py-4 pl-8">
                    <span
                      class="text-muted-foreground/40 mb-1 block text-xs font-black tracking-widest uppercase"
                      >Key</span
                    >
                    <code class="text-foreground font-mono text-sm font-bold">{{ env.key }}</code>
                  </TableCell>
                  <TableCell class="py-4">
                    <span
                      class="text-muted-foreground/40 mb-1 block text-xs font-black tracking-widest uppercase"
                      >Value</span
                    >
                    <code
                      class="text-muted-foreground bg-accent rounded border border-white/5 px-2 py-0.5 font-mono text-sm"
                      >{{ env.value }}</code
                    >
                  </TableCell>
                  <TableCell
                    v-if="canWriteApp"
                    class="py-4 pr-8"
                  >
                    <div
                      class="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        class="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        @click="showUpdateEnvVarDialog(env)"
                      >
                        <EditIcon class="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        @click="showDeleteEnvVarDialog(env)"
                      >
                        <Trash2Icon class="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </template>
          <div
            v-else
            class="p-12"
          >
            <DataNotFound />
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- Danger Zone Section -->
    <section v-if="canWriteApp">
      <Card class="border-destructive/30 bg-destructive/5 backdrop-blur-sm">
        <CardHeader class="flex-row items-center justify-between pb-6">
          <div class="flex items-center gap-4">
            <div class="bg-destructive/10 text-destructive rounded-xl p-2.5">
              <Trash2Icon :size="20" />
            </div>
            <div>
              <CardTitle class="text-destructive/80 text-xl font-black tracking-tight uppercase"
                >Danger Zone</CardTitle
              >
              <CardDescription class="text-xs font-medium tracking-widest uppercase opacity-60"
                >Destructive actions for this instance</CardDescription
              >
            </div>
          </div>
        </CardHeader>
        <CardContent class="border-destructive/10 border-t pt-6">
          <div class="flex flex-wrap items-center justify-between gap-6">
            <div class="max-w-md">
              <p class="text-muted-foreground text-sm font-medium">
                Permanently delete this application and all associated deployment history. This
                action is irreversible.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              class="shadow-destructive/20 rounded-full px-8 text-[10px] font-black tracking-tight uppercase shadow-lg transition-all active:scale-95"
              :disabled="!canDeleteApp"
              @click="showDeleteDialog"
            >
              Destroy Instance
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
</template>
