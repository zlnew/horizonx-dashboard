<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { EyeIcon, EyeOffIcon, SendIcon, WebhookIcon } from 'lucide-vue-next'
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { Form, type FormContext, type GenericObject } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import SettingsApi, { type WebhookSettings } from '@/api/Settings'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePageMeta } from '@/composables/page-meta'

const settingsApi = new SettingsApi()

usePageMeta({
  title: 'Webhooks',
  breadcrumb: [
    {
      label: 'Webhooks',
      to: { name: 'settings.webhooks' }
    }
  ]
})

const webhookForm = ref<FormContext>()
const webhookFormSchema = toTypedSchema(
  z.object({
    url: z
      .string()
      .min(1, 'Webhook URL is required')
      .url('Enter a valid URL'),
    secret: z.string().optional()
  })
)

const enabled = ref(false)
const secretIsSet = ref(false)
const clearSecret = ref(false)
const showSecret = ref(false)
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const loadError = ref<string | null>(null)
const saveError = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  loadError.value = null

  try {
    const res = await settingsApi.getWebhook<ApiResponse<WebhookSettings>>()
    const data = res.data

    if (data) {
      enabled.value = data.enabled
      secretIsSet.value = data.secret === 'set'
      webhookForm.value?.setValues({
        url: data.url || '',
        secret: ''
      })
    }
  } catch (error) {
    const fetchError = error as Error
    loadError.value = fetchError.message
  } finally {
    loading.value = false
  }
})

const onSave = async (values: GenericObject) => {
  saveError.value = null
  saving.value = true

  try {
    const payload: { enabled: boolean; url: string; secret?: string } = {
      enabled: enabled.value,
      url: (values.url as string) || ''
    }

    const secretValue = (values.secret as string) ?? ''

    // Empty secret keeps the existing one; "reset" clears it.
    if (secretValue.trim() !== '') {
      payload.secret = secretValue.trim()
    } else if (clearSecret.value) {
      payload.secret = 'reset'
    }

    const res = await settingsApi.updateWebhook<ApiResponse<WebhookSettings>>(payload)

    if (res.data) {
      secretIsSet.value = res.data.secret === 'set'
    }

    clearSecret.value = false
    showSecret.value = false
    webhookForm.value?.setFieldValue('secret', '')

    toast.success(res.message ?? 'Webhook settings saved successfully')
  } catch (error) {
    const fetchError = error as Error
    saveError.value = fetchError.message
  } finally {
    saving.value = false
  }
}

const onTestPing = async () => {
  testing.value = true

  try {
    const res = await settingsApi.testWebhook<ApiResponse<{ status: number; message: string }>>()
    toast.success(res.data?.message ?? 'Test ping sent successfully')
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    testing.value = false
  }
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-8">
      <div class="flex items-center gap-4">
        <div class="bg-accent/50 border-border/50 rounded-xl border p-3">
          <WebhookIcon
            :size="24"
            class="text-primary"
          />
        </div>
        <div class="border-border/50 flex flex-col gap-0 border-l pl-4">
          <h1 class="text-2xl font-black tracking-tight uppercase">Webhooks</h1>
          <p class="text-muted-foreground text-sm font-medium italic">
            Configure outbound webhook notifications for your applications
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="mt-12">
    <div class="max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            HorizonX will POST event notifications to the URL below when enabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert
            v-if="loadError"
            variant="destructive"
          >
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{{ loadError }}</AlertDescription>
          </Alert>

          <Form
            ref="webhookForm"
            v-slot="{ handleSubmit }"
            as=""
            :validation-schema="webhookFormSchema"
          >
            <form
              id="webhookForm"
              class="space-y-6"
              @submit.prevent="handleSubmit(onSave)"
            >
              <Alert
                v-if="saveError"
                variant="destructive"
              >
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{{ saveError }}</AlertDescription>
              </Alert>

              <!-- Enabled Toggle -->
              <div class="border-border/50 flex items-center justify-between rounded-lg border p-4">
                <div class="space-y-1">
                  <FormLabel class="text-sm font-medium">Enable Webhooks</FormLabel>
                  <p class="text-muted-foreground text-xs">
                    Send event notifications to the configured endpoint
                  </p>
                </div>
                <SwitchRoot
                  v-model="enabled"
                  aria-label="Enable webhooks"
                  class="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none focus-visible:ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SwitchThumb
                    class="bg-background pointer-events-none block size-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
                  />
                </SwitchRoot>
              </div>

              <div class="space-y-4">
                <FormField
                  v-slot="{ componentField }"
                  name="url"
                >
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/hooks/horizonx"
                        v-bind="componentField"
                        :disabled="loading"
                      />
                    </FormControl>
                    <FormMessage class="text-red-500" />
                  </FormItem>
                </FormField>

                <FormField
                  v-slot="{ componentField }"
                  name="secret"
                >
                  <FormItem>
                    <FormLabel>Secret</FormLabel>
                    <FormControl>
                      <div class="relative">
                        <Input
                          :type="showSecret ? 'text' : 'password'"
                          :placeholder="
                            secretIsSet
                              ? 'Enter a new secret to replace (leave empty to keep)'
                              : 'Enter a webhook secret (optional)'
                          "
                          class="pr-10"
                          v-bind="componentField"
                          :disabled="loading"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          class="absolute top-1/2 right-1 -translate-y-1/2"
                          :aria-label="showSecret ? 'Hide secret' : 'Show secret'"
                          @click="showSecret = !showSecret"
                        >
                          <EyeOffIcon
                            v-if="showSecret"
                            :size="16"
                          />
                          <EyeIcon
                            v-else
                            :size="16"
                          />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage class="text-red-500" />
                  </FormItem>
                </FormField>

                <div class="flex items-center justify-between gap-4">
                  <p class="text-muted-foreground text-xs">
                    <template v-if="secretIsSet">
                      A secret is currently set{{ clearSecret ? ' and will be cleared on save' : '' }}.
                    </template>
                    <template v-else>No secret is currently set.</template>
                  </p>
                  <Button
                    v-if="secretIsSet && !clearSecret"
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="clearSecret = true"
                  >
                    Clear Secret
                  </Button>
                  <Button
                    v-else-if="clearSecret"
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click="clearSecret = false"
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  :disabled="testing || loading"
                  @click="onTestPing"
                >
                  <SendIcon :size="16" />
                  <span v-if="testing">Sending Ping...</span>
                  <span v-else>Test Ping</span>
                </Button>
                <Button
                  type="submit"
                  form="webhookForm"
                  :disabled="saving || loading"
                >
                  <span v-if="saving">Saving...</span>
                  <span v-else>Save</span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  </section>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
