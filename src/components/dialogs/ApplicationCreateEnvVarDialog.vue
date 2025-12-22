<script setup lang="ts">
import { computed } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { Form, type GenericObject } from 'vee-validate'
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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useApplicationStore from '@/stores/application'
import useApplicationEnvStore from '@/stores/application-env'

const applicationStore = useApplicationStore()
const applicationEnvStore = useApplicationEnvStore()

const appID = computed(() => applicationStore.selectedApplication?.id)

const formSchema = toTypedSchema(
  z.object({
    key: z.string(),
    value: z.string()
  })
)

const submit = async (values: GenericObject, closeDialog: () => void) => {
  if (!appID.value) {
    return
  }

  try {
    const res = await applicationEnvStore.createEnvironment(appID.value, values)
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
    #="{ handleSubmit }"
    :validation-schema="formSchema"
  >
    <DialogRoot #="{ close }">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add environment variable</DialogTitle>
          <DialogDescription>
            Define a new environment variable for this application. It will be available on the next
            deployment and may affect runtime behavior.
          </DialogDescription>
        </DialogHeader>

        <form
          id="form"
          class="space-y-4"
          @submit.prevent="handleSubmit((values) => submit(values, close))"
        >
          <FormField
            v-slot="{ componentField }"
            name="key"
          >
            <FormItem>
              <FormLabel>Key</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage class="text-red-500" />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="value"
          >
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input
                  type="text"
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
            form="form"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  </Form>
</template>
