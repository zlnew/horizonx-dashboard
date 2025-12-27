<script setup lang="ts">
import { ChevronRightIcon } from 'lucide-vue-next'
import AppDeployBadge from '@/components/AppDeployBadge.vue'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { useDate } from '@/composables/date'

defineProps<{
  data: Deployment
}>()

const { formatDate } = useDate()
</script>

<template>
  <Item
    as-child
    class="rounded-none px-0 md:px-4"
  >
    <RouterLink
      :to="{
        name: 'applications.deploys.show',
        params: { id: data.application_id, deploymentID: data.id }
      }"
    >
      <ItemContent>
        <ItemTitle>{{ data.branch }}@{{ data.commit_hash ?? '~' }}</ItemTitle>
        <ItemDescription>
          <div class="space-y-2">
            <div>{{ data.commit_message ?? 'No deploy message' }}</div>
            <div class="flex items-center gap-2">
              <AppDeployBadge :status="data.status" />
              <span>&middot;</span>
              <span>{{ formatDate(new Date(data.triggered_at), 'DD MMM, YYYY HH:mm') }}</span>
            </div>
          </div>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon class="size-4" />
      </ItemActions>
    </RouterLink>
  </Item>
</template>
