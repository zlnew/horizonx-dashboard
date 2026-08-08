<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ActivityIcon, PlayIcon, SquareIcon, TerminalSquareIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import LogConsole from '@/components/LogConsole.vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useContainerLogs } from '@/composables/container-logs'
import { defineBreadcrumbs, usePageMeta } from '@/composables/page-meta'
import useApplicationStore from '@/stores/application'

const route = useRoute()
const appID = computed(() => Number(route.params.id))

const applicationStore = useApplicationStore()
const { selectedApplication: application } = storeToRefs(applicationStore)

const pageTitle = computed(() => `${application.value?.name ?? 'Application'} · Logs`)

const { lines, status, error, streaming, following, droppedChunks, start, stop, query, dispose } =
  useContainerLogs(appID.value)

usePageMeta({
  title: pageTitle,
  breadcrumb: computed(() =>
    defineBreadcrumbs([
      {
        label: 'Applications',
        to: { name: 'applications' }
      },
      {
        label: pageTitle.value,
        to: {
          name: 'applications.logs',
          params: { id: String(application.value?.id) }
        }
      }
    ])
  )
})

const serviceFilter = ref('')
const sincePreset = ref<'15m' | '1h' | '6h' | '24h'>('15m')

const isBusy = computed(() => status.value === 'starting' || status.value === 'querying')

const onStart = () => {
  serviceFilter.value = ''
  void start()
}

const onStop = () => {
  void stop()
  toast('Log tail stopped')
}

const onQuery = () => {
  void query({ since: sincePreset.value })
}

onUnmounted(() => {
  dispose()
})
</script>

<template>
  <Card class="border-border/50 bg-card/20 overflow-hidden backdrop-blur-md">
    <CardHeader
      class="border-border/50 flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center sm:gap-6"
    >
      <div class="flex items-center gap-4">
        <div class="bg-primary/10 text-primary rounded-xl p-2.5">
          <TerminalSquareIcon :size="20" />
        </div>
        <div>
          <CardTitle class="text-xl font-black tracking-tight uppercase">Log Console</CardTitle>
          <CardDescription class="text-xs font-medium tracking-widest uppercase opacity-60">
            Container runtime logs — the host is the log store, HorizonX is the viewer
          </CardDescription>
        </div>
      </div>

      <CardAction class="shrink-0">
        <div class="flex flex-wrap items-center justify-end gap-2">
          <template v-if="!streaming">
            <Button
              size="sm"
              variant="outline"
              :disabled="isBusy"
              @click="onQuery"
            >
              <ActivityIcon class="h-4 w-4" />
              Query ({{ sincePreset }})
            </Button>
            <select
              v-model="sincePreset"
              class="bg-background h-8 rounded-md border px-2 text-xs"
              :disabled="isBusy"
            >
              <option value="15m">Last 15m</option>
              <option value="1h">Last 1h</option>
              <option value="6h">Last 6h</option>
              <option value="24h">Last 24h</option>
            </select>
            <Button
              size="sm"
              :disabled="isBusy"
              @click="onStart"
            >
              <PlayIcon class="h-4 w-4" />
              Start tailing
            </Button>
          </template>
          <template v-else>
            <Button
              size="sm"
              variant="destructive"
              @click="onStop"
            >
              <SquareIcon class="h-4 w-4" />
              Stop
            </Button>
          </template>
        </div>
      </CardAction>
    </CardHeader>

    <CardContent class="p-4 sm:p-6">
      <!-- error state (agent offline, 409, etc.) -->
      <div
        v-if="error"
        class="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-xs"
      >
        {{ error }}
      </div>

      <LogConsole
        :lines="lines"
        :following="following"
        :streaming="streaming"
        :dropped-chunks="droppedChunks"
        :service="serviceFilter"
        @update:following="following = $event"
        @update:service="serviceFilter = $event"
      />
    </CardContent>
  </Card>
</template>
