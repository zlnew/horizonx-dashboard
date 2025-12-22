<script setup lang="ts">
import { useRouter } from 'vue-router'
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
import useApplicationStore from '@/stores/application'

const router = useRouter()
const applicationStore = useApplicationStore()

const deleteApplication = async (closeDialog: () => void) => {
  if (!applicationStore.selectedApplication?.id) {
    return
  }

  try {
    const res = await applicationStore.deleteApplication(applicationStore.selectedApplication.id)
    if (res.message) {
      toast.success(res.message)
    }

    applicationStore.cleanupState()
    router.push({ name: 'applications' })
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
        <DialogTitle>Delete application</DialogTitle>
        <DialogDescription>
          This action will permanently remove the application from your server. This cannot be
          undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          type="button"
          variant="destructive"
          @click="deleteApplication(close)"
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </DialogRoot>
</template>
