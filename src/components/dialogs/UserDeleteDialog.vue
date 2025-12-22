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
import useUserStore from '@/stores/user'

const userStore = useUserStore()

const deleteUser = async (closeDialog: () => void) => {
  if (!userStore.selectedUser?.id) {
    return
  }

  try {
    const res = await userStore.deleteUser(userStore.selectedUser.id)
    if (res.message) {
      toast.success(res.message)
    }

    userStore.selectedUser = null
    userStore.refetch = true
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
        <DialogTitle>Delete user</DialogTitle>
        <DialogDescription>
          This action will permanently remove the user from the system. This cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          type="button"
          variant="destructive"
          @click="deleteUser(close)"
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </DialogRoot>
</template>
