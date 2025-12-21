<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useClipboard } from '@vueuse/core'
import hljs from 'highlight.js/lib/core'
import yaml from 'highlight.js/lib/languages/yaml'
import 'highlight.js/styles/base16/black-metal-venom.min.css'
import { CheckIcon, CopyIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from './ui/button'

const { code } = defineProps<{
  code: string
}>()

const hightlightedCode = ref<string>()

const { copy, copied } = useClipboard({ legacy: true })

watch(copied, (state) => {
  if (state) {
    toast.info('docker-compose.yml code copied')
  }
})

onMounted(() => {
  hljs.registerLanguage('yaml', yaml)
  hightlightedCode.value = hljs.highlight(code, { language: 'yaml' }).value
})
</script>

<template>
  <div>
    <div class="bg-accent text-foreground w-full rounded-t-sm px-2 py-1">
      <div class="flex items-center justify-between gap-4">
        <code class="text-xs">docker-compose.yml</code>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          @click="copy(code)"
        >
          <CheckIcon v-if="copied" />
          <CopyIcon v-else />
        </Button>
      </div>
    </div>

    <div class="bg-background text-foreground h-84 overflow-auto rounded-b-sm p-4 text-sm">
      <pre v-html="hightlightedCode"></pre>
    </div>
  </div>
</template>
