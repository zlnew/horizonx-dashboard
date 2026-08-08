<script setup lang="ts">
import { ref, watch } from 'vue'
import { useClipboard } from '@vueuse/core'
import { CheckIcon, CopyIcon, KeyRoundIcon, Loader2Icon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
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
import useServerStore from '@/stores/server'

const serverStore = useServerStore()

const phase = ref<'confirm' | 'reveal'>('confirm')
const token = ref<string | null>(null)
const rotating = ref(false)

const { copy: copyToken, copied: tokenCopied } = useClipboard({ legacy: true })

watch(tokenCopied, (clipCopied) => {
  if (clipCopied) {
    toast.success('Token copied to clipboard!')
  }
})

const rotateSecret = async (closeDialog: () => void) => {
  if (!serverStore.selectedServer?.id || rotating.value) {
    return
  }

  rotating.value = true
  try {
    const res = await serverStore.rotateSecret(serverStore.selectedServer.id)
    const data = res.data as { token: string; shownOnce: boolean } | null
    token.value = data?.token ?? null

    phase.value = 'reveal'
    serverStore.refetch = true
  } catch (error) {
    const fetchError = error as Error
    toast.error(fetchError.message)
  } finally {
    rotating.value = false
  }
}
</script>

<template>
  <DialogRoot #="{ close }">
    <DialogContent class="sm:max-w-[425px]">
      <template v-if="phase === 'confirm'">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <KeyRoundIcon :size="18" />
            Rotate server token
          </DialogTitle>
          <DialogDescription>
            The agent on this server will be disconnected until its config is updated with the
            new token. Any in-flight deploys or jobs on this server will fail.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            :disabled="rotating"
            @click="rotateSecret(close)"
          >
            <Loader2Icon
              v-if="rotating"
              class="animate-spin"
              :size="14"
            />
            {{ rotating ? 'Rotating…' : 'Rotate token' }}
          </Button>
        </DialogFooter>
      </template>

      <template v-else>
        <DialogHeader>
          <DialogTitle>New token generated</DialogTitle>
          <DialogDescription>
            Update
            <code class="text-destructive font-bold">HORIZONX_SERVER_API_TOKEN</code>
            on the agent's environment and restart it to reconnect. This token is shown once.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 overflow-x-auto">
          <div class="space-y-1">
            <code class="text-destructive font-bold">HORIZONX_SERVER_API_TOKEN</code>
            <div
              class="bg-accent flex items-center justify-between gap-4 overflow-x-auto rounded-lg px-4 py-2"
            >
              <div class="text-muted-foreground overflow-x-auto tracking-wide">{{ token }}</div>
              <Button
                size="icon-sm"
                aria-label="Copy token"
                variant="ghost"
                @click="copyToken(token ?? '')"
              >
                <CheckIcon v-if="tokenCopied" />
                <CopyIcon v-else />
              </Button>
            </div>
          </div>

          <p class="text-muted-foreground text-xs">
            The agent returns a permanent unauthorized error on a stale token — it will not
            retry its way back. Update the config and restart, don't wait.
          </p>
        </div>

        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">Done</Button>
          </DialogClose>
        </DialogFooter>
      </template>
    </DialogContent>
  </DialogRoot>
</template>
