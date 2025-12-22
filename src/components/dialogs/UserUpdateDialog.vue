<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { IdCardLanyardIcon } from 'lucide-vue-next'
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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import useUserStore from '@/stores/user'

const userStore = useUserStore()

const veeForm = ref<FormContext>()
const formSchema = toTypedSchema(
  z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().nullish(),
    role_id: z.number()
  })
)

onMounted(() => {
  if (userStore.selectedUser) {
    veeForm.value?.setValues({
      name: userStore.selectedUser.name,
      email: userStore.selectedUser.email,
      role_id: userStore.selectedUser.role_id
    })
  }
})

const updateUser = async (values: GenericObject, closeDialog: () => void) => {
  if (!userStore.selectedUser?.id) {
    return
  }

  try {
    const res = await userStore.updateUser(userStore.selectedUser.id, values)
    if (res.message) {
      toast.success(res.message)
    }

    userStore.selectedUser = null
    userStore.refetch = true
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
          @submit.prevent="handleSubmit((values) => updateUser(values, close))"
        >
          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. John Doe"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage class="text-red-500" />
            </FormItem>
          </FormField>

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

          <FormField
            v-slot="{ componentField }"
            name="role_id"
          >
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger>
                    <div class="text-neutral-400">
                      <IdCardLanyardIcon />
                    </div>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem :value="1">Admin</SelectItem>
                      <SelectItem :value="2">Viewer</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
    </DialogRoot>
  </Form>
</template>
