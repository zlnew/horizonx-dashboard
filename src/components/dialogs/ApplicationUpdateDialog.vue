<script setup lang="ts">
import { ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { Form, type FormContext, type GenericObject } from 'vee-validate'
import { toast } from 'vue-sonner'
import z from 'zod'
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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

const applicationStore = useApplicationStore()

const veeForm = ref<FormContext>()
const formSchema = toTypedSchema(
  z.object({
    name: z.string(),
    branch: z.string()
  })
)

watch(
  () => applicationStore.dialogUpdateAppOpen,
  (open) => {
    if (open) {
      if (applicationStore.selectedApplication) {
        veeForm.value?.setValues({
          name: applicationStore.selectedApplication.name,
          branch: applicationStore.selectedApplication.branch
        })
      }
    }
  }
)

const updateApplication = async (values: GenericObject) => {
  if (!applicationStore.selectedApplication?.id) {
    return
  }

  try {
    const res = await applicationStore.updateApplication(applicationStore.selectedApplication.id, {
      name: values.name,
      repo_url: applicationStore.selectedApplication.repo_url,
      branch: values.branch,
      docker_compose_raw: applicationStore.selectedApplication.docker_compose_raw ?? '',
      env_vars: null,
      volumes: null
    })

    if (res.message) {
      toast.success(res.message)
    }

    applicationStore.dialogUpdateAppOpen = false
    applicationStore.refetch = true
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <Form
    ref="veeForm"
    v-slot="{ handleSubmit }"
    as=""
    :validation-schema="formSchema"
  >
    <Dialog v-model:open="applicationStore.dialogUpdateAppOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Application</DialogTitle>
          <DialogDescription>
            Update the application name and deployment branch used during build and runtime.
          </DialogDescription>
        </DialogHeader>

        <form
          id="appUpdateDialogForm"
          class="space-y-4"
          @submit.prevent="handleSubmit($event, updateApplication)"
        >
          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel>Application Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g. horizonx-dashboard"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage class="text-red-500" />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="branch"
          >
            <FormItem>
              <FormLabel>Deployment Branch</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="main"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>

        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            form="appUpdateDialogForm"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
</template>
