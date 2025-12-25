<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import ServerApi from '@/api/Server'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useAppStore from '@/stores/app'
import useAuthStore from '@/stores/auth'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const { serverID } = storeToRefs(appStore)
const { loginError } = storeToRefs(authStore)

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
)

const form = useForm({
  validationSchema: formSchema
})

onMounted(() => {
  appStore.title = 'Login'
})

onBeforeUnmount(() => {
  loginError.value = null
})

const getServers = async () => {
  try {
    const res = await new ServerApi().get<ApiResponse<Server[]>>()
    return res.data
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  }
}

const onSubmit = form.handleSubmit((values) => {
  authStore.login(values).then(async () => {
    const servers = await getServers()

    if (!servers?.find((s) => s.id === serverID.value)) {
      serverID.value = ''
    }

    if (serverID.value === '') {
      router.push({ path: '/servers/select' })
      return
    }

    router.push({ path: '/' })
  })
})
</script>

<template>
  <Card class="w-full sm:w-sm">
    <CardHeader>
      <CardTitle>Login to your account</CardTitle>
      <CardDescription>Enter your email below to login to your account</CardDescription>
    </CardHeader>

    <CardContent>
      <form
        class="space-y-4"
        @submit.prevent="onSubmit"
      >
        <Alert
          v-if="loginError"
          variant="destructive"
        >
          <AlertTitle>Login Error!</AlertTitle>
          <AlertDescription>{{ loginError }}</AlertDescription>
        </Alert>

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

        <Button
          type="submit"
          class="w-full"
        >
          Sign In
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
