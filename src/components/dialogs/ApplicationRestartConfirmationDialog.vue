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
import useApplicationStore from '@/stores/application'

const applicationStore = useApplicationStore()

const restartApp = async (closeDialog: () => void) => {
  if (!applicationStore.selectedApplication?.id) {
    return
  }

  try {
    const res = await applicationStore.restartApplication(applicationStore.selectedApplication.id)
    if (res.message) {
      toast.success(res.message)
    }

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
        <DialogTitle>Restart Application</DialogTitle>
        <DialogDescription>The application will be restarted. Proceed?</DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          type="button"
          @click="restartApp(close)"
        >
          Restart Application
        </Button>
      </DialogFooter>
    </DialogContent>
  </DialogRoot>
</template>
