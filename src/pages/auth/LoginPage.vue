<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { SparklesIcon } from 'lucide-vue-next'
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
const { loginError, isDemoMode } = storeToRefs(authStore)

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
)

const form = useForm({
  validationSchema: formSchema
})

onMounted(async () => {
  appStore.title = 'Login'
  await authStore.fetchConfig()
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

    router.push({ name: 'dashboard' })
  })
})

const onDemoLogin = () => {
  form.setFieldValue('email', 'demo@horizonx.dev')
  form.setFieldValue('password', 'demo123456')
  onSubmit()
}
</script>

<template>
  <Card class="w-full sm:w-sm">
    <CardHeader>
      <div class="flex items-center justify-between gap-2">
        <CardTitle>Login to your account</CardTitle>
        <span
          v-if="isDemoMode"
          class="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/20"
        >
          Demo Sandbox
        </span>
      </div>
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

        <div
          v-if="isDemoMode"
          class="space-y-3 pt-2"
        >
          <div class="relative flex items-center justify-center">
            <div class="border-border/60 absolute inset-0 flex items-center">
              <div class="w-full border-t" />
            </div>
            <span
              class="bg-card text-muted-foreground relative px-2 text-xs uppercase tracking-wider"
            >
              Public Sandbox
            </span>
          </div>

          <Button
            type="button"
            variant="secondary"
            class="w-full font-semibold border border-primary/20 hover:border-primary/40 text-primary transition-colors flex items-center justify-center gap-2"
            @click="onDemoLogin"
          >
            <SparklesIcon class="size-4 text-emerald-500" />
            Try Demo Account (1-Click)
          </Button>
          <p class="text-[11px] text-muted-foreground text-center">
            Instant access to the interactive demo. No registration required.
          </p>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
