<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from './ui/pagination'

const { meta } = defineProps<{
  meta: Meta
}>()

const route = useRoute()
const router = useRouter()

const prev = () => {
  const page = Number(route.query.page || meta.current_page)
  if (page <= 1) return
  toPage(page - 1)
}

const next = () => {
  const page = Number(route.query.page || meta.current_page)
  if (page >= meta.last_page) return
  toPage(page + 1)
}

const toPage = (page: number) => {
  router.push({
    query: {
      ...route.query,
      page: page
    }
  })
}
</script>

<template>
  <Pagination
    v-slot="{ page }"
    :itemsPerPage="meta.per_page"
    :total="meta.total"
    :default-page="meta.current_page"
  >
    <PaginationContent v-slot="{ items }">
      <PaginationPrevious @click="prev" />

      <template
        v-for="(item, index) in items"
        :key="index"
      >
        <PaginationItem
          v-if="item.type === 'page'"
          :value="item.value"
          :is-active="item.value === page"
          @click="toPage(item.value)"
        >
          {{ item.value }}
        </PaginationItem>
      </template>

      <PaginationEllipsis :index="4" />

      <PaginationNext @click="next" />
    </PaginationContent>
  </Pagination>
</template>
