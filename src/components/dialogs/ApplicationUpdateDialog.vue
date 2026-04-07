<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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
    branch: z.string(),
    site_url: z.union([z.string().url(), z.literal('')]).optional()
  })
)

const hydrateForm = () => {
  if (!applicationStore.selectedApplication) {
    return
  }

  veeForm.value?.setValues({
    name: applicationStore.selectedApplication.name,
    branch: applicationStore.selectedApplication.branch,
    site_url: applicationStore.selectedApplication.site_url ?? ''
  })
}

onMounted(hydrateForm)

watch(
  () => applicationStore.selectedApplication,
  () => {
    hydrateForm()
  },
  { immediate: true }
)

const updateApplication = async (values: GenericObject, closeDialog: () => void) => {
  if (!applicationStore.selectedApplication?.id) {
    return
  }

  try {
    const res = await applicationStore.updateApplication(applicationStore.selectedApplication.id, {
      name: values.name,
      site_url: values.site_url?.trim() ? values.site_url.trim() : null,
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
            Update the application metadata (name, branch, and site URL) used during build and
            runtime.
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

          <FormField
            v-slot="{ componentField }"
            name="site_url"
          >
            <FormItem>
              <FormLabel>Site URL</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="https://app.example.com"
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
