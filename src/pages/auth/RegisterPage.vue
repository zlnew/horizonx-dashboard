<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useAppStore from '@/stores/app'
import useAuthStore from '@/stores/auth'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const formSchema = toTypedSchema(
  z
    .object({
      email: z.string().email(),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(8, 'Password must be at least 8 characters')
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    })
)

const form = useForm({
  validationSchema: formSchema
})

onMounted(() => {
  appStore.title = 'Register'
})

const onSubmit = form.handleSubmit((values) => {
  authStore.register(values).then(() => {
    router.push({ name: 'auth.login' })
  })
})
</script>

<template>
  <Card class="sm:min-w-sm">
    <CardHeader>
      <CardTitle>Create Your Account</CardTitle>
      <CardDescription> Fill in your details below to get started. </CardDescription>
      <CardAction>
        <Button
          variant="link"
          asChild
        >
          <RouterLink :to="{ name: 'auth.login' }">Login</RouterLink>
        </Button>
      </CardAction>
    </CardHeader>

    <CardContent>
      <form
        class="space-y-4"
        @submit="onSubmit"
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
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage class="text-red-500" />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="confirmPassword"
        >
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Re-enter your password"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage class="text-red-500" />
          </FormItem>
        </FormField>

        <Button
          type="submit"
          class="w-full"
        >
          Sign Up
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
