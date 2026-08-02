<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { HistoryIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AuditLogApi from '@/api/AuditLog'
import DataLoading from '@/components/DataLoading.vue'
import DataNotFound from '@/components/DataNotFound.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useDate } from '@/composables/date'
import { usePageMeta } from '@/composables/page-meta'

const { formatDate } = useDate()
const auditApi = new AuditLogApi()

const logs = ref<AuditLog[]>([])
const meta = ref<Meta | null>(null)
const loading = ref(false)
const page = ref(1)
const perPage = 20

const totalPages = computed(() => {
  if (!meta.value?.total) return 1
  return Math.max(1, Math.ceil(meta.value.total / perPage))
})

usePageMeta({
  title: 'Audit Log',
  breadcrumb: [
    {
      label: 'Audit Log',
      to: { name: 'audit-logs' }
    }
  ]
})

const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await auditApi.list<ApiResponse<AuditLog[]>>({
      page: page.value,
      limit: perPage,
      paginate: 1
    })
    logs.value = res.data ?? []
    meta.value = res.meta ?? null
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    loading.value = false
  }
}

const actionLabel = (action: string) => {
  return action
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const actionColor = (action: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
  if (action.includes('failed') || action.includes('offline')) return 'destructive'
  if (action.includes('success') || action.includes('online')) return 'default'
  if (action.includes('created') || action.includes('started')) return 'secondary'
  return 'outline'
}

onMounted(fetchLogs)
</script>

<template>
  <div class="space-y-8">
    <section>
      <Card class="border-border/50 bg-card/30 backdrop-blur-md">
        <CardHeader class="border-border/50 flex-row items-center justify-between border-b pb-6">
          <div class="flex items-center gap-4">
            <div class="bg-primary/10 text-primary rounded-xl p-2.5">
              <HistoryIcon :size="20" />
            </div>
            <div>
              <CardTitle class="text-xl font-black tracking-tight uppercase">Audit Log</CardTitle>
              <CardDescription class="text-xs font-medium tracking-widest uppercase opacity-60">
                Append-only record of deploys, apps, and server events
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="px-8 pt-6">
          <DataLoading v-if="loading" />
          <DataNotFound v-else-if="!logs.length" title="No audit entries yet" />

          <div v-else class="space-y-1">
            <div
              v-for="log in logs"
              :key="log.id"
              class="border-border/40 hover:bg-muted/40 flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex items-center gap-3">
                <Badge :variant="actionColor(log.action)" class="font-mono text-[10px] font-bold tracking-wider uppercase">
                  {{ actionLabel(log.action) }}
                </Badge>
                <span class="text-xs text-muted-foreground">
                  {{ log.resource_type }}
                  <span v-if="log.resource_id" class="font-mono">#{{ log.resource_id }}</span>
                </span>
              </div>
              <div class="flex items-center gap-4 text-xs text-muted-foreground">
                <span v-if="log.actor_email">{{ log.actor_email }}</span>
                <span>{{ formatDate(new Date(log.created_at), 'DD MMM, HH:mm:ss') }}</span>
              </div>
            </div>
          </div>

          <div v-if="totalPages > 1" class="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              size="sm"
              :disabled="page <= 1 || loading"
              @click="page--; fetchLogs()"
            >
              Previous
            </Button>
            <span class="text-xs text-muted-foreground">
              Page {{ page }} of {{ totalPages }}
            </span>
            <Button
              variant="outline"
              size="sm"
              :disabled="page >= totalPages || loading"
              @click="page++; fetchLogs()"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
</template>
