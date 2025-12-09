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
import useUserStore from '@/stores/user'

const userStore = useUserStore()

watch(
  () => userStore.dialogDeleteOpen,
  (open) => {
    if (open) {
    } else {
      userStore.selectedUser = null
    }
  }
)

const deleteUser = async () => {
  if (!userStore.selectedUser?.id) {
    return
  }

  try {
    const res = await userStore.deleteUser(userStore.selectedUser.id)
    if (res.message) {
      toast.success(res.message)
    }

    userStore.dialogDeleteOpen = false
    userStore.selectedUser = null
    userStore.refetch = true
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <Dialog v-model:open="userStore.dialogDeleteOpen">
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
          @click="deleteUser"
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
