<script setup lang="ts">
import { computed } from 'vue'
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
import useApplicationEnvStore from '@/stores/application-env'

const applicationStore = useApplicationStore()
const applicationEnvStore = useApplicationEnvStore()

const appID = computed(() => applicationStore.selectedApplication?.id)
const envKey = computed(() => applicationEnvStore.selectedEnvironment?.key)

const deleteApplication = async (closeDialog: () => void) => {
  if (!appID.value || !envKey.value) {
    return
  }

  try {
    const res = await applicationEnvStore.deleteEnvironment(appID.value, envKey.value)
    if (res.message) {
      toast.success(res.message)
    }

    applicationStore.refetch = true
    applicationEnvStore.selectedEnvironment = null
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
        <DialogTitle>Delete environment variable</DialogTitle>
        <DialogDescription>
          This action will permanently remove the environment variable from your application. This
          cannot be undone.
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
