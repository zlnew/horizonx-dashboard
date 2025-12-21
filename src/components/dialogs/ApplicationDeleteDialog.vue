<script setup lang="ts">
import { useRouter } from 'vue-router'
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
import useApplicationStore from '@/stores/application'

const router = useRouter()
const applicationStore = useApplicationStore()

const deleteApplication = async () => {
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
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <Dialog v-model:open="applicationStore.dialogDeleteAppOpen">
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
          @click="deleteApplication"
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
