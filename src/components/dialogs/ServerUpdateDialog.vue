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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useServerStore from '@/stores/server'

const serverStore = useServerStore()

const veeForm = ref<FormContext>()
const formSchema = toTypedSchema(
  z.object({
    name: z.string(),
    ip_address: z.string()
  })
)

watch(
  () => serverStore.dialogUpdateOpen,
  (open) => {
    if (open) {
      if (serverStore.selectedServer) {
        veeForm.value?.setValues({
          name: serverStore.selectedServer.name,
          ip_address: serverStore.selectedServer.ip_address
        })
      }
    } else {
      serverStore.selectedServer = null
    }
  }
)

const updateServer = async (values: GenericObject) => {
  if (!serverStore.selectedServer?.id) {
    return
  }

  try {
    const res = await serverStore.updateServer(serverStore.selectedServer.id, values)
    if (res.message) {
      toast.success(res.message)
    }
    serverStore.dialogUpdateOpen = false
    serverStore.selectedServer = null
    serverStore.refetch = true
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
    <Dialog v-model:open="serverStore.dialogUpdateOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update server</DialogTitle>
          <DialogDescription>
            Modify the server's information below. Ensure all details are correct before saving the
            changes.
          </DialogDescription>
        </DialogHeader>

        <form
          id="serverUpdateDialogForm"
          class="space-y-4"
          @submit.prevent="handleSubmit($event, updateServer)"
        >
          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input v-bind="componentField" />
              </FormControl>
              <FormMessage class="text-red-500" />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="ip_address"
          >
            <FormItem>
              <FormLabel>IP Address</FormLabel>
              <FormControl>
                <Input v-bind="componentField" />
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
            form="serverUpdateDialogForm"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
</template>
