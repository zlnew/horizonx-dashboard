<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Form, type GenericObject } from 'vee-validate'
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

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
)

const createUser = async (values: GenericObject) => {
  try {
    const res = await userStore.createUser(values)
    if (res.message) {
      toast.success(res.message)
    }
    userStore.dialogCreateOpen = false
    userStore.refetch = true
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}
</script>

<template>
  <Form
    v-slot="{ handleSubmit }"
    as=""
    :validation-schema="formSchema"
  >
    <Dialog v-model:open="userStore.dialogCreateOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new user</DialogTitle>
          <DialogDescription>
            Add a new user account with the required information. Make sure the details are correct
            before saving.
          </DialogDescription>
        </DialogHeader>

        <form
          id="userCreateDialogForm"
          class="space-y-4"
          @submit.prevent="handleSubmit($event, createUser)"
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
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
</template>
