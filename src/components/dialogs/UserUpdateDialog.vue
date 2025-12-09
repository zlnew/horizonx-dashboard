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
import useUserStore from '@/stores/user'

const userStore = useUserStore()

const veeForm = ref<FormContext>()
const formSchema = toTypedSchema(
  z.object({
    email: z.string().email(),
    password: z.string().nullable()
  })
)

watch(
  () => userStore.dialogUpdateOpen,
  (open) => {
    if (open) {
      if (userStore.selectedUser) {
        veeForm.value?.setValues(userStore.selectedUser)
      }
    } else {
      userStore.selectedUser = null
    }
  }
)

const updateUser = async (values: GenericObject) => {
  if (!userStore.selectedUser?.id) {
    return
  }

  try {
    const res = await userStore.updateUser(userStore.selectedUser.id, values)
    if (res.message) {
      toast.success(res.message)
    }
    userStore.dialogUpdateOpen = false
    userStore.selectedUser = null
    userStore.refetch = true
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
    <Dialog v-model:open="userStore.dialogUpdateOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update user</DialogTitle>
          <DialogDescription>
            Modify the user’s information below. Ensure all details are correct before saving the
            changes.
          </DialogDescription>
        </DialogHeader>

        <form
          id="userCreateDialogForm"
          class="space-y-4"
          @submit.prevent="handleSubmit($event, updateUser)"
        >
          <FormField
            v-slot="{ componentField }"
            name="email"
          >
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="e.g. name@domain.com"
                  autocomplete="username"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage class="text-red-500" />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="password"
          >
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  autocomplete="new-password"
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
            form="userCreateDialogForm"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
</template>
