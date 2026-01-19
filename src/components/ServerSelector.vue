<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ServerIcon } from 'lucide-vue-next'
import type { AcceptableValue } from 'reka-ui'
import { toast } from 'vue-sonner'
import ServerApi from '@/api/Server'
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

const { serverID } = storeToRefs(appStore)
const servers = ref<Server[]>([])

onMounted(() => {
  fetchServers()
})

const fetchServers = async () => {
  try {
    const res = await new ServerApi().get<ApiResponse<Server[]>>()
    servers.value = res.data ?? []
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const handleServerSelect = (serverID: AcceptableValue) => {
  appStore.serverID = serverID?.toString() ?? ''
  window.location.reload()
}
</script>

<template>
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
</template>
