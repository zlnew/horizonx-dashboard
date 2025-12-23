<script setup lang="ts">
import { ChevronRightIcon } from 'lucide-vue-next'
import AppDeployBadge from '@/components/AppDeployBadge.vue'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { useDate } from '@/composables/date'
import DeploymentStatus from '@/constants/deployment-status'

defineProps<{
  data: Deployment
}>()

const { formatDate, formatDuration } = useDate()
</script>

<template>
  <Item as-child>
    <RouterLink
      :to="{
        name: 'applications.deploys.show',
        params: { id: data.application_id, deploymentID: data.id }
      }"
    >
      <ItemContent>
        <ItemTitle>
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold">
              {{ data.branch }}@{{ data.commit_hash ?? '~' }}
            </span>
            <AppDeployBadge :status="data.status" />
          </div>
        </ItemTitle>
        <ItemDescription>
          {{ data.commit_message ?? 'No deploy message' }}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <div class="flex items-center gap-4">
          <div class="flex flex-col gap-2">
            <div>
              {{ formatDate(new Date(data.triggered_at), 'DD MMM, YYYY HH:mm') }}
            </div>
            <div
              v-if="data.started_at && data.finished_at && data.status === DeploymentStatus.SUCCESS"
              class="text-sm text-neutral-400"
            >
              Deployed in
              {{ formatDuration(new Date(data.started_at), new Date(data.finished_at)) }}
            </div>
          </div>
          <ChevronRightIcon class="size-4" />
        </div>
      </ItemActions>
    </RouterLink>
  </Item>
</template>
