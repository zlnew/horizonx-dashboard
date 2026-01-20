<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ServerIcon } from 'lucide-vue-next'
import type { AcceptableValue } from 'reka-ui'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import useAppStore from '@/stores/app'

const appStore = useAppStore()
const { serverID, servers } = storeToRefs(appStore)

const handleServerSelect = (serverID: AcceptableValue) => {
  appStore.serverID = serverID?.toString() ?? ''
  window.location.reload()
}
</script>

<template>
  <div>
    <Select
      v-model="serverID"
      @update:model-value="handleServerSelect"
    >
      <SelectTrigger>
        <ServerIcon />
        <SelectValue placeholder="Choose a server" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem
            v-for="(srv, index) in servers"
            :key="index"
            :value="srv.id"
          >
            {{ srv.name }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>
