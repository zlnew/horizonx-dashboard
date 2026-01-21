<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import useApp from '@/composables/app'
import useAppStore from '@/stores/app'

const { menu } = useApp()
const appStore = useAppStore()

const { searchOpen } = storeToRefs(appStore)

onMounted(() => {
  window.addEventListener('keydown', handleSearch)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleSearch)
})

const handleSearch = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchOpen.value = !searchOpen.value
  }
}
</script>

<template>
  <CommandDialog
    v-model:open="searchOpen"
    #="{ close }"
  >
    <CommandInput placeholder="Search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <template
        v-for="(parent, pi) in menu"
        :key="pi"
      >
        <template v-if="parent.items?.length">
          <CommandGroup :heading="parent.label">
            <CommandItem
              v-for="(item, ii) in parent.items"
              :key="ii"
              :value="item.value"
              as-child
            >
              <RouterLink
                :to="item.to"
                @click.capture="close"
              >
                <component
                  :is="item.icon"
                  v-if="item.icon"
                />
                <span>{{ item.label }}</span>
              </RouterLink>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
        </template>
        <template v-else-if="parent.to">
          <CommandItem
            :value="parent.value"
            as-child
          >
            <RouterLink
              :to="parent.to"
              @click.capture="close"
            >
              <component
                :is="parent.icon"
                v-if="parent.icon"
              />
              <span>{{ parent.label }}</span>
            </RouterLink>
          </CommandItem>
        </template>
        <CommandSeparator v-if="pi + 1 < menu.length" />
      </template>
    </CommandList>
  </CommandDialog>
</template>
