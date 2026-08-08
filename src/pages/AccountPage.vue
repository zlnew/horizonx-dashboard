<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import {
  CircleUserIcon,
  KeyRoundIcon,
  Loader2Icon,
  LockIcon,
  MonitorSmartphoneIcon,
  UserIcon
} from 'lucide-vue-next'
import { Form, type FormContext, type GenericObject } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import AccountApi from '@/api/Account'
import PageHeader from '@/components/PageHeader.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useDate } from '@/composables/date'
import { usePageMeta } from '@/composables/page-meta'
import useAuthStore from '@/stores/auth'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const accountApi = new AccountApi()

const activeTab = ref<'profile' | 'password' | 'sessions'>('profile')
const profileError = ref<string | null>(null)
const passwordError = ref<string | null>(null)
const profileLoading = ref(false)
const passwordLoading = ref(false)

// Sessions tab state.
const sessions = ref<AccountSession[]>([])
const sessionsLoading = ref(false)
const sessionsError = ref<string | null>(null)
const revoking = ref<Set<string>>(new Set())
const revokingOthers = ref(false)

const { formatDate } = useDate()

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

// --- Sessions tab ---

// parseUserAgent maps a raw User-Agent into a short "Chrome on Linux"
// description. Deliberately a simple regex — no dependency, good enough
// for the account page.
const parseUserAgent = (ua: string) => {
  let browser = 'Browser'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\//.test(ua) || /Opera/.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Safari\//.test(ua)) browser = 'Safari'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'

  let os = 'OS'
  if (/Windows NT/.test(ua)) os = 'Windows'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  return `${browser} on ${os}`
}

const fetchSessions = async () => {
  sessionsLoading.value = true
  sessionsError.value = null

  try {
    const res = await accountApi.sessions<ApiResponse<AccountSession[]>>()
    sessions.value = res.data ?? []
  } catch (error) {
    const fetchError = error as Error
    sessionsError.value = fetchError.message
  } finally {
    sessionsLoading.value = false
  }
}

const onTerminate = async (session: AccountSession) => {
  if (session.is_current || revoking.value.has(session.id)) {
    return
  }

  revoking.value.add(session.id)
  try {
    await accountApi.terminateSession<ApiResponse>(session.id)
    sessions.value = sessions.value.filter((s) => s.id !== session.id)
    toast.success('Session terminated')
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    revoking.value.delete(session.id)
  }
}

const onRevokeOthers = async () => {
  if (revokingOthers.value) {
    return
  }

  revokingOthers.value = true
  try {
    await accountApi.revokeOtherSessions<ApiResponse>()
    sessions.value = sessions.value.filter((s) => s.is_current)
    toast.success('Signed out all other devices')
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    revokingOthers.value = false
  }
}

// Fetch sessions when the tab opens (lazy — no point loading on page mount
// if the user never visits the tab).
const switchTab = (tab: 'profile' | 'password' | 'sessions') => {
  activeTab.value = tab
  if (tab === 'sessions' && sessions.value.length === 0 && !sessionsError.value) {
    fetchSessions()
  }
}
</script>

<template>
  <section>
    <PageHeader
      :icon="CircleUserIcon"
      title="Account"
      description="Manage your account information and security"
    />
  </section>

  <section class="mt-12">
    <div class="max-w-4xl">
      <!-- Tab Navigation -->
      <div class="border-border/50 mb-8 flex gap-1 overflow-x-auto border-b sm:gap-4">
        <button
          type="button"
          class="flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-4 text-sm font-bold tracking-wide uppercase transition-all sm:gap-2 sm:px-6 sm:tracking-widest"
          :class="
            activeTab === 'profile'
              ? 'border-primary text-primary opacity-100 shadow-[0_4px_0_-2px_var(--primary)]'
              : 'text-muted-foreground hover:text-foreground border-transparent opacity-60'
          "
          @click="switchTab('profile')"
        >
          <UserIcon :size="16" />
          <span>Profile</span>
        </button>
        <button
          type="button"
          class="flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-4 text-sm font-bold tracking-wide uppercase transition-all sm:gap-2 sm:px-6 sm:tracking-widest"
          :class="
            activeTab === 'password'
              ? 'border-primary text-primary opacity-100 shadow-[0_4px_0_-2px_var(--primary)]'
              : 'text-muted-foreground hover:text-foreground border-transparent opacity-60'
          "
          @click="switchTab('password')"
        >
          <KeyRoundIcon :size="16" />
          <span>Security</span>
        </button>
        <button
          type="button"
          class="flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-4 text-sm font-bold tracking-wide uppercase transition-all sm:gap-2 sm:px-6 sm:tracking-widest"
          :class="
            activeTab === 'sessions'
              ? 'border-primary text-primary opacity-100 shadow-[0_4px_0_-2px_var(--primary)]'
              : 'text-muted-foreground hover:text-foreground border-transparent opacity-60'
          "
          @click="switchTab('sessions')"
        >
          <MonitorSmartphoneIcon :size="16" />
          <span>Sessions</span>
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
                    <p class="text-muted-foreground text-xs">Email address cannot be changed</p>
                  </div>
                </div>

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

      <!-- Sessions Tab -->
      <div v-show="activeTab === 'sessions'">
        <Alert
          v-if="sessionsError"
          variant="destructive"
          class="mb-4"
        >
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{{ sessionsError }}</AlertDescription>
        </Alert>

        <Card>
          <CardHeader
            class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
          >
            <div>
              <CardTitle>Registered Sessions</CardTitle>
              <CardDescription> Devices with an active session on your account </CardDescription>
            </div>
            <Button
              v-if="sessions.some((s) => !s.is_current)"
              type="button"
              variant="destructive"
              size="sm"
              :disabled="revokingOthers"
              @click="onRevokeOthers"
            >
              <Loader2Icon
                v-if="revokingOthers"
                class="animate-spin"
                :size="14"
              />
              <span v-else>Sign out all other devices</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div
              v-if="sessionsLoading"
              class="space-y-3"
            >
              <Skeleton
                v-for="i in 3"
                :key="i"
                class="h-16 rounded-xl"
              />
            </div>

            <div
              v-else-if="sessions.length"
              class="space-y-3"
            >
              <div
                v-for="session in sessions"
                :key="session.id"
                class="border-border/50 bg-accent/30 flex items-center justify-between gap-4 rounded-xl border p-4"
              >
                <div class="flex min-w-0 items-center gap-4">
                  <div class="bg-accent/50 border-border/50 rounded-lg border p-2">
                    <MonitorSmartphoneIcon
                      :size="20"
                      class="text-primary"
                    />
                  </div>
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="font-bold">
                        {{ parseUserAgent(session.user_agent) }}
                      </span>
                      <Badge
                        v-if="session.is_current"
                        class="border-primary/30 bg-primary/10 text-primary"
                      >
                        This device
                      </Badge>
                    </div>
                    <p class="text-muted-foreground truncate text-xs">
                      {{ session.ip }} · created
                      {{ formatDate(session.created_at, 'DD-MM-YYYY HH:mm') }} · expires
                      {{ formatDate(session.expires_at, 'DD-MM-YYYY HH:mm') }}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  class="shrink-0"
                  :disabled="session.is_current || revoking.has(session.id)"
                  :title="
                    session.is_current
                      ? 'Use the logout button for this device'
                      : 'Terminate this session'
                  "
                  @click="onTerminate(session)"
                >
                  <Loader2Icon
                    v-if="revoking.has(session.id)"
                    class="animate-spin"
                    :size="14"
                  />
                  <span v-else>Terminate</span>
                </Button>
              </div>
            </div>

            <div
              v-else
              class="text-muted-foreground py-8 text-center text-sm"
            >
              No other registered sessions.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
