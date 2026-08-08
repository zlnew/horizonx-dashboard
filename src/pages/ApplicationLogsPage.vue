<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ActivityIcon, PlayIcon, SquareIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LogConsole from '@/components/LogConsole.vue'
import { useContainerLogs } from '@/composables/container-logs'
import { usePageMeta } from '@/composables/page-meta'
import useApplicationStore from '@/stores/application'

const route = useRoute()
const appID = computed(() => Number(route.params.id))

const applicationStore = useApplicationStore()
const { selectedApplication: application } = storeToRefs(applicationStore)

const {
  lines,
  status,
  error,
  streaming,
  following,
  droppedChunks,
  service,
  since,
  start,
  stop,
  query,
  dispose
} = useContainerLogs(appID.value)

usePageMeta({ title: 'Application Logs' })

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
  <div class="space-y-6">
    <!-- header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black uppercase">
          {{ application?.name ?? 'Application' }}
        </h1>
        <p class="text-sm text-muted">Container runtime logs — the host is the log store, HorizonX is the viewer.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <template v-if="!streaming">
          <Button size="sm" variant="outline" :disabled="isBusy" @click="onQuery">
            <ActivityIcon class="h-4 w-4" />
            Query ({{ sincePreset }})
          </Button>
          <select
            v-model="sincePreset"
            class="h-8 rounded-md border bg-background px-2 text-xs"
            :disabled="isBusy"
          >
            <option value="15m">Last 15m</option>
            <option value="1h">Last 1h</option>
            <option value="6h">Last 6h</option>
            <option value="24h">Last 24h</option>
          </select>
          <Button size="sm" :disabled="isBusy" @click="onStart">
            <PlayIcon class="h-4 w-4" />
            Start tailing
          </Button>
        </template>
        <template v-else>
          <Button size="sm" variant="destructive" @click="onStop">
            <SquareIcon class="h-4 w-4" />
            Stop
          </Button>
        </template>
      </div>
    </div>

    <!-- error state (agent offline, 409, etc.) -->
    <div
      v-if="error"
      class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
    >
      {{ error }}
    </div>

    <!-- console -->
    <Card>
      <CardHeader>
        <CardTitle>Console</CardTitle>
      </CardHeader>
      <CardContent>
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
  </div>
</template>
