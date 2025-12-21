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
import { Textarea } from '@/components/ui/textarea'
import useApplicationStore from '@/stores/application'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

const applicationStore = useApplicationStore()

const veeForm = ref<FormContext>()
const formSchema = toTypedSchema(
  z.object({
    docker_compose_raw: z.string()
  })
)

watch(
  () => applicationStore.dialogUpdateDockerComposeOpen,
  (open) => {
    if (open) {
      if (applicationStore.selectedApplication?.docker_compose_raw) {
        veeForm.value?.setValues({
          docker_compose_raw: applicationStore.selectedApplication.docker_compose_raw
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
      name: applicationStore.selectedApplication.name,
      repo_url: applicationStore.selectedApplication.repo_url,
      branch: applicationStore.selectedApplication.branch,
      docker_compose_raw: values.docker_compose_raw,
      env_vars: null,
      volumes: null
    })

    if (res.message) {
      toast.success(res.message)
    }

    applicationStore.dialogUpdateDockerComposeOpen = false
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
    <Dialog v-model:open="applicationStore.dialogUpdateDockerComposeOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update docker compose file</DialogTitle>
          <DialogDescription>
            This configuration will be used to build and run your application containers.
          </DialogDescription>
        </DialogHeader>

        <form
          id="appUpdateDockerComposeDialogForm"
          class="space-y-4"
          @submit.prevent="handleSubmit($event, updateApplication)"
        >
          <FormField
            v-slot="{ componentField }"
            name="docker_compose_raw"
          >
            <FormItem>
              <FormLabel>docker-compose.yml</FormLabel>
              <FormControl>
                <Textarea
                  rows="16"
                  placeholder="Paste your docker-compose.yml configuration here"
                  class="font-mono text-sm"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage class="text-red-500" />
            </FormItem>
          </FormField>
        </form>

        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            form="appUpdateDockerComposeDialogForm"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
</template>
