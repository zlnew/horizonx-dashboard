<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { Form, type FormContext, type GenericObject } from 'vee-validate'
import { toast } from 'vue-sonner'
import z from 'zod'
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
import { Input } from '@/components/ui/input'
import useApplicationStore from '@/stores/application'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

const applicationStore = useApplicationStore()

const veeForm = ref<FormContext>()
const formSchema = toTypedSchema(
  z.object({
    name: z.string(),
    branch: z.string()
  })
)

onMounted(() => {
  if (applicationStore.selectedApplication) {
    veeForm.value?.setValues({
      name: applicationStore.selectedApplication.name,
      branch: applicationStore.selectedApplication.branch
    })
  }
})

const updateApplication = async (values: GenericObject, closeDialog: () => void) => {
  if (!applicationStore.selectedApplication?.id) {
    return
  }

  try {
    const res = await applicationStore.updateApplication(applicationStore.selectedApplication.id, {
      name: values.name,
      repo_url: applicationStore.selectedApplication.repo_url,
      branch: values.branch,
      env_vars: null
    })

    if (res.message) {
      toast.success(res.message)
    }

    applicationStore.refetch = true
    closeDialog()
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
    <DialogRoot #="{ close }">
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
          @submit.prevent="handleSubmit((values) => updateApplication(values, close))"
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
    </DialogRoot>
  </Form>
</template>
