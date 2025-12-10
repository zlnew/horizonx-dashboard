<script setup lang="ts">
import { watch } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import useServerStore from '@/stores/server'

const serverStore = useServerStore()

watch(
  () => serverStore.dialogDeleteOpen,
  (open) => {
    if (open) {
    } else {
      serverStore.selectedServer = null
    }
  }
)

const deleteServer = async () => {
  if (!serverStore.selectedServer?.id) {
    return
  }

  try {
    const res = await serverStore.deleteServer(serverStore.selectedServer.id)
    if (res.message) {
      toast.success(res.message)
    }

    serverStore.dialogDeleteOpen = false
    serverStore.selectedServer = null
    serverStore.refetch = true
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <Dialog v-model:open="serverStore.dialogDeleteOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete server</DialogTitle>
        <DialogDescription>
          This action will permanently remove the server from the system. This cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          type="button"
          variant="destructive"
          @click="deleteServer"
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
