<script setup lang="ts">
import { ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useClipboard } from '@vueuse/core'
import { CheckIcon, CopyIcon } from 'lucide-vue-next'
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
import useServerStore from '@/stores/server'

const serverStore = useServerStore()
const registerMessage = ref<string | null>()
const registeredServer = ref<Server | null>()
const token = ref<string | null>()

const { copy: copyToken, copied: tokenCopied } = useClipboard({ legacy: true })
const { copy: copySID, copied: sidCopied } = useClipboard({ legacy: true })

const formSchema = toTypedSchema(
  z.object({
    name: z.string(),
    ip_address: z.string()
  })
)

watch(
  () => serverStore.dialogRegisterOpen,
  (open) => {
    if (open) {
    } else {
      setTimeout(() => {
        registerMessage.value = null
        registeredServer.value = null
        token.value = null
      }, 150)
    }
  }
)

watch(tokenCopied, (clipCopied) => {
  if (clipCopied) {
    toast.success('Token copied to clipboard!')
  }
})

watch(sidCopied, (clipCopied) => {
  if (clipCopied) {
    toast.success('Server ID copied to clipboard!')
  }
})

const registerServer = async (values: GenericObject) => {
  try {
    const res = await serverStore.registerServer(values)
    const data = res.data as { server: Server; token: string } | null

    registerMessage.value = res.message ?? null
    registeredServer.value = data?.server ?? null
    token.value = data?.token ?? null

    serverStore.refetch = true
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
    <Dialog v-model:open="serverStore.dialogRegisterOpen">
      <DialogContent
        :class="registerMessage && registeredServer && token ? 'md:max-w-lg' : 'sm:max-w-[425px]'"
      >
        <template v-if="registerMessage && registeredServer && token">
          <DialogHeader>
            <DialogTitle>{{ registerMessage }}</DialogTitle>
            <DialogDescription>
              Please save this data on your HorizonX Agent environment
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4 overflow-x-auto">
            <div class="space-y-1">
              <code class="text-destructive font-bold">HORIZONX_SERVER_API_TOKEN</code>
              <div
                class="bg-accent flex items-center justify-between gap-4 overflow-x-auto rounded-lg px-4 py-2"
              >
                <div class="overflow-x-auto tracking-wide text-neutral-100">{{ token }}</div>
                <Button
                  size="icon-sm"
                  aria-label="Copy token"
                  variant="ghost"
                  @click="copyToken(token)"
                >
                  <CheckIcon v-if="tokenCopied" />
                  <CopyIcon v-else />
                </Button>
              </div>
            </div>

            <div class="space-y-1">
              <code class="text-destructive font-bold">HORIZONX_SERVER_ID</code>
              <div
                class="bg-accent flex items-center justify-between gap-4 overflow-x-auto rounded-lg px-4 py-2"
              >
                <div class="overflow-x-auto tracking-wide text-neutral-100">
                  {{ registeredServer.id }}
                </div>
                <Button
                  size="icon-sm"
                  aria-label="Copy server id"
                  variant="ghost"
                  @click="copySID(registeredServer.id)"
                >
                  <CheckIcon v-if="sidCopied" />
                  <CopyIcon v-else />
                </Button>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <DialogHeader>
            <DialogTitle>Register server</DialogTitle>
            <DialogDescription>
              Register server with the required information. Make sure the details are correct
              before saving.
            </DialogDescription>
          </DialogHeader>

          <form
            id="serverCreateDialogForm"
            class="space-y-4"
            @submit.prevent="handleSubmit($event, registerServer)"
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
              form="serverCreateDialogForm"
            >
              Register
            </Button>
          </DialogFooter>
        </template>
      </DialogContent>
    </Dialog>
  </Form>
</template>
