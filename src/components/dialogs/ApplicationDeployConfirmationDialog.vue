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

const deployApp = async (closeDialog: () => void) => {
  if (!applicationStore.selectedApplication?.id) {
    return
  }

  try {
    const res = await applicationStore.deployApplication(applicationStore.selectedApplication.id)
    if (res.message) {
      toast.success(res.message)
    }

    if (res.data) {
      router.push({
        name: 'applications.deploys.show',
        params: {
          id: applicationStore.selectedApplication.id,
          deploymentID: res.data.id
        }
      })
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
        <DialogTitle>Create New Deployment</DialogTitle>
        <DialogDescription>This will trigger a new deployment. Proceed?</DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Nevermind</Button>
        </DialogClose>
        <Button
          type="button"
          @click="deployApp(close)"
        >
          Let's Go!
        </Button>
      </DialogFooter>
    </DialogContent>
  </DialogRoot>
</template>
