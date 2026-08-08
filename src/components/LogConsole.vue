<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { DownloadIcon, SearchIcon, WrapTextIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  lines: ContainerLogLine[]
  following: boolean
  streaming: boolean
  droppedChunks?: number
  service?: string
  heightClass?: string
}>()

const emit = defineEmits<{
  (e: 'update:following', value: boolean): void
  (e: 'update:service', value: string): void
}>()

const consoleEl = ref<HTMLElement>()
const search = ref('')
// Unwrapped by default — log lines keep their native shape; the toggle is
// there for the rare long-line service. (Maul, 08-08.)
const wrap = ref(false)

const services = computed(() => {
  const set = new Set<string>()
  for (const line of props.lines) {
    if (line.service) set.add(line.service)
  }
  return [...set].sort()
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const svc = props.service
  return props.lines.filter((line) => {
    if (svc && line.service !== svc) return false
    if (q && !line.text.toLowerCase().includes(q)) return false
    return true
  })
})

const isAtBottom = () => {
  const el = consoleEl.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 40
}

const onScroll = () => {
  // The single most important UX detail on this page: reading history must
  // not be impossible while a tail is live. Scroll up -> follow off; back
  // to the bottom -> follow on. Only auto-scroll while following.
  if (isAtBottom()) {
    if (!props.following) emit('update:following', true)
  } else if (props.following) {
    emit('update:following', false)
  }
}

const scrollToBottom = () => {
  const el = consoleEl.value
  if (el) el.scrollTop = el.scrollHeight
}

watch(
  () => props.lines.length,
  async () => {
    await nextTick()
    if (props.following) scrollToBottom()
  }
)

const download = () => {
  const text = filtered.value
    .map((l) => `${l.ts ? l.ts + ' ' : ''}[${l.service || '-'}] ${l.text}`)
    .join('\n')
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `container-logs-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.log`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => scrollToBottom())
onUnmounted(() => {
  // never auto-scroll a dead console
})
</script>

<template>
  <div class="space-y-2">
    <!-- toolbar -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative">
        <SearchIcon class="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          v-model="search"
          placeholder="Filter text…"
          class="h-8 w-48 pl-8 text-xs"
        />
      </div>

      <select
        v-if="services.length > 1"
        :value="service"
        class="h-8 rounded-md border bg-background px-2 text-xs"
        @change="emit('update:service', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">All services</option>
        <option v-for="s in services" :key="s" :value="s">{{ s }}</option>
      </select>

      <Button
        variant="ghost"
        size="sm"
        class="h-8 px-2 text-xs"
        :title="wrap ? 'Disable wrapping' : 'Enable wrapping'"
        @click="wrap = !wrap"
      >
        <WrapTextIcon class="h-3.5 w-3.5" />
      </Button>

      <Button variant="ghost" size="sm" class="h-8 px-2 text-xs" title="Download as .log" @click="download">
        <DownloadIcon class="h-3.5 w-3.5" />
      </Button>

      <Badge v-if="!following" variant="secondary" class="h-6 text-[10px]">
        Scroll to bottom to resume
      </Badge>

      <Badge v-if="streaming" variant="outline" class="h-6 text-[10px] text-emerald-500">
        ● LIVE
      </Badge>
    </div>

    <!-- dropped chunk honesty marker -->
    <div
      v-if="droppedChunks"
      class="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] text-yellow-200"
    >
      ⚠ {{ droppedChunks }} chunk{{ droppedChunks === 1 ? '' : 's' }} dropped — the connection couldn't keep up
      <button class="ml-1 underline" @click="$emit('update:following', false)">pause</button>
    </div>

    <!-- console -->
    <div
      ref="consoleEl"
      class="h-96 overflow-auto rounded-lg bg-foreground p-3 font-mono text-xs leading-5 text-background dark:bg-background dark:text-foreground"
      :class="heightClass"
      @scroll.passive="onScroll"
    >
      <div v-if="!filtered.length" class="text-muted italic">
        {{ streaming ? 'Waiting for output…' : 'No logs yet. Start tailing or run a query.' }}
      </div>
      <div
        v-for="(line, i) in filtered"
        :key="i"
        class="flex gap-2 whitespace-pre"
        :class="wrap ? 'flex-wrap' : ''"
      >
        <span v-if="line.ts" class="shrink-0 text-muted">{{ line.ts }}</span>
        <span
          v-if="line.service"
          class="shrink-0 font-semibold"
          :class="line.stream === 'stderr' ? 'text-red-400' : 'text-sky-400'"
        >
          {{ line.service }}
        </span>
        <span :class="line.stream === 'stderr' ? 'text-red-400' : ''">{{ line.text }}</span>
      </div>
    </div>
  </div>
</template>
