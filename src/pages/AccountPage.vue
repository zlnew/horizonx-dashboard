<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import { CircleUserIcon, KeyRoundIcon, LockIcon, UserIcon } from 'lucide-vue-next'
import { Form, type FormContext, type GenericObject } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import AccountApi from '@/api/Account'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { usePageMeta } from '@/composables/page-meta'
import useAuthStore from '@/stores/auth'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const accountApi = new AccountApi()

const activeTab = ref<'profile' | 'password'>('profile')
const profileError = ref<string | null>(null)
const passwordError = ref<string | null>(null)
const profileLoading = ref(false)
const passwordLoading = ref(false)

usePageMeta({
  title: 'Account',
  breadcrumb: [
    {
      label: 'Account',
      to: { name: 'account' }
    }
  ]
})

// Profile form schema
const profileForm = ref<FormContext>()
const profileFormSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name is too long')
  })
)

// Password form schema
const passwordForm = ref<FormContext>()
const passwordFormSchema = toTypedSchema(
  z
    .object({
      current_password: z.string().min(1, 'Current password is required'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      password_confirmation: z.string().min(1, 'Password confirmation is required')
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: 'Passwords do not match',
      path: ['password_confirmation']
    })
)

onMounted(() => {
  profileForm.value?.setValues({
    name: user.value.name || ''
  })
})

const onProfileSubmit = async (values: GenericObject) => {
  profileError.value = null
  profileLoading.value = true

  try {
    const res = await accountApi.updateProfile<ApiResponse>(values)
    if (res.message) {
      toast.success(res.message)
    }
  } catch (error) {
    const fetchError = error as Error
    profileError.value = fetchError.message
  } finally {
    profileLoading.value = false
  }
}

const onPasswordSubmit = async (values: GenericObject) => {
  passwordError.value = null
  passwordLoading.value = true

  try {
    const res = await accountApi.changePassword<ApiResponse>(values)
    if (res.message) {
      toast.success(res.message)
      passwordForm.value?.resetForm()
    }
  } catch (error) {
    const fetchError = error as Error
    passwordError.value = fetchError.message
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-8">
      <div class="flex items-center gap-4">
        <div class="bg-accent rounded-lg p-3">
          <CircleUserIcon :size="24" />
        </div>
        <div class="flex flex-col gap-0">
          <div class="text-xl">Account Settings</div>
          <div class="text-sm text-neutral-400">Manage your account information and security</div>
        </div>
      </div>
    </div>
  </section>

  <section class="mt-8">
    <div class="max-w-4xl">
      <!-- Tab Navigation -->
      <div class="mb-6 flex gap-2 border-b border-neutral-800">
        <button
          type="button"
          class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors"
          :class="
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          "
          @click="activeTab = 'profile'"
        >
          <UserIcon :size="16" />
          <span>Profile</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors"
          :class="
            activeTab === 'password'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          "
          @click="activeTab = 'password'"
        >
          <KeyRoundIcon :size="16" />
          <span>Password</span>
        </button>
      </div>

      <!-- Profile Tab -->
      <div v-show="activeTab === 'profile'">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              ref="profileForm"
              v-slot="{ handleSubmit }"
              as=""
              :validation-schema="profileFormSchema"
            >
              <form
                id="profileForm"
                class="space-y-6"
                @submit.prevent="handleSubmit(onProfileSubmit)"
              >
                <Alert
                  v-if="profileError"
                  variant="destructive"
                >
                  <AlertTitle>Error!</AlertTitle>
                  <AlertDescription>{{ profileError }}</AlertDescription>
                </Alert>

                <div class="space-y-4">
                  <FormField
                    v-slot="{ componentField }"
                    name="name"
                  >
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter your name"
                          v-bind="componentField"
                        />
                      </FormControl>
                      <FormMessage class="text-red-500" />
                    </FormItem>
                  </FormField>

                  <div class="space-y-2">
                    <Label for="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      :model-value="user.email"
                      disabled
                    />
                    <p class="text-xs text-neutral-500">Email address cannot be changed</p>
                  </div>
                </div>

                <Separator />

                <div class="flex justify-end">
                  <Button
                    type="submit"
                    form="profileForm"
                    :disabled="profileLoading"
                  >
                    <span v-if="profileLoading">Updating...</span>
                    <span v-else>Update Profile</span>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <!-- Password Tab -->
      <div v-show="activeTab === 'password'">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              ref="passwordForm"
              v-slot="{ handleSubmit }"
              as=""
              :validation-schema="passwordFormSchema"
            >
              <form
                id="passwordForm"
                class="space-y-6"
                @submit.prevent="handleSubmit(onPasswordSubmit)"
              >
                <Alert
                  v-if="passwordError"
                  variant="destructive"
                >
                  <AlertTitle>Error!</AlertTitle>
                  <AlertDescription>{{ passwordError }}</AlertDescription>
                </Alert>

                <div class="space-y-4">
                  <FormField
                    v-slot="{ componentField }"
                    name="current_password"
                  >
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your current password"
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
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password (min. 8 characters)"
                          v-bind="componentField"
                        />
                      </FormControl>
                      <FormMessage class="text-red-500" />
                    </FormItem>
                  </FormField>

                  <FormField
                    v-slot="{ componentField }"
                    name="password_confirmation"
                  >
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your new password"
                          v-bind="componentField"
                        />
                      </FormControl>
                      <FormMessage class="text-red-500" />
                    </FormItem>
                  </FormField>
                </div>

                <Separator />

                <div class="flex justify-end">
                  <Button
                    type="submit"
                    form="passwordForm"
                    :disabled="passwordLoading"
                  >
                    <LockIcon :size="16" />
                    <span v-if="passwordLoading">Changing Password...</span>
                    <span v-else>Change Password</span>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
