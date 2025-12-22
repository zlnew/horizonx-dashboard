<script setup lang="ts">
import { toast } from 'vue-sonner'
import DialogRoot from '@/components/DialogRoot.vue'
import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import useServerStore from '@/stores/server'

const serverStore = useServerStore()

const deleteServer = async (closeDialog: () => void) => {
  if (!serverStore.selectedServer?.id) {
    return
  }

  try {
    const res = await serverStore.deleteServer(serverStore.selectedServer.id)
    if (res.message) {
      toast.success(res.message)
    }

    serverStore.selectedServer = null
    serverStore.refetch = true
    closeDialog()
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <DialogRoot #="{ close }">
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
          @click="deleteServer(close)"
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </DialogRoot>
</template>
